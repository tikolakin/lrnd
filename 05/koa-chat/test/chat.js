/* global describe, context, it */

const request = require('request-promise');
const app = require('../index');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

describe('server', () => {
  let server;
  before(done => {
    server = app.listen(3000, done);
  });

  after(done => {
    server.close(done);
  });

  describe('POST /publish', () => {

    it('sends a message to all subscribers', async function () {

      const message = 'text';

      const subscribers = Promise.all([
        request({
          method: 'GET',
          url: 'http://127.0.0.1:3000/subscribe',
          timeout: 500
        }),
        request({
          method: 'GET',
          url: 'http://127.0.0.1:3000/subscribe',
          timeout: 500
        })
      ]);

      await sleep(20);
      // postpone invoke of POST request cause
      // POST requests are skipped by koa-static which makes an async call to fs
      // and in our case post request will handle before GET requests in the same thread
      const publisher = await request({
        method: 'POST',
        url: 'http://127.0.0.1:3000/publish',
        json: true,
        body: {
          message
        }
      });

      const messages = await subscribers;

      messages.forEach(msg => {
        msg.should.eql(message);
      });

      publisher.should.eql('ok');

    });
  });

});
