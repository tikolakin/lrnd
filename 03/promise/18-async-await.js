// Проблема отсутствующего catch и проглоченной ошибки

const fs = require('mz/fs');

async function read(path) {
  const stat = await fs.stat(path);
  // const val = await doSmthAsync(stat);

  // stat, val

  if (stat.isDirectory()) {
    const files = await fs.readdir(path);
    return files;
  } else {
    const content = await fs.readFile(path);
    return content;
  }
}
//
// function read() {
//   fs.stat()
//     .then(stat => {
//       doSmthAsync(stat)
//         .then(val => {
//           // val, stat
//         })
//     })
//
// }

read(__dirname)
  .then(console.log)
  .catch(console.error);

// async function a() {}
//
// console.log(typeof a()); // undefined
