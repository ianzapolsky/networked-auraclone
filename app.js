var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var unique = require('uniquely');

var Game = require('./tgame.js').Game;

app.use(express.static('public'));

var appRoot = 'auraclone';

var runGame = function(nsp, res) {

  var players = 0;
  var game = new Game();

  nsp.on('connection', function(socket) {
    var _this = this;

    players += 1;

    if (players === 1) {
      socket.join('p1');
      nsp.to('p1').emit('set player', 1);
      nsp.to('p1').emit('wait for player');
    }
    if (players === 2) {
      socket.join('p2');
      nsp.to('p2').emit('set player', 2);

      game.init();
      nsp.emit('game start', game);

      var clock = setInterval(function() {
        var newUnits = game.doTick();
        nsp.emit('new units', newUnits);
      }, 1000);
    }
    if (players > 2) {
      res.redirect('/overload');
    }

    socket.on('p1 unit data', function(data) {
      nsp.to('p2').emit('unit data', data);
    });
    socket.on('p2 unit data', function(data) {
      nsp.to('p1').emit('unit data', data);
    });
    socket.on('planet data', function(data) {
      gp = game.planets[data.id];
      gp.size    = data.size;
      gp.upgrade = data.upgrade;
      gp.owner   = data.owner;
    });
  });
};

app.get('/overload', function(req, res) {

});

app.get('/create', function(req, res) {
  var roomName = unique.random(10);
  var nsp = io.of('/'+roomName);
  runGame(nsp, res);
  res.redirect('/'+appRoot+'/#'+roomName);
});

http.listen(8000, function() {
  console.log('listening on port 8000');
});
