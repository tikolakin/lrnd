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

describe('REST', async () => {
  it('get user by id');
  it('get array of users');
  it('create user');
  it('edit user');
  it('delete user');
  it('handle data not exist');
  it('validate data');
});
