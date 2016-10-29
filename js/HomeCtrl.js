myapp.controller("HomeCtrl", function ($scope, $location, socketio) {

	$scope.signIn = function(){
		socketio.saveUserName($scope.user);
		$location.path('/play');
	}

})
