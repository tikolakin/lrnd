const fs = require('fs');
// хотим читать данные из потока в цикле

function readStream(stream) {
  stream.on('error', err => Promise.reject(err));

  return function () {
    return new Promise((resolve) => {
      stream.resume();
      stream.once('data', (chunk) => {
        stream.pause();
        resolve(chunk);
      });
    })
      .catch((err) => { throw err; });
  };
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function read(path) {

  const stream = fs.createReadStream(path, { highWaterMark: 60, encoding: 'utf-8' });

  let data;

  // ЗАДАЧА: написать такой readStream
  const reader = readStream(stream);

  while(data = await reader()) {
    console.log(data);

    await sleep(500);
  }

};

read(__filename).catch(console.error);


/*
  db.unlock()
    .catch()
    .then(() => setValue())
    .catch()
    .then(() => db.lock())

  try {
    await db.unlock();
  } catch (err) {}

  try {
    await setValue()
  } catch(err) {}

  try {
    await db.lock();
  } catch (err) {}
*/
