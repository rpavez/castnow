const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const url = process.env.m3u;
const axios = require("axios")

if(!url){
  console.error("Please pass m3u URL as env variable");
  process.exit(1)
}

app.use(express.static("../dist/"));

http.listen(8090, function () {
  console.log('listening on *:8090');
});

let socket;
let data;

const sanit = s => s.replace("EXTINF:-1,", '').replace(/\r/g, '').replace(/\n/g, '')

if (!fs.existsSync('cache.json') || process.env.nocache) {
  axios.get(url).then(response => {
    data = response.data.split('\n#')
    data.shift();
    const list = data.map(d => {
      return {
        name: sanit(d.split("\n")[0]),
        url: sanit(d.split("\n")[1])
      }
    })
    fs.writeFileSync("cache.json", JSON.stringify(list), 'utf8');
  })
}
else {
  data = JSON.parse(fs.readFileSync("cache.json", 'utf8'));
}

const fork = require('child_process').fork;
let castnowProcess;

io.on('connection', inSocket => {
  socket = inSocket;
  socket.emit("FromAPI", { data });

  socket.on('switchChannel',newChannel=>{
    if(castnowProcess&&castnowProcess.kill) castnowProcess.kill()
    console.log("Selected",newChannel);
    castnowProcess = fork(path.resolve('../../index.js'),["--address","192.168.86.201","--tomp4",newChannel]);
  })
});

console.log('server started at 8090')
