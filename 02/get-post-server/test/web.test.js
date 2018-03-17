/* eslint-disable import/no-extraneous-dependencies */
const request = require('supertest');
const server = require('../server');
const assert = require('assert');
const fs = require('fs');
const config = require('config');

require('trace');
require('clarify');

const unhandledRejections = [];

process.on('unhandledRejection', (err, promise) => {
  unhandledRejections.push(promise);
  console.error(`Unhandled rejection: ${err.message} ${err.stack}\n\n`);
});

process.on('rejectionHandled', (promise) => {
  const index = unhandledRejections.indexOf(promise);
  unhandledRejections.splice(index, 1);
});

describe('Web Server', () => {
  beforeEach(() => {
    // clean directory
  });

  describe('File access', () => {
    it('should return index.html file', () => {
      const content = fs.readFileSync('./public/index.html', {
        encoding: 'utf-8',
      });

      return request(server)
        .get('/')
        .expect('Content-Type', 'text/html')
        .expect(200, content);
    });

    describe('file exists', () => {
      const file = Math.random().toString(36).substring(7);

      before(done => new Promise((resolve, reject) => {
        fs.writeFile(`./files/${file}`, 'tikolakin', (err) => {
          if (err) reject(err);
          resolve();
        });
      })
        .then(done()));

      it('should return existing file', async () => {
        request(server)
          .get(`/${file}`)
          .expect(200)
          .then((res) => {
            assert.equal('tikolakin', res.text);
          });
      });
    });

    it('should respond with page not found', async () => {
      request(server)
        .get('/../index.html')
        .expect(404);
    });
  });

  describe('File upload', () => {
    let file = '';

    beforeEach((done) => {
      file = Math.random().toString(36).substring(7);
      done();
    });

    it('should upload file', async () => {
      await request(server)
        .post(`/${file}`)
        .send('tikolakin')
        .expect(200)
        .then(() => new Promise((resolve, reject) => {
          fs.readFile(`./files/${file}`, (err, content) => {
            if (err) reject(err);
            resolve(content.toString());
          });
        }))
        .then((fileContent, err) => {
          if (err) throw err;
          assert.equal(fileContent, 'tikolakin');
        });
    });

    it('should prevent uploading big files', async () => {
      request(server)
        .post(`/${file}`)
        .set('Content-Length', `${config.get('limitFileSize') + 10}`)
        .expect(413);
    });

    it('should restrict saving big files', async () => {
      request(server)
        .post(`/${file}`)
        .set('Content-Length', `${10}`)
        .send(`${config.get('limitFileSize') * 10}`)
        .expect(400);
    });

    it('should not override file with same name', async () => {
      await new Promise((resolve, reject) => {
        fs.writeFile(`./files/${file}`, 'tikolakin', (err) => {
          if (err) reject(err);
          resolve();
        });
      });

      request(server)
        .post(`/${file}`)
        .expect(409)
        .then((res) => {
          assert.equal('File exist', res.text);
        });
    });

    it('should wipe file on interrupted uploading', async () => {
      await request(server)
        .post(`/${file}`)
        .set('Content-Length', `${10}`)
        .send(`${config.get('limitFileSize') * 10}`)
        .expect(400);

      await new Promise((resolve, reject) => {
        setTimeout(() => {
          fs.stat(`./files/${file}`, (err) => {
            if (err) {
              if (err.code === 'ENOENT') {
                resolve();
              } else {
                reject(err);
              }
            }
            reject(new Error('File exists'));
          });
        }, 10);
      });
    });
  });

  describe('File edit', () => {
    let file = '';

    beforeEach((done) => {
      file = Math.random().toString(36).substring(7);
      done();
    });

    it('should delete existing file', async () => {
      await new Promise((resolve, reject) => {
        fs.writeFile(`./files/${file}`, 'tikolakin', (err) => {
          if (err) reject(err);
          resolve();
        });
      });

      await request(server)
        .delete(`/${file}`)
        .expect(200);


      await new Promise((resolve, reject) => {
        setTimeout(() => {
          fs.stat(`./files/${file}`, (err) => {
            if (err) {
              if (err.code === 'ENOENT') {
                resolve();
              } else {
                reject(err);
              }
            }
            reject(new Error('File exists'));
          });
        }, 10);
      });
    });

    it('should respond on file doesn\'t exists', async () => {
      request(server)
        .delete('/nofile')
        .expect(404);
    });
  });
});
