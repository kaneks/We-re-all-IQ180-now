/*
##	This is the controller for the game page.
 */

myapp.controller("PlayCtrl", ['$rootScope','$scope','$location','socketio',function ($rootScope,$scope, $location, socketio) {
	//will need to modify the url when real thing comes
	var subCorrect = false;
	//will need to implement the score later.
	var score = null;
	var time = 60;
	var ans = null;
	var probNums = null;
	var settings = {
		"async": true,
		"crossDomain": true,
		"url": "http://localhost:80/question",
		"method": "GET",
		"headers": {
			"cache-control": "no-cache",
			"postman-token": "1acc73f6-96cc-809e-aebd-d6b2726566d6"
		}
	}

	$.ajax(settings).done(function (response) {
		console.log('hello');
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
				//for pausing the number when correct answer
				subCorrect=true;
				time *= 1000;
				socketio.submitStats(time);
				if($rootScope.firstPlayer){
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
			if($rootScope.firstPlayer){
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
	function startTest() {
		if($rootScope.firstPlayer){
			console.log('you are first player')
		}else{

		}
	}

	startTest();

	//go to the end screen;
	function goToEnd() {
		$scope.$on('ending', function (event, result) {
			$rootScope.playerStatus = result;
			console.log(result);
			$rootScope.$apply(function () {
				$location.path('/winlose');
			});

		});
	}
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
