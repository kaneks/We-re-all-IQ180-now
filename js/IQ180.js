var myapp = angular.module("myapp", ['ngRoute', 'ui.bootstrap']);

myapp.config(function($routeProvider){
    $routeProvider
    .when('/home',{
        templateUrl: 'app/home.html',
        controller: 'HomeCtrl'
    })
    .when('/play',{
        templateUrl: 'app/play.html',
        controller: 'PlayCtrl'
    })
    .otherwise({
        redirectTo: '/play'
    })
});

myapp.factory('socketio', ['$rootScope', function ($rootScope) {

    var socket = io.connect();

    var service = {

    };

    function join(name){
        socket.emit('join', name);
    }

    function ready(roomNumber){
        socket.emit('playerReady', roomNumber);
    }

    function assignRoom(assignRoom){
        socket.on('assignRoom', function (data) {
            console.log(data.room);
            roomNumber = data.roomNumber;
            if (socket.id == data.room.first.id) {
                opponentName = data.room.second.name;
            } else {
                opponentName = data.room.first.name;
            }
        });
    }

    function ready(){
        socket.on('gameReady', function () {
            //UNLOCK READY BUTTON
        });
    }

    function start(){
        socket.on('start', function () {
            //START GAME AND RECORD TIME
            //EMIT TIME (miliseconds) TO SERVER ONCE PLAYER FINISHES, EMIT 60000 IF PLAYER DOESNT FINISH ON WITHIN 1 MINUTE
            socket.emit('submit', {
                'roomNumber' : roomNumber,
                'time' : 50000
            });
        });
    }

    function wait(){
        //SET PAGE TO WAIT
    }

    function win(){
        //WIN
    }

    function lose(){
        //LOSE
    }

    /*return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        }
    };*/
    
});