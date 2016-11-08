myapp.controller("HomeCtrl", ['$rootScope', '$scope', '$location', 'socketio', function ($rootScope, $scope, $location, socketio) {

			$rootScope.scoreP1 = 0;
			$rootScope.scoreP2 = 0;
			$rootScope.round = 1;
			$rootScope.winner = '';
			$rootScope.username = '';
			$rootScope.opponentName = '';
			$rootScope.youWin = false;
			$rootScope.firstEnter = true;
			$rootScope.highscore = null;
			$rootScope.status = null;
			$rootScope.chatmsg='';

			$scope.signIn = function () {
				socketio.setName($scope.user);
				socketio.join($scope.user);
				$rootScope.username = $scope.user;

				var settings2 = {
					"async" : true,
					"crossDomain" : true,
					"url" : "http://localhost:3000/u/" + $rootScope.username,
					"method" : "GET",
					"headers" : {
						"cache-control" : "no-cache",
						"postman-token" : "9934f8b5-d4b5-3610-7372-d756a6e7ed87"
					}
				}

				$.ajax(settings2).done(function (response) {
					if (response.status != 1) {
						//No error
						console.log(response);
						if(response.status == 2){
							//User not found
							var settings2 = {
								"async" : true,
								"crossDomain" : true,
								"url" : "http://localhost:3000/u",
								"method" : "POST",
								"headers" : {
									"content-type" : "application/x-www-form-urlencoded",
									"cache-control" : "no-cache",
									"postman-token" : "8ddc7b40-66d8-874a-77dc-25eb42355430"
								},
								"data" : {
									"name" : $rootScope.username
								}
							};

							$.ajax(settings2).done(function (response) {
								console.log(response);
								if(response != 1){
									//User created
									$rootScope.status = response.status;
									$rootScope.highscore = 0;
								} else {
									//mongoDB error
									alert(response.message);
								}
							});
						} else {
							//User found
							$rootScope.status = response.status;
							$rootScope.highscore = response.user.points;
						}
					} else {
						//mongoDB error
						alert(response.message);
					}

				});

				$location.path('/ready');
			};

			$scope.$on('test', function () {
				console.log("rootscope works");
			});
			socketio.init();

		}
	]);
