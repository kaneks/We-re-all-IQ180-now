var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

var express = require('express');

//lets require/import the mongodb native drivers.
var mongodb = require('mongodb');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://localhost:27017/netcentric';

var bodyParser = require('body-parser');

var roomNumber = 0;
var playerNumber = 0;

app.use(bodyParser.json()); // support json encoded bodies

app.use(bodyParser.urlencoded({
		extended : true
	})); // support encoded bodies

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

io.on('connection', function (socket) {
	
	socket.emit('log', 'Your socket id is ' + socket.id + ".");
	
	socket.set('state', 0);

	socket.on('join', function (name) {
		
		socket.set('state', 1);
		
		if (io.sockets.adapter.rooms[roomNumber] && io.sockets.adapter.rooms[roomNumber].length == 2)
			roomNumber++;
		socket.join(roomNumber);
		
		//2 clients per room, assign first player as 0 and second as 1
		if (io.sockets.adapter.rooms[roomNumber].length == 1) {
			if (Math.random() < 0.5) {
				playerNumber = 0;
			} else {
				playerNumber = 1;
			}
			socket.emit('assignPlayerNumberAndRoom', {'player':playerNumber, 'room':roomNumber});
		} else {
			if (playerNumber == 0) {
				playerNumber = 1;
			} else {
				playerNumber = 0;
			}
			socket.emit('assignPlayerNumberAndRoom', {'player':playerNumber, 'room':roomNumber});
			//emit opponent name
			io.sockets.in(roomNumber).emit('assignOpponentId', {'opponent': io.sockets.adapter.rooms[roomNumber]});
			io.sockets.in(roomNumber).emit('gameReady');
		}
	});

	socket.on('playerReady', function (data) {
		socket.set('state', 2);
		if (io.to(data.opponent.id).get('state') == 2) {
			if(data.playerNumber == 0){
				socket.emit('start');
				io.to(data.opponent.id).emit('wait');
			} else {
				socket.emit('start');
				io.to(data.opponent.id).emit('wait');
			}
		}
	});
	
	socket.on('submit', function (data) {
		socket.set('state', 3);
		socket.set('time', data.time);
		if(data.playerNumber == 0){
			socket.emit('wait');
			io.to(data.opponent.id).emit('start');
		} else {
			if(socket.get('time') < io.to(data.opponent.id).get('time')){
				socket.emit('win');
				io.to(data.opponent.id).emit('lose');
			} else if(socket.get('time') > io.to(data.opponent.id).get('time')){
				socket.emit('lose');
				io.to(data.opponent.id).emit('win');
			} else {
				socket.emit('draw');
				io.to(data.opponent.id).emit('draw');
			}
		}
	});
	
	socket.on('chat message', function (msg) {
		io.sockets.in(roomNumber).emit('chat message', msg);
	});
	//io.emit('log', io.sockets.adapter.rooms);
});

http.listen(3000, function () {
	console.log('listening on *:3000');
});
