angular.module('converter.controllers', [])

.controller('ConvertCtrl', function($scope, Units) {
  $scope.units = Units.all();
  $scope.result = {value: ""};
  $scope.base = {value : "", lastValue : 0};
  $scope.lastBase = {value: ""};
  Units.getByName("inches").then(function(unit){
  	$scope.base.unit = unit;
  });

  Units.getByName("bananas").then(function(unit){
  	$scope.result.unit = unit;
  });


  $scope.convert = function(){
  	if ($scope.base.value != ""){
	  	var baseQty = new Qty($scope.base.value + " " + $scope.base.unit.name);
	  	$scope.result.value = baseQty.to($scope.result.unit.name).toPrec(0.01).scalar;
  	}	
  }

  $scope.onBaseValueChange = function(){
	$scope.result.value = ""

	if (typeof $scope.base.value == "undefined" || $scope.base.value > 999999999){
		$scope.base.value = parseFloat($scope.base.lastValue);
	} else {
		$scope.base.lastValue = String($scope.base.value);
	  	$scope.base.lastValue = $scope.base.lastValue.replace(",", ".").replace(/[^0-9.]/g, '');
	  	if ($scope.base.lastValue.indexOf(".") > -1 && $scope.base.lastValue.lastIndexOf(".") > $scope.base.lastValue.indexOf("."))
	  		$scope.base.lastValue = $scope.base.lastValue.slice(0, -1);
	  	$scope.base.value = parseFloat($scope.base.lastValue);
	}


  }

  $scope.onTargetUnitChange = function(targetUnitName){
  	$scope.convert();
  }
  $scope.onBaseUnitChange = function(baseUnitName){
  	$scope.convert();
  }

  $scope.copyToClipboard = function(value){
  	try{
  		cordova.plugins.clipboard.copy(value);
  	}
  	catch (exception){
  		console.log(exception);
  	}
  }
  
})