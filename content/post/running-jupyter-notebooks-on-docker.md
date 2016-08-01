+++
date = "2015-08-01T14:16:49-07:00"
draft = false
title = "Running Jupyter Notebooks on Docker"
tags = ["jupyter", "ipython", "docker"]
+++

A simple and quick way to get a <a href="https://github.com/jupyter/notebook" target="blank">Jupyter notebooks</a> up and running quickly is to run them on <a href="https://www.docker.com/" target="blank">Docker</a>.

If you don’t already have Docker installed, take a look at the <a href="https://docs.docker.com/engine/installation/" target="blank">installation guide</a> for your platform.

Once you have Docker installed, head over to <a href="https://github.com/jupyter/docker-stacks" target="blank">this repository</a> to get a few opinionated ready-to-run Jupyter applications in Docker.

For the most part, it's as easy as opening the README file in one of the directories in that repository and following its instructions.

For example, you can run the <a href="https://github.com/jupyter/docker-stacks/tree/master/datascience-notebook" target="blank">Data Science Notebook</a> using the following command:

```sh
docker run -d -p 8888:8888 jupyter/datascience-notebook
```

It'll take a few minutes to get this particular stack downloaded and running but after the initial setup, you should be able to run it in a few seconds using the command above.
