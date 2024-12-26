+++
title = 'Automating Disk Resizing with Ansible on RHEL Server'
date = 2024-12-26T17:58:53+01:00
draft = false
description = ""
image = "/images/automating-disk-resizing/automating-disk-resizing-first.png"
imageBig = "/images/automating-disk-resizing/automating-disk-resizing-first.png"
categories = ["Ansible", "RHEL"]
authors = ["lennart pieperjohanns"]
avatar = "/images/avatar.webp"
+++

As server admins, resizing disks of virtual machines is a task that routinely happens. It often involves several manual steps, from rescanning the SCSI bus to resizing physical and logical volumes. However, these steps can be automated using Ansible, making the process more efficient and less error-prone.

This playbook assumes that the physical root disk has been resized for more storage and provides a solution using Ansible.

## Ansible Playbook for Disk Resizing:
```YAML
---
- name: Automate Disk Resizing on RHEL
  hosts: all
  become: yes
  tasks:
    - name: Rescan SCSI bus
      ansible.builtin.shell: rescan-scsi-bus.sh -u

    - name: Resize partition 2 on /dev/sda
      ansible.builtin.expect:
        command: parted ---pretend-input-tty /dev/sda resizepart
        responses:
          "Fix/Ignore?": "Fix"
          "Partition number?": "2"
          "End?": "100%"

    - name: Inform the OS of partition table changes
      ansible.builtin.shell: partprobe /dev/sda

    - name: Resize physical volume /dev/sda2
      ansible.builtin.shell: pvresize /dev/sda2

    - name: Extend logical volume /dev/mapper/rhel-root
      ansible.builtin.shell: lvextend -r -l +100%FREE /dev/mapper/rhel-root

    - name: Rescan SCSI bus
      ansible.builtin.shell: rescan-scsi-bus.sh -u
```
## This playbook performs the following tasks:

1. Rescans the SCSI bus to detect the new disk size.
2. Uses `parted` to resize the partition. The `expect` module helps handle interactive prompts by providing the necessary responses.
3. Runs `partprobe` to inform the operating system of partition table changes.
4. Resizes the physical volume using `pvresize`.
5. Extends the logical volume using `lvextend` to utilize the newly available space.
6. Rescans the SCSI bus again as a final step.

This playbook is designed for a RHEL server in a home lab environment, where automatic provisioning was used. However, in a production setting, it is more common to manually size the partitions in a template, which makes it possible to use the playbook for different hosts. If the volume is under another number or the logical volume has another name, the script needs to be edited accordingly.

## To identify the current volume and logical volume names, you can use the following command:
```bash
[root@rhel ~]# lsblk
NAME                        MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
sda                           8:0    0   25G  0 disk
├─sda1                        8:1    0    1G  0 part /boot
└─sda2                        8:2    0   14G  0 part
  ├─rhel-root               253:0    0 12.5G  0 lvm  /
  └─rhel-swap               253:1    0  1.5G  0 lvm  [SWAP]
sr0                          11:0    1  991M  0 rom
```

After the playbook was executed the root logical volume (rhel-root) has been extended to utilize the additional space, growing from 12.5G to 22.5G.

```bash
[root@rhel ~]# lsblk
NAME                        MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
sda                           8:0    0   25G  0 disk
├─sda1                        8:1    0    1G  0 part /boot
└─sda2                        8:2    0   24G  0 part
  ├─rhel-root               253:0    0 22.5G  0 lvm  /
  └─rhel-swap               253:1    0  1.5G  0 lvm  [SWAP]
sr0                          11:0    1  991M  0 rom
```
By following this playbook, you can automate the disk resizing process on your RHEL servers, saving time and reducing the potential for human error. This approach can be tailored to fit different environments and configurations, making it a versatile solution for managing disk space on virtual machines.