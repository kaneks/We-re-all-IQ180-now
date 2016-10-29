myapp.controller("HomeCtrl", function ($scope) {
	$("#loginButton").click(function(){
		$.get("u/" + $("#loginTextbox").val(), function(data){
			console.log(data);
		});
	});
	
})
