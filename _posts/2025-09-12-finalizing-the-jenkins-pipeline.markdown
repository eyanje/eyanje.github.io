---
layout: post
date: 2025-09-12
title: Finalizing the Jenkins pipeline
categories: weekly-updates
---

This week, I created the deployment pipeline for Work Log, then fixed a series
of miscellaneous bugs relating to the build process.

## Jenkins

Until now, I was using a Multibranch Pipelinein Jenkins. This built and
tested every branch that had a Jenkinsfile defined. I only wanted to build the
main branch, so I switched to a regular Pipeline inside a folder containing
credentials. Besides limiting the build to one branch, this also enabled a
series of configuration options, such as Clean Up options, that were previously
not available.

I then attempted to set up a webhook to build and deploy the project when new
commits were pushed to GitHub. However, following a [GitHub
issue](https://github.com/orgs/community/discussions/117362) to the [GitHub
webhook
documentation](https://docs.github.com/en/enterprise-cloud@latest/webhooks/about-webhooks#about-webhooks-on-github),
it seems that webhooks do not have full IPv6 support yet, and since I don't have
a public IPv4 network, I won't be able to use webhooks at all.

## Fixing the title

During this process, I had noticed an issue with Work Log's title, which was the
default "Laravel" instead of my canary value "Journal2". On top of that, all
user data had been lost. I had dealt with this issue before, and I solved it by
setting `clear_env = no` in `/etc/php/8.4/fpm/pool.d/www.conf`. I assumed this
was an issue with missing environment values again, so I performed a series of
tests to try to set the environment variables.

My first solution was to try [FrankenPHP](https://frankenphp.dev/). I followed
the instructions to [use FrankenPHP for
Laravel](https://frankenphp.dev/docs/laravel/) and the [Caddyfile
refenrence](https://caddyserver.com/docs/caddyfile) to set up a PHP server over
HTTP. By rendering a test page with the content below, I verified that
environment variables were still present.
```php
<?php

echo phpinfo();
```
I also leaked all my application secrets and had to regenerate them later.

Unfortunately, I was now dealing with another old issue: pages were requesting
assets over HTTP, even though they were served over HTTPS through nginx. I
sidestepped this earlier by adding `fastcgi_param HTTPS $https;` to the nginx
configuration, but I could not find a similar method for FrankenPHP in the
documentation.

FrankenPHP was a bust.

### Configuring PHP FPM

PHP FPM had been working correctly until recently, so I decided to run some
tests to find out what environment variables were accessible. To spoil the
ending, none of these tests were necessary.

In my first test, I ran PHP FPM from a shell and rendered the test page. No
application environment variables were passed.

In my second test, I exported an arbitrary environment variable and ran PHP FPM
like before. This time, the variable was printed.

So, all we had to do was create an entrypoint script that would export the
proper environment variables before running PHP FPM, right?

I did exactly that, creating an shell script that exported all environment
variables before running PHP FPM. I ran the script, and none of the variables
were printed.

The problem was that, when we run a script, it launches a new process, clearing
the environment of unexported variables. To keep the environment varibles, I
would have needed to run `source entrypoint.sh` to run the commands in the
current shell. However, precisely because `source` is a shell utility, it can't
be used as part of a Docker entrypoint.

I repeated the last test within a container, just running `entrypoint.sh` with
an arbitrary environment variable set. This time, the variable was printed,
confirming that, when running a container, environment variables are passed
directly to the entrypoint.

At this point, I realized that the environment variables must have been passed
to PHP FPM. They just weren't visible. This was confirmed by running the backend
within a container, modified to print `phpinfo()`. The backend always had the
right environment variables.

### The solution

There were two solutions to this issue, one in the frontend and one in the
backend.

#### The title's solution: Vite variables

The application would display the correct title at first, but it would change
the title to the wrong title afterward. If the title was correct in the backend,
then the culprit had to be the frontend.

Among all the served files, the string "Laravel" appeared only in
`app-BUibgp2r.js`, in `const pb="Laravel";`. This was generated from a
definition in `resources/js/app.ts`.
```typescript
const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
```

`import.meta.env` is a variable defined during the [Vite build
process](https://vite.dev/guide/env-and-mode), so, if I wanted to set it to
"Journal", I needed to define the environment variable while building the [base
container](https://github.com/eyanje/work-log/blob/c3b6803e0164e85399ff273dd7a6183a7c57b4df/docker/base/Dockerfile).

I hardcoded this value in the
[Makefile](https://github.com/eyanje/work-log/blob/c3b6803e0164e85399ff273dd7a6183a7c57b4df/Makefile)
to avoid loading the production environment during the build process. 

#### The database's solution: choosing a different mount point

When I had issues with the database before, I discovered that, while I had
mounted a persistent volume to `/var/lib/postgres-data`, Postgres had written its
data to `/var/lib/postgres/data`. I thought to fix this by mounting the
persistent volume to `/var/lib/postgres` to match Postgres, without letting the
`lost+found` directory trigger additional issues, but this was insufficient
because the [Postgres Docker
image](https://hub.docker.com/layers/library/postgres/17/images/sha256-52341ca03960a8482b5976dc81529a67564056f52928672f4ffac624201c1465)
mounted a volume to `/var/lib/postgres/data` that was backed by container
storage.

A user had this issue [three years
ago](https://github.com/docker-library/postgres/issues/952) and fixed this by
setting `PGDATA` to a different directory. I chose to mount the persistent
volume to `/var/lib/postgres-data`, then set
`PGDATA=/var/lib/postgres-data/data`.

## Cleaning Harbor

During testing, I discovered that I could no longer push images to Harbor. This
had happened often in the past because of a slow or crashed component, so I
waited a long time for the problem to fix itself.

This time, the issue didn't fix itself. I scanned the harbor-core logs while
uploading different images and only saw this generic message: 
```
Error: writing manifest: uploading manifest latest to harbor.eyanje.net/work-log/build-agent: received unexpected HTTP status: 500 Internal Server Error
```

The Harbor registry had a more informative message:
```bash
time="2025-09-11T19:37:50.74047596Z" level=error msg="response completed with error" auth.user.name="harbor_registry_user" err.code=unknown err.detail="filesystem: mkdir /storage/docker/registry/v2/repositories/work-log/base/_uploads/43b0acaf-76ca-47ca-a0eb-8e5ec3f4a682: no space left on device" err.message="unknown error" go.version=go1.23.8 http.request.host=harbor.eyanje.net http.request.id=976f9a41-6340-4281-a4d4-c69d0f209b6b http.request.method=POST http.request.remoteaddr="2600:4040:538f:7200:ad90:738d:fdcf:3a82" http.request.uri="/v2/work-log/base/blobs/uploads/" http.request.useragent="containers/5.34.2 (github.com/containers/image)" http.response.contenttype="application/json; charset=utf-8" http.response.duration=94.622292ms http.response.status=500 http.response.written=240 vars.name="work-log/base" 
```

Based on [a report from another
user](https://github.com/goharbor/harbor/issues/21227), Harbor seems to only
count and clean up the storage used by blobs, while uploaded data is kept on
disk indefinitely. These uploads could take up multiple times the storage used
by the blobs but could only be deleted manually. Even deleting the entire
image would not clear them, as I had several deleted images still on disk.

To prevent these uploads from filling the disk, I wrote a CronJob to regularly
delete all uploads. I have not tested this job, but I have faced no consequences
for deleting the uploads manually.
```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: clean-harbor
spec:
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: clean-harbor
              image: docker.io/alpine:latest
              command: ["sh", "-c", "rm -rfv /storage/docker/registry/v2/repositories/*/*/_uploads/*"]
              volumeMounts:
                - mountPath: /storage
                  name: registry-data
          volumes:
            - name: registry-data
              persistentVolumeClaim:
                claimName: harbor-registry
          restartPolicy: OnFailure
      ttlSecondsAfterFinished: 300
  schedule: "@daily"
```

## Next week

This week, I set up Jenkins to deploy daily, fixed a series of bugs, and, as a
bonus, deployed Redis to the cluster. I also tried to schedule deletions of
unused data, so I believe this pipeline should work without intervention.

Next week, I should have nothing else to optimize in the pipeline, so I will
return to normal development. However, I admit that, after discovering that the
build process expected to have all production environment variables, I am
feeling uneasy about my containerization of Laravel with Vite. I'd like to start
a different project that hopefully has a straightforward deployment.

Still, I aim to allow users to mark entries as complete and edit entries
cleanly.
