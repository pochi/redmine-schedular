'use strict';

var Manager = function() {
  this.events = function() {
  };
};


// Singleton class
var EventManager = (function(){
  var instance;

  var createInstance = function() {
    var object = new Manager();
    return object;
  };

  return {
    getInstance: function() {
      if(!instance)
        instance = createInstance();

      return instance;
    }
  };
})();