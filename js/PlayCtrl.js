/*
##	This is the controller for the game page.
 */

myapp.controller("PlayCtrl", ['$rootScope', '$scope', '$location', 'socketio', function ($rootScope, $scope, $location, socketio) {
			//will need to modify the url when real thing comes
			var subCorrect = false;
			//will need to implement the score later.
			var score = null;
			var time = 60000;
			//current round number

			const MAX_ROUNDS = 5;
			var ans = $rootScope.ans;
			var probNums = $rootScope.probNums;
			$scope.greetName = 'Welcome, ' + $rootScope.username;
			$scope.customStyle = {};
			var check = [true, true, true, true, true];

			// $scope.check = function () {
			// 	reset();
			// 	var ansFormula = $scope.ansField;
            //
			// 	if (ansFormula.length != 0) {
			// 		var ansNums = ansFormula.match(/\d/g).map(Number);
			// 		for (var i = 0; i < ansNums.length; i++) {
			// 			for (var j = 0; j < probNums.length; j++) {
			// 				if ((ansNums[i] == probNums[j]) && check[j]) {
			// 					check[j] = false;
			// 					turnRed(j);
			// 					break;
			// 				}
			// 			}
			// 		}
			// 	}
			// }

			function numChange (clickedNum) {
				reset();
				var ansFormula = $scope.ansField;
				if(clickedNum == 'x'){
					//also check logic for when the ansfield is''
					if($scope.ansField.length!=0){
						 ansFormula = $scope.ansField.slice(0,$scope.ansField.length-1);
					}
				}else {
					 ansFormula = $scope.ansField+clickedNum;
				}

				if (ansFormula.length != 0) {
					var ansNums = ansFormula.match(/\d/g).map(Number);
					for (var i = 0; i < ansNums.length; i++) {
						for (var j = 0; j < probNums.length; j++) {
							if ((ansNums[i] == probNums[j]) && check[j]) {
								check[j] = false;
								turnRed(j);
								break;
							}
						}
					}
				}
			}

			var wasNum = false;
			//use after the expression is found
                //

					$('#ans').bind('keypress', function(e) {
					var txt = String.fromCharCode(e.which);
					console.log(txt + ' : ' + e.which);
					if(txt.match(/[0-9]/)&&!wasNum) {

						 var foundPlace = false;
						// //issues will fix
						 for(var k=0;k<probNums.length ; k++){
							 if(txt == probNums[k]&& check[k]){
								foundPlace=true;
								 break;
							 }
						  }

						  if(!foundPlace){
							  return false;
						  }

						wasNum = true;
						numChange(txt);


						//return false;
					}else if(txt.match(/[\*\-\+\/\(\)]/)){
						wasNum=false;
						numChange(txt);
					}
					else if(e.which ==8){
						if($scope.ansField.charAt($scope.ansField.length-1).match(/[0-9]/)){
							wasNum=false;
						}
						numChange('x');
					}
					else {
						return false;
					}
				});



			function turnRed(num) {
				switch (num) {
				case 0:
					// $scope.customStyle.style0 = {
					// 	"color" : "red"
					// }
					$("#num0").css("color", "red").show();
					break;
				case 1:
					// $scope.customStyle.style1 = {
					// 	"color" : "red"
					// }
					$("#num1").css("color", "red").show();
					break;
				case 2:
					// $scope.customStyle.style2 = {
					// 	"color" : "red"
					// }
					$("#num2").css("color", "red").show();
					break;
				case 3:
					// $scope.customStyle.style3 = {
					// 	"color" : "red"
					// }
					$("#num3").css("color", "red").show();
					break;
				case 4:
					// $scope.customStyle.style4 = {
					// 	"color" : "red"
					// }
					$("#num4").css("color", "red").show();
					break;
				}
			}

			function reset() {
				check = [true, true, true, true, true];
					// $scope.customStyle.style0 = {
					// 	"color" : "black"
					// };
					// $scope.customStyle.style1 = {
					// 	"color" : "black"
					// };
					// $scope.customStyle.style2 = {
					// 	"color" : "black"
					// };
					// $scope.customStyle.style3 = {
					// 	"color" : "black"
					// };
					// $scope.customStyle.style4 = {
					// 	"color" : "black"
					// };
				$("#num0").css("color", "black").show();
				$("#num1").css("color", "black").show();
				$("#num2").css("color", "black").show();
				$("#num3").css("color", "black").show();
				$("#num4").css("color", "black").show();

			}

			$scope.checkAns = function () {
				var ansFormula = $scope.ansField;
				console.log(ansFormula);

				var ansNums = ansFormula.match(/\d/g).map(Number);
				if(ansNums != null) {
					//for bug checking will have to change back
					if (angular.equals(ansNums.sort(), probNums.sort())) {
						if (eval(ansFormula) == ans) {
							if (true) {
								console.log('RIGHT');
								//for pausing the number when correct answer
								subCorrect = true;
								//time.round(); gonna need to put back stuff if implementation failed
								$scope.time = time;
								socketio.submitStats($scope.time);

								//	time.toFixed(1);
							} else {
								console.log('WRONG');
							}
						} else {
							console.log('INCOMPLETE');
						}
					}
				}
			};

			function startCountdown() {
				$scope.countdown = time / 1000;
				//console.log($scope.countdown);
				if (time < 0) {
					//code for exiting
					//need to find a way to check if still have to wait for other player
					$scope.time = time;
					socketio.submitStats(0);
				} else if (!subCorrect) {
					$('#time').text(time / 1000);
					time = time - 100;

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

			$scope.$on('clearAll', function () {
				console.log('clearing');
				$rootScope.$apply(function () {
					// it is '' or null need to check ;a
					$location.path('/home');
				});
			});

			$scope.$on('msgReceived', function (event, message) {
				console.log("message received infront end");
				console.log(message);
				$rootScope.$apply(function () {
					$rootScope.chatmsg = $rootScope.chatmsg + '\n' + message;
				});

			});

			$scope.sendMsg = function () {
				socketio.sendChat($scope.msg);
				$scope.msg = '';
			};

			$('#msgBox').keypress(function (e) {
				if (e.which == 13) {
					socketio.sendChat($scope.msg);
					$scope.msg = '';
				}
			});

		}
	]);
