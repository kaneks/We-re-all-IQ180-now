/*
##	This is the controller for the game page.
 */

myapp.controller("PlayCtrl", ['$rootScope','$scope','$location','socketio',function ($rootScope,$scope, $location, socketio) {
	//will need to modify the url when real thing comes
	var subCorrect = false;
	//will need to implement the score later.
	var score = null;
	var time = 60;
	var ans = $rootScope.ans;
	var probNums = $rootScope.probNums;


	$scope.checkAns = function(){
        var ansFormula = $scope.ansField;
		var ansNums = ansFormula.match(/\d/g).map(Number);

		if(angular.equals(ansNums.sort(),probNums.sort())){
			if(eval(ansFormula) == ans){
				console.log('RIGHT');
				//for pausing the number when correct answer
				subCorrect=true;
				time *= 1000;
				socketio.submitStats(time);
				if(!$rootScope.haswaited){
					$rootScope.$apply(function () {
						$location.path('/waiting');
					});
				}else{
					goToEnd();
				}
			//	time.toFixed(1);
			}else{
				console.log('WRONG');
			}
		}else{
			console.log('INCOMPLETE');
		}
	};

	function startCountdown() {
		if(time <0){
			//code for exiting
			//need to find a way to check if still have to wait for other player
			socketio.submitStats(60000);
			if(!$rootScope.haswaited){
				$rootScope.$apply(function () {
					$location.path('/waiting');
				});
			}else{
				goToEnd();
			}
		}else if(!subCorrect){
			$('#time').text(time);
			time= time - 1;
		//	time = time.toFixed(1);
			//can modify if want better time
			setTimeout(startCountdown, 1000);
		}
	}

	startCountdown();

	//for testing code


	//go to the end screen;
	function goToEnd() {
		$scope.$on('ending', function () {
			$rootScope.$apply(function () {
				$location.path('/winlose');
			});

		});
	}


	$scope.$on('waiting', function () {
		console.log('waiting');
		$rootScope.$apply(function () {
			$location.path('/waiting');
		});
		console.log($location.path());
	});
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
