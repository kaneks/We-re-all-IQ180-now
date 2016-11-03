myapp.controller("HomeCtrl", ['$rootScope','$scope','$location','socketio',function ($rootScope,$scope, $location, socketio) {

	$scope.signIn = function(){
		socketio.setName($scope.user);
		socketio.join($scope.user);
		$rootScope.greetName = 'Welcome, '+$scope.user;
		$location.path('/ready');
	};

	$scope.$on('test', function(){
		console.log("rootscope works");
	});
	socketio.init();

}]);
