---
layout: post
date: 2025-10-03
title: Microsevices not suitable, and scheduling coming soon
categories: weekly-updates
---

This week, I attempted to develop a small modular back end in Go. I succeeded in
making a controller, a generic model framework, and a series of tests for all
components, but the extra integration work didn't justify the theoretical
flexibility of a microservice architecture. Later, I began planning a convenient
scheduling system.

## Models and Controllers

In Go, I developed two interfaces. Models contained data and associations, and
drivers could create and load models from a backing store.

```
type Model[Id comparable, D any] interface {
    Id() Id
    Data() D

    Create() error
    Reload() error
    Update() error
    Delete() error
}

type Driver[M Model[Id, D], Id comparable, D any] interface {
    New() M
    Find(Id) (M, error)
}
```

I refined these interfaces to make a User model.

```
type userData struct {
    Email     string
    Password  []byte
    FirstName string
    LastName  string
}

type UserData = *userData

type User interface {
    db.Model[int32, UserData]
}

type UserDriver[U User] interface {
    db.Driver[U, int32, UserData]

    FindByEmail(email string) (U, error)
}
```

A dummy implementation could provide a UserDriver that maps IDs to user data and
a User that references its UserDriver and ID.

I defined a similar series of types for sessions and combined it with users to
make a single driver for authentication.
```
type AuthDriver[SD SessionDriver[S], S Session, UD UserDriver[U], U User] struct {
    Session SD
    User UD
}
```

Now that the models defined, we can create a session controller.

```
type sessionsController[SD auth.SessionDriver[S], S auth.Session, UD auth.UserDriver[U], U auth.User] struct {
    auth auth.AuthDriver[SD, S, UD, U]
}

type SessionsController[SD auth.SessionDriver[S], S auth.Session, UD auth.UserDriver[U], U auth.User] = *sessionsController[SD, S, UD, U]

func NewSessionsController[SD auth.SessionDriver[S], S auth.Session, UD auth.UserDriver[U], U auth.User](authDriver auth.AuthDriver[SD, S, UD, U]) SessionsController[SD, S, UD, U] {
    return &sessionsController[SD, S, UD, U]{
        auth: authDriver,
    }
}
```

I can point out a number of problems that will hinder further development.

Length. In the SessionsController, we have to specify the type of the session
driver, session model, user driver, and user model as generics. This should be
unnecessary: each concrete UserDriver implementation already specifies its User
model, yet we cannot rely on this.

Repetition. Just for a pair of authentication controllers, I created a series of
interfaces to represent models, test implementions for those interfaces, and
tests for those implementstions. If I decided to create a second codebase, I
would have needed to replicate all of this infrastructure.

Type restrictions. We might want a User method to return a member of the Session
interface, and we might want a Session method to return its User. If generic
types are involved, this would create a cycle, which isn't allowed.

Languages like Rust can reduce the numer of type parameters, and untyped
languages naturally allow for cycles, but the repetition is inevitable in a
fragmented codebase.

In the end, I returned to Rails.

## Scheduling

I then began developing a general system for scheduling reservations. The
[iCalendar specification](https://www.rfc-editor.org/rfc/rfc5545) provides a
good starting point for the data structures needed, but it doesn't handle
reservations completely.
Normally, a client can make a reservation in a calendar by querying for
free/busy information, then creating an event during a free time. The owner
responds by accepting or rejecting the event's invitation, which would
changes their free/busy information. This approach works for solo rentals, but I
want to support a number of additional conveniences: multiple slots at the same
time, buffer time between reservations, and easy time slot creation. Before
implementing these features, I'll need to assess the limits of the iCalendar
specification.

I briefly considered switching to Laravel to use the popular
[Sabre](https://sabre.io/) package to manage iCalendar data, but I arbitrarily
decided that I liked Ruby better than PHP. Unless Rails completely refuses to
render iCalendar data, I'll stick with it.

## Next week

I'll continue to work on the scheduling feature. I'll develop modules for
iCalendar event methods, models for reservations as a type of event, and a
controller to list reservations within a timeframe.
