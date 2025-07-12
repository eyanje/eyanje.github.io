---
layout: post
date: 2025-07-11
title: Work Log is live
categories: weekly-updates
---

Work Log is now live at [journal.eyanje.net](https://journal.eyanje.net).

This took a long time, mainly because of the inadequate security options on
existing routers. I thought, for a long time, that I would have to reconfigure
my entire network to place a single server online. However, I found a
solution that allows multiple machines to live on the Internet without
drastically changing existing network infrastructure.

## Deployment process

### Ingredients

1. An unused laptop, which will be used as a server.
2. An old router, which will be accessible on the internet.
3. A working router, which will serve general internet traffic.

### Steps

1. On the laptop, install the current stable version of Debian, and install and
   run the server.

2. On the laptop, enable incoming traffic to HTTPS.
   ```
ufw allow https
```
   The site should now be accessible for any local machine with the appropriate
   DNS entry. This can be achieved by editing `/etc/hosts`.

3. Install OpenWrt onto the old router. Configure the router so that it
   relays RA, DHCPv6, and NDP messages between the lan and wan6 interfaces.

   This was actually necessary on my home network, since the old router could
   only receive a 64-bit prefix and couldn't receive downstream packets.
   However, this will be necessary for exposing the server online.

4. Plug the old router into the working router and ensure that it has internet
   connectivity.

5. On the laptop, use NetworkManager to connect
   to the old router, then add a static IPv6 address

   ```
nmcli device wifi connect OpenWrt password secretpassword
nmcli connection modify OpenWrt ipv6.addresses 2600:4040:538f:7200:906a:5250:8a2f:75fe
   ```

7. On the router, add a firewall rule to enable incoming HTTPS traffic to the
   server.

   ![Allowing HTTPS traffic through
   LuCI](/assets/img/2025-07-11-firewall-allow-https.png)

   It should now be possible to access the site on the working router.

7. Enable DMZ in the working router, exposing the old router to the internet.

   ![Enabling DMZ in a Verizon FiOS
   router](/assets/img/2025-07-11-enable-dmz.png)

   It should now be possible to ping the router on mobile data, and
   the site should now be accessible to any machine on the internet with the
   appropriate DNS record, which, like before, can be achieved by editing
   `/etc/hosts/.

   Normally, the DMZ host feature would only allow a single machine to be
   exposed, but, since the router is relaying DHCPv6 and NDP messages, multiple
   machines' IPv6 addresses can be exposed and routed.

8. Set up global DNS records. Specifically, add an AAAA record pointing to your
   server's public IPv6 address.

   ![Adding a DNS record](/assets/img/2025-07-11-adding-a-dns-record.png)

   I did this through my registrar Cloudflare's website.

9. Test connectivity with the site. It may take up to 24 hours for the site to
   be accessible, depending on the speed at which DNS servers receive the new
   DNS record.


## Setting up a VPN

For convenience, I also set up a WireGuard VPN on my home network. This would
have enabled me to work from any network, not just my home network.

I decided install WireGuard onto my old router, since it was already routing
packets to my server. I installed the luci-proto-wireguard package, restarted
the router, and added a new interface. I set up peers in the router and in my
personal machine by generating keys and configuring IP addresses.

After setting up, I found that I could ping the router, and the router would
receive those packets. However, it would not return any of those pings,
making no effort to transmit data back.

The source of this problem, after a lot of searching, was that there was no
route back to my machine. To fix this, I went into the WireGuard interface's
Peer settings, and, for every machine, enabled the "Route Allowed IPs" setting.
This enabled packets to return back to the specified machine.

![Enabling the Route Allowed IPs
setting](/assets/img/2025-07-11-route-allowed-ips.png)

Since I wanted the server to always be accessible, I also needed to allow
WireGuard through its firewall, and I needed to keep an entry in my router's
routing table. To do so, I configured the server's WireGuard interface to use a
single listen port and to send keep-alive packets every 25 seconds by editing
the relevant connection in `/etc/NetworkManager/system-connections/`, a snippet
of which is shown below.

```
[wireguard]
listen-port=51820
private-key=mysecretkey

[wireguard-peer.WqSr1f569WY7Pu03Jo05Hyxe3HG0HTNs2v7U5iwQf28=]
endpoint=my-wireguard-server:51820
persistent-keepalive=25
allowed-ips=fdc7:4eb4:b8ae::1/48
```

`WqSr1f569WY7Pu03Jo05Hyxe3HG0HTNs2v7U5iwQf28=` should be the peer's public key.

### VPNs as security

After setting up and using the VPN to access my home network's resources, I'm
surprised to find how much control it has given me to configure the network.

Computer networks, for practical reasons, are set up around
physical arrangements. However, an organization's security is based on a virtual
premise: not just the machines, but also who is in control of those machines,
what those people are allowed to do. 

If we base an organization's security based on its physical layout, an employee
will be kicked out if they move away, losing access to network resources like
web sites and printers. Meanwhile, if a guest plugs in an ethernet cable, those
same, seemingly exclusive resources suddenly make themselves available.

Instead, if we configure our organization's security based on a completely
virtual (private) network, then our employee can keep access to resources they
need, even if they are not physically connected to a router we own, and a guest
can enjoy Internet connectivity without also accessing sensitive resources.

Now that my home network has a VPN, I've enabled myself to work from anywhere
with Internet connection, not just my home, without exposing my entire network
to attack. Years ago, if I needed access to ssh or an administrative panel,  I
just forwarded a port and hoped that no one would attack it. Now, I can access
any resource on my server and even configure my home network's settings, and I
only need to trust in the VPN's security to do so.

## Next week

There are a lot of things to work on.

1. Work Log doesn't look that great. It has one very basic home page, and all of
   its features require an account.
2. I haven't set up mailing, so users can't really sign up for accounts.
3. Work Log still has Laravel's branding everywhere.
4. The last time I deployed Work Log, it took half an hour. I want to automate
   this process so that I don't babysit a single build, waiting to run the next
   step. 

Next week, I will be looking for work. I still want to develop Work Log, and
maybe some other projects, but my priorities will be shifting somwhat.


