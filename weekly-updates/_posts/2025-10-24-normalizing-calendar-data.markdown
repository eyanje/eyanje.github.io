---
layout: post
date: 2025-10-24
title: Normalizing calendar data
---

Following [a recommendation on
StackOverflow](https://stackoverflow.com/a/21630476), I have normalized
iCalendar events, removing dependence on tuples and composite types. Further
development has been difficult on Rails, so I am considering alternatives.

## Database schema

The current database schema has three basic entities: Users, Listings, and
Events. Users and listings are self-explanatory. Other tables related to
scheduling are non-comprehensively detailed below.

### Event

Event
 - `dt_start`: Start time
 - `dt_end`: End time
 - `duration`: Duration

Recur
 - `event_id`: Reference to the owning event
 - `freq`: secondly, minutely, hourly, daily, weekly, monthly, yearly
 - `until`: Timestamp for upper bound of recurrence starts
 - `count`: Integer
 - `interval`: Interval containing all recurrences
 - `week_start`: Weekday

By second:
 - `recur_id`: Reference to recurrence
 - `by_second`: Integer for `by_second` recurrence

By minute:
 - `recur_id`: Reference to recurrence
 - `by_minute`: Integer for `by_minute` recurrence

There are other tables for recurrences by hour, day, month day, year day, week,
month, and set position.

### Rental window

A rental window is a link between a listing and an event. It specifies a window
of time where an item can be rented or returned.

Rental window
 - `listing_id`: Item listing
 - `event_id`: Calendar event
 - `can_rent`: Boolean
 - `can_return`: Boolean

### Reservation

A reservation links a user with two rental windows: one for the rental and one
for the return.

Reservation
 - `user_id`: reference to the user making the reservation
 - `rental_window_id`: reference to the initial rental window
 - `rental_start`: timestamp for the start of the rental to distinguish
   recurring windows
 - `return_window_id`: reference to the return window
 - `return_start`: timestamp for the start of the return to distinguish
   recurring windows

## An attempt at implementation

To implement these in Rails, I generated a migration and model classes for each
table, then I wronte a controller to manage rental windows and reservations.

As I did so, I encountered an issue where [GET requests are silently converted
to POST](https://github.com/rails/rails/issues/45409), causing my tests to
mysteriously fail. After removing `as: :json`, the request was made with GET,
but the response was now in HTML, even after defining `format`, following the
[rendering
reference](https://guides.rubyonrails.org/layouts_and_rendering.html#rendering-objects).

This is not the first time I struggled with the Rails documentation. Information
on Same-Site cookies was sparse, and Rails would incorrectly omit `Secure`
cookies when connected to localhost through HTTP, unless specifying
`config.assume_ssl = true`.

To avoid data type issues, I've also needed to configure
`config.active_record.schema_format = :sql`

I've been feeling that, rather than develop functionality from nothing, I
am now steadily overriding existing Rails code to patch over undocumented
behavior and configuration issues. I'm still struggling to use Devise,
overriding methods that rely on removed `respond_to`. Even though I'm testing
my code, I cannot trust that Rails behaves as it claims to do. For this reason,
I am once again considering developing in something besides Rails.

## Other frameworks

I've considered a number of other frameworks. Previously, I tried using
[Gin](https://gin-gonic.com/) but couldn't create the generic types I wanted.
Untyped web frameworks like [Express](https://expressjs.com/) or
[Flask](https://palletsprojects.com/projects/flask/) would probably be more
suitable, but I also want to try a web framework with a type system.

I'm currently considering the following.

* [Axum](https://github.com/tokio-rs/axum) is a [fairly
popular](https://survey.stackoverflow.co/2025/technology#most-popular-technologies-webframe)
web framework in Rust using [tower](https://crates.io/crates/tower) middleware.
* [Rocket](https://rocket.rs/) is another popular framework in Rust that
  supports forms, cookies, and templates.
* [SQLx](https://github.com/launchbadge/sqlx) is a SQL toolkit that supports
  data migrations.

## Next week

I intend to replicate authentication in one of these frameworks. This time, it
should be safe to develop models without dummy implementations.

