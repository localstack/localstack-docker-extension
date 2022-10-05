# LocalStack Docker extension

The repository contains a simple Docker extension to control and manage your LocalStack instance

# Installation

Once the repo is cloned you can start by going under /LocalStack and run
`make install-extension` (this will build and install the extension in your docker desktop application). Alternatively you can pull the image (`docker pull pive01/localstack-docker-extension:latest`) and then install it (`docker extension install pive01/localstack-docker-extension:latest`) but may not have the latest version.

In order to work you must add /tmp to your shared files on docker desktop under Settings > Resources > File sharing. This is a temporary solution since it's where the LocalStack volume directory mounts.

# Contributing

After cloning the directory and have installed all the dependencies (using npm) some useful commands are:
- `docker extension dev debug pive01/localstack-docker-extension` allows to open the Developer Tools
- after you started the ui using `npm start` under Localstack/ui/ you can enable hard-reload using `docker extension dev ui-source pive01/localstack-docker-extension http://localhost:3000` or whatever port the react app is running to
