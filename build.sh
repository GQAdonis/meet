#!/bin/bash

docker buildx build -t tribehealth/olympus-meet:latest --push --platform=linux/amd64,linux/arm64 .