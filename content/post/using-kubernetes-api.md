+++
date = "2016-08-19T07:32:52-07:00"
tags = ["kubernetes", "google container engine", "docker"]
title = "Using Kubernetes API"
draft = true
+++

As a continuation to the [previous post](/post/kubernetes-on-google-container-engine), we will now look at consuming the Kubernetes API using its [Go SDK](https://github.com/kubernetes/kubernetes/tree/master/pkg/client/unversioned).

First we need to `go get` the following packages:

```bash
go get -u k8s.io/kubernetes/pkg/api
go get -u k8s.io/kubernetes/pkg/client/unversioned
```

Next, we need to import these packages:

```Go
package main

import (
	"fmt"

	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/client/restclient"
	client "k8s.io/kubernetes/pkg/client/unversioned"
)
```

Now that we have our packages, let's use the API to run a Jupyter notebook Docker container on Kubernetes.

First we need to create the [pod](http://kubernetes.io/docs/user-guide/pods/#what-is-a-pod):

```Go
func main() {
	// Create a new client instance using kubectl proxy
	c, err := client.New(&restclient.Config{
		Host: "http://localhost:8001",
	})

	if err != nil {
		fmt.Println(err)
		return
	}

	// Create a Pod
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

	if err != nil {
		fmt.Println(err)
		return
	}
}

// Verify that pod is create and get its creation time
fmt.Println(pod.GetCreationTimestamp())
```

Full source code:

```Go
package main

import (
	"fmt"

	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/client/restclient"
	client "k8s.io/kubernetes/pkg/client/unversioned"
)

func main() {
	// Create a new client instance using kubectl proxy
	c, err := client.New(&restclient.Config{
		Host: "http://localhost:8001",
	})

	if err != nil {
		fmt.Println(err)
		return
	}

	// Create a Pod
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

	if err != nil {
		fmt.Println(err)
		return
	}

	// Verify that pod is create and get its creation time
	fmt.Println("Pod created at:" + pod.GetCreationTimestamp())


	// Set pod label so that we can expose it in a service
	pod.SetLabels(map[string]string{
		"pod-group": "my-pod-group",
	})

	pod, err = c.Pods(api.NamespaceDefault).Update(pod)

	if err != nil {
		fmt.Println(err)
		return
	}

	fmt.Println(pod.Labels)

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
}
```
