#!/bin/bash
#
# chipster.sh - Script to renew chipster accounts
#
# Author: Riccardo Bruno <riccardo.bruno@ct.infn.it>
#
CHIPSTER_CONF=chipster.conf
CHIPSTER_OUT=user.json
trap cleanup EXIT

load_args() {
  STEP="Loading arguments"
  echo $STEP
  CHIPSTER_USER="$1"
  CHIPSTER_PASS="$2"
  echo "  User: '$CHIPSTER_USER'"
  echo "  Password: '$CHIPSTER_PASS'"
  [ "$CHIPSTER_USER" != "" ] &&\
  [ "$CHIPSTER_PASS" != "" ] &&\
    return 0
  echo "ERROR: Missing input parameters"
  return 1
}

# Load configuration settings
load_config() {
  STEP="Loading configuration settings"
  echo $STEP
  REMOTE_ADDR=$(cat $CHIPSTER_CONF | jq '.remote_addr' | xargs echo)
  REMOTE_USER=$(cat $CHIPSTER_CONF | jq '.remote_user' | xargs echo)
  REMOTE_FILE=$(cat $CHIPSTER_CONF | jq '.remote_file' | xargs echo)
  EXPIRY_DAYS=$(cat $CHIPSTER_CONF | jq '.expiry_days' | xargs echo)
  echo "  Remote address: '$REMOTE_ADDR'"
  echo "  Remote user   : '$REMOTE_USER'"
  echo "  Remote file   : '$REMOTE_FILE'"
  echo "  Expiry days   : '$EXPIRY_DAYS'"
  [ "$REMOTE_ADDR" != "" ] &&\
  [ "$REMOTE_USER" != "" ] &&\
  [ "$REMOTE_FILE" != "" ] &&\
  [ "$EXPIRY_DAYS" != "" ] &&\
    return 0
  echo "ERROR: Missing configuration settings"
  return 1
}

# Copy from remote
download_file() {
  LOCAL_FILE=$(basename $REMOTE_FILE)
  STEP="Downloading remote file: '$REMOTE_USER@$REMOTE_ADDR:$REMOTE_FILE' to '$LOCAL_FILE'"
  echo $STEP
  scp -q $REMOTE_USER@$REMOTE_ADDR:$REMOTE_FILE $LOCAL_FILE
}

# Edit local file, removing existing entry if exists and adding the new entry
edit_file() {
  STEP="Editing file: '$LOCAL_FILE'"
  echo $STEP
  NUM_LINES=$(cat $LOCAL_FILE | wc -l)
  sed -i "/$CHIPSTER_USER/d" $LOCAL_FILE
  NEW_NUM_LINES=$(cat $LOCAL_FILE | wc -l)
  [ $NUM_LINES -ne $NEW_NUM_LINES ] &&\
    echo "  User '$CHIPSTER_USER', was existing; replacing its entry" ||\
    echo "  User '$CHIPSTER_USER', was not existing, adding its entry"
  RUNDATE=$(date +%Y-%m-%d)
  NEWDATE=$(date +%Y-%m-%d -d "+$EXPIRY_DAYS days")
  NEWENTRY=$(echo "$CHIPSTER_USER:$CHIPSTER_PASS:$NEWDATE")
  echo "  New entry: '$NEWENTRY'"
  echo $NEWENTRY >> $LOCAL_FILE
}

# Upload remote
upload_file() {
  STEP="Uploading file: '$LOCAL_FILE' to remote: '$REMOTE_USER@$REMOTE_ADDR:$REMOTE_FILE'"
  echo $STEP
  scp -q $LOCAL_FILE $REMOTE_USER@$REMOTE_ADDR:$REMOTE_FILE
}

# Prepare the output file containing created record
prepare_output() {
  if [ "$1" = "" ]; then
    cat >$CHIPSTER_OUT <<EOF
{ 
  "run_date": "${RUNDATE}",
  "user": "${CHIPSTER_USER}",
  "password": "${CHIPSTER_PASS}",
  "expiry": "${NEWDATE}", 
  "user_record": "${NEWENTRY}",
  "config": {
    "remote_addr": "${REMOTE_ADDR}",
    "remote_user": "${REMOTE_USER}",
    "remote_file": "${REMOTE_FILE}",
    "EXPIRY_DAYS": "${EXPIRY_DAYS}"
  }
}
EOF
  else
    cat >$CHIPSTER_OUT <<EOF
{ "error": "${1}" }
EOF
  fi
}

# Cleaning up
cleanup() {
  STEP="Cleaning up"
  echo $STEP
  [ -f "$LOCAL_FILE" ] &&\
    echo "  Removing file: '$LOCAL_FILE'" &&\
    rm -f $LOCAL_FILE
  [ ! -f "$CHIPSTER_OUT" ] &&\
     prepare_output "An error occurred modifying chipster account: '$CHIPSTER_USER' with password '$CHIPSTER_PASS'"
}

# Script execution
echo "Starting chipster account configurator" &&\
load_args $@ &&\
load_config &&\
download_file &&\
edit_file &&\
upload_file &&\
prepare_output &&\
echo "Done" ||
echo "Failed"

