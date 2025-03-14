+++
title = 'How to open a port under RedHat'
date = 2025-03-14T10:53:02+01:00
draft = false
description = "Learn how to open and manage firewall ports in RedHat Enterprise Linux (RHEL) using firewall-cmd. Step-by-step guide for configuring firewalld, adding ports, and securing your RHEL system with proper firewall management."
image = "/images/redhat-firewall-open-port/firewall.png"
imageBig = "/images/redhat-firewall-open-port/firewall.png"
categories = ["RHEL", "Linux", "Redhat"]
authors = ["lennart pieperjohanns"]
avatar = "/images/avatar.webp"
+++

## Introduction

In RedHat-based systems, managing firewall rules is crucial for controlling network access to your services. The `firewall-cmd` command-line tool, which is part of the `firewalld` service, provides a user-friendly interface for managing your system's firewall rules. This article will guide you through the process of opening ports using `firewall-cmd`.

## Prerequisites

Before proceeding, ensure you have:

1. Root access or sudo privileges on your RedHat system
2. `firewalld` service installed and running
3. The specific port number and protocol (TCP/UDP) you want to open

Note: If you encounter "Permission denied" errors while running any commands in this guide, prefix them with `sudo`. For example: `sudo firewall-cmd --state`

To verify if `firewalld` is running, use:
```bash
systemctl status firewalld
```

If it's not running, start it with:
```bash
systemctl start firewalld
systemctl enable firewalld
```

## Process

### 1. Check Current Firewall Status

First, verify your firewall's current status and configuration:

```bash
firewall-cmd --state
firewall-cmd --list-all
```

### 2. Add a New Port

To open a new port, use the following syntax:

```bash
firewall-cmd --zone=public --add-port=<port-number>/<protocol>
```

For example, to open port 8080 for TCP:
```bash
firewall-cmd --zone=public --add-port=8080/tcp
```

Note: This change is temporary and will be lost after a system reboot.

### 3. Make the Change Permanent

To make the port opening permanent, add the `--permanent` flag:

```bash
firewall-cmd --zone=public --add-port=8080/tcp --permanent
```

After adding a permanent rule, reload the firewall:
```bash
firewall-cmd --reload
```

### 4. Verify the Changes

To confirm that the port has been opened:

```bash
firewall-cmd --list-ports
```

### 5. Common Examples

Here are some common use cases:

- Opening HTTP port (80):
```bash
firewall-cmd --zone=public --add-port=80/tcp --permanent
```

- Opening HTTPS port (443):
```bash
firewall-cmd --zone=public --add-port=443/tcp --permanent
```

- Opening a range of ports:
```bash
firewall-cmd --zone=public --add-port=4000-4100/tcp --permanent
```

### 6. Removing Ports

If you need to close a port:

```bash
firewall-cmd --zone=public --remove-port=8080/tcp --permanent
firewall-cmd --reload
```

## Additional Tips

1. **Working with Services**: Instead of opening specific ports, you can allow predefined services:
```bash
firewall-cmd --zone=public --add-service=http --permanent
```

2. **List Available Services**:
```bash
firewall-cmd --get-services
```

3. **Zones**: FirewallD uses zones to define the trust level of network connections. The default zone is 'public', but you can list available zones:
```bash
firewall-cmd --get-zones
```

4. **Backup Your Rules**: Before making significant changes, it's good practice to backup your firewall rules:
```bash
firewall-cmd --runtime-to-permanent
```

## Verifying Port Status

After opening a port, it's important to verify if the service is actually listening on that port. Here are several ways to check:

### Using netstat

The `netstat` command is a classic tool for checking network connections and listening ports:

```bash
# Show all listening TCP ports with process names (-t for TCP, -l for listening, -n for numeric, -p for process)
netstat -tlnp

# Show all listening UDP ports
netstat -ulnp

# Filter for a specific port (e.g., port 8080)
netstat -tlnp | grep 8080
```

### Using ss (Socket Statistics)

The `ss` command is a modern replacement for netstat:

```bash
# Show all listening ports
ss -tulnp

# Check specific port
ss -tulnp | grep 8080
```

### Using lsof

The `lsof` command can show which process is using a specific port:

```bash
# Check what's using port 8080
lsof -i :8080
```

If no process is shown as listening on your opened port, it means:
1. The service isn't running
2. The service is configured to use a different port
3. The service is only listening on specific IP addresses

Remember: Opening a port in the firewall only allows traffic through - it doesn't automatically mean a service is listening on that port.

## Conclusion

Managing ports with `firewall-cmd` in RedHat is straightforward once you understand the basic concepts. Remember to always use the `--permanent` flag for persistent changes and reload the firewall after making modifications. Be cautious when opening ports, and only open what's necessary for your services to function properly.

For more detailed information, you can always consult the manual:
```bash
man firewall-cmd
```