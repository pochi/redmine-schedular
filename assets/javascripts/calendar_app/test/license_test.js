'use strict';

describe('Service: License', function() {
  var factory;

  // inject経由でLicenseManagerを取得する。
  beforeEach(module('eventService'));
  beforeEach(inject(function(License) {
    factory = LicenseManager;
  }));
});
