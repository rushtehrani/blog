+++
date = "2016-07-30T09:21:30-07:00"
draft = false
title = "Kubernetes on Google Container Engine"
tags = ["kubernetes", "google container engine", "docker"]
description = "Kubernetes on Google Container Engine"
keywords = ["kubernetes", "docker", "google container engine", "containers"]
+++

This is a quick walkthrough to show you how to spin up a very small Kubernetes cluster on Google Cloud Platform (GCE) and then get access to the Kubernetes REST API.

Before you get started, you need to sign-in to [Google Cloud Platform console](https://console.cloud.google.com) and create a new project. If you don’t already have a Google Account, you can [create one](https://accounts.google.com/SignUp).

First, you need to download GCE’s command line interface `gcloud`. The easiest way to install and initialize `gcloud` is via the [Quickstarts](https://cloud.google.com/sdk/docs/quickstarts). You can stop after the *Initialize the SDK* section and continue with the instructions in this post.

Once you are done initializing `gcloud`, you can then use it to install Kubernetes command line interface `kubectl`:

```sh  
gcloud components install kubectl
```

We’ll be using `kubectl` to get information about our Kubernetes cluster and set up a proxy to our Kubernetes API.

Next thing we need to do is to spin up our one node Kubernetes cluster:

```sh  
gcloud container --project "my-project" clusters create "my-cluster" --zone "us-west1-a" --machine-type "f1-micro" --num-nodes "3" --disk-size "20" --username "admin" --password "password"
```

Where:

- `--project "my-project"` is the name of the project you created above.
- `"my-cluster"` is the name of your cluster
- `--zone "us-west1-a"` is your cluster’s zone, see [Regions and Zones](https://cloud.google.com/compute/docs/regions-zones/regions-zones) for more information.
- `--machine-type "f1-micro"` is the machine type, see [Machine Types](https://cloud.google.com/compute/docs/machine-types) for more information.
- `--num-nodes "3"` is the number of nodes to allocate for this cluster. Defaults to `"3"`.
- `--disk-size "20"` is the size of disk per node in GB.  Defaults to `"100"`.
- `--username "admin"` is the username to use for cluster auth. Defaults to `"admin"`.
- `--password "password"` is the password to use for cluster auth.  Defaults to a randomly-generated string.

Alternatively, you can [add your cluster](https://console.cloud.google.com/kubernetes/add) in the Google Container Engine console.

After a few minutes, our cluster should be up and running. To verify that it’s running, first get a list of your running clusters:

```sh
gcloud container clusters list
```

You should see `my-cluster` (or your own cluster name) on the list and it should have a status `RUNNING`.

Next, we need to configure `kubectl` command line access for your new cluster:

```sh
gcloud container clusters get-credentials my-cluster --zone us-west1-a --project my-project
```

Then start a proxy to connect to Kubernetes control plane:

```sh
kubectl proxy &
```

Now you can access Kubernetes' Dashboard in your browser at:

http://localhost:8001/ui

And Kubernetes' REST API at:

http://localhost:8001/api/v1.
