---
layout: post
date: 2025-11-21
title: Testing authentication middleware
categories: weekly-updates
---

This week, I wrote tests for authentication middlewawre, using
[axum-login](https://docs.rs/axum-login/latest/src/axum_login/middleware.rs.html)
for reference.

[sqlx](https://docs.rs/sqlx/latest/sqlx/) has a
[test](https://docs.rs/sqlx/latest/sqlx/attr.test.html) annotation, which can
easily set up a test database with fixtures. However, I didn't want my
application to perform its queries through sqlx, as I wanted to keep each
component as light as possible.

At the time, the application only used a single database connection behind an
Arc\<Mutex\<...\>\>, but, as I began writing tests, I nevertheless found it
convenient to use a second conection to inspect the database while the
application used it. Thus, I integrated
[deadpool-postgres](https://docs.rs/deadpool-postgres/0.14.1/deadpool_postgres/index.html)
into the project. There is some extra overhead when configuring the pool and
retrieving a client, but, since
[ClientWrapper](https://docs.rs/deadpool-postgres/0.14.1/deadpool_postgres/struct.ClientWrapper.html)
implements [Deref<Target =
PgClient>](https://docs.rs/deadpool-postgres/0.14.1/deadpool_postgres/struct.ClientWrapper.html#deref-methods-PgClient),
it is straightforward to use a client returned by
[Pool::get](https://docs.rs/deadpool/0.12.3/deadpool/managed/struct.Pool.html#tymethod.get).

To test the middleware, I created a basic
[Router](https://docs.rs/axum/latest/axum/struct.Router.html) with a protected
route, then passed it a single HTTP request using
[Router::oneshot](https://docs.rs/axum/latest/axum/struct.Router.html#method.oneshot),
a strategy from [axum-login's middleware
tests](https://docs.rs/axum-login/latest/src/axum_login/middleware.rs.html#310).

```rust
#[tokio::test]
async fn should_reject_when_unauthorized() {
    let db = TestDatabase::new().await.expect("new test database");
    let layer = AuthLayer::new(db.pool().clone()).await.expect("new AuthLayer");

    let app = Router::new()
        .route("/", get(protected))
        .layer(layer);

    let req = Request::builder()
        .uri("/")
        .body(Body::empty())
        .unwrap();

    let res = app.oneshot(req).await.unwrap();
    assert_eq!(res.status(), StatusCode::UNAUTHORIZED);
}
```

I abstracted the test database by writing a TestDatabase struct, which can reset
the database, create users, and create sessions. These functions are useful for
testing but fairly tedious to implement, so I would like to move these database
helpers to the authentication crate if they are needed again.

## Neovim setup

Until now, I have been linting with
[rust-analyzer](https://rust-analyzer.github.io/) through
[ALE](https://github.com/dense-analysis/ale), which has worked well but only
after occupying around 1.5 GB of memory. This week, I switched to cargo with
clippy, which has had a negligible memory footprint.

## Next week

Next week, I plan to implement and test routes for indexing, showing, and
creating listings. I anticipate that these changes will be easy, so I also plan
to implement the same routes for rental windows.

