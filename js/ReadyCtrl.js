myapp.controller("ReadyCtrl", ['$rootScope', '$scope', '$location', 'socketio', function ($rootScope, $scope, $location, socketio) {

			var play = null;
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
    //first player or not
    $rootScope.test='goodbye;';
    console.log($rootScope.test);

    


    //getting numbers before going
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



			$scope.playGame = function () {
				socketio.playerReady();
				$scope.readyMsg = "PLAYER IS READY";

			};
			//will modify later
			$scope.dis = true;

			$scope.$on('buttonReady', function () {
                $scope.$apply(function () {
                   $scope.dis = false;
                });
				console.log("You can push the button.");
			});


             $scope.$on('play', function () {
				console.log('playing');
                 if($rootScope.firstEnter){
                     $rootScope.isFirstPlayer = true;
                 }
                    console.log('Is first player');
                 getNumGO('/play');

			});

			$scope.$on('waiting', function () {
				console.log('waiting');
                $rootScope.isFirstPlayer = false;
                getNumGO('/waiting');
			});




		}
	]);
