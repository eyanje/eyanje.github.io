---
layout: post
date: 2025-08-01
title: Testing Harbor and a Kubernetes cluster
---

This week, I set up a [Harbor](https://goharbor.io/) container registry on
minikube, then set up a Kubernetes control plane node in a virtual machine.

## Testing Harbor

I [deployed Harbor using
Helm](https://goharbor.io/docs/2.13.0/install-config/harbor-ha-helm/) to a
minikube cluster using the provided instructions, setting the server name to
`core.harbor.local`. I used [makecert](mkcert.dev) to create a TLS certificate.
```bash
mkcert -install
mkcert core.harbor.local
```
Do not use `sudo` to install the CA certificate! Running as root will generate a
new CA certificate for the root user.

To create the secrets, I should have used `kubectl create secret tls`. Instead,
I foolishly created the secret manually by moving the certificates into a
folder, then creating a secret using the `--from-file` option.

On my machine, I installed 
the `docker-credential-secretservice` binary from [the
docker-credential-helpers
repository](https://github.com/docker/docker-credential-helpers) into
`/usr/local/bin/secretservice`, then
logged into the repository
```bash
sudo curl https://github.com/docker/docker-credential-helpers/releases/download/v0.9.3/docker-credential-secretservice-v0.9.3.linux-amd64 -o /usr/local/bin/docker-credential-secretservice
sudo ln -s /usr/local/bin/docker-credential-secretservice /usr/local/bin/secretservice
```
```bash
docker login core.harbor.local
```

To test Harbor, I tagged and pushed a version of the `work-log-builder` image.
```bash
docker tag work-log-builder:latest core.harbor.local/work-log/work-log-builder:latest
docker push core.harbor.local/work-log/work-log-builder:latest
```
Then, I successfully pulled it into `containerd`.
```bash
sudo ctr image pull core.harbor.local/work-log/work-log-builder:latest
```


## Running a Kubernetes cluster

This week, I also set up a Kubernetes control plane node on a Debian virtual
machine using qemu.

For persistent storage, I created a qcow2 image with 3 gigabytes of space,
backed by a local copy of [Debian's cloud
image](https://www.debian.org/distrib/).
```bash
qemu-img create knode1.img -f qcow2 -b ./debian-12-nocloud-amd64.qcow2 -F qcow2 3G
```
I booted the system using 2 CPUs, 1792 megabytes of memory, and two network
interfaces: one to access the internet and one to access the guest from the host
environment.
```bash
qemu-system-x86_64 -drive file=knode1.img -smp 2 -m 1792 -nic user -nic tap
```
The `-nic tap` option only allows a link connection, so I plan to replace it
with `-nic bridge,br=br-lan0,mac=<mac-address>`, which would enable multiple
virtual machines to form a network.


In the virtual machine, I installed ssh, then configured it to enable root
access.
```bash
apt update && apt install -y ssh
```
In `/etc/ssh/sshd_config` or `/etc/ssh/sshd_config.d/my-enable-root-conf`,
```
PermitRootLogin yes
PermitEmptyPasswords yes
```
In production, this would be fairly dangerous, but for a test environment with
no public access, it was fine.

For all future steps, I was able to ssh into the virtual machine using its
link-local address, which I found by running `ip address`
```bash
ssh root@fe80::5054:ff:fe12:3457%tap0
```

### Installing and running kubeadm

I followed
[Kubernetes' instructions for installing kubeadm](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/)
and
[instructions for creating a cluster](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/)
to download and run `kubeadm` to create a cluster. During this process, `kubeadm
init` failed because I had downloaded the `kubeadm` and `kubelet` binaries
manually, but it succeeded when I used Kubernetes' deb packages.

For a container runtime, I decided to use the
[containerd](https://packages.debian.org/bookworm/containerd) and
[containernetworking-plugins](https://packages.debian.org/bookworm/containernetworking-plugins)
Debian packages.
```
apt install -y containerd containernetworking-plugins
```

By default, installing `containernetworking-plugins` does not create any
networks for containers. To create a network, I wrote a configuration file in
`/etc/cni/net.d/`,
where I heavily referenced [containernetworking's guide](https://github.com/containernetworking/cni/tree/main?tab=readme-ov-file#how-do-i-use-cni),
[cri-o's guide](https://github.com/cri-o/cri-o/tree/main/contrib/cni),
and [Kubernetes' example configuration](https://kubernetes.io/docs/tasks/administer-cluster/migrating-from-dockershim/troubleshooting-cni-plugin-related-errors/#an-example-containerd-configuration-file).

### Debugging pods

Even then, I was still not able to connect to my cluster. By running `crictl
pods -a` and then running `crictl logs <container-id>`, I found that many pods
stopped after failing to connect to port 6443, which, according to [Kubernetes'
port and protocol
reference](https://kubernetes.io/docs/reference/networking/ports-and-protocols/),
was the API server's endpoint. Further digging revealed that the API server
consistently stopped after failing to reach the etcd service, which was being
regularly killed.

After reading about [a similar
issue](https://discuss.kubernetes.io/t/why-does-etcd-fail-with-debian-bullseye-kernel/19696)
and checking the suggested blog post ["Who's killing my
pods?"](https://gjhenrique.com/cgroups-k8s/), I implemented the solution to set
`SystemdCgroup = true` in `/etc/containerd/config.toml`. After restarting
`containerd` and `kubelet`, the pods were stable.

## Next week

I still only have one real machine to use, so I plan to continue testing my
virtual machine by deploying an application to it. I also want to try
[kubespray](https://kubespray.io/) to automate setup.

However, before I try to automate everything, I should try to deploy Work Log, likely
using `kustomize` but possibly using Helm.


