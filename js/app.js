/*
 * Angular JS application. We define here the routes, the logic is in controllers/
 */

var vaultageApp = angular.module('TaskApp', ['ngAnimate', 'ngDragDrop', 'ngCookies'], function($httpProvider) {
  // Use x-www-form-urlencoded Content-Type
  $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
 
  /**
   * The workhorse; converts an object to x-www-form-urlencoded serialization.
   * @param {Object} obj
   * @return {String}
   */ 
  var param = function(obj) {
    var query = '', name, value, fullSubName, subName, subValue, innerObj, i;
      
    for(name in obj) {
      value = obj[name];
        
      if(value instanceof Array) {
        for(i=0; i<value.length; ++i) {
          subValue = value[i];
          fullSubName = name + '[' + i + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if(value instanceof Object) {
        for(subName in value) {
          subValue = value[subName];
          fullSubName = name + '[' + subName + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if(value !== undefined && value !== null)
        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
    }
      
    return query.length ? query.substr(0, query.length - 1) : query;
  };
 
  // Override $http service's default transformRequest
  $httpProvider.defaults.transformRequest = [function(data) {
    return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
  }];
});


vaultageApp.config(function($sceProvider) {
  // Completely disable SCE.  For demonstration purposes only!
  // Do not use in new projects.
  // LBARMAN : this security feature is not needed in this threat model (semi-trusted parties accessing a service with login)
  $sceProvider.enabled(false);
});

vaultageApp.directive('dynamic', function ($compile) {
  return {
    restrict: 'A',
    replace: true,
    link: function (scope, ele, attrs) {
      scope.$watch(attrs.dynamic, function(html) {
        ele.html(html);
        $compile(ele.contents())(scope);
      });
    }
  };
});

vaultageApp.directive('ngEnter', function($document) {
    return {
      link: function(scope, element, attrs) {
        var enterWatcher = function(event) {
          if (event.which === 13) {
            scope.modal.closed();
            $document.unbind("keydown keypress", enterWatcher);
          }
        };
        $document.bind("keydown keypress", enterWatcher);
      }
    }
  });

vaultageApp.directive('ngPassword', function($document) {
    return {
      link: function(scope, element, attrs) {
        var enterWatcher = function(event) {
          if (event.which === 13) {
            scope.passwordFilled();
            $document.unbind("keydown keypress", enterWatcher);
          }
        };
        $document.bind("keydown keypress", enterWatcher);
      }
    }
  });