/**
 * Created by Kaneks on 11/2/2016 AD.
 */
myapp.controller("WaitCtrl", ['$rootScope', '$scope', '$location', 'socketio', function ($rootScope, $scope, $location, socketio) {

			$rootScope.youWin = false;

			$scope.$on('play', function () {
				console.log('playing');
				$rootScope.$apply(function () {
					$location.path('/play');
				});
				console.log($location.path());
			});

			$scope.$on('ending', function () {
				$rootScope.$apply(function () {
					console.log('ending from waiting');
					$location.path('/winlose');
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
