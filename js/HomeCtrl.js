myapp.controller("HomeCtrl", function ($scope, $location, socketio) {

	$scope.signIn = function(){
		socketio.saveUserName($scope.user);
		socketio.join($scope.user);
		socketio.assignRoom();
		$location.path('/ready');
	}

})
