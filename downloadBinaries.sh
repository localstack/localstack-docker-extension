#!/bin/bash

latest_version=$(curl -s https://api.github.com/repos/localstack/localstack-cli/releases/latest | grep "tag_name" | cut -d'"' -f4)
version_number=$(echo "$latest_version" | grep -oP 'v(\d+\.\d+\.\d+)' | sed 's/v//')

wget "https://github.com/localstack/localstack-cli/releases/latest/download/localstack-cli-${version_number}-linux-amd64-onefile.tar.gz" -O localstack-cli-linux-amd64-onefile.tar.gz 
wget "https://github.com/localstack/localstack-cli/releases/latest/download/localstack-cli-${version_number}-linux-arm64-onefile.tar.gz" -O localstack-cli-linux-arm64-onefile.tar.gz 
wget "https://github.com/localstack/localstack-cli/releases/latest/download/localstack-cli-${version_number}-darwin-amd64-onefile.tar.gz" -O localstack-cli-darwin-amd64-onefile.tar.gz 
wget "https://github.com/localstack/localstack-cli/releases/latest/download/localstack-cli-${version_number}-darwin-arm64-onefile.tar.gz" -O localstack-cli-darwin-arm64-onefile.tar.gz 
wget "https://github.com/localstack/localstack-cli/releases/latest/download/localstack-cli-${version_number}-windows-amd64-onefile.zip" -O localstack-cli-windows-amd64-onefile.zip 

mkdir ./binaries/linux 
tar -xzvf localstack-cli-linux-amd64-onefile.tar.gz -C ./binaries/linux && mv ./binaries/linux/localstack ./binaries/linux/localstack-linux-amd && rm localstack-cli-linux-amd64-onefile.tar.gz 
tar -xzvf localstack-cli-linux-arm64-onefile.tar.gz -C ./binaries/linux && mv ./binaries/linux/localstack ./binaries/linux/localstack-linux-arm && rm localstack-cli-linux-arm64-onefile.tar.gz

mkdir ./binaries/darwin 
tar -xzvf localstack-cli-darwin-amd64-onefile.tar.gz -C ./binaries/darwin && mv ./binaries/darwin/localstack ./binaries/darwin/localstack-darwin-amd && rm localstack-cli-darwin-amd64-onefile.tar.gz
tar -xzvf localstack-cli-darwin-arm64-onefile.tar.gz -C ./binaries/darwin  && mv ./binaries/darwin/localstack ./binaries/darwin/localstack-darwin-arm && rm localstack-cli-darwin-arm64-onefile.tar.gz

mkdir ./binaries/windows 
unzip localstack-cli-windows-amd64-onefile.zip -d ./binaries/windows && mv ./binaries/windows/localstack.exe ./binaries/windows/localstack-windows-amd.exe && rm localstack-cli-windows-amd64-onefile.zip
        
