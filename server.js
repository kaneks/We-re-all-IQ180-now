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
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});
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
app.post('/getUser', function (req, res) {
	var user = req.body.username;
	if (!req.body.username) {
		MongoClient.connect(url, function (err, db) {
			if (err) {
				console.log('Unable to connect to the mongoDB server. Error:', err);
			} else {
				console.log('Connection established to', url);
				var collection = db.collection('user');
				collection.find({}).toArray(function (err, result) {
					if (err) {
						console.log(err);
						return res.send([{
									"status" : "0"
								}
							]);
					} else if (result.length) {
						console.log('Found:', result);
						return res.send(result);
					} else {
						console.log('No document(s) found with defined "find" criteria!');
						return res.send([{
									"status" : "0"
								}
							]);
					}
					db.close();
				});
			}
		});
	} else {
		MongoClient.connect(url, function (err, db) {
			if (err) {
				console.log('Unable to connect to the mongoDB server. Error:', err);
			} else {
				console.log('Connection established to', url);
				var collection = db.collection('user');
				collection.find({
					name : req.body.username
				}).toArray(function (err, result) {
					if (err) {
						console.log(err);
						return res.send([{
									"status" : "0"
								}
							]);
					} else if (result.length) {
						console.log('Found:', result);
						return res.send(result);
					} else {
						console.log('No document(s) found with defined "find" criteria!');
						return res.send([{
									"status" : "0"
								}
							]);
					}
					db.close();
				});
			}
		});
	}
});
app.post('/updateUser', function (req, res) {
	var user = req.body.username;
	if (!req.body.username || !req.body.score) {
		return res.send({
			"status" : "error",
			"message" : "missing a parameter"
		});
	} else {
		MongoClient.connect(url, function (err, db) {
			if (err) {
				console.log('Unable to connect to the mongoDB server. Error:', err);
			} else {
				console.log('Connection established to', url);
				var collection = db.collection('user');
				collection.update({
					name : req.body.username
				}, {
					$set : {
						score : req.body.score
					}
				}, function (err, numUpdated) {
					if (err) {
						console.log(err);
						return res.send([{
									"status" : "0"
								}
							]);
					} else if (numUpdated) {
						console.log("successfully updated");
						return res.send([{
									"status" : "1"
								}
							]);
					} else {
						console.log('No document(s) found with defined "find" criteria!');
						return res.send([{
									"status" : "0"
								}
							]);
					}
					db.close();
				});
			}
		});
	}
});
app.post('/newUser', function (req, res) {
	if (!req.body.username || !req.body.score) {
		return res.send({
			"status" : "error",
			"message" : "missing a parameter"
		});
	} else {
		MongoClient.connect(url, function (err, db) {
			if (err) {
				console.log('Unable to connect to the mongoDB server. Error:', err);
				return res.send([{
							"status" : "0"
						}
					]);
			} else {
				console.log('Connection established to', url);
				var collection = db.collection('user');
				var user1 = {
					name : req.body.username,
					score : req.body.score,
					status : "1"
				};
				collection.insert([user1], function (err, result) {
					if (err) {
						console.log(err);
						return res.send([{
									"status" : "0"
								}
							]);
					} else {
						console.log('Inserted %d documents into the "users" collection. The documents inserted with "_id" are:', result.length, result);
					}
					db.close();
				});
			}
		});
		return res.send({
			"status" : "1"
		});
	}
});
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
			} else if (rooms[data.roomNumber].first.time > rooms[data.roomNumber].second.time) {
				io.to(rooms[data.roomNumber].first.id).emit('lose');
				io.to(rooms[data.roomNumber].second.id).emit('win');
			} else {
				io.sockets.in(data.roomNumber).emit('draw');
			}
		}
	});
	socket.on('chat message', function (data) {
		io.sockets.in(data.roomNumber).emit('chat message', data.msg);
	});
});
http.listen(80, function () {
	console.log('listening on 80');
});
