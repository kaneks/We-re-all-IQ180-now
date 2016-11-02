myapp.controller("ReadyCtrl", ['$rootScope', '$scope', '$location', 'socketio', function ($rootScope, $scope, $location, socketio) {

			var play = null;

			$scope.playGame = function () {
				socketio.playerReady();
				$scope.readyMsg = "The other player is ready";

			}
			//will modify later
			$scope.dis = false;

			$scope.$on('buttonReady', function () {
				console.log("You can push the button.");
			});

			$scope.$on('play', function () {
				console.log('playing');
				$rootScope.$apply(function () {
					$location.path('/play');
				});
				console.log($location.path());
			});

			$scope.$on('waiting', function () {
				console.log('waiting');
				$rootScope.$apply(function () {
					$location.path('/waiting');
				});
				console.log($location.path());
			});

		}
	]);
