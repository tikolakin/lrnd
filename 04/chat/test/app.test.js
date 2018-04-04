const request = require('request-promise');
const config = require('config');
const app = require('../app');
const chai = require('chai');

const expect = chai.expect;
const should = chai.should();
const inspect = require('util').inspect;

chai.config.includeStack = true; // turn on stack trace
chai.config.truncateThreshold = 0; // disable truncating

const opts = {
  uri: `http://localhost:${config.get('port')}`,
  baseUrl: `http://localhost:${config.get('port')}`,
  resolveWithFullResponse: true,
};

let server;

beforeEach((done) => {
  server = app.listen(config.get('port'), () => {
    done();
  });
});

afterEach((done) => {
  server.close();
  done();
});

describe('chat', async () => {
  describe('webform', () => {
    it('should serve webform', async () => {
      await request('/', opts)
        .then((res) => {
          res.statusCode.should.equal(200);
          res.headers['content-type'].should.equal('text/html; charset=utf-8');
        });
    });
    it('should send message');
    it('should show sent message');
    it('should show received message');
  });
  describe('server', () => {
    it('should subscribe clients to new messages', async () => {
      expect(app.context.subscribers).to.have.lengthOf(0);
      let response;
      let req;
      const reqPromise = new Promise(async (resolve) => {
        req = request('/subscribe', opts)
          .then((res) => {
            response = res;
            resolve();
          });
      });

      await new Promise((resolve) => {
        setTimeout(() => {
          expect(inspect(reqPromise)).to.equal('Promise { <pending> }');
          should.not.exist(response);
          req.cancel();
          resolve();
        }, 100);
      });
      expect(app.context.subscribers).to.have.lengthOf(1);
    });

    it('should not keep inactive subscribers', async () => {
      expect(app.context.subscribers).to.have.lengthOf(0);
      const req = request('/subscribe', opts);
      await new Promise((resolve) => {
        setTimeout(() => {
          req.cancel();
          resolve();
        }, 0);
      });
      expect(app.context.subscribers).to.have.lengthOf(0);
    });
    it('should send message to all subscribers');
    it('should reject invalid message');
  });
});
