// Tiny static server for the sample app. No dependencies.
const http = require('http');
const fs = require('fs');
const path = require('path');

const port = Number(process.env.PORT || 4173);
const file = path.join(__dirname, 'index.html');

http
  .createServer((req, res) => {
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Server error');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
  })
  .listen(port, '127.0.0.1', () => console.log(`TaskBoard on http://127.0.0.1:${port}`));
