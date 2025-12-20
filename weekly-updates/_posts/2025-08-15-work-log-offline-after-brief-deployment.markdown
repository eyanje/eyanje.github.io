---
layout: post
date: 2025-08-15
title: Work Log offline after brief deployment
---

This week, we saw the Kubernetes cluster deployed, to such a point that I even
ran Work Log. However, its data lived on my laptop, so, to provide a
production-worthy data storage solution, I have since taken down the site.

## Network setup

So far, the cluster's network has been the biggest source of issues. When a
component failed, it was usually a matter of misconfiguration.

For background, I had two nodes, both on the same VPN. Each had a 64-bit IPv6
prefix but no IPv4 addresses. Each prefix created a static route within the VPN,
and neighbor discovery did not occur.

I expected Kubernetes to automatically make an overlay network so pods could
communicate, and perhaps this would have happened, with the proper tools, but I
was using the basic set of [reference container networking
plugins](https://github.com/containernetworking/plugins). With these plugins,
pods expected the node to act as a router, passing packets to other nodes and
pods without Kubernetes' help.

With a working setup, it should be possible to ping a pod from outside. Start a
pod that listens on port 9000.
```bash
kubectl run busybox --image docker.io/busybox --command -- nc -lk -p 9000
```
If the pod runs on fd3b:4a1d:7064:fa50::34, anyone on the VPN can run
```bash
nc -vz fd3b:4a1d:7064:fa50::34 9000
```
The connection should succeed.

A series of dumb mistakes beset my troubleshooting efforts, written here for
reference.

1. A firewall would block my packets.

2. No matter how I checked, the output given by `iptables-save` would never list
   the services Kubernetes had made. I had IPv6. I should have used
   `ip6tables-save`.

3. A node was routing its container network traffic through the VPN rather than
   the container network interface. I didn't specify the VPN's prefix large
   enough to let the CNI take priority.

4. The container network would give its subnet's first IP address to the node,
   which tried to use another address within the subnet. Those, I specified when
   setting up the VPN and now were pointless.

5. nftables mode in
   [kube-proxy](https://kubernetes.io/docs/reference/config-api/kube-proxy-config.v1alpha1/#kubeproxy-config-k8s-io-v1alpha1-KubeProxyConfiguration)
   would only NAT the destination IP address, but nodes were sending packets
   along their default route, using the wrong source address. Creating a new
   route specifically for the services fixed the issue until the rest of routing
   failed.

The pod subnet doesn't need to be set during `kubeadm init`, since Pods can
receive IP addresses from the container network. However, if a pod subnet is
specified, this subnet should be large enough to give a 64-bit subnet to each
node. The size of this prefix can be specified in [the arguments to the
controller
manager](https://kubernetes.io/docs/reference/command-line-tools-reference/kube-controller-manager/).

## Work Log on Kubernetes

I started to deploy Work Log last week. The overall process, minus
troubleshooting networking bugs, was this.

1. Deploy [Harbor](https://goharbor.io/) using Helm.
2. Install [Local Path
   Provisioner](https://github.com/rancher/local-path-provisioner) so Harbor's
   database can run, and add
   [nginx-ingress](https://github.com/kubernetes/ingress-nginx) to access Harbor.
4. Write scripts to build, tag, and push container images to Harbor.
5. Realize that real certificates were needed to push any images. Install
   [cert-manager](https://cert-manager.io/).
6. Read logs confused. Find [an
   issue](https://github.com/cert-manager/cert-manager/issues/7791) explaining
   why nginx-ingress is weird.
7. Observe connection failures even with ingress working. Suddenly remember a
   router sits between the nodes, blocking port 80 from probes.
8. Fight with Work Log to accept environment variables and win by telling
   php-fpm to `clear_env = no`.
9. Add [a health check](https://github.com/renatomefi/php-fpm-healthcheck) just
   in case.

Work Log was finally alive again.

## Storage

Work Log lived online, sitting on a Kubernetes cluster, using valid TLS,
for maybe two days, after which I felt that local storage was insufficient for
permanent deployment.

I wanted NFS to substitute for local storage and free my pods from the only node
with data. However, Postgres wanted user 999 and group 999,
which, on my NFS server, mapped to a mismatched user dnsmasq and group
systemd-journal, and it refused to let other files be owned by
anonymous user IDs.

Distributing storage on nodes is difficult, and so I continue to search for a
suitable storage provider.

## Next week

I should be able to find a storage provider soon, and I will finally be free
from Kubernetes and write the Jenkins pipeline.


