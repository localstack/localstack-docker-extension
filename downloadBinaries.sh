#!/bin/bash

latest_version=$(curl -s https://api.github.com/repos/localstack/localstack-cli/releases/latest | grep "tag_name" | cut -d'"' -f4)
version_number=$(echo "$latest_version" | grep -oE 'v[0-9]+\.[0-9]+\.[0-9]+' | sed 's/v//')

curl -fsSL "https://github.com/localstack/localstack-cli/releases/latest/download/localstack-cli-${version_number}-linux-amd64-onefile.tar.gz" -o localstack-cli-linux-amd64-onefile.tar.gz 
curl -fsSL "https://github.com/localstack/localstack-cli/releases/latest/download/localstack-cli-${version_number}-linux-arm64-onefile.tar.gz" -o localstack-cli-linux-arm64-onefile.tar.gz 
curl -fsSL "https://github.com/localstack/localstack-cli/releases/latest/download/localstack-cli-${version_number}-darwin-amd64-onefile.tar.gz" -o localstack-cli-darwin-amd64-onefile.tar.gz 
curl -fsSL "https://github.com/localstack/localstack-cli/releases/latest/download/localstack-cli-${version_number}-darwin-arm64-onefile.tar.gz" -o localstack-cli-darwin-arm64-onefile.tar.gz 
curl -fsSL "https://github.com/localstack/localstack-cli/releases/latest/download/localstack-cli-${version_number}-windows-amd64-onefile.zip" -o localstack-cli-windows-amd64-onefile.zip 

mkdir -p ./binaries/linux 
tar -xzvf localstack-cli-linux-amd64-onefile.tar.gz -C ./binaries/linux && mv ./binaries/linux/localstack ./binaries/linux/localstack-linux-amd && rm localstack-cli-linux-amd64-onefile.tar.gz 
tar -xzvf localstack-cli-linux-arm64-onefile.tar.gz -C ./binaries/linux && mv ./binaries/linux/localstack ./binaries/linux/localstack-linux-arm && rm localstack-cli-linux-arm64-onefile.tar.gz

mkdir -p ./binaries/darwin 
tar -xzvf localstack-cli-darwin-amd64-onefile.tar.gz -C ./binaries/darwin && mv ./binaries/darwin/localstack ./binaries/darwin/localstack-darwin-amd && rm localstack-cli-darwin-amd64-onefile.tar.gz
tar -xzvf localstack-cli-darwin-arm64-onefile.tar.gz -C ./binaries/darwin  && mv ./binaries/darwin/localstack ./binaries/darwin/localstack-darwin-arm && rm localstack-cli-darwin-arm64-onefile.tar.gz

mkdir -p ./binaries/windows 
unzip localstack-cli-windows-amd64-onefile.zip -d ./binaries/windows && mv ./binaries/windows/localstack.exe ./binaries/windows/localstack-windows-amd.exe && rm localstack-cli-windows-amd64-onefile.zip
        
