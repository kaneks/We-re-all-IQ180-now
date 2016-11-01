myapp.controller("ReadyCtrl", function ($scope, $location, socketio) {

    $scope.playGame = function(){

        //$location.path('/play');
        socketio.playerReady();
        
    }

})
