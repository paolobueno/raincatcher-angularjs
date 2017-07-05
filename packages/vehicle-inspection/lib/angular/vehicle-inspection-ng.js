'use strict';
var wfm = require('@angular/wfm');

var ngModule = angular.module('wfm.vehicle-inspection', []);

require('../../dist');

ngModule.directive('vehicleInspection', function($templateCache) {
  return {
    restrict: 'E',
    template: $templateCache.get('wfm-template/vehicle-inspection.tpl.html'),
    scope: {
      vehicleInspection: '=value'
    }
  };
});

ngModule.directive('vehicleInspectionForm', function($templateCache) {
  return {
    restrict: 'E',
    template: $templateCache.get('wfm-template/vehicle-inspection-form.tpl.html'),
    scope: {},
    controller: function() {
      var self = this;
      self.model = {};
      self.back = function(event) {
      // FIXME implement step back event
        event.preventDefault();
        event.stopPropagation();
      };
      self.done = function(event) {
      // FIXME implement step done event
      // done(self.model);
        event.preventDefault();
        event.stopPropagation();
      };
    }
    , controllerAs: 'ctrl'
  };
});

ngModule.service('task', function() {
});

// TODO: figure out how to export a Task from here
// maybe a service?

module.exports = 'wfm.vehicle-inspection';
