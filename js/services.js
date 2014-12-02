angular.module('converter.services', ['LocalStorageModule'])

/**
 * A simple example service that returns some data.
 */
.factory('Units', function($q) {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var units = [
    { name: 'bananas', type: "Universal units", typeId: "0", symbol : 'bn' },
    { name: 'inches', type: "Imperial units", typeId: "1", symbol : 'in'},
    { name: 'feet', type: "Imperial units", typeId: 1, symbol : 'ft' },
    { name: 'feet and inches', type: "Imperial units", typeId: 1, symbol : 'ft in' },
    { name: 'yards', type: "Imperial units", typeId: 1, symbol : 'yd' },
    { name: 'miles', type: "Imperial units", typeId: 1, symbol : 'mi' },
    { name: 'millimeters', type: "Metric units", typeId: 2, symbol : 'mm' },
    { name: 'centimeters', type: "Metric units", typeId: 2, symbol : 'cm' },
    { name: 'meters', type: "Metric units", typeId: 2, symbol : 'm' },
    { name: 'kilometers', type: "Metric units", typeId: 2, symbol : 'km' }
  ];
  // var qties = new Qty('m');

  return {
    all: function() {
      return units;
    },
    get: function(unitId) {
      // Simple index lookup
      return units[unitId];
    },
    getByName: function(unitName){
      var deferred = $q.defer();
      var found = false;
      units.some(function(u){
        if (u.name == unitName){
          found = true;
          deferred.resolve(u);
        }
      })
      if (!found) deferred.reject("Unit " + unitName + " doesn't exist.");
      return deferred.promise;
    }
  }
})



.factory('ConversionLocalStorageService', function($q, localStorageService){
  var factory = [];

  factory.addToConversionHistory = function(scope){
    var deferred = $q.defer();

    var conversion = {
      baseValue : scope.base.value,
      baseValue2 : scope.base.value2,
      baseUnit : scope.base.unit.name,
      resultValue : scope.result.value,
      resultValue2 : scope.result.value2,
      resultUnit : scope.result.unit.name,
      kindName : scope.kind
    };

    var conversionHistory = localStorageService.get('conversionHistory');

    /* Do not add if last conversion is the same as the new one */
    if (JSON.stringify(conversionHistory[conversion.kindName][0]) != JSON.stringify(conversion))
      conversionHistory[conversion.kindName].unshift(conversion);

    if (conversionHistory[conversion.kindName].length > 10)
      conversionHistory[conversion.kindName].pop();

    localStorageService.set('conversionHistory', conversionHistory);

    scope.conversionHistory = conversionHistory[conversion.kindName];

    deferred.resolve(conversionHistory[conversion.kindName]);

    return deferred.promise;

  };

  factory.loadHistory = function(scope){
    /* Check if history is already set conversions in localStorage */
    if (!localStorageService.get('conversionHistory')){
      localStorageService.set('conversionHistory', {});
    }


    /* Check if history exists for this kind of unit conversion */
    var conversionHistory = localStorageService.get('conversionHistory');
    if (!conversionHistory.hasOwnProperty(scope.kind))
      conversionHistory[scope.kind] = [];

    localStorageService.set('conversionHistory', conversionHistory);

    scope.conversionHistory = conversionHistory[scope.kind];

  };

  factory.saveLastUsedBaseUnit = function(scope){
    localStorageService.set('lastUsedBaseUnit', scope.base.unit);
  };

  factory.saveLastUsedResultUnit = function(scope){
    localStorageService.set('lastUsedResultUnit', scope.result.unit);
  }

  factory.loadLastUsedUnits = function(scope){
    var deferred = $q.defer();

    if (!localStorageService.get('lastUsedBaseUnit') || !localStorageService.get('lastUsedResultUnit')){
      deferred.reject(false);
    } else {
      scope.base.unit = localStorageService.get('lastUsedBaseUnit');
      scope.result.unit = localStorageService.get('lastUsedResultUnit');
      deferred.resolve(true);
    }

    return deferred.promise;
  }

  factory.wipe = function(scope){
    var conversionHistory = localStorageService.get('conversionHistory');
    conversionHistory[scope.kind] = [];
    localStorageService.set('conversionHistory', conversionHistory);
    scope.conversionHistory = [];

  }

  return factory;

})


.factory('ConversionModel', function($q){
  var factory = [];

  factory.resultValueAndUnitString = function(conversion){
    return conversion.resultValue + " " + conversion.resultUnit;
  }

  factory.toString = function(conversion){
    var leftSide = "";
    var rightSide = "";
    if (conversion.baseUnit == "feet and inches"){
      leftSide = parseFloat(0+conversion.baseValue) + "ft " + parseFloat(0+conversion.baseValue2) + 'in';
    }else {
      leftSide =  parseFloat(0+conversion.baseValue) + " " + conversion.baseUnit;
    }

    if (conversion.resultUnit == "feet and inches"){
      rightSide = parseFloat(0+conversion.resultValue) + "ft " + parseFloat(0+conversion.resultValue2) + 'in';
    }else {
      rightSide =  parseFloat(0+conversion.resultValue) + " " + conversion.resultUnit;
    }

    return leftSide + " = " + rightSide;
  }

  factory.rightSideToString = function(conversion){
    if (conversion.resultUnit == "feet and inches"){
      rightSide = parseFloat(0+conversion.resultValue) + "ft " + parseFloat(0+conversion.resultValue2) + 'in';
    }else {
      rightSide =  parseFloat(0+conversion.resultValue) + " " + conversion.resultUnit;
    }
    return rightSide;
  }


  factory.getBaseQty = function(scope){
    if (scope.base.unit.name == "feet and inches") {
      var baseQtyFeet = new Qty(scope.base.value + "feet");
      if (scope.base.value2 == "") scope.base.value2 = 0;
      var baseQtyInches = new Qty(scope.base.value2 + "inches");
      console.log(scope.base.value2)

      var totalQtyInches = new Qty(baseQtyFeet.to("inches").scalar + baseQtyInches.scalar + "inches");

      return totalQtyInches;

    } else {
      try {
        return Qty(scope.base.value + " " + scope.base.unit.name);
      } catch (exception){
        return exception;
      }
    }
  }

  factory.setResult = function(scope){
    if (scope.result.unit.name == "feet and inches") {
      var totalInches = new Qty(scope.result.value + "inches");
      var totalFeet = totalInches.to("feet");
      var qtyFeet = new Qty(Math.floor(totalFeet.scalar) + "feet");
      var qtyInches = new Qty(totalFeet.scalar - qtyFeet.scalar + "feet").to("inches").toPrec(0.01);

      scope.result.value = parseFloat(0+qtyFeet.scalar);
      scope.result.value2 = qtyInches.scalar;
    }

    if (scope.result.value < 0.01 && scope.result.value > 0 || scope.result.value > 9999999999)
      scope.result.value = scope.result.value.toExponential(3);
    else
      scope.result.value = parseFloat(scope.result.value.toFixed(3).replace(".000", ""));

    if (scope.result.value2 != "" ) {
      if (scope.result.value2 < 0.01 && scope.result.value2 > 0 || scope.result.value2 > 9999999999)
        scope.result.value2 = scope.result.value2.toExponential(3);
      else
        scope.result.value2 = parseFloat(scope.result.value2.toFixed(3).replace(".000", ""));
    }


  }

  return factory;

})


/**
* @class angular_module.steroidsBridge.ConnectionManager
* @classdesc Service pour gérer les événements en-ligne, hors-ligne
*/
.factory("ConnectionManager", function(localStorageService, $rootScope, $timeout){

  localStorageService.set("online", "");
  var connectionManager = [];

  /* Flags créés pour éviter les appels multiples lors des changements d'états */
  var offlineFnCallBuffer = false;
  var onlineFnCallBuffer = false;


 /**
  * @name onOffline
  * @function
  * @memberOf angular_module.steroidsBridge.ConnectionManager
  * @description Méthode appelée lorsque l'application redevient en ligne
  */
  connectionManager.onOffline = function() {
    if (localStorageService.get("online") != false && !offlineFnCallBuffer) { 
      offlineFnCallBuffer = true;
      localStorageService.set("online", false);

      /* On notifie les observateurs */
      $rootScope.$broadcast('online', false);

      $timeout(function(){
        offlineFnCallBuffer = false;
      }, 500)

    }
  }


 /**
  * @name onOnline
  * @function
  * @memberOf angular_module.steroidsBridge.ConnectionManager
  * @description Méthode appelée lorsque l'application devient hors-ligne
  */
  connectionManager.onOnline = function(){
    if (localStorageService.get("online") != true && !onlineFnCallBuffer) {
      onlineFnCallBuffer = true;

      /* On notifie les observateurs */
      $rootScope.$broadcast('online', true); 

      localStorageService.set("online", true);
      $timeout(function(){
        onlineFnCallBuffer = false;
      }, 500)

    }
  }


  connectionManager.isOnline = function(){
    return (localStorageService.get("online") == "true") ? true : false;
  }


  /* Gestionnaires d'événements -> ces événements sont lancés par Cordova */
  connectionManager.addEventListeners = function(){
    document.addEventListener("offline", connectionManager.onOffline, false);
    document.addEventListener("online", connectionManager.onOnline, false);
  }
  connectionManager.removeEventListeners = function(){
    document.removeEventListener("offline", connectionManager.onOffline, false);
    document.removeEventListener("online", connectionManager.onOnline, false); 
  }


  connectionManager.addEventListeners();

  return connectionManager;


})
