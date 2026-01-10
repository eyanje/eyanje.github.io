---
layout: post
date: 2026-01-09
title: Plan for Rent
---

This week, I created an overview of Rent's features, identifying productive
goals and eliminating others.

I spent a long time trying to build a perfect software solution for the rental
platform, something correct and secure without human intervention. This neither
possible nor necessary. A rental business is fundamentally physical and
therefore requires a large degree of human intervention. However, a human-only
solution can still be automated by software, reducing necessary research and
labor. Thus, we start from a software-free solution, then build software to
manage private and shared data.

I plan to implement the following features.

  - Account verification. Optional at first.
  - Administrator's portal. View reports on accounts. Ban or verify accounts.
  - Account reporting. Request human intervention.
  - Vendor's dashboard. Manage rental items and their status.
  - Renter's dashboard. Show all rented items and saved listings.
  - Check-out flow. Vendors and renters both confirm rentals and returns.
    Finalizes a transaction for security purposes.
  - Advertising board. Vendors can optionally advertise items for rent.
  - Messaging. Convenient and improves fraud detection.
  - Rental applications. Streamlines procedure for initial contact.
  - Reservation calendar. This is partially implemented.

Each feature needs to be designed, built, and tested in the back and front end.
Account verification, check-out, and the reservation calendar will require
research. Overall, I would expect:

  - 2 weeks: account verification, administrator portal, account reporting.
  - 1 week: vendor's and renter's dashboards.
  - 3 weeks: check-out flow.
  - 1 week: advertising board.
  - 2 week: messaging.
  - 2 weeks: rental applications.
  - 3 weeks: reservation calendar.

This totals 14 weeks, or 3.5 months. I expect testing and framework changes to
add an additional 2 weeks overall.

## Next week

I will start implementing the administrator portal and reporting mechanism. I
don't intend to build a complex system, just enough for me to manage user
accounts. I also don't intend to verify any accounts, but I will label them as
unverified.

