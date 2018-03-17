const request = require('supertest');
const server = require('../server');
const assert = require('assert');
const fs = require('fs');
const config = require('config');

describe('Web Server', () => {

  before(done => {
    server.listen(4000, done);
  });

  after(done => {
    server.close(done);
  });

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
      const file =  Math.random().toString(36).substring(7);
      before(() => {
        try {
          fs.writeFileSync(`./files/${file}`, 'tikolakin');
        } catch (err) {
          return Promise.reject(err);
        }
      });

      after(() => {
        fs.unlinkSync(`./files/${file}`);
      });

      it('should return existing file', () => {
          return request(server)
            .get(`/${file}`)
            .expect(200)
            .then(res => {
              assert.equal('tikolakin', res.text);
            });
      });
    });

    it('should respond with page not found', () => {
      return request(server)
        .get('/../index.html')
        .expect(404);
    });
  });

  describe('File upload', () => {

    let file = '';

    beforeEach( done => {
      file =  Math.random().toString(36).substring(7);
      done();
    });

    it('should upload file', () => {
      return request(server)
        .post(`/${file}`)
        .send('tikolakin')
        .expect(200)
        .then(() => {
          assert(fs.readFileSync(`./files/${file}`).includes('tikolakin'));
        })
    });

    it('should prevent uploading big files', () => {
      return request(server)
        .post(`/${ file }`)
        .set('Content-Length', `${config.get('limitFileSize') + 10}`)
        .expect(413);
    });

    it('should restrict saving big files', () => {
      return request(server)
        .post(`/${file}`)
        .set('Content-Length', `${10}`)
        .send(`${config.get('limitFileSize') * 10}`)
        .expect(400);
    });

    it('should not override file with same name', () => {
      try {
        fs.writeFileSync(`./files/${file}`, 'tikolakin');
      } catch (err) {
        return Promise.reject(err);
      }
      return request(server)
        .post(`/${file}`)
        .expect(409)
        .then(res => {
          assert.equal('File exist', res.text);
        });
    });

    it('should wipe file on interrupted uploading', () => {
      return request(server)
        .post(`/${file}`)
        .set('Content-Length', `${10}`)
        .send(`${config.get('limitFileSize') * 10}`)
        .expect(400)
        .then(() => {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              fs.stat(`./files/${file}`, (err) => {
                if (err) {
                  if (err.code === 'ENOENT') {
                    resolve();
                  } else {
                    reject(err);
                  }
                }
              })}, 10)
          });
        });
    });
  });

  describe('File edit', () => {

    let file = '';

    beforeEach( done => {
      file =  Math.random().toString(36).substring(7);
      done();
    });

    it('should delete existing file', () => {
      try {
        fs.writeFileSync(`./files/${file}`, 'tikolakin');
      } catch (err) {
        return Promise.reject(err);
      }

      request(server)
        .delete(`/${file}`)
        .expect(200)
        .then(() => {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              fs.stat(`./files/${file}`, (err) => {
                if (err) {
                  if (err.code === 'ENOENT') {
                    resolve();
                  } else {
                    reject(err);
                  }
                }
              })}, 0)
          });
        });
    });

    it('should respond on file doesn\'t exists', () => {
      request(server)
        .delete('/nofile')
        .expect(404);
    });
  });
});
