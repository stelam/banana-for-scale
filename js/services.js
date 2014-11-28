angular.module('converter.services', [])

/**
 * A simple example service that returns some data.
 */
.factory('Units', function($q) {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var units = [
    { id: 0, name: 'Bananas', type: "Universal" },
    { id: 1, name: 'Centimeters', type: "Metric" },
    { id: 2, name: 'Inches', type: "Imperial" },
    { id: 3, name: 'Feet', type: "Imperial" },
    { id: 4, name: 'Meters', type: "Metric" }
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
});
