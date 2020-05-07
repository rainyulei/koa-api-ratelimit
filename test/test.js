const http = require('http');
function hget() {
  setInterval(() => {
    http.get('http://localhost:3000/home', res => {
      let stri = '';
      res.on('data', chunk => {
        stri += chunk;
      });
      res.on('close', () => {
        console.log(stri);
      });
    });
  }, 100);
}
hget();
