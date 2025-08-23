---
layout: post
date: 2025-08-22
title: Testing Rook on a VM
---

This week, I've been testing [Rook](https://rook.io) on a virtual machine, to
inconsistent results. Many pods are failing to start, and all diagnostics are
printing generic error codes or failing to connect to nonexistent daemons.

At first, pods were reporting the error
```
Fatal glibc error: CPU does not support x86-64-v2
```
A user with a similar user fixed this by [using the host processor
](https://github.com/rook/rook/issues/6089).

It was now possible to start the pods for RBD and CephFS, but there were no OSD
pods. Consequently, the Rook operator would not generate provisioning secrets,
causing provisioning to fail with
```
error getting secret rook-csi-rbd-provisioner in namespace rook-ceph: secrets "rook-csi-rbd-provisioner" not found
```

The operator was reporting the error
```
clusterdisruption-controller: failed to get OSD status: failed to get osd metadata: exit status 1
```
but this was expected, given that no OSD pods were running.

Other diagnostics tools, such as the
[Tookbox](https://rook.io/docs/rook/v1.18/Troubleshooting/ceph-toolbox/) and the
[Rook kubectl
plugin](https://rook.io/docs/rook/v1.18/Troubleshooting/kubectl-plugin/), would
simply time out while trying to connect to Ceph.

Then, a couple days, ago, Rook updated to version v1.18.0. Now, the RBD plugin
is now called the "node plugin", and the provisioner plugin is called the
"control plugin". Monitors are also failing to start, despite working a few days
ago. It's fortunate that most pods wre not broken during the update, but it'll
take extra time to diagnose my issues.

By now, I normally would have switched to another storage solution, one more
suitable for a smaller deployment. In fact, I attempted to use
[Gluster](https://www.gluster.org/) with [Kadalu](https://kadalu.tech/), but,
after failing to delete a Gluster brick, failing to run Kadalu, and finding
little development activity, I decided to push through with Rook.

## Next week

I will continue to test Rook and, if the test environment works, deploy a
minimal cluster.

