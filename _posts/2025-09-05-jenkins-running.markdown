---
layout: post
date: 2025-09-05
categories: weekly-updates
title: Jenkins running
---

Work Log nearly has a functioning Jenkins pipeline. Jenkins has successfully
built and deployed the project, but it is not fully automated yet.

Last week, I faced an issue where Jenkins consumed 11 GiB of ephemeral storage
before timing out. At first, I thought that I just wasn't allocating enough
storage, so I expanded the size of the `/var` volume on my machines, hoping that
the extra space would stop Kubernetes from terminating the build agent.

Unfortanately, the build was still slow, taking about three hours to run to
completion, and the storage usage was annoying. In my development environment,
the build finished in minutes and only claimed a gigabyte of storage, so this
was a problem with my Jenkins setup.

Performance suffered most whenever images were committed or created, so, with
the help of [a Reddit
comment](https://www.reddit.com/r/podman/comments/14dgdf8/comment/joppgoq/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button),
I found that the Jenkins build agent was using VFS for storage by default. On
Debian trixie, the default is an overlay filesystem, but, on Debian bookworm, it
was necessary to install the
[containers-storage](https://packages.debian.org/bookworm/containers-storage)
package manually.

With this fix, the builds were still slow, but they now completed in under and
hour using one gigabyte. so I continued to write the Jenkinsfile,
adding steps to authenticate to the container registry and apply changes to the
Kubernetes cluster.

I'm still making a number of small optimizations: the base Docker image installs
vendor packages before adding other project files, the build caches artifacts in
the registry, and Jenkins uses `make` to run build steps in parallel. However,
build speed is largely restricted by disk and network operations, so long build times might be inevitable. Builds can also fail because of network conditions, which cause long delays.

## Next week

I'll merge the jenkins branch branch into main, then set up Jenkins to build and
deploy automatically when changes are pushed to main.

I should deploy the Redis cache, which I probably should have done earlier.

I also intend to build more features. Users should be able to mark entries as
complete and edit entries cleanly.

