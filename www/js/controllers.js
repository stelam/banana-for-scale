angular.module('converter.controllers', [])

.controller('ConvertCtrl', function($scope, Units) {
  $scope.units = Units.all();
  Units.getByName("Inches").then(function(unit){
  	$scope.baseUnit = unit;
  });

  Units.getByName("Bananas").then(function(unit){
  	$scope.targetUnit = unit;
  });


  
})