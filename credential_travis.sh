#!/usr/bin/env bash

mkdir -p ~/.aws
mkdir -p ~/.ask

cat > ~/.aws/credentials << EOL
[default]
aws_access_key_id = ${AWS_ACCESS_KEY_ID}
aws_secret_access_key = ${AWS_SECRET_ACCESS_KEY}
EOL

sed -e s/ASK_ACCESS_TOKEN/${ASK_ACCESS_TOKEN}/g -e \
    s/ASK_REFRESH_TOKEN/${ASK_REFRESH_TOKEN}/g ask_config.json > ~/.ask/cli_config
