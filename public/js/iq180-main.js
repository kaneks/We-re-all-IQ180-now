var probNums = [];
var probAns = 0;
var useNums = [];
var score = 0;
var time = 60;

$(function(){
	generateNumbers();
	$('#score').text(score);
	startCountdown();
});

$('#answerFormula').on('keydown', function(){

	setTimeout(function(){
		var formula = $('#answerFormula').val();

		if(formula.length != 0) {

			var numbers = formula.match(/\d/g).map(Number);

			for (var i = 0; i < 5; i++) {
				if (!useNums[i]) {
					for (var j = 0; j < numbers.length; j++) {
						if (numbers[j] == probNums[i]) {
							$('#prob-num' + i).text('X');
							useNums[i] = true;
							break;
						}
					}
				} else {
					var check = false;
					for (var j = 0; j < numbers.length; j++) {
						if (numbers[j] == probNums[i]) {
							var check = true;
							break;
						}
					}
					if (!check) {
						$('#prob-num' + i).text(probNums[i]);
						useNums[i] = false;
					}
				}
			}
		}else{
			for (var i = 0; i < 5; i++) {
				$('#prob-num' + i).text(probNums[i]);
				useNums[i] = false;
			}
		}
	}, 0);

});

$('#submitAnswer').on('click', function(){

	var formula = $('#answerFormula').val();
	var ansNums = formula.match(/\d/g).map(Number);

		if(isEqual(ansNums.sort(),probNums.sort())){
			if(eval(formula) == probAns){
				score++;
				$('#score').text(score);
				$('#answer').val('');
				generateNumbers();
				time = 60;
			}else{
				console.log('WRONG');
			}
		}else{
			console.log('INCOMPLETE');
		}
});

function generateNumbers(){

	$("#alert_template span").remove();

	var useNums = [false, false, false, false, false];
	
	for(var i = 0; i < 5; i ++){
		probNums[i] = Math.floor(Math.random() * 10);
		$('#prob-num' + i).text(probNums[i]);
	}

	var count = 0;
	var genNums = [];

	while(true){
		if(count == 5) break;
		var ranNum = Math.floor(Math.random() * 5);
		if(genNums[ranNum] == null){
			genNums[ranNum] = probNums[count];
			count++;
		}
	}

	var temp = genNums[0];
	for(var i = 0; i < 3; i++){
		var opSelector = Math.floor(Math.random() * 4);
		if(opSelector == 0){
			temp += genNums[i + 1]; 
		}else if(opSelector == 1){
			temp -= genNums[i + 1]; 
		}else if(opSelector == 2){
			temp *= genNums[i + 1]; 
		}else{
			if((temp%genNums[i + 1]) == 0){
				temp /= genNums[i + 1]; 
			}else{
				i--;
			}
		}
	}

	probAns = temp;
	$('#prob-answer').text(probAns);

}

function isEqual(a, b){
 	if (a.length != b.length) return false;
 	for (var i = 0; i < a.length; ++i) {
   		if (a[i] !== b[i]) return false;
 	}
 	return true;
}

function startCountdown(){
	if(time == 0){
		generateNumbers();
		time = 60;
	}
	time--;
    $('#time').text(time);
    setTimeout(startCountdown, 1000);
}