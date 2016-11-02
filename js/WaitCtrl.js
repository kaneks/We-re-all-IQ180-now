/**
 * Created by Kaneks on 11/2/2016 AD.
 */
myapp.controller("WaitCtrl",['$rootScope','$scope','$location','socketio',function ($rootScope,$scope, $location, socketio) {

    function startTest() {
        if(!$rootScope.firstPlayer){
            console.log('you are second player');
        }else{

        }
    }

    $scope.$on('ending', function (event, result) {
        $rootScope.playerStatus = result;
        console.log(result);
        $rootScope.$apply(function () {
           $location.path('/winlose');
        });

    });



    startTest();





}]);