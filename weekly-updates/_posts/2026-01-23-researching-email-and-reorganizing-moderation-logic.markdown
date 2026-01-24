---
layout: post
date: 2026-01-23
title: Researching email and reorganizing moderation logic
---

This week, I did not establish email verification, but I researched the basic
requirements to send an email from a personal server and continued developing
complex moderation logic.

## Sending emails

To send emails, the application needs three things:

1. A local SMTP client
2. Public and private keys to sign emails
3. [DMARC, DKIM, and SPF
   records](https://www.cloudflare.com/learning/email-security/dmarc-dkim-spf/).

Email servers may have strict rules on the source of an email, so I
cannot fully test email verification from a private instance of the application.
For development purposes, it suffices to print emails to a console or deliver
to a local server.

Sending from a local server has its risks. An automated mailer could be
instructed to send data to a private machine, but the potential for damage is
limited if the email contains no user-submitted content. Still, this might be a
case where an external service is necessary.

## Moving moderation logic

While researching email, I've continued writing moderation logic for the server,
including some logic to authorize moderators before showing reports. Unlike
prior CRUD operations, the authorization logic is fairly complex, which has
prompted a change in project philosophy.

Fundementally, this application is just a database with extra security. It needs
to integrate with external systems like email, calendars, and mobile hardware,
but its core functionality is to organize and synchronize data for renters and
vendors. Because of this, I've deferred a lot of logic to Postgres, using a
single complex query to check the existence of a resource, check relevant
permissions, and perform some operation.

Using a single query efficiently manages basic resources, but it loses the
advantages of static checking and code reuse. Traditionally, a Postgres database
could use [views](https://www.postgresql.org/docs/current/sql-createview.html)
to reuse queries safely and easily, but they cannot be used here because they
must be defined through a migration.

Moving forward, I plan to put reusable application logic in the application
itself, using the database to hold a small amount of application state, with
basic checks like not-null and foreign key constraints. I don't intend to use an
ORM because I need to perform recursive queries without loading all data into
the application. Merely, longer queries will be split into a constant number of
subqueries.

## Next week

Next week, I still need to implement a basic email solution so that
authentication works in a development environment. Until then, the front end
will remain broken. I will also fix moderation so that the back end runs.

