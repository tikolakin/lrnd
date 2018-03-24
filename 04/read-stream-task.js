const fs = require('fs');

// хотим читать данные из потока в цикле

function readStream(stream) {
  let missedErr;

  stream.on('error', err => {
    missedErr = err;
  });

  return function() {
    return new Promise((resolve, reject) => {
      if (missedErr) {
        return reject(missedErr);
      }

      stream.resume();

      function onData(chunk) { // => flowing
        stream.pause(); // => paused
        console.log('data');
        // stream.removeListener('data')
        resolve(chunk);
        cleanup();
      }

      stream.on('data', onData);

      function onError(err) {
        reject(err);
        cleanup();
      }

      stream.on('error', onError);

      function cleanup() {
        stream.removeListener('data', onData);
        stream.removeListener('error', onError);
      }
    });
  }
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

}

read(__filename).catch(console.error);
