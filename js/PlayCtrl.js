/*
##	This is the controller for the game page.
*/

myapp.controller("PlayCtrl", ['$rootScope','$scope','$location','socketio',function ($rootScope,$scope, $location, socketio) {
	//will need to modify the url when real thing comes
	var subCorrect = false;
	//will need to implement the score later.
	var score = null;
	var time = 60000;
	console.log($rootScope.test);
	//current round number

	const MAX_ROUNDS = 5;
	var ans = $rootScope.ans;
	var probNums = $rootScope.probNums;
	$scope.greetName = 'Welcome, '+$rootScope.username;

	$scope.customStyle = {};
	var check = [true, true, true, true, true];

	$scope.check = function(){
		reset();
		var ansFormula = $scope.ansField;
		if(ansFormula.length != 0){
			var ansNums = ansFormula.match(/\d/g).map(Number);
			for(var i = 0; i < ansNums.length; i++){
				for(var j = 0; j < probNums.length; j++){
					if((ansNums[i] == probNums[j]) && check[j]){
						check[j] = false;
						turnRed(j);
						break;
					}
				}
			}
		}
	}

	function turnRed(num){
		switch(num) {
			case 0:
				$scope.customStyle.style0 = {"color" : "red"};
				break;
			case 1:
				$scope.customStyle.style1 = {"color" : "red"};
				break;
			case 2:
				$scope.customStyle.style2 = {"color" : "red"};
				break;
			case 3:
				$scope.customStyle.style3 = {"color" : "red"};
				break;
			case 4:
				$scope.customStyle.style4 = {"color" : "red"};
				break;
		}
	}


	function reset(){
		check = [true, true, true, true, true];
		$scope.customStyle.style0 = {"color" : "black"};
		$scope.customStyle.style1 = {"color" : "black"};
		$scope.customStyle.style2 = {"color" : "black"};
		$scope.customStyle.style3 = {"color" : "black"};
		$scope.customStyle.style4 = {"color" : "black"};
	}


	$scope.checkAns = function(){
		var ansFormula = $scope.ansField;
		var ansNums = ansFormula.match(/\d/g).map(Number);
		//for bug checking will have to change back
		//if(angular.equals(ansNums.sort(),probNums.sort())){
			if(true){
			//if(eval(ansFormula) == ans){
				if(true){
					console.log('RIGHT');
				//for pausing the number when correct answer
				subCorrect=true;
				//time.round(); gonna need to put back stuff if implementation failed
				console.log(time);
				socketio.submitStats(time);


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
			socketio.submitStats(0);
		}else if(!subCorrect){
			$('#time').text(time/1000);
			time= time - 100;

			//can modify if want better time
			setTimeout(startCountdown, 100);
		}
	};

	startCountdown();

	//for testing code

	//ending is for round ending

	$scope.$on('ending', function () {
		console.log('ending');
		$rootScope.$apply(function () {
			$location.path('/winlose');
		});
	});



	$scope.$on('waiting', function () {
		console.log('waiting');
		$rootScope.$apply(function () {
			$location.path('/waiting');
		});
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

$scope.$on('clearAll', function () {
	console.log('clearing');
	$rootScope.$apply(function () {
			// it is '' or null need to check ;a
			$location.path('/home');
		});
});

}]);
