/**
 * Created by Choll on 11/6/2016.
 */
myapp.controller("WinLoseCtrl",['$rootScope','$scope','$location','socketio',function ($rootScope,$scope, $location, socketio) {


    var time = 10000;
    $rootScope.firstEnter=false;

    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://localhost:3000/question",
        "method": "GET",
        "headers": {
            "cache-control": "no-cache",
            "postman-token": "1acc73f6-96cc-809e-aebd-d6b2726566d6"
        }
    }
    if($rootScope.status == 1){
        var settings2 = {
            "async": true,
            "crossDomain": true,
            "url": "http://localhost:3000/u",
            "method": "POST",
            "headers": {
                "content-type": "application/x-www-form-urlencoded",
                "cache-control": "no-cache",
                "postman-token": "8ddc7b40-66d8-874a-77dc-25eb42355430"
            },
            "data": {
                "name": $rootScope.username
            }
        }

        $.ajax(settings2).done(function (response) {

            console.log(response);
            $rootScope.status = 0;
        });
    }

    function startCountdown() {
        if(time <0){
          getNumGO();
            socketio.playerReady();
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

    function getNumGO(pathway){
        $.ajax(settings).done(function (response) {
            console.log('received http get');
            $rootScope.num = [response.Num1, response.Num2, response.Num3, response.Num4, response.Num5];
            $rootScope.ans = response.Ans;
            $rootScope.probNums = [response.Num1, response.Num2, response.Num3, response.Num4, response.Num5];
            $rootScope.$apply(function () {
                $location.path(pathway);
            });
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



}]);