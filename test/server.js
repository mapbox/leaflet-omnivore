var st = require('st');
var http = require('http');

console.log('serving on ', process.env.ZUUL_PORT, ' in ', __dirname);
http.createServer(st(__dirname)).listen(process.env.ZUUL_PORT);
