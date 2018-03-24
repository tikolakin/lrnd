const request = require('supertest');
const server = require('../server');
const expect = require('expect');

afterEach(() => {
  server.close();
});

describe('chat', async () => {
  describe('webform', () => {
    it('should serve webform', async () => {
      const response = await request(server).get('/');
      expect(response.status).toEqual(200);
      expect(response.type).toEqual('text/html');
    });
    it('should send message');
    it('should show sent message');
    it('should show received message');
  });
  describe('server', () => {
    it('should subscribe clients successfully');
    it('should not keep inactive subscribers');
    it('should send message to all subscribers');
    it('should reject invalid message');
  });
});
