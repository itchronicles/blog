+++
title = 'Automatic LXC Login'
date = 2024-12-30T14:44:21+01:00
draft = false
description = "Automatically Login to a Proxmox LXC Container"
image = "/images/automatic-lxc-root-login/lxc-mini.webp"
imageBig = "/images/automatic-lxc-root-login/lxc-big.webp"
categories = ["general", "proxmox", "lxc", "systemd", "getty", "root", "login", "home lab"]
authors = ["lennart pieperjohanns"]
avatar = "/images/avatar.webp"
+++

## Introduction

In a homelab environment, it is often necessary to quickly access a LXC container for debugging or other purposes. Although we live in the age of SSH keys and Passwordmanagers, I still find myself forgetting these simple or strong root passwords I set for my containers. Especially when I have created the container to just "quickly test something".

This guide will show you how to automatically login to the root user of a Proxmox LXC container using the normal GUI Console.


## Prerequisites

- Proxmox
- a Proxmox LXC Container

## Process

Create the systemd override file for automatic root login:

```bash
GETTY_OVERRIDE="/etc/systemd/system/container-getty@1.service.d/override.conf"
mkdir -p $(dirname $GETTY_OVERRIDE)
cat <<EOF >$GETTY_OVERRIDE
[Service]
ExecStart=
ExecStart=-/sbin/agetty --autologin root --noclear --keep-baud tty%I 115200,38400,9600 \$TERM
EOF
systemctl daemon-reload
systemctl restart $(basename $(dirname $GETTY_OVERRIDE) | sed 's/\.d//')
```

This script does the following:
1. Creates a systemd override directory for the getty service.
2. Configures automatic root login without password.
3. Reloads systemd and restarts the getty service.

**Note:** This should only be used in development environments where security is not a concern. For production systems, always use proper authentication.

## Learn More
- 📖 <u>[What is Getty?](https://en.wikipedia.org/wiki/Getty_(Unix))</u> - Learn more about the Unix program that manages terminal logins


