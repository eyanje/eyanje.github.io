---
layout: post
date: 2025-04-18
title: Removed SDP and searching for projects
---

This week, I removed SDP logic from the HID server, for little benefit, and I've
made the first steps to working on other projects.

## HID Server

### Progress

I've removed the SDP records and registration constraints in a branch called
no-sdp.

### Design

#### Don't spawn new proesses for each connection

Last week, I considered forking new processes in order to handle connections. It
would be easy to ensure that advertising triggers listening using systemd.
However, there are other problems with this, especially within Rust's type
safety.

There are two communication channels, but they are part of one connection. If I
fork one process for both, that process would need to receive the interrupt
channel through a socket. If I separate the processes, I still risk establishing
extra communication channels to coordinate.

Forking would let me separate the communication code from the server code, but I
would need to set up file descriptors carefully when forking, dealing with a
variety of safety issues. This separation doesn't seem worth the extra overhead.

#### No reason to split listening and transmission

I also considered splitting the HID server into two servers: one to listen for
connections, and one to transfer data. In addition to the SDP server, this would
produce three services:
1. A keep-alive service that exposes Unix domain sockets.
2. A listening server that listens on the appropriate PSM, then sends
   connections to the persistent server.
3. An advertising service which publishes an SDP record. This advertising
   service requires the listening server to be running.

However, the keep-alive server and the listening server are still very closely
linked. In practice, what use is a keep-alive server that's tuned for HID
control and interrupt sockets? Why have a standalone listening server if if just
sends sockets to a different process?

I've preserved the details of the keep-alive service.

##### Original notes

The keep-alive service receives file descriptors with a name. It then creates a
unix domain socket to correspond with the file descriptor. This Unix domain
socket might be a variety of protocols, which we don't necessarily know in
advance. But I suppose we could… assume? Maybe it's better not to.

Input: socket domain, socket type, socket protocol, bound path: bluetooth address (variable).
Output: create a socket with:
* domain: `AF_UNIX`
* socket type: same socket type
* socket protocol: 0
* Bound path: bluetooth address

If the socket type is a dataram, just continuously read and write.
If the socket type is connection-oriented, accept one connection at a time.

We could choose to make this specific to Bluetooth, which means we can simplify
the server's behavior to assume certain behvior of the socket, or we could make
a generalized program.

We need the sockets to operate together. And we can't be disconnected.

Okay, so the behavior of the sockets (control and interrupt) needs to be tuned
for HID applications. Specifically, the number of connections, additional
proxying, connecting and disconnecting entire devices, all of these need to be
controlled together. And I don't intend to build a full proxying application;
that would be rather ambitious.

Is there any reason to split the current HID server, which has its own interface
for going up and down, into the keep-alive and listening servers? It splits the
application in two, but we have to insert D-Bus within the gap. It would be
easier to keep all the file descriptors within one process, rather than
transferring them.

### HID Server struggles to generalize

Originally, HID server was to provide a universal implementation of the HID
profile. However, developers can already set up their own implementations using
Bluetooth sockets and BlueZ's profile advertisement methods, if they disable
Sixaxis support.

The persistent server can help to keep connections alive, so after one method
of control has been relinquished, we can substitute another as we please. This
would be useful for a number of connections and event architectures, but I can't
provide a generalized keep-alive server that would also work well for HID.

Between advertising SDP records and listening, between creating and preserving a
communication channel, I'm having a lot of trouble justifying splits, why we
should put effort into keeping connections alive when we don't know them.

For most uses, I recommend for application developers to simply use the sockets
directly. It's easy in Python using the built-in sockets library, which already
supports the `AF_BLUETOOTH` family. SDP advertisement remains a challenge.

## Trying open source development

I'll be searching for other projects to work on.

After reading
[New to open source? Here's everything you need to get started](https://github.blog/open-source/new-to-open-source-heres-everything-you-need-to-get-started/)
and
[Make your first open source contribution in four easy steps](https://github.com/readme/guides/first-oss-contribution),
I've decided to find projects where I can make meaningful non-code
contributions. Since I've used Debian for so many years, I should have a lot of
options. So far, I've filed a report in BlueR after triaging a bug.

