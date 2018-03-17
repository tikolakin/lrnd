const {Server} = require('http');

const s = new Server((req, res) => {
  console.log(req.headers);

  let b = '';
  req.on('data', c => {
    b += c;
  });

  req.on('end', () => {
    console.log(b);
    res.end(b);
  });
});

s.listen(3000);
