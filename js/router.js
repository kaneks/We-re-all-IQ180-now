var myapp = angular.module("myapp", ['ngRoute', 'ui.bootstrap']);

myapp.config(function($routeProvider){
    $routeProvider
    .when('/home',{
        templateUrl: 'app/home.html',
        controller: 'HomeCtrl'
    })
    .when('/play',{
        templateUrl: 'app/play.html',
        controller: 'PlayCtrl'
    })
    .otherwise({
        redirectTo: '/play'
    })
});