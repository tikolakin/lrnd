const url = require('url');
const fs = require('fs');
const path = require('path');
const mime = require('mime');

const FILESROOT = `${process.cwd()}/files`;
const PUBLICROOT = `${process.cwd()}/public`;

function sendFile(filePath, res) {
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);

  fileStream.on('error', (err) => {
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
      console.info('File sending was interrupted.');
      fileStream.destroy();
    });
}


function handleGET(pathname, req, res) {
  if (req.method !== 'GET') {
    return;
  }

  let filePath;
  let root = PUBLICROOT;

  if (pathname === '/') {
    filePath = `${PUBLICROOT}/index.html`;
  } else {
    filePath = path.normalize(path.join(FILESROOT, pathname));
    root = FILESROOT;
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.statusCode = 404;
      res.end('Page not found');
      return;
    }
    sendFile(filePath, res);
  });
}

function handleAddUpdate(pathname, req, res) {
  if (['POST', 'DELETE'].indexOf(req.method) < 0) {
    return;
  }

  if (req.headers['content-length'] > 1e6) {
    res.statusCode = 413;
    res.end('File is too big.');
    return;
  }

  const filePath = path.normalize(path.join(FILESROOT, pathname));

  switch (req.method) {
    case 'POST':

      fs.stat(filePath, (err, stat) => {
        if (err && err.code === 'ENOENT') {
          const fileStream = fs.createWriteStream(filePath);
          req.pipe(fileStream);

          fileStream.on('error', (err) => {
            console.error(err);
            res.statusCode = 500;
            return res.end('Server error. File was not uploaded!');
          });

          req.on('end', () => {
            res.end('File uploaded!');
          });

          req.on('close', () => {
            console.info('File receiving was interrupted.');
            fileStream.destroy();
            fs.unlink(filePath, (e) => {
              if (e) {
                console.error(e);
              }
            });
          });
        } else if (stat && stat.isFile()) {
          res.statusCode = 409;
          return res.end('File exist');
        } else {
          res.statusCode = 500;
          return res.end('Bad request!');
        }
      });
      break;

    case 'DELETE':

      fs.stat(filePath, (err, stat) => {
        if (err) {
          if (err.code === 'ENOENT') {
            res.statusCode = 404;
            return res.end('File not found');
          }
          console.error(err);
          res.statusCode = 500;
          return res.end('Internal server error. Try again later.');
        }

        if (stat && stat.isFile()) {
          fs.unlink(filePath, (e) => {
            if (e) {
              console.error(e);
              res.statusCode = 500;
              return res.end('Could not delete file.');
            }
            return res.end('Successfully deleted');
          });
        }
      });
      break;
    default:
  }
}

exports.route = (req, res) => {
  let pathname;

  try {
    pathname = decodeURI(url.parse(req.url).pathname);
  } catch (e) {
    res.statusCode = 500;
    res.end('Bad request!');
    return;
  }

  handleGET(pathname, req, res);

  handleAddUpdate(pathname, req, res);
};
