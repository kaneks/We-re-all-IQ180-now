var myapp = angular.module("myapp", ['ngRoute']);

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
        redirectTo: '/home'
    })
});