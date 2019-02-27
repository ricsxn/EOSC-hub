#!/bin/bash
#
# Pilot script for r-studio fgsg application
#
# This script executes the r-studio docker container assigning it the proper
# port number, extracted from a given range of possible values.
# Container information will be available in json format and written into an
# output file.

INFO_FILE=rstudio.json
PORT_RANGE_FROM=17000
PORT_RANGE_TO=17001
RSTUDIO_USER=rstudio
RSTUDIO_PASSWORD=rstudio_pass
RSTUDIO_IMAGE=rocker/rstudio

# Find available slot and assign the available  port number
find_port() {
  PORT=0
  for port in $(seq $PORT_RANGE_FROM $PORT_RANGE_TO); do
    PORT_SLOT=$(sudo netstat -plnt | grep docker-proxy | grep $port)
    [ "$PORT_SLOT" == "" ] && PORT=$port && break
  done
  [ $PORT -eq 0 ] &&\
    ERR_MSG="No available ports for the r-studio application" &&\
    return 1
  return 0
}

# Generate a random password and execute container
run_container() {
  RSTUDIO_PASS=$(date +%s | sha256sum | base64 | head -c 32) 
  CONTAINER_CMD="sudo docker run\
	              --name r-studio-$PORT\
                      --rm\
                      -ti\
                      -e USER=$RSTUDIO_USER\
                      -e PASSWORD=$RSTUDIO_PASS\
                      -p $PORT:8787\
                      -d $RSTUDIO_IMAGE"
  echo $CONTAINER_CMD
  CMD_OUTPUT=$(mktemp)
  eval $CONTAINER_CMD | tee $CMD_OUTPUT
  RES=$?
  [ $RES -ne 0 ] &&\
    ERR_MSG="Unable to execute container having image: '$RSTUDIO_IMAGE'" &&\
    return 1
  CONTAINER_ID=$(cat $CMD_OUTPUT)
  rm -f $CMD_OUTPUT
  return 0
}

prepare_output() {
  sudo docker inspect $CONTAINER_ID > $INFO_FILE
}

report_error() {
  cat >$INFO_FILE <<EOF
{ "error": "${ERR_MSG}" }
EOF
}

kill_container() {
  CONTAINER_ID=$1
  RES=1
  [ "$CONTAINER_ID" != "" ] &&\
      sudo docker stop $CONTAINER_ID &&\
      RES=$? ||\
      ERR_MSG="Unable to stop container having id: '$CONTAINER_ID'"
  return $RES
}

delete_task() {
  TASK="$1"
  TOKEN="$2"
  CURL="curl -k"
  FGENDPOINT="https://fgsg.ct.infn.it/fgapiserver/v1.0"
  FGAUTH="Authorization: $TOKEN"

  # Verify token validity
  CMD="$CURL -H \"$FGAUTH\" \"$FGENDPOINT/token\" 2>/dev/null"
  RESULT=$(eval $CMD)
  TOKEN_LASTING=$(echo $RESULT | jq '.lasting')
  [ $TOKEN_LASTING -eq 0 ] &&\
    ERR_MSG="Token $TKN has expired" &&
    return 1
  # Delete r-studio submission task
  CMD="$CURL -H \"$FGAUTH\" -X DELETE \"$FGENDPOINT/tasks/$TASK\" 2>/dev/null"
  RESULT=$(eval $CMD)
  RES=$?
  [ $RES -ne 0 ] &&\
    ERR_MSG="Error deleting taks $TASK: '$RESULT'" &&\
    return 1
  return 0
}

# Executing script
#
# If no arguments are given, a new container will be instantiated
# If arguments are provided, the script kills the running contaner
# and delete the submission task accordingly to the given arguments
ARGS="$@"
if [ "$ARGS" != "" ]; then
  CONTAINER_ID="$1"
  TASK="$2"
  TOKEN="$3"
  ERR_MSG="Invalid arguments given; container_id=$CONTAINER_ID, task=$TASK, token=$TOKEN"
  [ "$CONTAINER_ID" != "" -a\
    "$TASK" != "" -a\
    "$TOKEN" != "" ] &&\
  ERR_MSG="" &&\
  delete_task $TASK $TOKEN &&\
  kill_container $CONTAINER_ID ||\
  report_error
else
  find_port &&\
  run_container &&\
  prepare_output ||\
  report_error
fi
