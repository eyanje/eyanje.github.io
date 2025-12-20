---
layout: post
date: 2025-12-05
title: Trying different approaches for rental windows
---

Early this week, I finished implementing endpoints for listings. I began
implementing rental windows, first fixing error reporting and testing helpers
before writing endpoints.

During this process, I tried to research the viability of using Postgres as the
back end. With stricter security and a higher connection limit, I think it
would be possible to provide a public-facing database, but not immediately.

## Data-first or user-first development

I encountered two approaches for developing a back end, one focused around the
application's data and another around the application's intended usage.

The data-first method formats the data cleanly in the database and
writes a thin layer to interact with the database. This makes sense because many
online applications are fundamentally about users exchanging data, and a good
data-first back end provides efficiency and flexibility with the data.

The user-first method organizes the application according to user actions. User
experience is the foundation of an application, so it makes sense to describe
the user experience first, then write the application to implement it. The data
store itself is insignificant, as long as it serves the application well.

Agile methods typically support the user-facing method, but I believe that a
many applications would benefit by providing a plain database of user-submitted
content. The user-first approach also suggests building the front end before
starting the back end, resulting in a smaller but less robust back end.

Security in the data-first method can be enforced by tables, columns, or rows.
This database-level security controls read/write access, like file permissions,
and is secure against arbitrary queries. However, it is not clear what extra
information might be inferred. Security in the user-first method is instead
enforced at each endpoint, so it is possible to leak data accidentally by
miswriting a query, but it is also easier to eliminate correlations.

Realistically, I should adopt a mix of both approaches. I still believe that the
database is the real core of the application, particularly where reads are
concerned, but I still need to design user flows to guide development.

## One package or many

This week, I also repeated the fruitless process of trying to split the
application into logical modules. Though this is normally good practice, a
back-end server doesn't present clear boundaries to use.

Benefits to separating modules into libraries
1. Individual binaries are smaller and less dangerous.
2. Implementation details can be decoupled.
2. Dependencies are easier to track.
3. cargo compiles dependencies in parallel.

Drawbacks
1. Small packages are difficult to test in isolation.
2. Similar modules duplicate code.

Both drawbacks are fairly serious. It can be tempting to create a shared library
from the repeated code, but there is rarely a clean separation between the
shared and unshared code, particularly in a back end whose behavior changes to
match business needs.

Testing enables further duplication. To implement authentication, it was
necessary to write code to create and insert a new session. To separately test
that listings could be created, it was also necessary to write code to create
and insert a new session. I could have reused the same code for the public
facing service and the tests, but they had slightly different requirements. I
ultimately chose to create a separate module with similar code for testing
purposes.

I don't have a short fix for this duplication. Perhaps I could write all setup
code in SQL, or I could test exclusively with application endpoints.

## Next week

Next week, I will finish implementing and testing the basic CRUD operations on
rental windows. This might require the code to be unoptimized, but that's fine.
