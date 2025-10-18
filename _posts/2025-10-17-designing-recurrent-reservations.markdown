---
layout: post
date: 2025-10-17
title: Designing recurrent reservations
categories: weekly-updates
---

Last week, I began designing the scheduling system, which I continued this week. 

Initially, customers could create reservations by specifying an arbitrary date
and time. A better system lets the owner specify a series of reservation slots
for pick-up and drop-off, and the customer selects a pair of slots.

To implement this system, I'll need a convenient way to create a series of
recurring events. Full support would include:
* Recurrence by minute, hour, day of the week, day of the month, day of the
  year, week, month, year, and any combination of them.
* Specifying an end by count or by time.
* The ability to delete or hide a specific instance of a recurrence.
* Time zones.

In general, the reservation system should support a full calendar system. So
far, I have followed the [iCalendar
RFC](https://www.rfc-editor.org/rfc/rfc5545), which includes a design for
recurring events. I was hoping to find a library with the relevant data types in
Rails or Postgres, but I might have to do the work myself.

## Next week

Next week, I will continue developing recurrences. Continuing the goals for last
week, I'll develop a controller to list reservations within a timeframe, both in
iCalendar and in JSON.

