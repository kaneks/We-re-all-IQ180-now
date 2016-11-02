myapp.factory('socketio', ['$rootScope',socketio]);

function socketio($rootScope){

    var socket = io.connect();
    var username = 'test';
    var roomNum;


    var service = {

    };

    //emits 'ready' when is ready

    service.saveUserName = saveUserName;
    service.getUserName = getUserName;
    service.join = join;
    service.ready = ready;
    service.assignRoom = assignRoom;
    service.startGame = startGame;
    service.waitGame = waitGame;
    service.playerReady =playerReady;
    service.win = win;
    service.lose = lose;
    service.init = init;

    return service;

    function init(){
        assignRoom();
        ready();
        startGame();
        waitGame();
        win();
        lose();

        //for testing
        $rootScope.$emit('test');
    }


    function saveUserName(name){
        username = name;
    }

    function getUserName(){
        return username;
    }



    function join(name){
        socket.emit('join', name);
        console.log(name);

    }

    function playerReady(){
        console.log('player is ready');
        socket.emit('playerReady', roomNum);
        console.log(roomNum);

    }
    //back end assign room
    function assignRoom(){
        socket.on('assignRoom', function (data) {
           console.log(data.room);
            roomNumber = data.roomNumber;
            setRoomNumber(roomNumber);
            if (socket.id == data.room.first.id) {
                opponentName = data.room.second.name;
            } else {
                opponentName = data.room.first.name;
            }



        });
    }

    function ready(){
        socket.on('gameReady', function () {
            //UNLOCK READY BUTTON
            console.log('isReady');
            setTimeout(function() {
                //your code to be executed after 1 second
                $rootScope.$broadcast('buttonReady');
            }, 2000);
            // $rootScope.$broadcast('buttonReady');

        });
    }

    function startGame(){
        socket.on('start', function () {
            //START GAME AND RECORD TIME
            //EMIT TIME (miliseconds) TO SERVER ONCE PLAYER FINISHES, EMIT 60000 IF PLAYER DOESNT FINISH ON WITHIN 1 MINUTE
            // socket.emit('submit', {
            //     'roomNumber' : roomNumber,
            //     'time' : 50000
            // });
            console.log('will start game');
            $rootScope.$broadcast('play');
        });
    }

    function waitGame(){
        //SET PAGE TO WAIT
        socket.on('wait',function(){
            //will do later
            console.log("will wait");
            $rootScope.$broadcast('waiting');
        });
    }

    function win(){
        //WIN
        socket.on('win',function(){

        });
    }

    function lose(){
        //LOSE
        socket.on('lose',function(){

        });
    }


    function setRoomNumber(num){
        roomNum = num;
    }

}
