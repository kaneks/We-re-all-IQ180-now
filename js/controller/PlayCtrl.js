/*
##	This is the controller for the game page.
 */

myapp.controller('PlayCtrl', function ($scope) {

	$scope.num = [1, 2, 3, 4, 5];
	$scope.ans = 'some num';

	var myName;
	var opponentName;
	var myNumber;
	var roomNumber;

	var socket = io();

	//PLACEHOLDER NAME

	socket.emit('join', 'mickey');

	//ASSIGN ACTIONS TO BUTTON

	$('joinButton').click(function () {
		socket.emit('join', myName);
	});
	$('readyButton').click(function () {
		socket.emit('playerReady', roomNumber);
	});

	socket.on('assignRoom', function (data) {
		console.log(data.room);
		roomNumber = data.roomNumber;
		if (socket.id == data.room.first.id) {
			opponentName = data.room.second.name;
		} else {
			opponentName = data.room.first.name;
		}
	});

	socket.on('gameReady', function () {
		//UNLOCK READY BUTTON
	});

	socket.on('start', function () {
		//START GAME AND RECORD TIME
		//EMIT TIME (miliseconds) TO SERVER ONCE PLAYER FINISHES, EMIT 60000 IF PLAYER DOESNT FINISH ON WITHIN 1 MINUTE
		socket.emit('submit', {
			'roomNumber' : roomNumber,
			'time' : 50000
		});
	});

	socket.on('wait', function () {
		//SET PAGE TO WAIT
	});

	socket.on('win', function () {
		//WIN
	});

	socket.on('lose', function () {
		//LOSE
	});

	//CHAT AND LOG

	$('form').submit(function () {
		socket.emit('chat message', {
			'roomNumber' : roomNumber,
			'msg' : $('#m').val()
		});
		$('#m').val('');
		return false;
	});

	socket.on('chat message', function (msg) {
		$('#messages').append($('<li>').text(msg));
	});
	socket.on('log', function (msg) {
		console.log(msg);
	});

})
