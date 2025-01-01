+++
title = 'Vaultwarden With Custom SSL Certificate using docker'
date = 2025-01-01T22:42:22+01:00
draft = false
description = "Learn how to set up Vaultwarden with a custom SSL certificate in a docker container."
image = "/images/docker-vaultwarden-with-custom-cert/vaultwarden-icon.svg"
imageBig = "/images/docker-vaultwarden-with-custom-cert/vaultwarden-icon.svg"
categories = ["Docker", "Vaultwarden", "Linux", "Home Lab", "SSL", "Certificate"]
authors = ["lennart pieperjohanns"]
avatar = "/images/avatar.webp"
+++

## Introduction

Many people use Vaultwarden as a self-hosted password manager.
The most common way to setup Vaultwarden is to use a reverse proxy like nginx, traefik or caddy. However there is another way to setup Vaultwarden without a reverse proxy.
This guide will show you how to set up Vaultwarden with a custom SSL certificate in a docker container.

## Prerequisites

- A Linux server or container with docker installed
- A valid SSL certificate (see <u>[Creating a Cloudflare SSL Certificate using certbot](/posts/creating-cloudflare-certificate)</u>)

## Setup

For this guide, I assume that the current user is `root`. If you are not `root`, you can prefix the commands with `sudo` or `doas`. Alternatively, you can switch to the `root` user with `sudo su -`.

First, let's create a directory for Vaultwarden.

I will create the `/vaultwarden` directory in my root directory. However, you can choose any directory you want. One common place is `/opt/vaultwarden`.

```bash
cd /
mkdir /vaultwarden
cd /vaultwarden
```

Now that we are in the `/vaultwarden` directory, we have two options to install Vaultwarden.

1. Use a docker run command
2. Use a docker-compose file

### Option 1: Use a docker run command

```bash
docker run -d \
    --name=vaultwarden \
    --restart unless-stopped \
    -e DOMAIN="https://vault-test.itchronicles.org" \
    -e WEBSOCKET_ENABLED="true" \
    -e ROCKET_TLS='{certs="/ssl/fullchain.pem",key="/ssl/privkey.pem"}' \
    -v /vaultwarden/vw-data:/data \
    -v /etc/letsencrypt/live/vault-test.itchronicles.org/fullchain.pem:/ssl/fullchain.pem:ro \
    -v /etc/letsencrypt/live/vault-test.itchronicles.org/privkey.pem:/ssl/privkey.pem:ro \
    -p 443:80 \
    vaultwarden/server:latest
```

Let's break down the command:

- `docker run -d` creates a new container and runs it in detached mode
- `--name=vaultwarden` sets the name of the container to `vaultwarden`
- `--restart unless-stopped` sets the restart policy to `unless-stopped`
- `-e DOMAIN="https://vault-test.itchronicles.org"` sets the domain to `https://vault-test.itchronicles.org`
- `-e WEBSOCKET_ENABLED="true"` enables websockets
- `-e ROCKET_TLS='{certs="/ssl/fullchain.pem",key="/ssl/privkey.pem"}'` sets the SSL certificate and key
- `-v /vaultwarden/vw-data:/data` mounts the `/vaultwarden/vw-data` directory to the container as `/data`
- `-v /etc/letsencrypt/live/vault-test.itchronicles.org/fullchain.pem:/ssl/fullchain.pem:ro` mounts the fullchain.pem file to the container as `/ssl/fullchain.pem`
- `-v /etc/letsencrypt/live/vault-test.itchronicles.org/privkey.pem:/ssl/privkey.pem:ro` mounts the privkey.pem file to the container as `/ssl/privkey.pem`
- `-p 443:80` Maps Port 443 on the host to Port 80 on the container
- `vaultwarden/server:latest` specifies the image to use

### Option 2: Use a docker-compose file

First, we need to create a `docker-compose.yml` file.

```bash
touch docker-compose.yml
```

Now we can add the following content to the `docker-compose.yml` file:

```yaml
---
services:
  vaultwarden:
    image: vaultwarden/server:latest
    container_name: vaultwarden
    restart: unless-stopped
    environment:
      DOMAIN: "https://vault-test.itchronicles.org"
      WEBSOCKET_ENABLED: "true"
      ROCKET_TLS: >
        {certs="/ssl/fullchain.pem",key="/ssl/privkey.pem"}
    volumes:
      - /vaultwarden/vw-data:/data
      - /etc/letsencrypt/live/vault-test.itchronicles.org/fullchain.pem:/ssl/fullchain.pem:ro
      - /etc/letsencrypt/live/vault-test.itchronicles.org/privkey.pem:/ssl/privkey.pem:ro
    ports:
      - "443:80"
```

After creating the docker-compose file, you can start the container with the following command:

```bash
docker-compose up -d
```

## Learn More
- 📖 <u>[Vaultwarden Documentation](https://github.com/dani-garcia/vaultwarden)</u> - Learn more about Vaultwarden
- 📖 <u>[Docker Compose Documentation](https://docs.docker.com/compose/)</u> - Learn more about Docker Compose


