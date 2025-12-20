---
layout: post
date: 2025-07-25
title: Learning Kubernetes
---

Small update this week. I'm continuing to learn Kubernetes with the intention of
deploying Work Log to it. I'm making slow progress adapting the current Docker
Compose infrastructure to take advantage of Kubernetes' more advanced
environment and secret value options.

I've also considered deploying to virtual machines, but, besides security, I
don't think the extra overhead is necessary yet.

## Next Week

I hope to adapt the current deployment to run on minikube. I anticipate
challenges with initializing the database and performing health checks, but I
believe solutions should exist.
