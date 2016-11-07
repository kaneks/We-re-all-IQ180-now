myapp.controller("HomeCtrl", ['$rootScope','$scope','$location','socketio',function ($rootScope,$scope, $location, socketio) {

	$rootScope.scoreP1 = 0;
	$rootScope.scoreP2 = 0;
	$rootScope.round =1;
	$rootScope.winner='';
	$rootScope.youWin = false;
	$rootScope.firstEnter = true;
	$rootScope.highscore = null;
	$rootScope.status = null;
	

	$scope.signIn = function(){
		socketio.setName($scope.user);
		socketio.join($scope.user);
		$rootScope.username = $scope.user;

		var settings2 = {
			"async": true,
			"crossDomain": true,
			"url": "http://localhost:3000/u/"+$rootScope.username,
			"method": "GET",
			"headers": {
				"cache-control": "no-cache",
				"postman-token": "9934f8b5-d4b5-3610-7372-d756a6e7ed87"
			}
		}

		$.ajax(settings2).done(function (response) {
			if(response.status == 1){
				$rootScope.status = response.status;
				console.log(response.points);
			}
			else{
				$rootScope.highscore = response.points;
				$rootScope.status = 0;
				console.log(response.points);
			}
			
		});


		$location.path('/ready');
	};





	$scope.$on('test', function(){
		console.log("rootscope works");
	});
	socketio.init();

}]);
