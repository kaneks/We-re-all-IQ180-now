myapp.controller("HomeCtrl", ['$rootScope','$scope','$location','socketio',function ($rootScope,$scope, $location, socketio) {

	$rootScope.scoreP1 = 0;
	$rootScope.scoreP2 = 0;
	$rootScope.round =1;
	$rootScope.winner='';
	$rootScope.firstEnter = true;

	$scope.signIn = function(){
		socketio.setName($scope.user);
		socketio.join($scope.user);
		$rootScope.username = $scope.user;
		$location.path('/ready');
	};

	$scope.$on('test', function(){
		console.log("rootscope works");
	});
	socketio.init();

}]);
