"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var vaultage_api_server_1 = require("vaultage-api-server");
// creates koa app, registers all controller routes and returns you koa app instance
var app = vaultage_api_server_1.API.create();
console.log(require.resolve('vaultage-web-cli'));
app.use(require('koa-static')(path.dirname(require.resolve('vaultage-web-cli'))));
// run koa application on port 3000
app.listen(3000);
