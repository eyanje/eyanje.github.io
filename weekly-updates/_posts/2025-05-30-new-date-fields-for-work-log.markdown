---
layout: post
date: 2025-05-30
title: New date fields for Work Log
---

## Work Log

### No imports yet

I intended to implement iCalendar imports this week, but I debated whether I
should design imports like a complete backup, overwriting some entries but not
others, or like a copy/paste function, where importing entries will insert them
as new entries.

In the end, I decided to stick with standards and design the import feature
primarily as a backup and replication mechanic. Since importing data can modify
existing entries, Work Log now has separate date fields for the start and end of
an entry, separate from the creation date.

### Design

Even though journals are usually write-only and only include start dates, it
will likely be necessary to have editable start and end dates.

In my original paper-based methods for logging time, every journal entry had an
end time in addition to a start time. This made it easier to track gaps between
tasks and created a division between working and not. Work gets recorded;
play stays off the books.

In my original method, I could also edit entries to some degree. If I forgot to
record a start time, I would estimate the original start time. If I did extra
work in a task, I would write it in. If I recordded a task but didn't actually
start it, I would cross it out. I was free to change entry data if I felt that
they were inaccurate.

Though the journal records were functional with only their creation date, my
method has always worked better with more flexibility and control.

### Next week

Next week, I have two immediate tasks.

* Finish the import feature.
* Create branding assets.

Later, we will expand features.

* Allow entries to be edited.
* Show and record an end date.

If you read last week's goals, it turns out the Bcrypt engine has been salting
passwords the entire time. I guess I should have read the relevent section of
the manual sooner.

