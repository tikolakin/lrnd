const mongoose = require('mongoose');
mongoose.set('debug', true);

mongoose.connect('mongodb://localhost/test');

const User = mongoose.model('User', new mongoose.Schema({
  email:   {
    type:     String,
    required: 'укажите email',
    unique:   true
  }
}));

async function createUsers() {

  await User.remove({});
  let john = await User.create({email: 'pete@gmail.com'});
  let pete = await User.create({email: 'pete@gmail.com'});
  let mary = await User.create({email: 'mary@gmail.com'});

}

// ВОПРОС: что будет при ошибке валидации?
// структура ошибки валидации: err.errors

createUsers()
  .then(() => console.log("done"))
  .catch(console.error)
  .then(() => mongoose.disconnect());
