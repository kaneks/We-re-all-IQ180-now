var socket = io.connect();

$('#clearButton').click(function () {
	io.emit('clear');
})

rooms = [];

socket.emit('requestData');

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
		if(rooms[i].first.name != null && rooms[i].second.name != null){
			$('#playersList').append($('<li>').attr('class',  'list-group-item').append(rooms[i].first.name + ' VS ' + rooms[i].second.name));
		}
	}
}

function getNumberOfPlayers(){
	var p = 0;
	for(var i = 0; i < rooms.length; i++){
		if(rooms[i].first.name != null){
			p++;
		}
		if(rooms[i].second.name != null){
			p++;
		}
		if(rooms[i].first.time != null && rooms[i].second.time != null){
			p -= 2;
		}
	}
	console.log(p);
	return p;
}