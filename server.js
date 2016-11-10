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
				console.log(err);
				return res.send({
					'status' : '1',
					'message' : err
				});
			} else {
				var collection = db.collection('user');
				var user = {
					name : '',
					points : 0,
					wins : 0,
					losses : 0
				};
				user.name = req.body.name;
				collection.insert(user, function (err, doc) {
					if (err) {
						console.log(err);
						return res.send({
							'status' : '1',
							'message' : err
						});
					} else {
						console.log('Inserted ' + req.body.name + '.');
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
					console.log('Found ' + req.body.name + '.');
					return res.send({
						'status' : 0,
						'message' : 'user found',
						'user' : doc,

					});
				} else {
					console.log('Can not find ' + req.body.name + '.');
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
function generateQuestion() {
	var probNums = [];
	for (var i = 0; i < 5; i++) {
		probNums[i] = Math.floor(Math.random() * 10);
	}

	var count = 0;
	var genNums = [];
	while (true) {
		if (count == 5)
			break;
		var ranNum = Math.floor(Math.random() * 5);
		if (genNums[ranNum] == null) {
			genNums[ranNum] = probNums[count];
			count++;
		}
	}

	var temp = genNums[0];
	var sol = genNums[0] + ' ';
	
	for (var i = 0; i < 4; i++) {
		var opSelector = Math.floor(Math.random() * 4);
		if (opSelector == 0) {
			temp += genNums[i + 1];
			sol += '+ ' + genNums[i+1] + ' ';
		} else if (opSelector == 1) {
			temp -= genNums[i + 1];
			sol += '- ' + genNums[i+1] + ' ';
		} else if (opSelector == 2) {
			temp *= genNums[i + 1];
			sol += '* ' + genNums[i+1] + ' ';
		} else {
			if ((temp % genNums[i + 1]) == 0) {
				temp /= genNums[i + 1];
				sol += '/ ' + genNums[i+1] + ' ';
			} else {
				i--;
			}
		}
	}
	
	sol += '= ' + temp;
	
	console.log(sol);

	return {
		'nums' : probNums,
		'ans' : temp
	};

};

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
			rooms[roomCount] = {
				'first' : {
					'id' : '',
					'name' : '',
					'ready' : false
				},
				'second' : {
					'id' : '',
					'name' : '',
					'ready' : false
				},
				'roomNumber' : roomCount
			};
			if (Math.random() < 0.5) {
				rooms[roomCount].first.id = socket.id;
				rooms[roomCount].first.name = name;
			} else {
				rooms[roomCount].second.id = socket.id;
				rooms[roomCount].second.name = name;
			}
			io.sockets.in('monitors').emit('updateData', rooms);
		} else {
			if (rooms[roomCount].first.id != '') {
				rooms[roomCount].second.id = socket.id;
				rooms[roomCount].second.name = name;
			} else {
				rooms[roomCount].first.id = socket.id;
				rooms[roomCount].first.name = name;
			}
			io.sockets.in('monitors').emit('updateData', rooms);
			io.sockets.in(roomCount).emit('gameReady', {
				'roomNumber' : roomCount,
				'room' : rooms[roomCount],
				'question' : generateQuestion()
			});
			console.log('Emitted \'gameReady\' to ' + rooms[roomCount].first.name);
			console.log('Emitted \'gameReady\' to ' + rooms[roomCount].second.name);
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
			rooms[data.roomNumber].question = generateQuestion();
			rooms[data.roomNumber].first.ready = false;
			rooms[data.roomNumber].second.ready = false;
			io.sockets.in(roomCount).emit('updateQuestion', {
				'question' : generateQuestion()
			});
			console.log('Emitted \'gameReady\' to ' + rooms[data.roomNumber].first.name);
			console.log('Emitted \'gameReady\' to ' + rooms[data.roomNumber].second.name);
			io.sockets.in('monitors').emit('updateData', rooms);
		}
	});
	socket.on('disconnect', function () {
		console.log(socket.id + ' abandoned the game.');
		for (var i = 0; i < rooms.length; i++) {
			if (socket.id == rooms[i].first.id || socket.id == rooms[i].second.id) {
				io.sockets.in(i).emit('clear');
				if ((socket.id == rooms[i].first.id && rooms[i].second.id == '') || (socket.id == rooms[i].second.id && rooms[i].first.id == '')) {
					roomCount++;
					break;
				}
				if (socket.id == rooms[i].first.id) {
					console.log(rooms[i].first.name + ' abandoned the game.');
					console.log(rooms[i].second.name + ' disconnected.');
				} else {
					console.log(rooms[i].second.name + ' abandoned the game.');
					console.log(rooms[i].first.name + ' disconnected.');
				}
				break;
			}
		}
		io.sockets.in('monitors').emit('updateData', rooms);
	});

	//Monitor

	socket.on('requestData', function () {
		socket.join('monitors');
		socket.emit('updateData', rooms);
	});
	socket.on('requestClear', function () {
		console.log('Received \'requestClear\' from ' + socket.id);
		io.emit('clear');
		rooms = [];
		roomCount = 0;
		socket.emit('updateData', rooms);
	});

	//Chat

	socket.on('chat message', function (data) {
		//console.log('received chat data in backend');
		if (socket.id == rooms[data.roomNumber].first.id) {
			io.sockets.in(data.roomNumber).emit('chat message', rooms[data.roomNumber].first.name + " : " + data.msg);
		} else {
			io.sockets.in(data.roomNumber).emit('chat message', rooms[data.roomNumber].second.name + " : " + data.msg);
		}
	});
});

function updateResult(winnerName, loserName, draw) {
	MongoClient.connect(url, function (err, db) {
		if (err) {
			console.log(err);
		} else {
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
