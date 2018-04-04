// слишком простой чат, в коде есть минимум 7 серьёзных ошибок - КАКИХ?
const http = require('http');
const fs = require('fs');

let clients = [];

http.createServer((req, res) => {

  switch (req.method + ' ' + req.url) {
    case 'GET /':
    // 1. handle reading error
    fs.createReadStream('./public/index.html').pipe(res);
    break;

    case 'GET /subscribe':
    // 2. Remove res if client closed connection
    console.log("subscribe");
    // 6. confirm subscribtion ok and keep alive
    clients.push(res);
    break;

  case 'POST /publish':
    let body = '';

    req
    // 3. on('error')
    // 4. validate data
    // 7 . don't store local data but pipe to susbscribers
      .on('data', data => {
        body += data;
      })
      .on('end', () => {
        // 5. handle bad JSON body
        body = JSON.parse(body);

        console.log("publish '%s'", body.message);

        clients.forEach(res => {
          res.end(body.message);
        });

        clients = [];

        res.end("ok");
      });

    break;

  default:
    res.statusCode = 404;
    res.end("Not found");
  }


}).listen(3000);
