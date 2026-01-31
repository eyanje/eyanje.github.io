---
layout: post
date: 2026-01-30
title: Splitting application and database code in Rent
---

This week, I continued to refactor Rent. Unfortunately, I was again unable to
implementing email.

```
warning: `rent` (lib test) generated 8 warnings (8 duplicates)
error: could not compile `rent` (lib test) due to 472 previous errors; 8 warnings emitted
```

Database code is now split from the rest of application logic. The database
logic only encapsulates basic [CRUD
operations](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete),
while authorization is considered application logic.

The biggest weakness of this approach is that, to index data, it may be
necessary to perform a loop of queries, worsening the application's asymptotic
bounds on round-trip count. Indexing nested data introduces another factor to
the bounds, worsening them further.

For now, it seems best to ignore indexing and design search special operations
only where needed. Nested indexes should be rare beyond three levels and can
always be hard-coded later.

## Next week

Next week, I will continue to refactor Rent in preparation for email
verification.
