#!/bin/bash
# Shell script for ask-cli pre-deploy hook for Node.js
# Script Usage: pre_deploy_hook.sh <SKILL_NAME> <DO_DEBUG> <TARGET>

# SKILL_NAME is the preformatted name passed from the CLI, after removing special characters.
# DO_DEBUG is boolean value for debug logging
# TARGET is the deploy TARGET provided to the CLI. (eg: all, skill, lambda etc.)

# Run this script under skill root folder

# The script does the following:
#  - Run "npm install" in each sourceDir in skill.json

SKILL_NAME=$1
DO_DEBUG=${2:-false}
TARGET=${3:-"all"}

if [ $DO_DEBUG == false ]
then
    exec > /dev/null 2>&1
fi

deploy_aws_resources() {
    node ./tools/deployAWSResources.js >/dev/null 2>&1
    return $?
}

install_dependencies() {
    npm install --prefix "$1" >/dev/null 2>&1
    return $?
}

echo "###########################"
echo "##### pre-deploy hook #####"
echo "###########################"

if [[ $TARGET == "all" || $TARGET == "lambda" ]]; then
    ls -d lambda/* | while read -r SOURCE_DIR; do
        if install_dependencies $SOURCE_DIR; then
            echo "Codebase ($SOURCE_DIR) built successfully."
        else
            echo "There was a problem installing dependencies for ($SOURCE_DIR)."
            exit 1
        fi
    done
    if deploy_aws_resources; then
        echo "AWS resources deployed successfully."
    else
        echo "There was a problem deploying the AWS resources."
        exit 1
    fi
    echo "###########################"
fi

exit 0



ask smapi update-account-linking-info -s amzn1.ask.skill.eb6e6958-a33c-4050-a1f4-ceaeda2eddb1 -g live --account-linking-request {"accountLinkingRequest": { "skipOnEnablement": "true",    "type": "AUTH_CODE",    "authorizationUrl": "https://zenkit.com/api/v1/oauth/authorize",    "clientId": "7b43921c-0b3d-42f0-8475-90db0da058a9",    "accessTokenUrl": "https://zenkit.com/api/v1/oauth/token",    "clientSecret": "41f9f5ac579826a6b3c11bb25e6dba47d9802841c03a650e45c02e45244f4cb0a384b0ad2c05de2a071887bfc0190b69a07b8adcbb6a9cd818b353f6e5485309",    "accessTokenScheme": "REQUEST_BODY_CREDENTIALS",    "defaultTokenExpirationInSeconds": 86400,    "redirectUrls": [      "https://zenkit.com/en/integrations/"    ]      }}




