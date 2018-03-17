const fs = require('fs');
const promisify = require('util').promisify;

const promisifiedReadFile = promisify(fs.readFile);

promisifiedReadFile(__filename)
  .then(console.log)
  .catch(console.error);

function readFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, content) => { // thunk
      if (err) return reject(err);

      // myStore.putToCache(content);
      resolve(content);
    });
  });
}

readFile(__filename).then(
  console.log,
  console.error
);
