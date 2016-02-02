// define angular module to update index.html
var app = angular.module('myApp', [
  'datamaps',
  'angular-flot'
]);

// global variables and helper functions
var attributeWebId;
var plotWidth = '400';
var startTimePI = '*-10m';

var getStartTime = function () {
  return (new Date()).getTime() - 10 * 60000;
};

// string format helper
// usage: 'abc{0}fg{1}'.format('de', 'h') will output 'abcdefgh'
if(!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined'
              ? args[number]
              : match
            ;
        });
    };
};

// url format helper
// usage: urlHelper('http://localhost', 'path1', ['param1=val1', 'param2=val2'])
//        will give the url http://localhost/path1?param1=val1&param2=val2
var urlHelper = function(baseUrl, path, parameters) {
  var url = baseUrl;
  url += path.charAt(0) == '/' ? path : '/' + path;
  if (parameters !== undefined) {
    url += '?';
    for (var i = 0; i < parameters.length; i++) {
      url += url.charAt(url.length-1) == '?' ? '' : '&';
      url += parameters[i];
    }
  }
  return url;
};
