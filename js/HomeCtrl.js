myapp.controller("HomeCtrl", ['$rootScope','$scope','$location','socketio',function ($rootScope,$scope, $location, socketio) {

	$scope.signIn = function(){
		socketio.saveUserName($scope.user);
		socketio.join($scope.user);
	//	socketio.init();
		$location.path('/ready');
	};

	$scope.$on('test', function(){
		console.log("rootscope works");
	});
	socketio.init();

}]);
