/**
 * Created by Choll on 11/6/2016.
 */
myapp.controller("WinLoseCtrl",['$rootScope','$scope','$location','socketio',function ($rootScope,$scope, $location, socketio) {


    var time = 10000;
    $rootScope.firstEnter=false;


    // var settings = {
    //     "async": true,
    //     "crossDomain": true,
    //     "url": "/question",
    //     "method": "GET",
    //     "headers": {
    //         "cache-control": "no-cache",
    //         "postman-token": "1acc73f6-96cc-809e-aebd-d6b2726566d6"
    //     }
    // }

    function startCountdown() {
        if(time <0){
        //    socketio.playerReady();

            //will testing new question getting
            $rootScope.$apply(function () {
                $location.path(pathway);
            });

        }else{
            $('#time').text(time/1000);
            time= time - 1000;

            //can modify if want better time
            setTimeout(startCountdown, 1000);
        }
    };

    if($rootScope.youWin){
        $scope.winURL = '/winning.gif';
    }else {
        $scope.winURL = '/lose.gif';
    }

    startCountdown();

    function getNumGO(pathway) {

        // $.ajax(settings).done(function (response) {
        //     console.log('received http get');
        //     console.log(response);
        //     $rootScope.num = [response.Num1, response.Num2, response.Num3, response.Num4, response.Num5];
        //     $rootScope.ans = response.Ans;
        //     $rootScope.probNums = [response.Num1, response.Num2, response.Num3, response.Num4, response.Num5];
        //     $rootScope.$apply(function () {
        //         $location.path(pathway);
        //     });
        // });

        //will testing new question getting
        $rootScope.$apply(function () {
            $location.path(pathway);
        });

    }

    $scope.$on('play', function () {
        console.log('playing');
        getNumGO('/play');

    });

    $scope.$on('waiting', function () {
        console.log('waiting');
        getNumGO('/waiting');
    });


    $scope.$on('clearAll', function () {
        console.log('clearing');
        $rootScope.$apply(function () {
            // it is '' or null need to check ;a
            $location.path('/home');
        });
    });

}]);