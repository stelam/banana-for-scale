angular.module('converter.services', ['LocalStorageModule'])

/**
 * A simple example service that returns some data.
 */
.factory('Units', function($q) {
  // Might use a resource here that returns a JSON array
  var units ={
    length : [
      { name: 'bananas', id: 'banana-length', type: "Universal units", typeId: 0, symbol : 'bn' },
      { name: 'inches', id: 'inches', type: "Imperial units", typeId: 1, symbol : 'in'},
      { name: 'feet', id: 'feet', type: "Imperial units", typeId: 1, symbol : 'ft' },
      { name: 'feet and inches', id: 'feet and inches', type: "Imperial units", typeId: 1, symbol : 'ft in' },
      { name: 'yards', id: 'yards', type: "Imperial units", typeId: 1, symbol : 'yd' },
      { name: 'miles', id: 'miles', type: "Imperial units", typeId: 1, symbol : 'mi' },
      { name: 'millimeters', id: 'millimeters', type: "Metric units", typeId: 2, symbol : 'mm' },
      { name: 'centimeters', id: 'centimeters', type: "Metric units", typeId: 2, symbol : 'cm' },
      { name: 'meters', id: 'meters', type: "Metric units", typeId: 2, symbol : 'm' },
      { name: 'kilometers', id: 'kilometers', type: "Metric units", typeId: 2, symbol : 'km' }
    ], 

    mass : [
      { name: 'bananas', id: 'banana-mass', type: "Universal units", typeId: 0, symbol : 'bn' },
      { name: 'ounces', id: 'ounces', type: "Imperial units", typeId: 1, symbol : 'oz'},
      { name: 'pounds', id: 'pounds', type: "Imperial units", typeId: 1, symbol : 'lbs'},
      { name: 'short tons', id: 'short tons', type: "Imperial units", typeId: 1, symbol : 'tons'},
      { name: 'grams', id: 'grams', type: "Metric units", typeId: 2, symbol : 'g'},
      { name: 'kilograms', id: 'kilograms', type: "Metric units", typeId: 2, symbol : 'kg'},
      { name: 'metric tons', id: 'metric tons', type: "Metric units", typeId: 2, symbol : 't'}
    ]
  };

  // var qties = new Qty('m');

  
  var all = function() {
      return units;
    }

  var allByType = function(type){
      return units[type];
    }

  var get = function(unitId) {
      // Simple index lookup
      return units[unitId];
    }

  var getByName = function(unitName, type){

      var deferred = $q.defer();
      var found = false;
      units[type].some(function(u){
        if (u.name == unitName){
          found = true;
          deferred.resolve(u);
        }
      })
      if (!found) deferred.reject("Unit " + unitName + " doesn't exist.");
      return deferred.promise;
    }

  var getDefaults = function(type){
      var defaults = [];
      var deferred = $q.defer();

      if (type == "length"){
        getByName('inches', type).then(function(unit){defaults[0] = unit})
        getByName('bananas', type).then(function(unit){defaults[1] = unit; deferred.resolve(defaults)})
      }
      if (type == "mass"){
        getByName('pounds', type).then(function(unit){defaults[0] = unit})
        getByName('bananas', type).then(function(unit){defaults[1] = unit; deferred.resolve(defaults);})
      }

      return deferred.promise;

    }
  
  return {
    all:all,
    allByType:allByType,
    get:get,
    getByName:getByName,
    getDefaults:getDefaults
  }
})



.factory('ConversionLocalStorageService', function($q, localStorageService){
  var factory = [];

  factory.addToConversionHistory = function(scope){
    var deferred = $q.defer();

    var conversion = {
      baseValue : parseFloat(scope.base.value),
      baseValue2 : parseFloat(scope.base.value2),
      baseUnit : scope.base.unit.name,
      resultValue : parseFloat(scope.result.value),
      resultValue2 : parseFloat(scope.result.value2),
      resultUnit : scope.result.unit.name,
      kindName : scope.kind
    };

    if (!conversion.baseValue2) conversion.baseValue2 = 0;
    
    var conversionHistory = localStorageService.get('conversionHistory');

    console.log(JSON.stringify(conversionHistory[0]));
    console.log(JSON.stringify(conversion))
    /* Do not add if last conversion is the same as the new one */
    if (JSON.stringify(conversionHistory[0]) != JSON.stringify(conversion)){
      conversionHistory.unshift(conversion);
    }


    if (conversionHistory.length > 10)
      conversionHistory.pop();

    localStorageService.set('conversionHistory', conversionHistory);

    scope.conversionHistory = conversionHistory;

    deferred.resolve(conversionHistory);

    return deferred.promise;

  };

  factory.checkVersion = function(scope){
    if (localStorageService.get('version') != scope.version){
      localStorageService.set('version', scope.version);
      factory.wipe(scope);
    }
  }

  factory.loadHistory = function(scope){

    /* Check if history is already set conversions in localStorage */
    if (!localStorageService.get('conversionHistory')){
      localStorageService.set('conversionHistory', []);
    }


    /* Check if history exists for this kind of unit conversion */
    var conversionHistory = localStorageService.get('conversionHistory');

    scope.conversionHistory = conversionHistory;

  };

  factory.saveLastUsedBaseUnit = function(scope){
    localStorageService.set('lastUsedBaseUnit_'+scope.kind, scope.base.unit);
  };

  factory.saveLastUsedResultUnit = function(scope){
    localStorageService.set('lastUsedResultUnit_'+scope.kind, scope.result.unit);
  }

  factory.loadLastUsedUnits = function(scope){
    var deferred = $q.defer();

    if (!localStorageService.get('lastUsedBaseUnit_'+scope.kind) || !localStorageService.get('lastUsedResultUnit_'+scope.kind)){
      deferred.reject(false);
    } else {
      scope.base.unit = localStorageService.get('lastUsedBaseUnit_'+scope.kind);
      scope.result.unit = localStorageService.get('lastUsedResultUnit_'+scope.kind);
      deferred.resolve(true);
    }

    return deferred.promise;
  }

  factory.saveLastUsedKind = function(scope){
    localStorageService.set('lastUsedKind', scope.kind);
  }

  factory.loadLastUsedKind = function(scope){
    var deferred = $q.defer();
    if (!localStorageService.get('lastUsedKind'))
      deferred.reject(false);
    else{
      scope.kind = localStorageService.get('lastUsedKind');
      deferred.resolve(true);
    }
    return deferred.promise;
  }

  factory.wipe = function(scope){
    var conversionHistory = localStorageService.get('conversionHistory');
    conversionHistory = [];
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
       console.log("in")

      var totalQtyInches = new Qty(baseQtyFeet.to("inches").scalar + baseQtyInches.scalar + "inches");

      return totalQtyInches;

    } else {
      try {
        return Qty(scope.base.value + " " + scope.base.unit.id);
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
    } else {
      scope.result.value2 = 0;
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
