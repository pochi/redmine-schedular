'use strict';

var calendarApp = angular.module('calendarApp', ['ui.calendar', 'ui.bootstrap']);

calendarApp.controller('CalendarCtrl', function($scope, $dialog) {
  $scope.shouldBeOpen = false;
});

var ModalDemoCtrl = function ($scope) {

  $scope.open = function () {
    $scope.shouldBeOpen = true;
  };

  $scope.close = function () {
    $scope.closeMsg = 'I was closed at: ' + new Date();
    $scope.shouldBeOpen = false;
  };

  $scope.items = ['item1', 'item2'];

  $scope.opts = {
    backdropFade: true,
    dialogFade:true
  };

};