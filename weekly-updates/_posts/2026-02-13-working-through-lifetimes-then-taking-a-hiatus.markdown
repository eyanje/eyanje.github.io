---
layout: post
date: 2026-02-13
title: Working through lifetimes, then taking a hiatus
---

This week, I continued writing moderation code for Rent. This is the first time
that the logic has required a query of a query result, which has exposed a
fundamental flaw in the program's design.

To demonstrate, we define a trait `CheckPermission` to express the task of
checking permissions.

```rust
trait CheckPermission<Parameter> {
    type Error: Error + 'static;

    fn check_permission(user_id: &UserId, parameter: Parameter) -> Result<bool, Self::Error>;
}
```

An example choice for `Parameter` might be a struct containing references.
```rust
struct CheckPermissionParams<'a> {
    report: &'a Report,
    timestamp: Timestamp,
}
```

Then, when used in a function, the error in `check_permission` needs to be
propogated.

```rust
fn get_report_auth<Backend: AppBackend>(
    backend: &Backend,
    report_id: &ReportId,
    user_id: &UserId,
) -> Result<
    Option<Report>,
    <Backend as CheckPermission<CheckPermissionParams</* what? */>>>::Error
> {
    let report = backend.get_report(report_id);

    // If this function returns an error, report is dropped.
    if !backend.check_permission(user_id, CheckPermissionParams {
        report: &report,
        now: now(),
    })? {
        // Unauthorized, so return nothing
        return Ok(None)
    }

    Ok(Some(report))
}
```

Now we can see the issue. The error type needs to reference the trait
`CheckPermission`, which must be specified with its `Parameter` type. However,
this parameter is a `CheckPermissionParams` that has a lifetime that only exists
within the function.

It might be possible to change the trait definition to avoid specifying the
input's lifetime, but I have yet to find a convenient and intuitive method. If
the trait accepts the error type as a type parameter, a complete back-end type
would need to be generic over every error type combination possible, which makes
little sense. If we return an opaque Error type, the compiler might capture
unnecessary references. Ideally, I would like to have something like str, which
is generally used as a reference but doesn't have a lifetime, but I'm not sure
if it is possible or safe.

## Hiatus

I'll put Rent on hiatus to focus on studying for the CompTIA A+ certifications.

