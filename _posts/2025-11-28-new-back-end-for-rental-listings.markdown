---
layout: post
date: 2025-11-28
categories: weekly-updates
title: New back end for rental listings
---

This week, I developed and tested a back end for item listings, enabling
indexing, showing, and creating listings.

This time, there was no complex application logic, so I split the application
into only two layers: one for database access and a thin layer for HTTP. In
fact, the application itself is basically just SQL, with basic authentication on
top.

To test, I wrote a helper struct to create a test database, then ran some
example flows. The tests caught a single error: if
[query\_one](https://docs.rs/tokio-postgres/latest/tokio_postgres/struct.Client.html#method.query_one)
fails to find a record, it returns an opaque error type that can't be matched.
To properly return code 404, it's necessary to use
[query\_opt](https://docs.rs/tokio-postgres/latest/tokio_postgres/struct.Client.html#method.query_opt)
when querying a record that might not exist.

This week, I wanted to develop a general library for authentication that could
create users and sessions. This general library could be used in the
authentication service and in client applications for testing purposes. However,
I want to refrain from producing such a library until it becomes necessary.
Coupling service internals early could lead to difficult maintenance and poor
performance.

## Next week

Next week, I will continue developing listings. I'll enable editing and
deletion, then add a field for descriptions and location. I also want to
implement rental windows, though I still don't know how to practically organize
them.

