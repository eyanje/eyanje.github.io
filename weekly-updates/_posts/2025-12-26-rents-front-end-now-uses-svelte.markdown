---
layout: post
date: 2025-12-26
title: Rent's front end now uses Svelte
---

Last week, I encountered bugs with the single-page front end, so, out of
curiosity, I rewrote the front end using SvelteKit, which resolved most of these
issues.

Unlike React, which puts HTML in JavaScript, Svelte keeps JavaScript inside
HTML, like Vue and traditional web pages, and builds markup like a
template language, such as Jinja. By using native HTML and CSS, Svelte
automatically includes recent HTML and CSS features, useful for creating
[dialogs](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog).

Naturally, I've been using SvelteKit for routing. Like React Router, there are
clear separations between front-end and back-end code, but there are also
options to write universal code. SvelteKit still performs some client-side
navigation, but it seems to match native browser behavior better than React
Router. It's also nice making API calls in the back end, improving load times
and accessibility.

## Next week

I made an unsuccessful attempt to simplify the API this week, so the application
is currently broken. Next week, I'll successfully simplify the API, then
recreate the site's CSS.



