const app = require('./app');
const PORT = require('config').get('port');


app.on('error', err => console.error(err));

module.exports = {
  start: () => {
    app.listen(PORT, () => {
      console.log(`Server runs at http://localhost:${PORT}`);
    });
  },
};
