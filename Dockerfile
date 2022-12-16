FROM golang:1.17-alpine AS builder
ENV CGO_ENABLED=0
WORKDIR /backend
COPY vm/go.* .
RUN --mount=type=cache,target=/go/pkg/mod \
  --mount=type=cache,target=/root/.cache/go-build \
  go mod download
COPY vm/. .
RUN --mount=type=cache,target=/go/pkg/mod \
  --mount=type=cache,target=/root/.cache/go-build \
  go build -trimpath -ldflags="-s -w" -o bin/service

FROM --platform=$BUILDPLATFORM node:17.7-alpine3.14 AS client-builder
WORKDIR /ui
# cache packages in layer
COPY ui/package.json /ui/package.json
COPY ui/package-lock.json /ui/package-lock.json
RUN --mount=type=cache,target=/usr/src/app/.npm \
  npm set cache /usr/src/app/.npm && \
  npm ci
# install
COPY ui /ui
RUN npm run build

FROM alpine
LABEL org.opencontainers.image.title="LocalStack" \
  org.opencontainers.image.description="Extension of Localstack for Docker desktop" \
  org.opencontainers.image.vendor="LocalStack GmbH" \
  com.docker.desktop.extension.api.version=">= 0.2.3" \
  com.docker.desktop.extension.icon="https://avatars.githubusercontent.com/u/28732122?v=4" \
  com.docker.extension.screenshots="[ \
  {\"alt\": \"System status\", \"url\": \"https://raw.githubusercontent.com/localstack/localstack-docker-extension/main/.github/images/1-systemStatus.png\"}, \
  {\"alt\": \"Edit configurations\", \"url\": \"https://raw.githubusercontent.com/localstack/localstack-docker-extension/main/.github/images/2-configuration.png\"}, \
  {\"alt\": \"Watch logs of the LocalStack running container \", \"url\": \"https://raw.githubusercontent.com/localstack/localstack-docker-extension/main/.github/images/3-logs.png\"}, \
  ]" \
  com.docker.extension.detailed-description="The LocalStack Extension for Docker Desktop enables developers working with LocalStack to run their AWS applications or Lambdas entirely \
  on their local machine without connecting to a remote cloud provider! LocalStack empowers developers to use over 75+ AWS services locally while helping them simplify their testing \
  and development workflow. LocalStack supports a comprehensive list of APIs, which you can view on our <a href=\"https://docs.localstack.cloud/user-guide/aws/feature-coverage/\"> \
  Feature coverage page</a>. <br><br> \
  Make sure to have also installed awscli-local. You can install it via pip: <b>pip install awscli-local</b> \
  <h2>This extension supports the following main features:</h2>\
  <ul>\
  <li> Control LocalStack: Start, stop, and restart LocalStack from the Docker Desktop. You can also see the current status of your LocalStack instance and navigate to LocalStack Web Application. </li>\
  <li> LocalStack insights: You can see the log information of the LocalStack instance and all the available services and their status on the service page. </li>\
  <li> LocalStack configurations: You can manage and use your profiles via configurations and create new configurations for your LocalStack instance. </li>\
  </ul>" \
  com.docker.extension.publisher-url="https://localstack.cloud/" \
  com.docker.extension.additional-urls="[ \
  {\"title\":\"GitHub Repository\", \"url\":\"https://github.com/localstack/localstack-docker-extension\"}, \
  {\"title\":\"Feedback and Issues\", \"url\":\"https://github.com/localstack/localstack-docker-extension/issues\"}, \
  ]" \
  com.docker.extension.changelog="We have introduced a new feature:<br/> \
  <ul>  \
  <li> You can now update your LocalStack images from the UI </li> \
  </ul> \
  We have made some changes in the UI: \
  <ul>  \
  <li> Updates in the control section </li> \
  <li> Moved to a table to display saved configurations </li> \
  <li> Improved UI for inserting a new configuration </li> \
  </ul> \
  Bug fixes:<br/> \
  <ul>  \
  <li> Made configuration persistent </li> \
  <li> Logs are correctly displayed </li> \
  </ul>"

COPY --from=builder /backend/bin/service /
COPY docker-compose.yaml .
COPY metadata.json .
COPY localstack.svg .
COPY --from=client-builder /ui/build ui
CMD /service -socket /run/guest-services/extension-LocalStack.sock
