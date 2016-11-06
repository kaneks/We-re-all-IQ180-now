var myapp = angular.module("myapp", ['ngRoute']);

myapp.config(function ($routeProvider) {
	$routeProvider
	.when('/home', {
		templateUrl : 'app/home.html',
		controller : 'HomeCtrl'
	})
	.when('/ready', {
		templateUrl : 'app/ready.html',
		controller : 'ReadyCtrl'

	})
	.when('/play', {
		templateUrl : 'app/play.html',
		controller : 'PlayCtrl'
	})
	.when('/waiting', {
		templateUrl : 'app/waiting.html',
		controller : 'WaitCtrl'
	})
	.when('/winlose', {
		templateUrl : 'app/winlose.html',
		controller	: 'WinLoseCtrl'
	})
	.otherwise({
		redirectTo : '/home'
	})
});
