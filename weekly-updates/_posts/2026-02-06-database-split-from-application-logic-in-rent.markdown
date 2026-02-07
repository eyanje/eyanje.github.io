---
layout: post
date: 2026-02-06
title: Database split from application logic in Rent
---

This week, I have fully split application logic from the database and resolved
the resulting compilation errors. I detail some of the challenges involved.

## Database verbs

Each resource can be affected by a number of verbs, like Create, Read, Update,
 and Delete. Each verb is characterized by its type signature.

Common verbs

* Create a new resource, given its data.
* Read an existing resource, given its ID.
* Update an existing resource, given its ID and new data.
* Delete a resource, given its ID.
* Check for the existence of a resource, given its ID.
* Index a set of resources, given a parent object.

Most operations return the resource in its entirety. This simplifies database
logic with only minor performance penalties.

## Streaming an index

Indexing continues to be the most complex operation. It returns an asynchronous
stream of values with static lifetime so that axum can deliver the response to
clients.

Though it is necessary to return an opaque type, Rust then unnecessarily
captures the lifetime of `&self`, which is not static. A later edition of Rust
might solve these issues, but, for now, I'm going to use a pinned, boxed, Stream
object.

## Connection pooling

Previously, I would reserve a database client as soon as an HTTP request is
received, returning it after fully responding. This worked fine when each
request performed a single query, but it would cause issues if multiple queries
were to be sent to separate back ends.

To avoid these performance issues, each individual database operation requests a
new client from a pool, and the operation's error type is wrapped in a custom
PooledError, an enumeration of a
[PoolError](https://docs.rs/deadpool/latest/deadpool/managed/enum.PoolError.html)
and an internal error. Like PoolError, the From trait is implemented for the
inner error so that question-mark (?) syntax can be used to elide the
constructor.

## Next week

Next week, I will resume implementing moderation logic, verifying moderation
permissions and reading reports.

