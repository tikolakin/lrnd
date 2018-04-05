const config = require('config');
const mongoose = require('mongoose');

mongoose.set('debug', true);
mongoose.connect(config.get('DB_HOST'));

const User = new mongoose.Schema({

});

const models = {
  User,
};

module.exports = models;
