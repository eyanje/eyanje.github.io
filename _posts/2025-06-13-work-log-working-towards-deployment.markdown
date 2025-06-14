---
layout: post
date: 2025-06-13
title: Work Log is heading toward deployment
categories: personal-projects updates
---

## Work Log

Work Log is still preparing for deployment. I have a local server with Nginx
pointed at the app, but the server itself is not yet ready for the public.

### Marketing

I've created a few logos, but, due to their simplicity, they struggle to render
well at small sizes. Their central motif is a series of rings in a flower, but
the silhouette is too uniformly circular, even with a good color scheme.

The name is still undecided. Since this is a personal project, a simple name
like "journal" or "tracker" should suffice, but "Work Log" does not.

### Containerization

I attempted to containerize my application, a first for me. I hoped that
isolating my application in a container would help to automate deployment of
multiple applications, but I need to manage a central Nginx server and secret
values carefully to avoid breaking automation. My current attempts to modularize
the application have failed so far.

### IP addressing

Since my server runs locally, I intend to use a IPv6 address to access its
services rather than port forwarding. When I used port forwarding in the past, I
had issues managing the server without access to the router. However, switching
to IPv6 has presented a number of security tradeoffs, which I haven't resolved
yet.

### Next week

I will resolve this week's issues and deploy the application. Logos and names
will be tentative but usable. The app should be containerized and deployed
automatically, with minimal management.

