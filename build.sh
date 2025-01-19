#!/bin/bash

docker buildx build -f tribehealth/olympus-meet:latest --push --platform=linux/amd64,linux/arm64 .