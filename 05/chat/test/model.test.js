const request = require('request-promise');
const config = require('config');
const app = require('../app');
const chai = require('chai');

const expect = chai.expect;
const should = chai.should();
const inspect = require('util').inspect;

chai.config.includeStack = true; // turn on stack trace
chai.config.truncateThreshold = 0; // disable truncating

describe('User', async () => {
  it('has unique email');
  it('has created at date');
  it('has modified at date');
  it('has display name');
});
