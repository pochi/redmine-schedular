'use strict';

describe('Service: LicenseManager', function() {
  var factory;

  // inject経由でLicenseManagerを取得する。
  beforeEach(module('eventService'));
  beforeEach(inject(function(LicenseManager) {
    factory = LicenseManager;
  }));

  it("should be true", function() {
    expect(!!factory).toBeDefined();
  });

  describe("#push", function() {
    var base_license;
    beforeEach(function() {
      base_license = {id: "license"};
    });

    describe("when is_visible() is true", function() {
      beforeEach(function() {
        base_license.hoge = "moge";
        factory.push(base_license);
      });

      it("should increase license", function() {
        expect(!!factory.current.license).toBe(true);
      });
    });

    describe("when is_visible() is false", function() {
      it("should not set visible events", function() {
        expect(factory.visible_events.length).toBe(0);
      });
    });
  });
});
