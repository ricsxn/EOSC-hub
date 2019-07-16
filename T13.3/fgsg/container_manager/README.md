# container_manager
This repository contains the `container_manager` script wich provides a way to manage easily container requests that can grow dynamically by external requests. The script provides functions to preserve the hosting system from containers overload. This script also manage port request assignment and reservation.

# Usage
Normally container_manager files are pointed by links or copied directly in the `$HOME` directory and then `container_manager` file sourced by `.bashrc`. 
The `container_manager` script  can be used not only sourcing it, but it can be used explicitly calling it.

Implemented calls are:

`request <container name pattern> <number of requested instances>`

The output of this command will be the number of allowed instances a number <= of the number of requested instances. Port reseervation can be configured by the file: `.container_registry` by row entries in the form of:

`<container_pattern> <max number of running instances>`

Normally script functionalities are claimed by remote access to the container host; both kind of calls are correct:

```bash
ssh duser@localhost -x "source .container_manager;\
    request_containers r-studio 15"
```

```bash
ssh duser@localhost -x "./.container_manager request;\
    r-studio 150"
``` 

To get a new port use:

```bash 
freeport
``` 

The output will be a number in the range specified in file: `~/.container_ports` by variables: `FREE_PORT_FROM`, `FREE_PORT_TO`.

Also freeport can be claimed by remote access to the container host as:

```bash
ssh duser@localhost -x "./.container_manager; PORT=$(freeport)"  
``` 

