myapp.factory('socketio', socketio);

function socketio(){

    var socket = io.connect();

    var service = {

    };

    service.join = join;
    service.ready = ready;
    service.assignRoom = assignRoom;
    service.startGame = startGame;
    service.waitGame = waitGame;
    service.win = win;
    service.lose = lose;

    return service;

    function join(name){
        socket.emit('join', name);
        console.log(name);
    }

    function ready(roomNumber){
        socket.emit('playerReady', roomNumber);
    }

    function assignRoom(){
        socket.on('assignRoom', function (data) {
            console.log(data.room);
            roomNumber = data.roomNumber;
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
        });
    }

    function startGame(){
        socket.on('start', function () {
            //START GAME AND RECORD TIME
            //EMIT TIME (miliseconds) TO SERVER ONCE PLAYER FINISHES, EMIT 60000 IF PLAYER DOESNT FINISH ON WITHIN 1 MINUTE
            socket.emit('submit', {
                'roomNumber' : roomNumber,
                'time' : 50000
            });
        });
    }

    function waitGame(){
        //SET PAGE TO WAIT
    }

    function win(){
        //WIN
    }

    function lose(){
        //LOSE
    }

}
