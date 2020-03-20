const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const r = require('rethinkdb');
require('dotenv').config()

let rdbconn = null
r.connect({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  db: 'person-counter'
}, (err, conn) => {
  if (err) throw err;
  rdbconn = conn;
  getLocationData();
  getData();
})

function getLocationData() {
  r.table('location').changes()('new_val').run(rdbconn, (err, cursor) => {
    if (err) throw err;
    cursor.each((err, row) => {
      if (err) throw err;
      io.emit('updated_location_data', row);
    });
  });
}

function getData() {
  r.table('The_Core').changes().filter({old_val: null})('new_val').run(rdbconn, (err, cursor) => {
    if (err) throw err;
    cursor.each((err, row) => {
      if (err) throw err;
      io.emit('updated_data', row);
    });
  });
}

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  })

  // Get and send initial location data
  r.table('location').run(rdbconn, (err, cursor) => {
    if (err) throw err;
    cursor.toArray((err, array) => {
      if (err) throw err;
      socket.emit('initial_location_data', array);
    });
  });

  // Get and send initial timeseries data
  let filter_date = new Date();
  filter_date.setHours(filter_date.getHours() - 12);
  // filter_date.setMinutes(filter_date.getMinutes() - 5);
  r.table('The_Core').filter(r.row('TimeStamp').ge(filter_date)).orderBy('TimeStamp').run(rdbconn, (err, cursor) => {
  // r.table('The_Core').orderBy('TimeStamp').run(rdbconn, (err, cursor) => {
    if (err) throw err;
    cursor.toArray((err, array) => {
      if (err) throw err;
      socket.emit('initial_data', array);
    });
  });
});

app.use((req, res, next) => {
  console.log(req.hostname, res.statusCode, req.url);
  next();
});

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/src/index.html');
});

http.listen(3000, err => {
  if (err) throw err;
  console.log('Running on localhost:3000');
});