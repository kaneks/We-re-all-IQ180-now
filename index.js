
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
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


app.use(express.static(path.join(__dirname, 'public')));


app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

app.post('/getUser', function(req, res){
	var user = req.body.username;

	if(!req.body.username) {
		return res.send({"status": "error", "message": "missing a parameter"});
	} else {


		MongoClient.connect(url, function (err, db) {
			if (err) {
				console.log('Unable to connect to the mongoDB server. Error:', err);
			} else {

				console.log('Connection established to', url);
				var collection = db.collection('user');
				collection.find({name: req.body.username}).toArray(function (err, result) {
					if (err) {
						console.log(err);
                        return res.send([{"status": "0"}]);
					} else if (result.length) {
						console.log('Found:', result);
                        return res.send(result);
					} else {
						console.log('No document(s) found with defined "find" criteria!');
                        return res.send([{"status": "0"}]);
					}


                    db.close();
				});

			}
		});

	}
});

app.post('/updateUser', function(req, res){
    var user = req.body.username;

    if(!req.body.username || !req.body.score) {
        return res.send({"status": "error", "message": "missing a parameter"});
    } else {


        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {

                console.log('Connection established to', url);
                var collection = db.collection('user');
                collection.update({name: req.body.username}, {$set: {score: req.body.score}}, function (err, numUpdated) {
                    if (err) {
                        console.log(err);
                        return res.send([{"status": "0"}]);
                    } else if (numUpdated) {
                        console.log("successfully updated");
                        return res.send([{"status": "1"}]);
                    } else {
                        console.log('No document(s) found with defined "find" criteria!');
                        return res.send([{"status": "0"}]);
                    }


                    db.close();
                });

            }
        });

    }
});



app.post('/newUser', function(req, res){

	
	if(!req.body.username || !req.body.score) {
		return res.send({"status": "error", "message": "missing a parameter"});
	} else {


		MongoClient.connect(url, function (err, db) {
			if (err) {
				console.log('Unable to connect to the mongoDB server. Error:', err);
                return res.send([{"status": "0"}]);
			} else {
				
				console.log('Connection established to', url);
				var collection = db.collection('user');
				var user1 = {name: req.body.username, score: req.body.score, status: "1"};
				collection.insert([user1], function (err, result) {
					if (err) {
						console.log(err);
                        return res.send([{"status": "0"}]);
					} else {
						console.log('Inserted %d documents into the "users" collection. The documents inserted with "_id" are:', result.length, result);
					}

					
					db.close();
				});
			}
		});
		return res.send({"status": "1"});
	}
});



io.on('connection', function(socket){
	socket.on('chat message', function(msg){
		io.emit('chat message', msg);
	});
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});