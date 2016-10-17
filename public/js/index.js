/**
 * Created by Kaneks on 10/17/2016 AD.
 */

var myId;
var opponentId;
var myName;
var opponentName;
var roomNumber;
var state;

var socket = io();

$('form').submit(function(){
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
    return false;
});

socket.on('chat message', function(msg){
    $('#messages').append($('<li>').text(msg));
});

socket.on('log', function(msg){
    console.log(msg);
});

$('submitNameButton').click(function () {
   socket.emit('') 
});

socket.on('start', function () {
   //START GAME
});

socket.on('wait', function () {
    //SET PAGE TO WAIT
});