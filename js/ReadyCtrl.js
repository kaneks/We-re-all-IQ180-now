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

    $scope.$on('play', function () {
        console.log('playing');
        
        $location.path('/play');
        
          
        
    });

	$scope.$on('waiting', function () {
        console.log('waiting');
        
           $location.path('/waiting');
 
    });

}]);
