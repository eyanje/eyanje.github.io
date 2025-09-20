---
layout: post
date: 2025-09-19
categories: weekly-updates
title: Dates editable in Work Log and a pressure washer rental
---

Work Log now supports entering end dates and editing records. I have also
started a second full-stack engineering project, this time to advertise and
coordinate rentals of a pressure washer at home.

It is now possible to add the ending time for a record by clicking a button
labeled "Now".

Previously, there was a rudimentary form to edit records, but it was not connected to
the backend. Now, the form is functional and formats dates and times through the
browser's native [datetime-local input](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/datetime-local).

<video autoplay controls>
    <source src="/assets/images/2025-09-19-end-dates-and-editing.mp4"
type="video/mp4" />
    <a href="/assets/images/2025-09-19-end-dates-and-editing.mp4">Original video</a>
</video>

## Pressure washer rental

I started developing a demo to assist in renting out our pressure
washer.

![Powerwash rental](/assets/images/2025-09-19-powerwash-rental.png)

I'm just getting started with using Rails as a backend, and it provides good
functionality for managing users, sessions, reservations, and other resources.
However, with only ERB templates, it seems that all CSS files need to be
imported into every page, which has limited scalability in the past.

Eventually, I'll also need to add interactivity to the page, probably through
React or TypeScript. I'm not sure how this will integrate with Rails.

## Next week

In its current state, Work Log is now functional. It isn't very polished yet:
end dates are missing, and there is no offline support. However, there are also
larger issues about storage and security which shouldn't exist in an application
designed for personal use.

For this reason, I don't have any plans to develop Work Log further, at least
for now. The next feature should be offline support, which will change a lot of
the backend's design, potentially discarding Laravel entirely.

I do plan to develop the power washer rental, but I will likely recreate the
application a few times to get things right. I don't even know if I'll make a
frontend.

