// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('scale', ['ionic', 'converter', 'converter.services', 'ngRoute'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})


.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider, ConvertCtrl){
  $locationProvider.html5Mode(false);
  $locationProvider.hashPrefix('!'); // faudrait mettre html5 mode à true pis le foutre sur heroku en php
  $routeProvider.
    when('/convert/:kind/:baseValue/:baseUnit/:resultUnit', {
      templateUrl: 'templates/converter.html',
      controller: ConvertCtrl
    }).
    when('/convert/:kind/:baseValue/:baseValue2/:baseUnit/:resultUnit', {
      templateUrl: 'templates/converter.html',
      controller: ConvertCtrl
    }).
    otherwise({
      redirectTo: '/',
      templateUrl: 'templates/converter.html',
      controller: ConvertCtrl
    });
}])