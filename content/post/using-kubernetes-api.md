+++
date = "2016-08-20T17:30:00-07:00"
tags = ["kubernetes", "google container engine", "docker", "jupyter"]
title = "Using Kubernetes API to Launch a Jupyter Notebook"
description = "Use Go SDK to access Kubernetes API and create a Jupyter notebook"
keywords = ["kubernetes", "go", "golang", "docker", "jupyter", "containers"]
+++

As a continuation to the [previous post](/post/kubernetes-on-google-container-engine), we will now look at consuming the Kubernetes API to create a simple pod and service to expose a Docker container running a Jupyter notebook server.

We will be using Kubernetes' [Go SDK](https://github.com/kubernetes/kubernetes/tree/master/pkg/client/unversioned), so let's get started by getting the following packages:

```bash
go get -u k8s.io/kubernetes/pkg/api
go get -u k8s.io/kubernetes/pkg/client/unversioned
```

Once the packages download, we need to import them in our `main.go` file:

```Go
package main

import (
	"fmt"

	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/client/restclient"
	client "k8s.io/kubernetes/pkg/client/unversioned"
)

func main()  {
	//...
}
```

We will then instantiate the client, using the `kubectl` proxy URL we configured previously:

```Go
c, err := client.New(&restclient.Config{
	Host: "http://localhost:8001",
})
```

Next, we need to create a Kubernetes [Pod](http://kubernetes.io/docs/user-guide/pods/#what-is-a-pod) that'll contain our Jupyter notebook container:

```Go
// Create a Pod named "my-pod"
pod, err := c.Pods(api.NamespaceDefault).Create(&api.Pod{
	ObjectMeta: api.ObjectMeta{
		Name: "my-pod",
	},
	Spec: api.PodSpec{
		Containers: []api.Container{
			{
        Name:  "jupyter-notebook",
        Image: "jupyter/minimal-notebook",
				Ports: []api.ContainerPort{
					{
						ContainerPort: 8888,
					},
				},
			},
		},
	},
})
```

Note that `Pods` [aren't durable](http://kubernetes.io/docs/user-guide/pods/#durability-of-pods-or-lack-thereof), so if you want your `Pod` to survive node failures and maintenance, you would need to create a [replication controller](http://kubernetes.io/docs/user-guide/replication-controller/#what-is-a-replication-controller).

If we want to make our Pod publicly accessible, we can do so via a Kubernetes [Service](http://kubernetes.io/docs/user-guide/services/).  Since `Services` use label selectors to target Pods, we'd first need update our `Pod` to include a label:

```Go
// Set Pod label so that we can expose it in a service
pod.SetLabels(map[string]string{
	"pod-group": "my-pod-group",
})

// Update Pod to include the labels
pod, err = c.Pods(api.NamespaceDefault).Update(pod)
```

Then we can create a [Node Port](http://kubernetes.io/docs/user-guide/services/#type-nodeport) type `Service` that targets this `Pod` via the API:

```Go
// Create a Service named "my-service" that targets "pod-group":"my-pod-group"  
svc, err := c.Services(api.NamespaceDefault).Create(&api.Service{
	ObjectMeta: api.ObjectMeta{
		Name: "my-service",
	},
	Spec: api.ServiceSpec{
		Type:     api.ServiceTypeNodePort,
		Selector: pod.Labels,
		Ports: []api.ServicePort{
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
