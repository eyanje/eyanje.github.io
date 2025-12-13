---
layout: post
date: 2025-12-12
categories: weekly-updates
title: Implementing rental windows, without recurrences
---

This week, I wrote and tested the back-end support for rental windows, so it
should now be possible for the front end to perform basic CRUD operations. I
also considered the threat of theft.

## Challenges with recurrent events

As planned, vendors must specify windows of time during which a renter may pick
up or drop off an item. For many vendors, these windows might be one-hour blocks
that repeat throughout the day.

iCalendar supports these recurrences by attaching a [recurrence
rule](https://www.rfc-editor.org/rfc/rfc5545#section-3.8.5.3) to an event, but,
since we need to store and sort this data internally, we have to understand a
bit about it.
Consider scheduling a recurring meeting every Monday at 5 P.M. for the rest of
the year. In person, this is easy to achieve: each Monday, one needs only to
consult an appropriate wall clock to know when 5 P.M. might occur. However, if
we consider local rules like Daylight Savings Time, the exact point in time when
this meeting occurs is not as easy to describe. Depending on the user's time
zone and the current date, the next meeting could be 23, 24, or 25 hours from
the 5 P.M. on the previous day.

To implement recurrent events, it was necessary to preserve the time zone
exactly: not just a fixed offset from GMT, but also any shifts throughout the
year.
Postgres betrayed me here because, even though the [user manual's section on
time
zones](https://www.postgresql.org/docs/current/datatype-datetime.html#DATATYPE-TIMEZONES)
addressed their political nature, timestamps were still represented as [a number
of microseconds from January 1st,
2000](https://docs.rs/postgres-protocol/latest/postgres_protocol/types/fn.timestamp_from_sql.html).
Therefore, it was necessary to store zoned date/time values as text, relying
instead on the useful
[jiff::Zoned](https://docs.rs/jiff/latest/jiff/struct.Zoned.html) struct to deal
with date-time logic.

Aside from fixing their table definitions, I haven't actually implemented
recurrent rental windows yet.

## How do we handle theft?

My main concern, as a vendor, is the potential for theft. If a customer rents an
item, then stops responding, is there any potential recourse? I could report the
theft, then collect just compensation, but another vendor could send a false
report just to collect the money.

Theft is an external act, something that an abstract system can't prove or
disprove. Even outside the abstract, if the other party is unreachable, it's
practically impossible for a vendor to prove that an item was stolen, and the
same for a renter proving that an item was returned. In our protocol,
correctness depends on this purely external, unproveable fact.

If the platform automatically pays money for theft, that automation can be
exploited. If it pays nothing, theft is easy. To avoid theft, it might be
necessary to actively prevent fraud and to involve real-world means of law
enforcement, any authority that can prove theft had occured, even if the suspect
refuses to respond.

It's unfortunate that this system can't be made fully secure using abstract
financial means, but this is also the beautiful reality of a complex world.

## Designing structs to pass references

This week, I spent an entire day writing copy-free structures to assist in
database write operations. When designing these structures, the trick is to
identify the long-lived owned data that is given as input, then to make
references only to that data. All other fields in a struct should be owned. It's
also possible to use generics to store any borrowable datum, with added
verbosity.

This is a bit like getting dressed quickly, between 9 hours of sleep and 2 hours
of commute. My network is just too slow for me to worry about cloning.

This is the real cost of using Rust: spending all my time perfecting run time
and memory usage without improving run time or memory usage at all.

## Next week

Next week, I will work a little more in the front end. I haven't actually tested
the HTTP endpoints, so I want to subject them to some manual tests.
I also want to have some visual results to show, so I'll implement a basic
non-calendar interface for rental windows, then add some search.
Reservations are a natural next step, but I think that their potential
back-and-forth nature will require some thought.

