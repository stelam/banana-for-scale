angular.module('converter.controllers', ['ionic', 'ngCordova', 'angular.filter'])

.controller('ConvertCtrl', function($scope, $rootScope, Units, ConversionLocalStorageService, $timeout, $ionicActionSheet, $cordovaSplashscreen, ConnectionManager, $ionicScrollDelegate, $cordovaDialogs, $cordovaToast, ConversionModel, $ionicSideMenuDelegate, $ionicModal, $ionicPlatform) {
  $scope.units = Units.all();
  $scope.result = {value: "", value2 : ""};
  $scope.base = {value : "", value2 : "", lastValue : 0};
  $scope.kind = "length"; // hardcoded for now
  $scope.conversionHistory = [];
  $scope.conversion = {}
  $scope.historyVisible = false;
  $scope.search = {value : ""};
  $scope.mobile = true;
  $scope.ConversionModel = ConversionModel;
  ConversionLocalStorageService.loadHistory($scope);

  ConversionLocalStorageService.loadLastUsedUnits($scope).then(function(){}, function(error){
    Units.getByName("inches").then(function(unit){
      $scope.base.unit = unit;
    });

    Units.getByName("bananas").then(function(unit){
      $scope.result.unit = unit;
    });
  })


  $timeout(function(){
    //$ionicSideMenuDelegate.toggleLeft();
  }, 500)
  

  $scope.convert = function(){

  	if ($scope.base.value != ""){
	  	
	  	try {
	  		var baseQty = ConversionModel.getBaseQty($scope);
	  		$scope.result.value = baseQty.to($scope.result.unit.name).scalar;

		  	ConversionModel.setResult($scope);

		  	ConversionLocalStorageService.addToConversionHistory($scope).then(function(conversionHistory){
		  		$ionicScrollDelegate.resize();
		  		$scope.conversion = conversionHistory[0];
		  	});

	  	} catch (exception){
	  		try {
	  			$cordovaToast.showShortTop('Invalid value');
	  		} catch (exception2){
	  			console.log(exception2);
	  		}
	  	}

  	}

  }


  $scope.init = function(){
    try{
      $cordovaNetwork.getNetwork();
      $scope.mobile = true;
    } catch(exception){
      $scope.mobile = false;
    }

    $ionicModal.fromTemplateUrl('modal-units.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });


    $ionicPlatform.registerBackButtonAction(function(e){
      if ($rootScope.backButtonPressedOnceToExit) {
        ionic.Platform.exitApp();
      }
      else if ($rootScope.$viewHistory.backView) {
        $rootScope.$viewHistory.backView.go();
      }
      else {
        $rootScope.backButtonPressedOnceToExit = true;
        window.plugins.toast.showShortCenter(
          "Press back button again to exit",function(a){},function(b){}
        );
        setTimeout(function(){
          $rootScope.backButtonPressedOnceToExit = false;
        },2000);
      }
      e.preventDefault();
      return false;
    },101);


  }

  $scope.init();

  $scope.showModal = function(side){
    $scope.currentUnit = (side == 'base') ? $scope.base.unit : $scope.result.unit;
    $scope.currentUnit.side = side;
    $scope.search.value = "";
    console.log($scope.currentUnit);
    $scope.modal.show();

  }

  $scope.scrollTop = function() {
    $ionicScrollDelegate.scrollTop(true);
  };

  $scope.clearSearch = function() {
    $scope.search.value = '';
  };

  $scope.setUnit = function(name){
    $scope.modal.hide().then(function(){
      //$scope.modal.remove();
    });

    Units.getByName(name).then(function(unit){
      if ($scope.currentUnit.side == 'base'){
        $scope.base.unit = unit;
        $scope.onBaseUnitChange();
        ConversionLocalStorageService.saveLastUsedBaseUnit($scope);
      }else{
        $scope.result.unit = unit;
        ConversionLocalStorageService.saveLastUsedResultUnit($scope);

        $timeout(function(){
          $scope.convert();
        }, 400)
        
      }
    });
  }


  $scope.initAdMob = function(){
  	var ad_units = {
  		android : {
  			banner: 'ca-app-pub-0046815007221313/3464924159',
  		}
  	};
  	var admobid = ad_units.android;
  	AdMob.createBanner( admobid.banner ) 
  }

  $scope.removeAdMob = function(){
    try{
      AdMob.removeBanner();
    } catch (exception){
      console.log(exception);
    }
  }


  $ionicPlatform.ready().then(function(){
    try {
      //$cordovaSplashscreen.hide();
    } catch (exception){
      console.log(exception);
    }
  	//$scope.initApp();
  })

  $scope.onBaseValueChange = function(tt){
  	if ($scope.base.value != $scope.base.lastValue)
		$scope.result.value = "";

	$scope.base.lastValue = String($scope.base.value);
  	$scope.base.lastValue = $scope.base.lastValue.replace(",", ".").replace(" ", "").replace("undefined", "");
  	$scope.base.value = ($scope.base.lastValue);

	$scope.base.lastValue2 = String($scope.base.value2);
  	$scope.base.lastValue2 = $scope.base.lastValue2.replace(",", ".").replace(" ", "").replace("undefined", "");
  	$scope.base.value2 = ($scope.base.lastValue2);

  }

  $scope.onTargetUnitChange = function(targetUnitName){
  	if ($scope.base.unit.name == "feet and inches"){ 

  	} else {
  		$scope.convert();
  	}


  }
  $scope.onBaseUnitChange = function(){
  	if ($scope.base.unit.name == "feet and inches"){
  		$scope.wipeBaseInput('base-input-2');
  		$scope.wipeBaseInput('base-input');
  	} else {
  		//$scope.convert();
  	}

  	$scope.result.value = "";
  }

  $scope.resultContextualMenu = function(conversion){
  	if (conversion.resultUnit == "feet and inches") {
  		buttons = [
  			{ text: 'Copy result value and units to clipboard', copyValue : ConversionModel.rightSideToString(conversion), action : $scope.copyToClipboard, id : "convert" },
  			{ text: 'Copy conversion to clipboard', copyValue : ConversionModel.toString(conversion), action : $scope.copyToClipboard }
  		]
    	} else{
  		buttons = [
  			{ text: 'Copy result value to clipboard', copyValue : conversion.resultValue, action : $scope.copyToClipboard },
  			{ text: 'Copy result value and units to clipboard', copyValue : ConversionModel.resultValueAndUnitString(conversion), action : $scope.copyToClipboard },
  			{ text: 'Copy conversion to clipboard', copyValue : ConversionModel.toString(conversion), action : $scope.copyToClipboard }
  		]
  	}

  	try{
  		var hideSheet = $ionicActionSheet.show({
  			buttons : buttons,
  			titleText: ConversionModel.toString(conversion),
  			cancelText: 'Cancel',

  			cancel: function() {
  			  // add cancel code..
  			},
  			buttonClicked: function(index, button) {
  				button.action(button.copyValue);
  				return true;
  			}
  		});

      if (!$scope.mobile){
        
        $timeout(function(){
          //console.log(document.querySelector('.action-sheet-title'));
          var copyEl = angular.element( document.querySelectorAll( '.action-sheet-group .button' ) );
          $scope.client = new ZeroClipboard( copyEl );

        }, 200)
      }
  	}
  	catch (exception){
  		console.log(exception);
  	}
  }


  $scope.copyToClipboard = function(value){
  	try{
  		cordova.plugins.clipboard.copy(value);
  		$cordovaToast.showShortTop("'" + value + "' copied to clipboard");
  	} 
  	catch (exception){
      
      $scope.client.setText(value);
  		console.log("Failed to copy '" + value + "'");
  		console.log(exception);
  	}
  }

  $scope.toggleHistory = function(){
  	$scope.historyVisible = !$scope.historyVisible;
  	$ionicScrollDelegate.resize();
  }

  $scope.deleteHistory = function(){
  	ConversionLocalStorageService.wipe($scope);
  	$scope.toggleHistory();
  }

  $scope.onKeyDown = function(event){
  	console.log(event.keyCode);
  	if (event.keyCode === 13 || event.keyCode === 9){
  		$scope.convert();
  	} 
  }

  $scope.wipeBaseInput = function(eleId){
  	if (eleId == 'base-input'){
	  	$scope.base.value = "";
	  	$scope.base.lastValue = "";
      $scope.result.value = "";
	} else if (eleId == 'base-input-2'){
	  	$scope.base.value2 = "";
	  	$scope.base.lastValue2 = "";
	}
  	$timeout(function(){
  		document.getElementById(eleId).focus();
  	}, 50)
  	
  }

  $rootScope.$on("online", function(event, isOnline){
    if (isOnline == true){
      $scope.initAdMob();
    } else {
      $scope.removeAdMob();
    }
  })
})