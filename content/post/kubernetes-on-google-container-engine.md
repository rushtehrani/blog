+++
date = "2016-07-30T09:21:30-07:00"
draft = false
title = "Kubernetes on Google Container Engine"
tags = ["kubernetes", "google container engine", "docker"]
+++

This is a quick walkthrough to show you how to spin up a very small Kubernetes (K8S) cluster on Google Cloud Platform (GCE) and then get access to the K8S REST API.

Before you get started, you need to sign-in to <a href="https://console.cloud.google.com" target="blank">Google Cloud Platform console</a> and create a new project. If you don’t already have a Google Account, you can <a href="https://accounts.google.com/SignUp" target="blank">create one</a>.

First, you need to download GCE’s command line interface `gcloud`. The easiest way to install and initialize `gcloud` is via the <a href="https://cloud.google.com/sdk/docs/quickstarts" target="blank">Quickstarts</a>. You can stop after the Initialize SDK section and continue with the instructions in this post.

Once you are done initializing `gcloud`, you can then use it to install K8S command line interface `kubectl`:

```sh  
gcloud components install kubectl
```

We’ll be using `kubectl` to get information about our K8S cluster and set up a proxy to our K8S API.

Next thing we need to do is to spin up our one node K8S cluster:

```sh  
gcloud container --project "my-project" clusters create "my-cluster" --zone "us-west1-a" --machine-type "g1-small" --num-nodes "1"
```

Where:

- `--project "my-project"` is the name of the project you created above.
- `"my-cluster"` is the name of your cluster
- `--zone "us-west1-a"` is your cluster’s zone, see Regions and Zones for more information.
- `--machine-type "g1-small"` is the machine type, see Machine Types for more information.
- `--num-nodes "1"` is the number of nodes to allocate for this cluster.

Alternatively, you can add your cluster in the Google Container Engine console.

After a few minutes, our cluster should be up and running. To verify that it’s running, first set `gcloud` to point to your cluster zone:

```sh
gcloud config set compute/zone us-west1-a
```

Then get a list of your running clusters:

```sh
gcloud container clusters list
```

You should see `my-cluster` (or your own cluster name) on the list and it should have a status `RUNNING`.

Next, we need to get our cluster endpoint and credentials and update our `kubectl` config to point to our newly created cluster:

```sh
gcloud container clusters get-credentials my-cluster
```

Now that kubectl is set to point to our new cluster, we should be able to use it to get information on our K8S cluster:

```sh
kubectl config view
```

This will give us the IP address, username and password that we need to access the K8S admin UI at `https://<ip address>/ui`

The next thing we want to do is use `kubectl` as a proxy to our K8S cluster’s API:

```sh
kubectl proxy --port=8080 &
```

Now you can interface with your K8S cluster’s API using your local endpoint at http://localhost:8080/api/v1.
