FROM node:10-alpine
ARG VAULTAGE_CHANNEL

ENV NPM_CONFIG_PREFIX=/home/node/.npm-global

USER node

RUN npm install -g vaultage@${VAULTAGE_CHANNEL}

EXPOSE 3000

CMD ["/home/node/.npm-global/bin/vaultage-server"]