const { Server } = require('http');
const handler = require('handler');

const server = new Server(handler);

server.listen(5000);
