myapp.controller("ReadyCtrl",['$rootScope','$scope','$location','socketio',function ($rootScope,$scope, $location, socketio) {

    var play = null;

    $scope.playGame = function(){
        socketio.playerReady();

    }
    //will modify later
    $scope.dis = false;

    $scope.$on('buttonReady', function(){

        console.log("it is working");
    });

    $scope.$on('playOrWait', function (isPlay) {
        if(isPlay){
            $location.path('/play');
        }else{
            $location.path('/waiting');
        }
    });



}]);
