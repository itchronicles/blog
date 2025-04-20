+++
title = 'How to create a Cloudflare SSL Certificate using certbot'
date = 2024-12-27T17:48:13+01:00
draft = false
description = "Learn how to create a SSL certificate using certbot and Cloudflare on a Debian 12 container."
image = "/images/creating-cloudflare-certificate/cert-mini.webp"
imageBig = "/images/creating-cloudflare-certificate/cert-big.webp"
categories = ["Debian", "Certbot", "Cloudflare", "Linux", "home lab", "ssl", "certificate"]
authors = ["lennart pieperjohanns"]
avatar = "/images/avatar.webp"
+++

## Introduction

As IT Enthusiasts, having a homelab is great. You can have projects, deploy practical things like a password manager or your own cloud.
However, no one likes having warnings like "Your connection is not Private". To fix this, there are multiple options: either import the self-signed certificate, set up your own CA, or get a valid certificate from a CA like Let's Encrypt.
Since I have a domain registered with Cloudflare, I thought why not make use of it.

So here is my way of getting certificates through Certbot and Cloudflare.

## Prerequisites

- A Debian 12 server or container
- A Cloudflare account
- A domain

It is necessary to have a domain that is pointing to Cloudflare as the DNS provider.

Once the domain is pointing to Cloudflare, you can create a Cloudflare token.

## Creating a Cloudflare token

To create a Cloudflare token, you need to go to the Cloudflare dashboard and scroll down to the API section.

Click on "Get your API token".

<img src="/images/creating-cloudflare-certificate/get-cloudflare-token.webp" alt="Get Cloudflare Token" style="max-width: 400px; width: 100%; height: auto;">

Now you need to create a token.

<img src="/images/creating-cloudflare-certificate/create-token-cloudflare-token.webp" alt="Create Cloudflare Token" style="max-width: 700px; width: 100%; height: auto;">

Cloudflare's API tokens can be restricted to specific domains and operations. They are therefore the recommended authentication option.

The token needed by Certbot requires `Zone:DNS:Edit` permissions for only the zones you need certificates for.

Click on "Create Token" and then "Use template" next to "Edit zone DNS".
<img src="/images/creating-cloudflare-certificate/template-cloudflare-token.webp" alt="Template Cloudflare Token" style="max-width: 700px; width: 100%; height: auto;">

Now you need to configure the token. There are multiple options to restrict the tokens: permissions to a specific zone or all zones, Client API Address, and the time it is valid for.

<img src="/images/creating-cloudflare-certificate/configure-cloudflare-token.webp" alt="Configure Cloudflare Token" style="max-width: 900px; width: 100%; height: auto;">

After the token is created, you can use it to get a certificate.

**Warning:** The token is only displayed once and cannot be retrieved later. So better save it somewhere safe.

## Installing Certbot

```bash
apt update && apt install -y certbot python3-certbot-dns-cloudflare
```

## Creating the certificate

First, let's create a directory for the secrets.

```bash
mkdir -p ~/.secrets/certbot
```

Now create the cloudflare.ini file. Because of the `~/`, this example saves the file in the home directory of the user.

```bash
cat <<EOF > ~/.secrets/certbot/cloudflare.ini
dns_cloudflare_api_token = "your_api_token_here"
EOF
```

Certbot will display a warning if it detects that the credentials file can be accessed by other users. To fix this, you can change the permissions of the file.

```bash
chmod 600 ~/.secrets/certbot/cloudflare.ini
```

Now you can finally create the certificate!

```bash
certbot certonly --dns-cloudflare --dns-cloudflare-credentials ~/.secrets/certbot/cloudflare.ini -d cert-test.itchronicles.org
```

Let's break down the command:

- `certbot certonly`: This tells Certbot to only obtain the certificate without installing it
- `--dns-cloudflare`: Specifies that we want to use the Cloudflare DNS challenge for domain validation
- `--dns-cloudflare-credentials`: Points to the file containing our Cloudflare API token
- `-d cert-test.itchronicles.org`: Specifies the domain name for the certificate we want to create

Typically, Certbot will save the certificates in `/etc/letsencrypt/live/`.

To validate the certificate, you can use the `certbot certificates` command.

```bash
certbot certificates
```

This will display the certificates and their status.
