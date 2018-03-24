function readStream(stream) {
  let missedError;

  function onMissedError(err) {
    missedErrors = err;
  }

  stream.on('error', onMissedError);

  return function() {
    return new Promise((resolve, reject) => {
      if (missedError) {
        stream.removeListener('error', onMissedError);
        return reject(missedError);
      }

      stream.on('data', ondata);
      stream.on('error', onerror);
      stream.on('end', onend);
      stream.resume();

      function ondata(chunk) {
        stream.pause(); // until new promise is created, stream doesn't generate new data
        cleanup();
        resolve(chunk);
      }

      function onend() {
        cleanup();
        resolve();
      }

      function onerror(err) {
        stream.removeListener('error', onMissedError);
        cleanup();
        reject(err);
      }

      function cleanup() {
        stream.removeListener('data', ondata);
        stream.removeListener('error', onerror);
        stream.removeListener('end', onend);
      }
    });
  };

}

const fs = require('fs');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function read(path) {

  let stream = fs.createReadStream(path, {highWaterMark: 60, encoding: 'utf-8'});

  let data;
  let reader = readStream(stream);

  while(data = await reader()) {

    console.log(data);

    await sleep(500);
  }


}

read(__filename).catch(console.error);
