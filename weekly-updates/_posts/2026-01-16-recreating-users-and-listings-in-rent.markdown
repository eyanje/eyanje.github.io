---
layout: post
date: 2026-01-16
title: Recreating users and listings in Rent
---

This week, I started implementing moderation within Rent by adding tables for
secure user authentication and permission management. However, I'll need to
rebuild the legacy listing and rental window code to proceed further, since I
can't commit any database migrations until then.

To implement moderation, I decided to let regular accounts gain moderation
privileges if an authorized administrator grants it. To make this work, I
defined a dedicated `moderation_privilege` table, which contains this set of
grants.

Unfortunately, I could not comfortably commit this code to Git beceause the rest
of the application still uses legacy table definitions, which need to be redone.

First, I need to update user management to be secure. To create a user, the
application must verify e-mail addresses before allowing a user to finalize a
password. Without this, the application currently lets users create an account
under another's e-mail address.

I also need to split listing logic. Previously, there was no distinction between
items and their advertisements: both were part of one listing. It's more
traditional to let an item's owner publish multiple advertisements and a renter
retain a copy of any advertisement seen. To accomodate both, advertisements
become immutable when published, and renters can bookmark an advertisement to
keep it after deletion.

Meanwhile, I've been reorganizing the back-end code. Previously, I struggled to
organize code modules into useful packages while also isolating unsafe testing
helpers. For now, I've organied the application into four main components:
1. A core module containing basic data structures, error types, and implementor
   traits
2. A Postgres module implementing application data logic in SQL
3. An HTTP module containing Tower helpers and HTTP controllers
4. Test helpers.

The crate contains two binaries: one for the main application and
another for moderation.

## Next week

Next week, I'll finish implementing user creation. I last programmed e-mail
verification in 2020, so I'll need to relearn it.
