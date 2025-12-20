---
layout: post
date: 2025-08-08
title: Migrating Work Log to Kubernetes
---

This week, I began deploying a small Kubernetes cluster to bare metal using
`kubeadm`. In the process, I discovered that the version of containerd provided
by Docker wasn't compatible with Kubernetes, so I installed
[podman](https://podman.io/) as a replacement. This led to a few changes within
the codebase.

I rewrote the build scripts to build and tag each image in sequence, rather than
as part of a declarative Docker Compose application. Although this complicates
the scripts' behavior, it also produces much nicer artifacts: two container
images, which can be run independently.

I rewrote the Kubernetes configuration to pull from the global repository by
default. This means that, unlike the previous Docker Compose setup, which built
images from local Dockerfiles, the Kubernetes deployment can be executed outside
of the repository.

Podman is able to run Kubernetes configurations to deploy pods, but, as I
discovered, it only supports deployments. I still wanted to run
[Harbor](https://goharbor.io/) and [automate certificate
renewal](https://cert-manager.io/docs/tutorials/acme/nginx-ingress/), so I
decided to try to deploy a full Kubernetes cluster.

## Deploying to bare metal

I began the challenge of deploying a Kubernetes cluster to my laptop. I expected
this process to be easy because I had successfully set up a cluster on a single
virtual node, but I encountered a lot of little issues, which I will document
here.

During setup, `kubeadm init` would hang while waiting for a liveness probe.
After checking logs, I identified the culprit to be my swap partition. I didn't
want to disable swap, so I followed [Kubernetes' guide for using
swap](https://kubernetes.io/docs/concepts/cluster-administration/swap-memory-management/)
to update the kubelet configuration during this process. Unfortunately, I did
have to edit the configuration every time I reset the cluster.

Afterwards, CoreDNS would fail to ping the API server. A look through `dmesg`
showed that my firewall was blocking the pings. I ran `ufw allow in on cni0`,
and the problem was fixed.

Finally, the cluster ran. However, I could not connect to it from a second
machine. The culprit this time was obvious: I only had IPv6 access through a
VPN. Following [Kubernetes' guide on creating a dual-stack
cluster](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/dual-stack-support/),
I reconfigured all nodes from scratch using configuration files, learning a few
details about the network along the way.

- The node IP should be the accessible from all cluster machines. For me, this
  was a VPN address.
- The pod subnet or cluster CIDR is optional can be inferred from the network
  plugin. However, it may be helpful to specify.
- The control plane's localAPIEndpoint needs to be set to an IPv6 address to
  prevent an address family mismatch during control plane communications.


I had reconfigured the cluster and the network a few times, so I saw this event
a number of times.
```
plugin type="bridge" failed (add): failed to set bridge addr: "cni0" already has an IP address different from 10.88.0.1/16
```
I also received connection errors.
```
dial udp [2001:db8:4860:1::a]:53: connect: network is unreachable
```
This was due to conflicting CNI configurations. Deleting the configuration and
the link just disabled the node; the real solution was to change the pod network
configuration on all nodes to a different prefix, then, following [Kubernetes'
instructions for updating CNI plugins and
configurations](https://kubernetes.io/docs/tasks/administer-cluster/migrating-from-dockershim/troubleshooting-cni-plugin-related-errors/#updating-your-cni-plugins-and-cni-config-files),
to drain and then uncordon each updated node. Without draining the nodes, I
could find no other way to reestablish the CNI network interface.

I was still having trouble running Harbor, which seemed to be caused by the lack
of a storage provider, so I installed
[rancher/local-path-provisioner](https://github.com/rancher/local-path-provisioner).
However, it consistently failed to retrieve its own configuration from the API
server, at which point I suspected the worst: my container network wasn't going
to work.

To resolve this last issue, I decided to try installing
[Cilium](https://cilium.io/), but this yielded the same issue:
```
dial tcp [2001:db8:4860:1::1]:443: i/o timeout
```
It seems that, even now, the network is unable to transport data to services.

## Next week

Next week, I plan to establish a working cluster. Since I still have to set up
storage provisioning, I might switch to using Ansible and Kubespray to set up
the rest, especially now that I can enable swap. However, I would also like to
set up the cluster manually at least once.

I should also push a usable Kubernetes configuration to GitHub.
