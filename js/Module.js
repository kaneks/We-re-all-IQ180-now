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
        .when('/ready',{
            templateUrl: 'app/ready.html',
            controller: 'ReadyCtrl'

        }).when('/waiting',{
            templateUrl:'app/waiting.html'
    })
        .when('/winlose',{
            templateUrl:'app/winlose.html'
        })
    .otherwise({
        redirectTo: '/home'
    })
});