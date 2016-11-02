/*
##	This is the controller for the game page.
 */

myapp.controller('PlayCtrl', function ($scope,$location, socketio) {

	$scope.num = [1, 2, 3, 4, 5];
	$scope.ans = 'some num';
	//CHAT AND LOG

	/*
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
*/

}]);
