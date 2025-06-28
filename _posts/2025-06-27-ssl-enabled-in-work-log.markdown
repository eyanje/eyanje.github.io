---
layout: post
date: 2025-06-27
title: SSL enabled in Work Log
categories: personal-projects updates
---

Work Log now uses self-signed certificates for TLS. These aren't as secure as
[Let's Encrypt](https://letsencrypt.org/)'s certificates, but I wanted to try to
set up the certificates myself.

![SSL is enabled for the server](/assets/img/2025-06-27-ssl-enabled.png)

Based on the examples in [openssl-req's manual
entry](https://docs.openssl.org/master/man1/openssl-req/), I wrote the following
configuration file to generate a certificate for the site.

```openssl
[ req ]
distinguished_name = req_distinguished_name
req_extensions = v3_ca
prompt = no

[ req_distinguished_name ]
C = US
ST = Massachusetts
L = Boston
O = Edward Yan
CN = journal.eyanje.net
emailAddress = eyanje@gmail.com

[ v3_ca ]
subjectAltName = DNS:journal.eyanje.net
keyUsage = digitalSignature
extendedKeyUsage = serverAuth
```

To generate the keys and certificates, I created a Makefile to run the
appropriate commands. Keys currently use RSA, but it should be easy to use any
suitable algorithm, like ECDSA.

```make
all : keys/work-log.pem certs/work-log.pem

.PHONY : clean

clean :
        rm -f keys/*.pem certs/*.pem

keys/%.pem :
        openssl genpkey -algorithm rsa -out $@

certs/%.pem : conf/%.req.conf keys/%.pem
        openssl req -new -x509 -config conf/$*.req.conf -key keys/$*.pem -out $@
```

Finally, I build the keys in the Dockerfile for the central nginx server.

```Dockerfile
FROM alpine:latest AS ssl-builder
 
RUN apk add --no-cache openssl make
 
WORKDIR /etc/nginx/ssl
COPY ./ssl /etc/nginx/ssl
RUN make clean && make
 
FROM nginx:alpine
 
WORKDIR /etc/nginx
COPY . /etc/nginx/
COPY --from=ssl-builder /etc/nginx/ssl /etc/nginx/ssl
```

Unfortunately, the keys will eventually expire, which Docker won't fix until I
edit something manually. so I'll need to change this setup to regenerate the
keys regularly.

## Next week

I still haven't deployed the site. I'm still afraid to try to install OpenWRT,
and I'm also a little afraid to be responsible for others' personal data.
Fortunately, if I'm the only user, that second point should be fine.

Next week, I'll try to expose the project to the internet.
