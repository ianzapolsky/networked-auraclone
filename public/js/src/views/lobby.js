define([
  'underscore',
  'jquery',
  'backbone',
  'socketio',
], function(_, $, Backbone, io) {

  var AppView = Backbone.View.extend({

    el: 'body',

    games: [],

    appRoot: 'auraclone',

    initialize: function() {
      var _this   = this;
      this.socket = io('/lobby');

      this.socket.on('games', function(games) {
        console.log('received games');
        console.log(games);
        _this.games = games;
        console.log(_this.games);
        _this.render();
      });
    },

    events: {
    },

    handleClick: function(e) {
      var _this = this;
      var selected = this.game.players[this.pid - 1].executeMove(e.clientX, e.clientY);
      if (selected.length > 0) {
        this.emitData(selected);
      }
    },

    render: function() {
      var _this = this;
      var content = _.template( $('#game-list-template').html(), { data: _this.games});
      $('.game-list').html(content);
    }

  });

  return AppView;
});
