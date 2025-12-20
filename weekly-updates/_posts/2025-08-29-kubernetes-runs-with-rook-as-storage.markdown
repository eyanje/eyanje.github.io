---
layout: post
date: 2025-08-29
title: Kubernetes runs with Rook as storage
---

Early this week, I finished deploying Work Log on Kubernetes using Rook for
storage, and I began testing Jenkins to automate building, testing, and, most
importantly, deploying the project. Unfortunately, those tests suggest a change
in direction.

## Setting up Rook on a strange network

I had a lot of trouble installing Rook.

[Last week](/2025/08/22/testing-rook-on-a-vm.html), the Rook operator could not connect to monitor service, nor could any
other pod, even though they could connect to the monitor pod directly. According
to [Rook's troubleshooting
guide](https://rook.io/docs/rook/latest-release/Troubleshooting/ceph-common-issues/#solution_1),
this was likely a network issue, so I read through the kernel logs and saw this
line.
```
[  128.366598] bridge: filtering via arp/ip/ip6tables is no longer available by default. Update your scripts to load br_netfilter if you need this.
```
I ran `modprobe br_netfilter`, and the operator connected to the monitor.

This worked fine in a VM, but, on bare metal, other pods began to fail slowly as
they tried to contact the API server. When new containers tried to use the
neighbor discovery protocol to find the node, their communications were
mysteriously reset. A reset suggested that the firewall was at fault, so I
tested the connection manually while watching the kernel logs, but no messages
were printed. However, the firewall was indeed at fault. If I used
`ip6tables-save` to print the firewall's routing entries, I discovered that
logging was limited to 3 per hour. By editing the logging entry and using
`ip6tables-restore` to apply the changes, I could observe new entries appear for
each packet blocked.

Even so, it was strange to see the firewall blocking packets that should have
been allowed. The firewall, managed by ufw, contained entries to allow NDP
packets, and these rules were not being activated. Instead, the problems seemed
to be from conntrack, a kernel module that tracks connection state. NDP has
caused problems for conntrack [in the past](https://bugzilla.kernel.org/show_bug.cgi?id=11797),
and conntrack has since been patched with fixes, but it seems like bridge
networks still cause issues.

If I disabled ufw, the monitors successfully formed quorum. Since the server
only exposed Kubernetes and ssh, I supposed that the firewall was not necessary,
and now I am relying solely on application security.

It is possible to [disable conntrack in
ufw](https://help.ubuntu.com/community/UFW#Enable_PING), but I did not know so
at the time, so I have not tested it.

### OSDs stuck in an unknown state

I hoped this was the end, but Ceph still could not finish setup. I had a number
of warnings from the operator about unknown PGs:
```
2025-08-25 07:10:22.430930 I | clusterdisruption-controller: OSD failure Domains : ["glowing-pigeon-debian"]
2025-08-25 07:10:22.430936 I | clusterdisruption-controller: Draining Failure Domain: "glowing-pigeon-debian"
2025-08-25 07:10:22.430940 I | clusterdisruption-controller: Set noout on draining Failure Domain: ""
2025-08-25 07:10:22.620023 I | clusterdisruption-controller: reconciling osd pdb controller
2025-08-25 07:10:24.603994 I | clusterdisruption-controller: OSDs are up but PGs are not clean from previous drain event. PGs Status: "cluster is not fully clean. PGs: [{StateName:unknown Count:2}]"
```

This time, I believed network wasn't at fault. I had no firewall, and no other
pods had issues communicating. At one point, I reverted my cluster to have only
one node to replicate my working VM setup, but nothing helped. I had no idea why
my bare metal cluster, which was identical to my VM in every way, was failing.

There was actually one difference between the VM and bare metal: the VM used
IPv4, while the bare metal used IPv6. No other applications cared about this
difference and readily used IPv6, but Ceph had to be configured manually by
specifying `ipFamily: IPv6`.

```yaml
apiVersion: ceph.rook.io/v1
kind: CephCluster
metadata:
  # Cluster object metadata
spec:
  network:
    ipFamily: IPv6
    # Other network options
  # Other spec data
```

After completely purging the cluster from my machines and installing the new
definition, Rook finally provisioned storage.

### Feasibility of Rook

I confess that none of this work was necessary. I have a single-node
cluster; Ceph is designed to scale. Compared to compute power, storage must be
especially durable, and I don't have enough nodes to build such a cluster.
Realistically, I should use a bigger cloud solution like [AWS
EBS](https://docs.aws.amazon.com/eks/latest/userguide/ebs-csi.html), but, for
now, I will store data locally, at the risk of losing it.

## Testing Jenkins

Even with the cluster, I needed an agent, like
[Jenkins](https://www.jenkins.io/) or [GitHub
Actions](https://github.com/features/actions), which could automatically build,
test, and deploy the project when changes were pushed. I had already written
scripts to
[build](https://github.com/eyanje/work-log/blob/24033e8b3b65dde9513dee744bb223713afbef27/scripts/build.sh)
and
[publish](https://github.com/eyanje/work-log/blob/24033e8b3b65dde9513dee744bb223713afbef27/scripts/publish.sh)
container images, and I had used Jenkins to run those scripts locally. To
complete the setup, I had to deploy Jenkins and add an additional step to deploy
the project.

Deploying Jenkins to Kubernetes required nested containerizataion. I was
building image layers inside a Kubernetes pod running Jenkins. It would have
been a lot of trouble to also start a Docker daemon, so I opted to use
[Podman](https://podman.io/). As soon as I started, the error `clone: permission
denied` led me to [an issue on
GitHub](https://github.com/containers/podman/issues/10797), which led me to the
article ["How to use Podman in
Kubernetes"](https://www.redhat.com/en/blog/podman-inside-kubernetes) by Mohanni
and Walsh at Red Hat.

Following the article, I successfully ran `podman build` on Jenkins, but the
build process failed to connect to the Debian package index, even though other
containers could. This seems to be [an ongoing issue with
Buildah](https://github.com/containers/buildah/issues/6148), which I'm avoiding
by using the host's network.

So far, I have run the build once, and, after spending 2 hours and 45 minutes
and 11 GiB of ephemeral storage, the build timed out. Jenkins generally seems to
consume a lot of memory and storage, so I am considering moving the build to
something like GitHub Actions, which already runs the project's automated tests.

## Next week

I will set up automated deployment over Jenkins or GitHub Actions. If possible,
I will also polish the front end.

I have a handful of other projects that I want to start, but I want to finish
learning the deployment process first.

