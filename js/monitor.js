var socket = io.connect();

rooms = [];

socket.emit('requestData');

$('#clearBtn').click(function(){
	console.log('requestClear');
	socket.emit('requestClear');
});

socket.on('updateData', function(data){
	//rooms.clear();
	rooms = data;
	console.log(rooms);
	updatePage();
});

function updatePage(){
	$('#currentPlayers').text(getNumberOfPlayers() + ' players are currently online.');
	$('#playersList').empty();
	for(var i = 0; i < rooms.length; i++){
		if(rooms[i] != null){
			if(rooms[i].first.name != '' && rooms[i].second.name != ''){
				$('#playersList').append($('<li>').attr('class',  'list-group-item').append(rooms[i].first.name + ' VS ' + rooms[i].second.name));
			} else if(rooms[i].first.name != '' && rooms[i].second.name == ''){
				$('#playersList').append($('<li>').attr('class',  'list-group-item').append(rooms[i].first.name + ' is waiting for another player.'));
			} else if(rooms[i].first.name == '' && rooms[i].second.name != ''){
				$('#playersList').append($('<li>').attr('class',  'list-group-item').append(rooms[i].second.name + ' is waiting for another player.'));
			}
		}
	}
}

function getNumberOfPlayers(){
	var p = 0;
	for(var i = 0; i < rooms.length; i++){
		if(rooms[i] != null){
			if(rooms[i].first.name != ''){
				p++;
			}
			if(rooms[i].second.name != ''){
				p++;
			}
		}
	}
	console.log(p);
	return p;
}