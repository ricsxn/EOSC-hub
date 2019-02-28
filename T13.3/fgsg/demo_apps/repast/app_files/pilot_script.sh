#!/bin/bash
#
# Pilot script for repast fgsg application
#
# This script executes the repast docker container executing 
# the application with the given inputs
#
# This script has been based from test execution:
# docker run -ti\
#             --rm\
#             --name test_repast\
#            osabuoun/repast\
#            /opt/execute.sh "<ftp_username>"\
#                            "<ftp_password>"\
#                            "ftp://<ftp_address>/repast/PS-FirstTest/output/"\
#                            "http://<ftp_address>/repast/PS-FirstTest/model.tar"\
#                            "http://<ftp_address>/repast/PS-FirstTest/input/batch_params.xml_0"
#
REPAST_VOLUME_PATH=/mnt
REPAST_IMAGE=osabuoun/repast
REPAST_EXEC=/opt/execute.sh
REPAST_NAME=repast
REPASST_INPUT=repast/PALMS/input
REPASST_OUTPUT=repast/PALMS/output
FTP_HOST=<ftp_host>
FTP_PATH=repast/PALMS
REPASST_INPUT=$FTP_PATH/input
REPASST_OUTPUT=$FTP_PATH/output
FTP_USER=<ftp_username>
FTP_PASSWORD=<ftp_password>
# Taken from GUI, it contains the path to the model
DEFAULT_MODEL_URL=http://$FTP_HOST/$FTP_PATH/model.tar
DEFAULT_PARAM_XML=http://$FTP_HOST/$FTP_PATH/input/batch_params.xml_0

# The script takes two parameters
# $1 - The model URL
# $2 - The XML input file that can be remote or in the local file system
prepare_params() {
    UUID=$(cat /proc/sys/kernel/random/uuid)
    REPAST_CONTAINER_NAME=${REPAST_NAME}_${UUID}
    MODEL_URL="$1"
    # If no model argument is given, default URL will be considered
    [ "$MODEL_URL" == "" ] &&\
        MODEL_URL=$DEFAULT_MODEL_URL &&\
        echo "WARNING: Using demo model value: $MODEL_URL" ||\
	echo "Using model: $MODEL_URL"
    # If no parameter XML file is given, default XML file will be considered
    PARAM_XML="$2"
    [ "$PARAM_XML" == "" ] &&\
        PARAM_XML=$DEFAULT_PARAM_XML &&\
	echo "WARNING: Using demo input xml file: $PARAM_XML" ||\
	echo "Using input xml file: $PARAM_XML"
    # XML file may be a local file, in this case a volume is necessary and
    # the XML file placed inside. The container will mount it and the
    # PARAM_XML variable must be created accordingly with:
    # file://$REPAST_VOLUME_PATH/$PARAM_XML (es. /mnt/local_file.xml)
    [ -f "$PARAM_XML" ] &&\
	echo "Given local XML file: $PARAM_XML" &&\
        docker volume create $REPAST_CONTAINER_NAME &&\
        docker container create --name $REPAST_CONTAINER_NAME\
                                -v ${REPAST_CONTAINER_NAME}:${REPAST_VOLUME_PATH}\
                                $REPAST_IMAGE &&\
        docker cp $PARAM_XML ${REPAST_CONTAINER_NAME}:${REPAST_VOLUME_PATH}/$PARAM_XML &&\
        docker rm $REPAST_CONTAINER_NAME &&\
	PARAM_XML="file://${REPAST_VOLUME_PATH}/${PARAM_XML}" &&\
	echo "PARAM_XML file argument: $PARAM_XML" &&\
	REPAST_VOLUME_ARGUMENT="-v ${REPAST_CONTAINER_NAME}:${REPAST_VOLUME_PATH}" ||\
	REPAST_VOLUME_ARGUMENT=""
    # Prepare FTP_OUPUTDIR
    FTP_OUTPUTDIR=$(dirname $PARAM_XML | sed s/http/ftp/ | sed s/input$/output/)"/"
}

execute_repast() {
    UUID=$(cat /proc/sys/kernel/random/uuid)
    docker run --rm\
      --name $REPAST_CONTAINER_NAME\
             $REPAST_VOLUME_ARGUMENT\
             $REPAST_IMAGE\
             $REPAST_EXEC "$FTP_USER"\
                          "$FTP_PASSWORD"\
                          "$FTP_OUTPUTDIR"\
                          "$MODEL_URL"\
                          "$PARAM_XML"
    # If the volume is present, remove it
    [ "$REPAST_VOLUME_ARGUMENT" != "" ] &&\
        docker volume rm $REPAST_CONTAINER_NAME &&\
	echo "Removed volume $REPAST_CONTAINER_NAME"
    # docker run returns a non zero return code causing Aborted status
    return 0
}


#
# Executing script
#
prepare_params $@ &&\
execute_repast &&\
echo Done

