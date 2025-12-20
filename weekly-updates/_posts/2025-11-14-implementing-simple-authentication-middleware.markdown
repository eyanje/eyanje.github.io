---
layout: post
date: 2025-11-14
title: Implementing simple authentication middleware
---

This week, I wrote a simple piece of middleware to verify a session token, but I
haven't been able to test it yet.

## Writing middleware

Building the middleware was simpler than expected. Referencing [axum-login's
middleware](https://github.com/maxcountryman/axum-login/blob/main/axum-login/src/service.rs),
I wrote the parts to fulfill three basic steps.

1. Store a handle to a database.
2. Upon receiving a request, verify a session token, if it exists, an attach it
   to the request.
3. Defer processing to an inner service.

To store the database, I wrote a
[Layer](https://docs.rs/tower/latest/tower/trait.Layer.html) containing a
database client and a prepared statement. The client is wrapped in an
`Arc<Mutex<...>>`, so both the client and statement are easy to clone.

When the first request arrives, Axum calls
[layer](https://docs.rs/tower/latest/tower/trait.Layer.html#tymethod.layer) with
the inner service, constructing a
[Service](https://docs.rs/tower/latest/tower/trait.Service.html) with a given
inner layer.

The service mainly needs to define the
[call](https://docs.rs/tower/latest/tower/trait.Service.html#tymethod.call)
method, which returns any future. For authentication, this is an async function
of type `Pin<Box<dyn Future<Output = ...>>>`, which queries the database and
defers to the inner layer.

To attach the user id, I defined a `struct UserId(i32)`, implementing
`FromRequestParts`. This custom type can be added to a request through
[extensions\_mut](https://docs.rs/http/latest/http/request/struct.Request.html#method.extensions_mut),
where it can then be extracted.

The additional
[poll\_ready](https://docs.rs/tower/latest/tower/trait.Service.html#tymethod.poll_ready)
function can be used to signal readiness. Since the middleware is ready when it
is constructed, this can return `inner.poll_ready()`.

During implementation, one complication was the return type of the Future.
Although the Future returns a Result, [axum receives
middleware](https://docs.rs/axum/latest/axum/struct.Router.html#method.layer)
which never returns an Err.

## Testing

I wanted to test this middleware immediately, but there were a number of barriers
to doing so.

1. This middleware is part of a separate binary and is meant to be multiplexed
   with nginx. This makes it difficult to test with the frontend.
2. The middleware uses Postgres directly, and I haven't established a testing
   database.

An internal test won't care about the first point, since it can construct the
server directly, but the second point seems impossible to do portably with
lightweight technology.

## Next week

Without easy testing, it will be difficult to develop any new features. Next
week, I will develop an automated test for the basic authentication middleware.
If this turns out well, I aim to also test the main authentication flow as well.

