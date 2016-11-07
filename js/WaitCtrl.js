/**
 * Created by Kaneks on 11/2/2016 AD.
 */
myapp.controller("WaitCtrl",['$rootScope','$scope','$location','socketio',function ($rootScope,$scope, $location, socketio) {


    $rootScope.youWin = false;

    $scope.$on('play', function () {
        console.log('playing');
        $rootScope.$apply(function () {
            $location.path('/play');
        });
        console.log($location.path());
    });

    $scope.$on('ending', function () {
        $rootScope.$apply(function () {
            console.log('ending from waiting');
                $location.path('/winlose');
        });

    });









}]);