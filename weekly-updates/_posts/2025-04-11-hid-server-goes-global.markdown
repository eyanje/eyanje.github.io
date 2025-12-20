---
layout: post
title: HID Server goes global
date: 2025-04-11
tags: hiddev
---

## Progress

The HID server now runs as a Systemd service that places relevant sockets in
/run/hid-server. As I have discovered, systemd is fairly powerful and could
potentially be used to advertise specific SDP records in the server.

I also wrote hid-server-python, a Python module to open and use the relevant
sockets without specifying their location.

There is additional work needed to simplify deployment across all projects, but
I'm currently hesitating to pursue these until existing issues are resolved. If
I can't find a solution this week, I plan to halt development.

## Difficulties

### SDP advertisement

There exists a fundamental disconnect between SDP advertisement and data
transmission. Data transmission should be tied to the SDP record, but it is
generally impossible for the HID server to know what SDP record a remote device
reads.

Perhaps we should rely on the user to match the data to the device, since only
the user has control over both. If we make this assumption, we would make the
following changes:
1.   Remove SDP records from the HID server to avoid disagreement.
2.   Allow a client to connect to the HID server, even when it is not
     advertising an SDP record.
3.   Keep connections alive by forking new processes, and remove the now
     redundant command socket.
4.   Make it easy for a user to access a specific connection, avoiding direct
     access to the /run directory.

However, the current architecture works well when a server is a central hub,
assuming that devices connect once and remain connected forever. With so many
connections, other programs use the listed SDP records to route input data to
the right device. Even so, it is difficult to argue that the HID server is
benefit by assuming the current state of the SDP service, considering that the
server also can't accept any connections without the SDP record.

I have opened an issue on GitHub to address this issue, and I may copy these
notes to that thread.

### D-Bus

Throughout the development process, I've considered using D-Bus instead of
command and event sockets, but I've had trouble finding useful reasons to
switch.



