+++
title = 'Creating a Cloudflaire SSL Certificate using certbot'
date = 2024-12-27T17:48:13+01:00
draft = false
description = "Learn how to create a Cloudflaire SSL certificate using certbot on a Debian 12 server."
image = ""
imageBig = ""
categories = ["general"]
authors = ["lennart pieperjohanns"]
avatar = "/images/avatar.webp"
+++

## Introduction

This guide will show you how to create a Cloudflaire SSL certificate using certbot on a Debian 12 container.

## Prerequisites

- A Debian 12 server or container
- A Cloudflaire account
- A domain

It is necissary to have a domain that is pointing to cloudflare as the DNS provider.

once the domain is pointing to cloudflare, you can create a cloudflare token.

## Creating a Cloudflaire token

To create a Cloudflaire token, you need to go to the Cloudflaire dashboard and scroll down to the API section.

Click on "Get your API token".


Cloudflare's newer API Tokens can be restricted to specific domains and operations, and are therefore now the recommended authentication option.

The Token needed by Certbot requires Zone:DNS:Edit permissions for only the zones you need certificates for.



after the token is created, you can use it to create a certificate.

## Installing certbot

```bash
apt update
apt install python3 python3-venv libaugeas0
python3 -m venv /opt/certbot/
/opt/certbot/bin/pip install --upgrade pip
/opt/certbot/bin/pip install certbot certbot-dns-cloudflare
```
Link certbot to the system path

```bash
ln -s /opt/certbot/bin/certbot /usr/bin/certbot
```

## Creating the certificate

```bash
certbot certonly --dns-cloudflare --dns-cloudflare-credentials ~/.secrets/certbot/cloudflare.ini -d cert-test.itchronicles.org
```

