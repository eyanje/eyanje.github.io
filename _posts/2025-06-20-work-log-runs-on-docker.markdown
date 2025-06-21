---
layout: post
date: 2025-06-20
title: Work Log runs on Docker
categories: personal-projects updates
---

Work Log now has Dockerfiles and a compose.yaml to deploy the application,
though they are somewhat cumbersome to use. Using a higher Compose project, I
also set up a single nginx server to proxy multiple websites.

In theory, I can now create a cron job to pull and build the project every
morning. However, I know that, with a CI tool like Jenkins, I could structure
the entire pipeline to pull, build, test, and deploy. I expect Jenkins to take
time to set up, so I'll work on the cron job first.

Still, The project is not ready for deployment until I can ensure that all
communications are secure and attack vectors are minimal.

## Challenges with moving to Docker

To run the project within a Docker container, I felt that it would be best to
split it into a series of smaller components. I thought that I would split it
into a backend and a frontend, then combine both into one service using Docker
Compose.

Unfortunately, that wasn't possible. I found a long loop of dependencies,
starting from the backend PHP installation, which builds the backend, which
builds the frontend, which is needed to run the backend. Ultimately, running any
component required building the entire project.

I also encountered issues because the dependencies were decentralized. Composer
and npm stored their dependencies within the project directory, but PHP required
modules found in global directories. To copy project files from stage to stage
of the build, I needed to copy not only the project itself, but also a series of
global directories containing those modules.

The simplest solution, as I found, was to build a single image containing the
entire project, on top of which I could develop individual endpoints for CGI and
static assets. This solution unfortunately wasn't possible with Docker alone,
since I needed to specify an order to build images, so I wrote small scripts to
build and run the necessary images. These scripts would work well in a pipeline,
whenever I can set one up.

## Network security

Currently, the project is ready to run on a private server. To finalize
deployment, I need to produce SSL certificates, which should be easy through
Let's Encrypt, then configure the network to expose the server to the public.
Without options for configuring a firewall, I haven't taken the final step, but,
depending on my confidence, this may change very soon. More likely, it will
take some time to safely set up.

## Next week

I plan to run the server publicly, but I don't want to rush the final steps.
More likely, I'll make some minor tweaks and finish automating deployment.


