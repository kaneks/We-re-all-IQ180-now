myapp.controller('TimeCtrl', function($scope, $interval) {
  var tick = function() {
    $scope.clock = Date.now();
  }
  tick();
  $interval(tick, 1000);
});

function changeToOceanBG(){
	$('body').css('background-image', 'url(ocean.jpg)');
}

function changeToSpaceBG(){
	$('body').css('background-image', 'url(space.jpg)');
}