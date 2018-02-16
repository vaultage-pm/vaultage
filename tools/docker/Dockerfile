FROM node:9

ENV NPM_CONFIG_PREFIX=/home/node/.npm-global

USER node

RUN npm install -g vaultage

EXPOSE 3000

CMD ["/home/node/.npm-global/bin/vaultage-server"]