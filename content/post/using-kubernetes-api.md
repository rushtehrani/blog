+++
date = "2016-12-14T12:00:00-08:00"
tags = ["kubernetes", "google container engine", "docker", "jupyter"]
title = "Using Kubernetes Go Client to Launch a Jupyter Notebook"
description = "Quick how-to on using Kubernetes Go client to access its API and Launch a Jupyter notebook."
keywords = ["kubernetes", "go", "golang", "docker", "jupyter", "containers"]
+++

Note: This post was updated to use the latest stable Kubernetes Go client as of 12/14/2016.

As a continuation to the [previous post](/post/kubernetes-on-google-container-engine), we will now look at using Kubernetes' API to create a simple [Pod](http://kubernetes.io/docs/user-guide/pods/#what-is-a-pod) and [Service](http://kubernetes.io/docs/user-guide/services/) to expose a Docker container running a Jupyter notebook server.

We will be using Kubernetes' [Go client](https://github.com/kubernetes/client-go), so let's get started by getting the package:

```bash
go get -u k8s.io/client-go/
```

Once the package downloads, we need to add the relevant import paths in our `main.go` file.  Note that we'll be using the 1.5 stable version which is in the `1.5` folder.  Version 2.0 is currently in alpha and [will not contain the top level folder names](https://github.com/kubernetes/client-go#why-do-the-14-and-15-branch-contain-top-level-folder-named-after-the-version).

```Go
package main

import (
	"fmt"

	"k8s.io/client-go/1.5/kubernetes"
	"k8s.io/client-go/1.5/pkg/api/v1"
	"k8s.io/client-go/1.5/tools/clientcmd"
	"k8s.io/client-go/1.5/rest"
)

func main()  {
	//...
}
```

If outside of the cluster, then we will need to instantiate the client using an existing Kubernetes config path.  In most cases, the path would be `$HOME/.kube/config`.

```Go
config, err := clientcmd.BuildConfigFromFlags("", "<kube-config-path>")
if err != nil {
	return nil, err
}

c, err := kubernetes.NewForConfig(config)
if err != nil {
	return nil, err
}
```

If inside the cluster, we can instantiate the client this way instead:

```Go
config, err := rest.InClusterConfig()
if err != nil {
	return nil, err
}

c, err := kubernetes.NewForConfig(config)
if err != nil {
	return nil, err
}
```

Next, let's create a Kubernetes `Pod` that'll contain our Jupyter notebook container:

```Go
// Create a Pod named "my-pod"
pod, err := c.Pods(v1.NamespaceDefault).Create(&v1.Pod{
	ObjectMeta: v1.ObjectMeta{
		Name: "my-pod",
	},
	Spec: v1.PodSpec{
		Containers: []v1.Container{
			{
        Name:  "jupyter-notebook",
        Image: "jupyter/minimal-notebook",
				Ports: []v1.ContainerPort{
					{
						ContainerPort: 8888,
					},
				},
			},
		},
	},
})
```

Note that `Pods` [aren't durable](http://kubernetes.io/docs/user-guide/pods/#durability-of-pods-or-lack-thereof), so if you want your `Pod` to survive node failures and maintenance, you would need to create a [replication controller](http://kubernetes.io/docs/user-guide/replication-controller/#what-is-a-replication-controller) or a [Deployment](http://kubernetes.io/docs/user-guide/deployments/).

We can also make our `Pods` publicly accessible via `Services`.  Since `Services` use label selectors to target `Pods`, we'd first need to update our `Pod` to include a label:

```Go
// Set Pod label so that we can expose it in a service
pod.SetLabels(map[string]string{
	"pod-group": "my-pod-group",
})

// Update Pod to include the labels
pod, err = c.Pods(v1.NamespaceDefault).Update(pod)
```

Then we can create a [Node Port](http://kubernetes.io/docs/user-guide/services/#type-nodeport) type `Service` that targets this `Pod` via the API:

```Go
// Create a Service named "my-service" that targets "pod-group":"my-pod-group"
svc, err := c.Services(v1.NamespaceDefault).Create(&v1.Service{
	ObjectMeta: v1.ObjectMeta{
		Name: "my-service",
	},
	Spec: v1.ServiceSpec{
		Type:     v1.ServiceTypeNodePort,
		Selector: pod.Labels,
		Ports: []v1.ServicePort{
			{
				Port: 8888,
			},
		},
	},
})

if err != nil {
	fmt.Println(err)
	return
}

// Print the port the service is exposed on
// You can access this notebook at http://<kubernetes node ip>:<node port>
fmt.Println(svc.Spec.Ports[0].NodePort)
```

That's all there is to it! You will now be able to access your Jupyter notebook at: [http://&lt;any kubernetes node ip&gt;:&lt;node port&gt;](#)
