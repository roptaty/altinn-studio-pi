# base image
# no
FROM node:14.16.0-alpine3.12  AS generate-receipt-app

# Copy and install Lerna
# Context is ./src, see docker-compose.yaml in src\Altinn.Platform\Altinn.Platform.Receipt\docker-compose.yml
COPY Altinn.Apps/AppFrontend/react/lerna.json .
COPY Altinn.Apps/AppFrontend/react/package.json .
COPY Altinn.Apps/AppFrontend/react/package-lock.json .
RUN npm ci

# Copy shared and receipt
COPY Altinn.Apps/AppFrontend/react/shared/ /shared/
COPY Altinn.Apps/AppFrontend/react/receipt/ /receipt/

# Install
RUN npm run install-deps

# Build runtime
RUN npm run build --prefix /receipt; exit 0

CMD ["echo", "done"]
