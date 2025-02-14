+++
title = 'How to automatically manage content on Redhat Satellite with Ansible'
date = 2025-02-13T19:52:06+01:00
draft = false
description = "Learn how to automatically manage content on Redhat Satellite with Ansible"
image = "/images/redhat-satellite-automatic-content-management-with-ansible/content-management.webp"
imageBig = "/images/redhat-satellite-automatic-content-management-with-ansible/content-management.webp"
categories = ["Ansible", "RHEL", "Linux", "Automation", "Satellite", "Content Management", "Redhat"]
authors = ["lennart pieperjohanns"]
avatar = "/images/avatar.webp"
+++

## Introduction

Part of managing a big server infrastructure is making sure that the servers are up to date. For that, we use central servers to manage updates. One such system is the RedHat Satellite, a platform to manage your RedHat subscriptions, updates, insights, and much more.
All these features make it a great tool to manage your servers. However, it also entails a lot of granular and sometimes manual work.

For that reason, I sought out to automate some of these tasks.

### What Do I Want to Automate?

What I needed was a simple way to publish a new content view to my test servers, update them, and then promote the content view to my production servers.

This way I can test the updates in a test environment before they are promoted to production. If something goes wrong, the playbook will fail and not promote the content view to production.

## Prerequisites

- A RedHat Satellite server or Foreman server
- RHEL / Fedora hosts 
- A user with the necessary permissions to manage the content on the satellite server
- [ansible-collection-redhat-satellite](https://github.com/RedHatSatellite/satellite-ansible-collection)

## Process

### Playbook Beginning and Global Variables

First, we need to create the base of the playbook.

```yaml
---
- name: Publish rhel content view
  hosts: all
  become: true 
  vars:
    satellite_server_url: https://satellite.example.com
    satellite_username: "{{ username }}"
    satellite_password: "{{ password }}"
    satellite_organization: "{{ organisation }}"
```	
Together with the standard playbook structure, I define that we want to become the root user on the hosts and I also give the global variables that we will use in the playbook.

- satellite_server_url: the url of the satellite server
- satellite_username: the username of the user that has the necessary permissions to manage the content on the satellite server
- satellite_password: the password of the user
- satellite_organization: the organization that we want to manage the content for

Feel free to change any of these variables, even to static values if that suits your needs.

### Publishing the Content Views

The first task is to publish the new content views. 

```yaml	
  tasks:
    - name: publish new contentviews
      ansible.builtin.include_role:
        name: redhat.satellite.content_view_publish
      vars:
        satellite_content_views:
          - content_view: content_view_1
            description: "{{ ansible_date_time.day }}-{{ ansible_date_time.month }}-{{ ansible_date_time.year }}"
            lifecycle_environments: test
          - content_view: content_view_2
            description: "{{ ansible_date_time.day }}-{{ ansible_date_time.month }}-{{ ansible_date_time.year }}"
            lifecycle_environments: test
      run_once: true
```

For this, I use the redhat.satellite.content_view_publish role, and I define more variables specific for this task. As they are on the task/local level, they will not be used in the next tasks.

- satellite_content_views: Defines that there is more than one content view that we want to publish
- content_view: The name of the individual content view that we want to publish
- description: The description of the content view (I use the current date in this example: day-month-year)
- lifecycle_environments: The lifecycle environment that we want to publish the content view to

<br>

#### run_once: True

run_once is special as it allows us to run the task only once. Because I am going to deploy the playbook against multiple hosts, I don't want to publish the content views every time. This way, only one (typically the first) host will publish the content views, and the playbook will move on to the next task.

### Updating the Test Servers

After the content views are published and promoted to the test environment, we can update the servers.

```yaml
    - name: Update Server
      ansible.builtin.yum:
        name: '*'
        state: latest
      register: task_result
       
    - name: Print return information from the previous task
      ansible.builtin.debug:
        var: task_result
     
    - name: reboot server if there was an update
      reboot:
      when: task_result is changed
     
    - name: Update Server again
      ansible.builtin.yum:
        name: '*'
        state: latest
```

Here we update the servers and make a quick reboot on the condition that there was an update installed. To make sure that there is no update left, we run the update one more time. (I also make use of the debug module to print the return information of all the packages that were updated, installed, or removed.)

This way we can test if the update causes any issues, and if so, the playbook will fail and not promote the content views to the production environment.

### Promoting the Content Views

After the servers are updated successfully, we can promote the content views to the production environment.

```yaml
    - name: promote contentviews
      ansible.builtin.include_role:
        name: redhat.satellite.content_view_publish
      vars:
        satellite_content_views:
          - content_view: content_view_1
            current_lifecycle_environment: test
            lifecycle_environments: prod
          - content_view: content_view_2
            current_lifecycle_environment: test
            lifecycle_environments: prod
      run_once: true
```

This is very similar to the publishing task. However, even though we call for the publishing role again, this task will simply promote the content views in the current lifecycle environment (test) to the next lifecycle environment (prod).

Variables explained:
- satellite_content_views: Defines that there are more than one content view that we want to promote
- content_view: The name of the individual content view that we want to promote
- current_lifecycle_environment: The current lifecycle environment of the content view (test)
- lifecycle_environments: The lifecycle environment that we want to promote the content view to (prod)

## Complete Playbook

First, we need to create the playbook:

```bash
nano playbook.yml
```

Now we can add the content of the playbook. Please note to change any variables to your own values. For example, the satellite_server_url, content_view_1, content_view_2, or even the organisation, lifecycle_environment, username, and password.

```yaml
---
- name: Publish rhel content view
  hosts: all
  become: true 
  vars:
    satellite_server_url: https://satellite.example.com
    satellite_username: "{{ username }}"    
    satellite_password: "{{ password }}"
    satellite_organization: "{{ organisation }}"
  tasks:
    - name: publish new contentviews
      ansible.builtin.include_role:
        name: redhat.satellite.content_view_publish
      vars:
        satellite_content_views:
          - content_view: content_view_1
            description: "{{ ansible_date_time.day }}-{{ ansible_date_time.month }}-{{ ansible_date_time.year }}"
            lifecycle_environments: test
          - content_view: content_view_2
            description: "{{ ansible_date_time.day }}-{{ ansible_date_time.month }}-{{ ansible_date_time.year }}"
            lifecycle_environments: test
      run_once: true

    - name: Update Server
      ansible.builtin.yum:
        name: '*'
        state: latest
      register: task_result
       
    - name: Print return information from the previous task
      ansible.builtin.debug:
        var: task_result
     
    - name: reboot server if there was an update
      reboot:
      when: task_result is changed
     
    - name: Update Server again
      ansible.builtin.yum:
        name: '*'
        state: latest
    
    - name: promote contentviews
      ansible.builtin.include_role:
        name: redhat.satellite.content_view_publish
      vars:
        satellite_content_views:
          - content_view: content_view_1
            current_lifecycle_environment: test
            lifecycle_environments: prod
          - content_view: content_view_2
            current_lifecycle_environment: test
            lifecycle_environments: prod
      run_once: true
```

Now we can finally run and test the playbook:

```bash
ansible-playbook -i host.example.com, -e "username=admin" -e "password=password" -e "organisation=Default_Organization" playbook.yml
```

After the playbook is finished and we have checked that everything went well, we can now plan to run the playbook on a regular basis.

### Schedule the Playbook

There are many ways to schedule the playbook:

- Cronjob (CLI)
- Ansible Tower
- Satellite web UI (jobs)

One word of caution though: Although automating tasks like these is a great way to save time and reduce the risk of human error, it is important to check in on a regular basis and test the playbook and servers. Sometimes automations fail or produce unexpected results. So be aware and be warned to use this at your own risk and avoid using this in a critical production environment without proper testing and monitoring.



