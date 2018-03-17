const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const mime = require('mime');
const config = require('config');

function sendFile(filePath, res) {
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);

  fileStream
    .on('error', (err) => {
      if (err.code === 'ENOENT') {
        res.statusCode = 404;
        res.end('Page not found');
      } else {
        console.error(err);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.end('Cannot read file from server.');
        } else {
          res.end();
        }
      }
    })
    .on('open', () => {
      res.setHeader('Content-Type', mime.getType(filePath));
    })
    .on('close', () => {
      fileStream.destroy();
    });
}


function handleGET(pathname, req, res) {
  if (req.method !== 'GET') {
    return;
  }

  let filePath;

  if (pathname === '/') {
    filePath = `${config.get('publicRoot')}/index.html`;
  } else {
    filePath = path.normalize(path.join(config.get('filesRoot'), pathname));
  }

  sendFile(filePath, res);
}

function handleAddUpdate(pathname, req, res) {
  if (['POST', 'DELETE'].indexOf(req.method) < 0) {
    return;
  }

  if (req.headers['content-length'] > config.get('limitFileSize')) {
    res.statusCode = 413;
    res.end('File is too big.');
    return;
  }

  const filePath = path.normalize(path.join(config.get('filesRoot'), pathname));

  if (req.method === 'POST') {
    debugger;
    let size = 0;
    const fileStream = fs.createWriteStream(filePath, { flags: 'wx' });

    let gotData = function(chunk) {
      size += chunk.length;
      if (size > config.get('limitFileSize')) {
        // fail fast
        req.removeEventListener('data', gotData);

        // if we just res.end w/o connection close, browser may keep on sending the file
        // the connection will be kept alive, and the browser will hang (trying to send more data)
        // this header tells node to close the connection
        // also see http://stackoverflow.com/questions/18367824/how-to-cancel-http-upload-from-data-events/18370751#18370751
        res.header('Connection', 'close');
        res.send(413, 'Upload too large');
        // Some browsers will handle this as 'CONNECTION RESET' error
        fileStream.destroy();
        fs.unlink(filePath, (err) => { /* suppress error */ });
      }
    };


    req
      .on('data', gotData)
      .on('close', () => {
        fileStream.destroy();
        fs.unlink(filePath, (err) => { /* suppress error */ });
      })
      .pipe(fileStream);

    fileStream
      .on('error', (err) => {
        if (err.code === 'EEXIST') {
          res.statusCode = 409;
          res.end('File exist');
        } else {
          console.error(err);
          if (!req.headersSent) {
            res.writeHeader(500, { Connection: 'close' });
            res.write('Bad request!');
          }
          fs.unlink(filePath, (err) => { /* suppress error */
          });
          res.end();
        }
      })
      .on('close', () => {
        // Note: can't use on('finish')
        // finish = data flushed, for zero files happens immediately,
        // even before 'file exists' check

        // for zero files the event sequence may be:
        //   finish -> error

        // we must use 'close' event to track if the file has really been written down
        res.end('File uploaded!');
      });
  } else if (req.method === 'DELETE') {
    fs.unlink(filePath, (err) => {
      if (err) {
        if (err.code === 'ENOENT') {
          res.statusCode = 404;
          res.end('File not found');
        } else {
          console.error(err);
          res.statusCode = 500;
          res.end('Internal server error. Try again later.');
        }
      }
      res.end('Successfully deleted');
    });
  }
}

module.exports = http.createServer((req, res) => {
  let pathname;

  try {
    pathname = decodeURI(url.parse(req.url).pathname);
  } catch (e) {
    res.statusCode = 500;
    res.end('Server error!');
    return;
  }

  handleGET(pathname, req, res);

  handleAddUpdate(pathname, req, res);
});
