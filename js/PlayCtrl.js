/*
##	This is the controller for the game page.
 */

myapp.controller("PlayCtrl", ['$rootScope','$scope','$location','socketio',function ($rootScope,$scope, $location, socketio) {

	var ans = null;
	var probNums = null;
	var settings = {
		"async": true,
		"crossDomain": true,
		"url": "http://localhost:3000/question",
		"method": "GET",
		"headers": {
			"cache-control": "no-cache",
			"postman-token": "1acc73f6-96cc-809e-aebd-d6b2726566d6"
		}
	}

	$.ajax(settings).done(function (response) {
		$scope.num = [response.Num1, response.Num2, response.Num3, response.Num4, response.Num5];
		$scope.ans = response.Ans;
		ans = response.Ans;
		probNums = [response.Num1, response.Num2, response.Num3, response.Num4, response.Num5];
	});

	$scope.checkAns = function(){
        var ansFormula = $scope.ansField;
		var ansNums = ansFormula.match(/\d/g).map(Number);

		if(angular.equals(ansNums.sort(),probNums.sort())){
			if(eval(ansFormula) == ans){
				console.log('RIGHT');
			}else{
				console.log('WRONG');
			}
		}else{
			console.log('INCOMPLETE');
		}
	};
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
