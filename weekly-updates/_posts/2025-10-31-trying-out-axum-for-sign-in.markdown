---
layout: post
date: 2025-10-31
title: Trying out Axum for sign-in
---

This week, I started to develop a sign-in flow using
[Axum](https://github.com/tokio-rs/axum/tree/main).

## Sign-in

A basic sign-in flow should perform the following:
1. Access database for users.
2. Use a hashing algorithm, such as bcrypt, to verify the hash.
3. Update the session database.
4. Respond with the session key.

I started building this flow using Axum, referencing [The code for TechEmpower's
Framework Benchmarks](https://github.com/TechEmpower/FrameworkBenchmarks) for
database access. I have tried to create a suitable development database using
[migrate](https://github.com/golang-migrate/migrate), with difficulties.

Even with the extra work, it is refreshing to develop a smaller application in
an isolated context. It is convenient to use SQL directly, thus freeing the
database schema from restrictions of ORMs. Working directly with HTTP and SQL
also reduces application overhead, enabling even Python and JavaScript solutions
to perform well.

## TODO: authentication middleware

Later, every protected route should look up the session key included with the
request. Normally, this is handled in middleware, but, with Rust's strict
typing, I wasn't sure how to provide user data to controllers.

Axum's documentation [recommends using extensions for
authentication](https://docs.rs/axum/latest/axum/struct.Router.html#method.with_state).
Other examples show [sharing state with
handlers](https://docs.rs/axum/latest/axum/#sharing-state-with-handlers) and
[passing state from middleware to
handlers](https://docs.rs/axum/latest/axum/middleware/index.html#passing-state-from-middleware-to-handlers).

I intend to build the middleware myself, referencing
[axum-login](https://github.com/maxcountryman/axum-login), an existing crate
that handles authentication, and Tower's [Building a middleware from
scratch](https://github.com/tower-rs/tower/blob/master/guides/building-a-middleware-from-scratch.md).

## Next week

I will finish implementing authentication, though without middleware.

