myapp.factory('socketio', ['$rootScope', socketio]);

function socketio($rootScope) {

	var socket = io.connect(window.location.origin);
	var name = 'test';
	var roomNum;

	init();

	function init() {
		clear();
		ready();
		startGame();
		waitGame();
		win();
		lose();
		updateQuestion();
		draw();
		listenChat();
	}

	function setName(name) {
		this.name = name;
	}

	function getName() {
		return this.name;
	}

	function join(name) {
		socket.emit('join', name);
		console.log(name);
	}

	function playerReady() {
		console.log('player is ready');
		socket.emit('playerReady', roomNum);
		console.log(roomNum);

	}

	function ready() {
		socket.on('gameReady', function (data) {
			console.log(data.room);
			setRoomNumber(data.roomNumber);
			//socket id was null need to change logic
			if ($rootScope.username === data.room.first.name) {
				$rootScope.opponentName = data.room.second.name;
			} else {
				$rootScope.opponentName = data.room.first.name;
			}

			$rootScope.num = [data.question.nums[0], data.question.nums[1], data.question.nums[2], data.question.nums[3], data.question.nums[4]];
			$rootScope.ans = data.question.ans;
			$rootScope.probNums = [data.question.nums[0], data.question.nums[1], data.question.nums[2], data.question.nums[3], data.question.nums[4]];

			console.log($rootScope.opponentName + ' is the opponent.');
			setTimeout(function () {
				//your code to be executed after 1 second
				$rootScope.$broadcast('buttonReady');
			}, 2000);
			// $rootScope.$broadcast('buttonReady');

		});
	}

	function startGame() {
		console.log('STARTSTARTSTARTSTARTSTART');
		socket.on('start', function () {
			//START GAME AND RECORD TIME
			//EMIT TIME (miliseconds) TO SERVER ONCE PLAYER FINISHES, EMIT 60000 IF PLAYER DOESNT FINISH ON WITHIN 1 MINUTE
			// socket.emit('submit', {
			//     'roomNumber' : roomNumber,
			//     'time' : 50000
			// });
			console.log('will start game');
			setTimeout(function () {
				$rootScope.$broadcast('play');
			}, 1000);
		});
	}

	//submit room and time
	function submitStats(time) {
		socket.emit('submit', {
			'roomNumber' : roomNum,
			'time' : time
		});
	}

	function waitGame() {
		console.log('WAITWAITWAITWAITWAIT');
		//SET PAGE TO WAIT
		socket.on('wait', function () {
			//will do later
			console.log("will wait");
			setTimeout(function () {
				$rootScope.$broadcast('waiting');
			}, 1000);
		});
	}

	function win() {
		//WIN
		socket.on('win', function () {
			console.log('you win');
			$rootScope.winner = $rootScope.username + ' wins';
			$rootScope.scoreP1++;
			$rootScope.youWin = true;
			$rootScope.$broadcast('ending');
		});
	}

	function lose() {
		//LOSE
		socket.on('lose', function () {
			console.log('you lose');
			$rootScope.winner = $rootScope.opponentName + ' wins';
			$rootScope.scoreP2++;
			$rootScope.$broadcast('ending');
		});
	}

	function draw() {
		socket.on('draw', function () {
			console.log('it\'s a draw');
			$rootScope.winner = 'It\'s a draw';
			$rootScope.scoreP2++;
			$rootScope.scoreP1++;
			$rootScope.$broadcast('ending');
		});
	}

	function updateQuestion() {
		socket.on('updateQuestion', function (data) {
			console.log('Got new question.');
			$rootScope.num = [data.question.nums[0], data.question.nums[1], data.question.nums[2], data.question.nums[3], data.question.nums[4]];
			$rootScope.ans = data.question.ans;
			$rootScope.probNums = [data.question.nums[0], data.question.nums[1], data.question.nums[2], data.question.nums[3], data.question.nums[4]];
		});
	}

	function setRoomNumber(num) {
		roomNum = num;
	}

	function clear() {
		socket.on('clear', function () {
			$rootScope.$broadcast('clearAll');
		});
	}

	function listenChat() {
		console.log('listening');
		socket.on('chat message', function (message) {
			console.log('received message from chat');
			console.log(message);
			$rootScope.$broadcast('msgReceived', message);
		});
	}

	function sendChat(txtMessage) {
		console.log('sending ' + txtMessage);
		socket.emit('chat message', {
			msg : txtMessage,
			roomNumber : roomNum
		});
	}

	var service = {};

	//emits 'ready' when is ready

	service.setName = setName;
	service.getName = getName;
	service.join = join;
	service.ready = ready;
	service.startGame = startGame;
	service.waitGame = waitGame;
	service.playerReady = playerReady;
	service.win = win;
	service.lose = lose;
	service.init = init;
	service.submitStats = submitStats;
	service.draw = draw;
	service.clear = clear;
	service.listenChat = listenChat;
	service.sendChat = sendChat;

	return service;

}
