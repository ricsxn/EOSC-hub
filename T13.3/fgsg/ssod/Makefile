#
# fghttpd Docker container makefile
#
# Please ensure that Makefile environment variables are matching
# values defined inside Dockerfile
# 
# Author: Riccardo Bruno (INFN) <riccardo.bruno@ct.infn.it>
#
DOCKER_REPO = futuregateway
IMAGE_NAME = fghttpd
IMAGE_TAG = 0.2
FG_NETWORK = fgnetwork
SS_NETWORK = ssod_net
SS_IP = 193.206.209.9
SS_SUBNET = 193.206.209.0/24
SS_NETDEV = enp27s0f2
SS_DRIVER = macvlan
SS_BRIDGE = mac0
FG_CFGVOL = /usr/local/apache2/conf
FG_CFGVOLNAME = ssod_cfg
FG_WARNMSG = "This makefile does not publish the fghttpd image, please refer to the right fghttpd repository to accomplish this operation"

default:
	@echo "Usage: make <image|pubimg>"
	@echo "       run   - Create container from image : $(DOCKER_REPO)/$(IMAGE_NAME):$(IMAGE_TAG)"
	@echo "               having name: $(IMAGE_NAME)_$(IMAGE_TAG)"
	@echo "       clean - Remove the running instance and all its related resources (except volume: $(FG_CFGVOLNAME))"
	@echo ""

image:
	@echo "$(FG_WARNMSG)"

publish:
	@echo "$(FG_WARNMSG)"

network:
	[ "$(shell docker network list | grep $(FG_NETWORK))" = "" ]\
                && docker network create $(FG_NETWORK)\
                || echo "Network $(FG_NETWORK) already running"
	[ "$(shell docker network list | grep $(SS_NETWORK))" = "" ]\
                && docker network create -d $(SS_DRIVER) --subnet=$(SS_SUBNET) -o parent=$(SS_NETDEV) $(SS_NETWORK)\
		&& echo "Network $(SS_NETWORK) created"\
		&& ip link add $(SS_BRIDGE) link $(SS_NETDEV) type $(SS_DRIVER) mode bridge\
		&& echo "Bridge device  $(SS_BRIDGE) on network $(SS_NETDEV) with type $(SS_DRIVER) created"\
		&& ip addr add $(SS_IP)/24 dev $(SS_BRIDGE)\
		&& echo "IP: $(SS_IP) to bridge device $(SS_BRIDGE) assgned"\
		&& ifconfig $(SS_BRIDGE) up\
		&& echo "Bridge device $(SS_BRIDGE) turned on"\
                || echo "Network $(SS_NETWORK) already running"

clean:
	@echo "Cleaning ssod_$(IMAGE_NAME)_$(IMAGE_TAG)"
	@[ "$(shell docker ps -a | grep ssod_$(IMAGE_NAME)_$(IMAGE_TAG))" != "" ]\
		&& docker container stop ssod_$(IMAGE_NAME)_$(IMAGE_TAG)\
		&& echo "Container ssod_$(IMAGE_NAME)_$(IMAGE_TAG) stopped"\
		|| echo "No need to stop container ssod_$(IMAGE_NAME)_$(IMAGE_TAG)"
	@[ "$(shell docker ps -a | grep ssod_$(IMAGE_NAME)_$(IMAGE_TAG))" != "" ]\
		&& docker container rm ssod_$(IMAGE_NAME)_$(IMAGE_TAG)\
		&& echo "Container ssod_$(IMAGE_NAME)_$(IMAGE_TAG) removed"\
		|| echo "No need to remove container ssod_$(IMAGE_NAME)_$(IMAGE_TAG)"
	@[ "$(shell docker network ls | grep $(SS_NETWORK))" != "" ]\
		&& docker network rm  $(SS_NETWORK)\
		&& echo "Docker network $(SS_NETWORK) removed"\
		|| echo "Network $(SS_NETWORK) already removed"
	@ifconfig $(SS_BRIDGE) down 2>/dev/null\
	       	&& echo "Bridge device $(SS_BRIDGE) placed down"\
	       	|| echo "Device $(SS_BRIDGE) already down"
	@ip link del $(SS_BRIDGE) 2>/dev/null\
	       	&& echo "Bridge device $(SS_BRIDGE) deleted"\
	       	|| echo "Device $(SS_BRIDGE) already removed"

volumes:
	@[ "$(shell docker volume list | grep $(FG_CFGVOLNAME))" = "" ]\
	       && echo "Creating volume $(FG_CFGVOLNAME)"\
	       && docker volume create $(FG_CFGVOLNAME)\
	       || echo "Volume $(FG_CFGVOLNAME) already exists"

run: network volumes
	FGDB_IP=`docker network inspect fgnetwork|\
                jq '.[].Containers[]|select(.Name|contains("fgdb"))|.IPv4Address'|\
                xargs echo| sed 's/\// /' | awk '{ print $$1 }'` &&\
	FGLIFERAY_IP=`docker network inspect fgnetwork|\
                jq '.[].Containers[]|select(.Name|contains("fgliferay"))|.IPv4Address'|\
                xargs echo| sed 's/\// /' | awk '{ print $$1 }'` &&\
        [ "$$FGDB_IP" != "" -a "$$FGLIFERAY_IP" != "" ] &&\
        echo "fgdb IP: $$FGDB_IP" &&\
        echo "fgliferay IP: $$FGLIFERAY_IP" &&\
        docker create\
                   -e FGDB_HOST=$(FGDB_IP)\
                   --ip=$(SS_IP)\
                   --net $(SS_NETWORK)\
                   --name ssod_$(IMAGE_NAME)_$(IMAGE_TAG)\
		   -p $(SS_IP):80:80\
		   -p $(SS_IP):443:443\
                   -v $(FG_CFGVOLNAME):$(FG_CFGVOL)\
                   -h ssod_httpd\
	           $(DOCKER_REPO)/$(IMAGE_NAME):$(IMAGE_TAG) &&\
	echo "Docker container ssod_$(IMAGE_NAME)_$(IMAGE_TAG) created" &&\
	docker container start ssod_$(IMAGE_NAME)_$(IMAGE_TAG) &&\
       	echo "Docker container ssod_$(IMAGE_NAME)_$(IMAGE_TAG) started" ||\
        echo "Sorry, one of the nodes FGDB ($$FGDB_IP) or FGAPISRV ($$FGLIFERAY_IP) is not running, or docker run failed!"
