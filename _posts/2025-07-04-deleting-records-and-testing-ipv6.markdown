---
layout: post
date: 2025-07-04
title: Deleting records and testing IPv6
categories: personal-projects updates
---

## Deleting records

Work Log supports deleting records.

![Selecting the option to delete a record](/assets/images/2025-07-04-deleting-a-record.gif)

I also added a page to edit records, though
there is no backend support yet.

![The page to edit a record](/assets/images/2025-07-04-editing-a-record.png)

I should have started developing these features a lot earlier, but I think
progress has slowed a lot because I had been filing an issue on GitHub for every
feature.

## Deployment

I'm still working towards deploying through OpenWRT slowly because I don't want
to break too much local infrastructure at once. Unfortunately, faking a
realistic test environment has been difficult, and, with only a 64-bit prefix to
work with, I have been performing a lot of imperfect tests to figure out what I
should expect with a larger prefix.

I could switch routers any time, but I would certainly
disconnect every device in the house then, so I'm waiting for a convenient time
to do so.

Incidentally, I discovered that DuckDuckGo and GitHub don't support IPv6, and,
for no apparent reason, Reddit forgets to provide an AAAA record for its www
subdomain.

## Next week

I could deploy immediately, but I still want to be careful and choose a good
time to disconnect everything. Hopefully that happens this week, but I might
just work on branding and editing features.

The next few stages of development should proceed a lot more smoothly if I don't
file an issue for everything, but perhaps I should keep doing it for the
experience.

