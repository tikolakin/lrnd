const fs = require('fs');

// хотим читать данные из потока в цикле

function readStream(stream) {

}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function read(path) {

  let stream = fs.createReadStream(path, {highWaterMark: 60, encoding: 'utf-8'});

  let data;

  // ЗАДАЧА: написать такой readStream
  let reader = readStream(stream);

  while(data = await reader()) {
    console.log(data);

    await sleep(500);
  }

});

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
