---
layout: post
date: 2025-11-07
title: Authentication and user management in Axum
categories: weekly-updates
---

This week, I wrote a small authentication service in Axum. Users can create and
delete accounts, as well as sign in and out.

<video controls autoplay>
    <source src="/assets/images/2025-11-07-signing-up.mp4" type="video/mp4" />
    <a href="/assets/images/2025-11-07-signing-up.mp4">Original video</a>
</video>
<br>
<caption>Signing up for an account and signing in</caption>

<video controls autoplay>
    <source src="/assets/images/2025-11-07-deleting-account.mp4" type="video/mp4" />
    <a href="/assets/images/2025-11-07-deleting-account.mp4">Original video</a>
</video>
<br>
<caption>Deleting an account</caption>

Unfortunately, the front-end doesn't detect a sign-out immediately. This is a
result of using SWR to load session details instead of manual fetch calls.

## Implementation

I created the user and session tables using SQL, then ran those database
migrations using
[sqlx](https://github.com/launchbadge/sqlx/blob/main/sqlx-cli/README.md), which
I've found to be more complete and robust than
[migrate](https://github.com/golang-migrate/migrate).

For the HTTP service, I wrote an application with three layers.

1. Database layer. Provides functions to execute SQL statements and queries
   using a [tokio-postgres
   Client](https://docs.rs/tokio-postgres/latest/tokio_postgres/struct.Client.html).
2. Application layer. Performs complex logic for authentication, such as
   checking bcrypt hashes. Does not work with SQL or HTTP directly.
3. HTTP layer. Using [Axum](https://github.com/tokio-rs/axum), parses and
   serializes HTTP cookie and JSON data.

The middle layer is meant to separate the HTTP and SQL interfaces, but it is not
always well-defined. To sign in, it is natural to separate database access,
hashing logic, and HTTP parsing. However, to query the session, the SQL query
results must be parsed directly into the JSON output format. Here, there is
barely provides any division between the application's HTTP and SQL interfaces.

[Last time I tried to write a
microservice](/weekly-updates/2025/10/03/microservices-not-suitable-and-scheduling-coming-soon.html),
I found it tedious to create abstractions for models. This time, I have avoided
writing model objects in favor of raw SQL queries, which match the relational
model better.

## Next week

I will authenticate a user through middleware. This middleware layer might
require its own database connection, so I'm not sure how complex it will be to
implement in a general context.

