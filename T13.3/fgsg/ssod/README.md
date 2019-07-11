# Science Software on Demand
The Science Software on Demand is an EGI service using the FutureGateway as Science Gateway Engine.

# HTML
Under this folder, it is possible to find the HTML code used for static web content.

## footer.html
SSOD site uses a javascript code to override the default Liferay footer. The `footer.html` file contains this script and it can be placed inside a static HTML web content or include it in the form of a hidden web content to be placed in the destination page.

# HTTP proxy
The http proxy has the same 'futuregateway/fghttpd' image of the global FGSG environment. It only has a dedicated storage volume to keep persistent the configurations.
This repository keeps the Makefile that execute this docker container instance.
To execute the container kust type:

```bash
make run
```

## Usage
Use one of the following make recipes:
* `make run` Executes the docker container

Before to execute the Makefile, please have a look in the Makefile variables, in particular:

* `DOCKER_REPO` Used for publishing in the hub
* `IMAGE_NAME` The name of the image file
* `IMAGE_TAG` Tag to assign to the image
* `FG_NETWORK` Name of the Docker network dedicated to the FG components
* `FG_IOSNDBXVOLNAME` Volume name to store FutureGateway IO Sandbox
* `FGAPISRV_IOSANDBOX` Container path to the IO Sandbox dir
* `FG_APISRVVOLNAME` Volume name for APIServer
* `FG_APPSDIRVOLNAME` Apps directory volume name
* `FG_IOSNDBXVOLNAME` Volume storing IO Sandbox
* `FGAPISRV_IOSANDBOX` IO Sandbox volume name
* `FG_APISERVERGIT` Git repository address for APIServerDaemon
* `FG_APISERVERGITBRANCH` Git repository branch for APIServerDaeon

## Configuration
The **fghttpd** component requires the following variables to properly generate its Docker image:

### FutureGateway user and tester user
* `FG_USER` Unix username that will manage FutureGateway' components
* `FG_USERPWD` Unix password for FutureGayeay user
* `FG_DIR` FutureGateway unix user home directory
* `FG_TEST` Tester user username
* `FG_TESTPWD`  Tester user password
* `FG_TESTDIR` Tester user home directory

### FurtureGateway DB settings
* `FGDB_HOST` FG database host name
* `FGDB_PORT` FG database port number
* `FGDB_USER` FG database user
* `FGDB_PASSWD` FG database user' password
* `FGDB_NAME` Name for FG database

### Environment for scripts
In this section it is possible to point the source code extraction to a particular repository and branch.
* `FGSETUP_GIT` Git repository address for FG setup files
* `FGSETUP_BRANCH` Git repository branch for FG setup files

### Environment for GridAndCloudEngine
* `UTDB_HOST` GridAnClouddEngine host name
* `UTDB_PORT` GridAnClouddEngine port number
* `UTDB_USER` GridAnClouddEngine database user
* `UTDB_PASSWORD` GridAnClouddEngine database password
* `UTDB_DATABASE` GridAnClouddEngine database name

### Environment for Liferay portal
* `FG_LIFERAY_PROXYPATH` published endpoint for liferay portal
* `FG_LIFERAY_PROXY` ajp address for liferay portal

# Network configuration
**WARNING:** Following chapters are just instructions to to assign a public IP address to a Docker container. This kind of configuration may be used in similar Docker-based FutureGateway installations.


The SSOD service has to be accessible by the URL fgsg.egi.eu
This is possible using the existing FGSG environment using another apache http proxy docker instance and assigning to it a physical IP address.

## Container IP configuration
The following steps are capable to setup the public IP address:

```bash
docker network create -d macvlan  --subnet=193.206.209.0/24  --gateway=193.206.209.1  -o parent=enp27s0f2 ssod_net
sudo ip link add mac0 link enp27s0f2 type macvlan mode bridge
sudo ip addr add 193.206.209.9/24 dev mac0
sudo ifconfig mac0 up
docker run --rm --name egi_ssod --net ssod_net --ip 193.206.209.9  futuregateway/fghttpd
```

The creation of the mac0 device and assign to it the public IP, has been also placed int /etc/rc.local file, so that the configuration will be available after a system reboot.
The file is created with:

```bash
cat >/etc/rc.local <<EOF
#!/bin/bash
#
# Virtual device to access docker newtork ssod_net
#
# Author: Riccardo Bruno <riccardo.bruno@ct.infn.it>
#
ip link add mac0 link enp27s0f2 type macvlan mode bridge
ip addr add 193.206.209.9/24 dev mac0
EOF

chmod +x >/etc/rc.local
```

These steps have been taken from [2 Minutes to Docker MacVLAN Networking – A Beginners Guide][CNTPUBIP].

[CNTPUBIP]:<http://collabnix.com/2-minutes-to-docker-macvlan-networking-a-beginners-guide/>

