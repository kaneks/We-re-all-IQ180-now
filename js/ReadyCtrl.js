myapp.controller("ReadyCtrl", ['$rootScope', '$scope', '$location', 'socketio', function ($rootScope, $scope, $location, socketio) {

			$scope.greetName = 'Welcome, '+$rootScope.username;

			var play = null;
			// var settings = {
			// 	"async" : true,
			// 	"crossDomain" : true,
			// 	"url" : "/question",
			// 	"method" : "GET"
			// }

			$('#readyBtn').text('Waiting for opponent to join.');
			$scope.dis = true;

			$scope.playGame = function () {
				socketio.playerReady();
				$('#readyBtn').text('Waiting for opponent to press ready.');
				$('#readyBtn').attr('class', 'btn btn-primary btn-success');
				$scope.dis = true;
				//$scope.readyMsg = "PLAYER IS READY";
			};

			$scope.$on('buttonReady', function () {
				$scope.$apply(function () {
					$('#readyBtn').text('I am ready.');
					$scope.dis = false;
				});
			});

			$scope.$on('play', function () {
				console.log('playing');
				if ($rootScope.firstEnter) {
					$rootScope.isFirstPlayer = true;
				}
				console.log('Is first player');
				$scope.dis = true;
				getNumGO('/play');
			});

			$scope.$on('waiting', function () {
				console.log('waiting');
				$rootScope.isFirstPlayer = false;
				$scope.dis = true;
				getNumGO('/waiting');
			});

			$scope.$on('clearAll', function () {
				console.log('clearing');
				$rootScope.$apply(function () {
					// it is '' or null need to check ;a
					$location.path('/home');
				});
			});

			//getting numbers before going
			function getNumGO(pathway) {
				$rootScope.$apply(function () {
					$scope.dis = true;
					$location.path(pathway);
				});
				// $.ajax(settings).done(function (response) {
				// 	console.log('received http get');
				// 	console.log(response);
				// 	$rootScope.num = [response.Num1, response.Num2, response.Num3, response.Num4, response.Num5];
				// 	$rootScope.ans = response.Ans;
				// 	$rootScope.probNums = [response.Num1, response.Num2, response.Num3, response.Num4, response.Num5];
				// 	console.log(response);
				// 	$rootScope.$apply(function () {
				// 		$location.path(pathway);
				// 	});
				// });
			}

		}
	]);
