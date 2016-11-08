var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var express = require('express');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://localhost:27017/netcentric';
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
		extended : true
	}));
app.use(express.static(__dirname));

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.get('/monitor', function (req, res) {
	res.sendFile(__dirname + '/monitor.html');
});

var userModel = {
	name : '',
	points : 0,
	wins : 0,
	losses : 0
};

//Create a new user with name

app.post('/u', function (req, res) {
	if (!req.body.name) {
		return res.send({
			'status' : '1',
			'message' : 'missing a parameter'
		});
	} else {
		MongoClient.connect(url, function (err, db) {
			if (err) {
				console.log('Unable to connect to the mongoDB server. Error:', err);
				return res.send({
					'status' : '1',
					'message' : err
				});
			} else {
				console.log('Connection established to', url);
				var collection = db.collection('user');
				var user = userModel;
				user.name = req.body.name;
				collection.insert([user], function (err, doc) {
					if (err) {
						console.log(err);
						return res.send({
							'status' : '1',
							'message' : err
						});
					} else {
						return res.send({
							'status' : '0',
							'message' : 'user created'
						});
					}
					db.close();
				});
			}
		});
	}
});

//Get user info with name

app.get('/u/:name', function (req, res) {
	MongoClient.connect(url, function (err, db) {
		if (err) {
			return res.send({
				'status' : 1,
				'message' : err
			});
		} else {
			var collection = db.collection('user');
			collection.findOne({
				'name' : req.params.name
			}, function (err, doc) {
				if (err) {
					return res.send({
						'status' : 1,
						'message' : err
					});
				} else if (doc != null) {
					return res.send({
						'status' : 0,
						'message' : 'user found',
						'user' : doc,
						
					});
				} else {
					return res.send({
						'status' : 2,
						'message' : 'user not found'
					});
				}
				db.close();
			});
		}
	});
});

//generate question and ans
app.get('/question', function (req, res) {
	var probNums = [];
	for(var i = 0; i < 5; i ++){
		 probNums[i] = Math.floor(Math.random() * 10);
	}

	var count = 0;
	var genNums = [];

	while(true){
		if(count == 5) break;
		var ranNum = Math.floor(Math.random() * 5);
		if(genNums[ranNum] == null){
			genNums[ranNum] = probNums[count];
			count++;
		}
	}

	var temp = genNums[0];
	for(var i = 0; i < 4; i++){
		var opSelector = Math.floor(Math.random() * 4);
		if(opSelector == 0){
			temp += genNums[i + 1];
		}else if(opSelector == 1){
			temp -= genNums[i + 1];
		}else if(opSelector == 2){
			temp *= genNums[i + 1];
		}else{
			if((temp%genNums[i + 1]) == 0){
				temp /= genNums[i + 1];
			}else{
				i--;
			}
		}
	}

	return res.send({
		'Num1' : probNums[0],
		'Num2' : probNums[1],
		'Num3' : probNums[2],
		'Num4' : probNums[3],
		'Num5' : probNums[4],
		'Ans' : temp
	});


});

//Socket

var rooms = [];
var roomCount = 0;
io.on('connection', function (socket) {
	socket.on('join', function (name) {
		console.log('Received \'join\' from ' + name);
		if (io.sockets.adapter.rooms[roomCount] && io.sockets.adapter.rooms[roomCount].length == 2)
			roomCount++;
		socket.join(roomCount);
		if (io.sockets.adapter.rooms[roomCount].length == 1) {
			rooms[roomCount] = {};
			rooms[roomCount].first = {};
			rooms[roomCount].second = {};
			rooms[roomCount].roomNumber = roomCount;
			if (Math.random() < 0.5) {
				rooms[roomCount].first.id = socket.id;
				rooms[roomCount].first.name = name;
			} else {
				rooms[roomCount].second.id = socket.id;
				rooms[roomCount].second.name = name;
			}
			io.sockets.in('monitors').emit('updateData', rooms);
		} else {
			if (rooms[roomCount].first.id != null) {
				rooms[roomCount].second.id = socket.id;
				rooms[roomCount].second.name = name;
			} else {
				rooms[roomCount].first.id = socket.id;
				rooms[roomCount].first.name = name;
			}
			io.sockets.in('monitors').emit('updateData', rooms);
			io.sockets.in(roomCount).emit('assignRoom', {
				'roomNumber' : roomCount,
				'room' : rooms[roomCount]
			});
			console.log('Emitted \'assignRoom\' to ' + rooms[roomCount].first.name);
			console.log('Emitted \'assignRoom\' to ' + rooms[roomCount].second.name);
			io.sockets.in(roomCount).emit('gameReady');
			console.log('Emitted \'gameReady\' to ' + rooms[roomCount].first.name);
			console.log('Emitted \'gameReady\' to ' + rooms[roomCount].second.name);
			rooms[roomCount].first.ready = false;
			rooms[roomCount].second.ready = false;
		}
	});
	socket.on('playerReady', function (roomNumber) {
		if (socket.id == rooms[roomNumber].first.id) {
			console.log('Received \'playerReady\' from ' + rooms[roomNumber].first.name);
			rooms[roomNumber].first.ready = true;
		} else {
			console.log('Received \'playerReady\' from ' + rooms[roomNumber].second.name);
			rooms[roomNumber].second.ready = true;
		}
		if (rooms[roomNumber].first.ready && rooms[roomNumber].second.ready) {
			io.to(rooms[roomNumber].first.id).emit('start');
			console.log('Emitted \'start\' to ' + rooms[roomNumber].first.name);
			io.to(rooms[roomNumber].second.id).emit('wait');
			console.log('Emitted \'wait\' to ' + rooms[roomNumber].second.name);
		}
	});
	socket.on('submit', function (data) {
		if (socket.id == rooms[data.roomNumber].first.id) {
			console.log('Received \'submit\' from ' + rooms[data.roomNumber].first.name);
			rooms[data.roomNumber].first.time = data.time;
			socket.emit('wait');
			console.log('Emitted \'wait\' to ' + rooms[data.roomNumber].first.name);
			io.to(rooms[data.roomNumber].second.id).emit('start');
			console.log('Emitted \'start\' to ' + rooms[data.roomNumber].second.name);
		} else {
			console.log('Received \'submit\' from ' + rooms[data.roomNumber].second.name);
			rooms[data.roomNumber].second.time = data.time;
			if (rooms[data.roomNumber].first.time > rooms[data.roomNumber].second.time) {
				io.to(rooms[data.roomNumber].first.id).emit('win');
				io.to(rooms[data.roomNumber].second.id).emit('lose');
				console.log('Emitted \'win\' to ' + rooms[data.roomNumber].first.name);
				console.log('Emitted \'lose\' to ' + rooms[data.roomNumber].second.name);
				updateResult(rooms[data.roomNumber].first.name, rooms[data.roomNumber].second.name, false);
			} else if (rooms[data.roomNumber].first.time < rooms[data.roomNumber].second.time) {
				io.to(rooms[data.roomNumber].first.id).emit('lose');
				io.to(rooms[data.roomNumber].second.id).emit('win');
				console.log('Emitted \'lose\' to ' + rooms[data.roomNumber].first.name);
				console.log('Emitted \'win\' to ' + rooms[data.roomNumber].second.name);
				updateResult(rooms[data.roomNumber].second.name, rooms[data.roomNumber].first.name, false);

				//switch first room to winner of last
				var temp = rooms[data.roomNumber].first;
				rooms[data.roomNumber].first = rooms[data.roomNumber].second;
				rooms[data.roomNumber].second = temp;

			} else {
				io.sockets.in(data.roomNumber).emit('draw');
				console.log('Emitted \'draw\' to ' + rooms[data.roomNumber].first.name);
				console.log('Emitted \'draw\' to ' + rooms[data.roomNumber].second.name);
				updateResult(rooms[data.roomNumber].first.name, rooms[data.roomNumber].second.name, true);
			}
			io.sockets.in('monitors').emit('updateData', rooms);
		}
	});
	socket.on('disconnect', function (){
		for(var i = 0; i < rooms.length; i++){
			if(socket.id == rooms[i].first.id || socket.id == rooms[i].second.id){
				io.sockets.in(i).emit('clear');
				if(socket.id == rooms[i].first.id){
					console.log(rooms[i].first.name + ' abandoned the game.');
					console.log(rooms[i].second.name + ' disconnected.');
				} else {
					console.log(rooms[i].second.name + ' abandoned the game.');
					console.log(rooms[i].first.name + ' disconnected.');
				}
				break;
			}
		}
	});
	
	
	//Monitor
	
	socket.on('requestData', function (){
		socket.join('monitors');
		socket.emit('updateData', rooms);
	});
	socket.on('requestClear', function () {
		io.emit('clear');
		console.log('cleared!');
	});
	
	//Chat
	
	socket.on('chat message', function (data) {
		console.log('received chat data in backend');
		console.log(data.msg);
		io.sockets.in(data.roomNumber).emit('chat message', data.msg);
	});
});

//Scoring

app.post('/score', function (req, res) {
	if (updateResult('Mickey', 'Kan', false)) {
		res.send([{
					'status' : '0'
				}
			]);
	} else {
		res.send([{
					'status' : '1'
				}
			]);
	}
});

function updateResult(winnerName, loserName, draw) {
	MongoClient.connect(url, function (err, db) {
		if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		} else {
			console.log('Connection established to', url);
			var collection = db.collection('user');
			if (draw) {
				collection.update({
					'name' : winnerName
				}, {
					$inc : {
						'points' : 50
					}
				});
				collection.update({
					'name' : loserName
				}, {
					$inc : {
						'points' : 50
					}
				});
			} else {
				collection.update({
					'name' : winnerName
				}, {
					$inc : {
						'points' : 100,
						'wins' : 1
					}
				});
				collection.update({
					'name' : loserName
				}, {
					$inc : {
						'points' : 50,
						'losses' : 1
					}
				});
			}
			db.close();
			console.log('Updated points of ' + winnerName + ' and ' + loserName + ' successfully.');
		}
	});
}

http.listen(3000, function () {
	console.log('listening on 80');
});
