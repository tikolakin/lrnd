// Connecting w/ mongoose, schema, model, basic queries
const mongoose = require('mongoose');
mongoose.set('debug', true);

mongoose.connect('mongodb://localhost/intro');

const userSchema = new mongoose.Schema({
  email: {
    type:       String,
    // встроенные сообщения об ошибках (можно изменить):
    // http://mongoosejs.com/docs/api.html#error_messages_MongooseError.messages
    required:   'Укажите email', // true for default message
    unique:     true,
    validate: [{
      validator: function checkEmail(value) {
        return /^[-.\w]+@([\w-]+\.)+[\w-]{2,12}$/.test(value);
      },
      msg: 'Укажите, пожалуйста, корректный email.'
    }],
    lowercase:  true, // to compare with another email
    trim:       true
  },
  displayName: String,
  gender: {
    type:       String,
    enum:       ['М', 'Ж'], // enum validator
    default:    'Ж'
  }
}, {
  timestamps: true // createdAt, updatedAt
});

userSchema.index({ email: 1, gender: -1 });

// публичные (доступные всем) поля
userSchema.methods.getPublicFields = function() {
  return {
    email: this.email,
    gender: this.gender
  };
};

const User = mongoose.model('User', userSchema); // users

// User.collection - это mongo native driver collection
// console.log(User.collection.conn.db); // доступ к connection, db на уровне native driver

const mary = new User({
  email: 'mary@mail.com'
});

console.log(mary);
console.log(mary.getPublicFields());

// mary.toObject() - обычный объект без методов, с данными

// no error handling here (bad)
User.remove({}, function(err) {
  // ensureIndex ???
  mary.save(function(err, result) {
    console.log(err);
    console.log(result);

    User.findOne({
      email: 'mary@mail.com'
    }, function(err, user) {
      console.log(user);

      // ... do more with mary

      // no unref!
      mongoose.disconnect();
    });

  });

});
