---
layout: post
date: 2025-09-27
title: Separating frontend from backend
---

This week, I separated the Pressure Washer Rental stack into a React front end
and an API-only Rails back end.

## Selecting Rails

Initially, I wanted to split the back end further, isolating the controllers in
a separate codebase. I began writing controllers in Go using the [Gin web
framework](https://gin-gonic.com/), aiming for performance.

To test this controller, I needed to build a system for managing databases in
production and development environments. Rails achieves this through sequenced
migrations, so I built a simpler system to generate and run SQL scripts on an
arbitrary database. This replicated the old workflow in a ORM-free context.

I began adding more layers to the back end. The envrionment had a database and a
controller using that database, so it was time to add a model. At this point, I
was just ineffectively replicating Rails, so I gave up and consolidated the back
end into a single API-only Rails project.

## Selecting React

I now wanted to select a front-end framework. I had used Vue.js most recently,
and Angular.js before that. Vue.js offered a familiar component framework, and
Angular.js offered easy integration with RxJs. I had used React in the past, but
I really wanted to try practicing further with other frameworks.

I was tempted to use Angular.js again, but I disliked its templating syntax.
Vue.js had better syntax, but, ultimately, React's JSX syntax was the clear
winner. Considering its [popularity among
developers](https://survey.stackoverflow.co/2025/technology#most-popular-technologies)
and [mobile capabilities](https://reactnative.dev/), React was also the better
long-term pick.

## Trying Next.js

[Next.js](https://nextjs.org/) is a popular framework for writing full-stack
applications in React that provides routing and navigation. I had used Next.js
to write a server-side application before, so, when I picked it up again,
initial development flowed smoothly.

I later discovered the same issues that I encountered in my last experience. I
tried a Context to replicate the dependency injection pattern that occurs in
[Angular](https://angular.dev/guide/di/dependency-injection) and
[Vue](https://vuejs.org/guide/components/provide-inject.html). This normally
works well, but, in Next, it is impossible to use a Context at the application's
root. The Context must run on the client, while the root must run on the server.

I also failed to apply a custom layout for logins. In Next.js, a layout is
applied to the current page and pages in all subdirectories. Therefore, to give
the login page a custom layout, I would have needed to move all other pages
into a subdirectory.

## Using React Router

[React Router](https://reactrouter.com/home) is another framework that can build
front-end and full-stack applications. It supports additional options for
creating routes and layouts, and, compared to Next.js, provides more client-side
APIs.

After switching to React Router, 
I implemented creating accounts, signing in, and signing out, using React
Router's data loaders and client actions, with [SWR](https://swr.vercel.app/) to
simplify API calls. I resolved the layout issue, and I sidestepped using
dependency injection by importing configuration data from [environment
variables](https://vite.dev/guide/env-and-mode.html#env-variables).

## Rails Authentication

For authentication, I used [Devise](https://github.com/heartcombo/devise), which
provides sessions, users, and test helpers, among other features.

To use Devise in an API-only application, I had been steadily patching
individual parts of the stack. I configured CORS using
[rack-cors](https://github.com/cyu/rack-cors) and [Action
Dispatch](https://guides.rubyonrails.org/configuring.html#config-action-dispatch-cookies-same-site-protection)
and provided an additional endpoint to return the state of a user's session.
While implementing sign-out, I tried but failed to return flash messages in the
HTTP response. Eventually, I decided to rewrite each controller and convert
every instance of flash to a `render`. Even then, messages were flashed in
various places.

Evidently, Devise is [not yet
ready](https://github.com/heartcombo/devise/wiki/API-Mode-Compatibility-Guide)
for usage in API-only Rails, and functionality will be compromised. Even so,
it still contains a wide set of tools for session-based authentication, so it
would be convenient if I could use it.

If I don't use Devise, I might at least use
[Warden](https://github.com/wardencommunity/warden).

## Next week

I will continue developing the rental service, and it should be possible to
sign in, sign out, and register for an account.

