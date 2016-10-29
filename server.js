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

/*
app.get('/time', function (req, res) {
var date = new Date();
var hour = date.getHours();
hour = (hour < 10 ? "0" : "") + hour;
var min = date.getMinutes();
min = (min < 10 ? "0" : "") + min;
var sec = date.getSeconds();
sec = (sec < 10 ? "0" : "") + sec;
var year = date.getFullYear();
var month = date.getMonth() + 1;
month = (month < 10 ? "0" : "") + month;
var day = date.getDate();
day = (day < 10 ? "0" : "") + day;
var ans = "[{" + year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec + "}]";
return res.send(ans);
});
 */

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
			"status" : "1",
			"message" : "missing a parameter"
		});
	} else {
		MongoClient.connect(url, function (err, db) {
			if (err) {
				console.log('Unable to connect to the mongoDB server. Error:', err);
				return res.send({
					"status" : "1",
					"message" : err
				});
			} else {
				console.log('Connection established to', url);
				var collection = db.collection('user');
				var user = userModel;
				user.name = req.body.name;
				collection.insert([user], function (err, result) {
					if (err) {
						console.log(err);
						return res.send({
							"status" : "1",
							"message" : err
						});
					} else {
						console.log('Inserted ' + user.name + ' into the "users" collection.');
						return res.send({
							"status" : "0"
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
			console.log('Unable to connect to the mongoDB server. Error:', err);
		} else {
			console.log('Connection established to', url);
			var collection = db.collection('user');
			console.log(req.params);
			collection.findOne({
				'name' : req.params.name
			}, function (err, item) {
				if (err) {
					console.log(err);
					return res.send({
						"status" : "1",
						"message" : err
					});
				} else if (item != null) {
					//console.log('Found:', item);
					return res.send(item);
				} else {
					return res.send({
						"status" : "1",
						"message" : "User not found"
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
	for(var i = 0; i < 3; i++){
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
		"Num1" : probNums[0],
		"Num2" : probNums[1],
		"Num3" : probNums[2],
		"Num4" : probNums[3],
		"Num5" : probNums[4],
		"Ans" : temp
	});


});

//Socket

var rooms = [];
var roomCount = 0;
io.on('connection', function (socket) {
	socket.on('join', function (name) {
		if (io.sockets.adapter.rooms[roomCount] && io.sockets.adapter.rooms[roomCount].length == 2)
			roomCount++;
		socket.join(roomCount);
		if (io.sockets.adapter.rooms[roomCount].length == 1) {
			rooms[roomCount] = new Object();
			rooms[roomCount].first = new Object();
			rooms[roomCount].second = new Object();
			if (Math.random() < 0.5) {
				rooms[roomCount].first.id = socket.id;
				rooms[roomCount].first.name = name;
			} else {
				rooms[roomCount].second.id = socket.id;
				rooms[roomCount].second.name = name;
			}
		} else {
			if (rooms[roomCount].first.id != '') {
				rooms[roomCount].second.id = socket.id;
				rooms[roomCount].second.name = name;
			} else {
				rooms[roomCount].first.id = socket.id;
				rooms[roomCount].first.name = name;
			}
			io.sockets.in(roomCount).emit('assignRoom', {
				'roomNumber' : roomCount,
				'room' : rooms[roomCount]
			});
			io.sockets.in(roomCount).emit('gameReady');
			rooms[roomCount].first.ready = false;
			rooms[roomCount].second.ready = false;
		}
	});
	socket.on('playerReady', function (roomNumber) {
		if (socket.id == rooms[roomNumber].first.id) {
			rooms[roomNumber].first.ready = true;
		} else {
			rooms[roomNumber].second.ready = true;
		}
		if (rooms[roomNumber].first.ready && rooms[roomNumber].second.ready) {
			io.to(rooms[roomNumber].first.id).emit('start');
			io.to(rooms[roomNumber].second.id).emit('wait');
		}
	});
	socket.on('submit', function (data) {
		if (socket.id == rooms[roomNumber].first.id) {
			rooms[data.roomNumber].first.time = data.time;
			socket.emit('wait');
			io.to(rooms[data.roomNumber].second.id).emit('start');
		} else {
			rooms[data.roomNumber].second.time = data.time;
			if (rooms[data.roomNumber].first.time < rooms[data.roomNumber].second.time) {
				io.to(rooms[data.roomNumber].first.id).emit('win');
				io.to(rooms[data.roomNumber].second.id).emit('lose');
				updateResult(rooms[data.roomNumber].first.name, rooms[data.roomNumber].second.name, false);
			} else if (rooms[data.roomNumber].first.time > rooms[data.roomNumber].second.time) {
				io.to(rooms[data.roomNumber].first.id).emit('lose');
				io.to(rooms[data.roomNumber].second.id).emit('win');
				updateResult(rooms[data.roomNumber].second.name, rooms[data.roomNumber].first.name, false);
			} else {
				io.sockets.in(data.roomNumber).emit('draw');
				updateResult(rooms[data.roomNumber].first.name, rooms[data.roomNumber].second.name, true);
			}
		}
	});
	socket.on('chat message', function (data) {
		io.sockets.in(data.roomNumber).emit('chat message', data.msg);
	});
});

//Scoring

app.post('/score', function (req, res) {
	if (updateResult('Mickey', 'Kan', false)) {
		res.send([{
					"status" : "0"
				}
			]);
	} else {
		res.send([{
					"status" : "1"
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
