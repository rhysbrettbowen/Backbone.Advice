var allTestFiles = [];
var TEST_REGEXP = /test/;

Object.keys(window.__testacular__.files).forEach(function(file) {
  if (TEST_REGEXP.test(file)) {
    allTestFiles.push(file);
  }
});

require.config({
  // Testacular serves files under /base, which is the basePath from your config file
  baseUrl: '/base',

  // example of using shim, to load non AMD libraries (such as Backbone, jquery)
  shim: {
    '/base/shim.js': {
      exports: 'global'
    },
    underscore:{exports:"_"},
    backbone:{
      deps:["underscore","jquery"],
      exports:"Backbone"
    },
  },

  paths: {
    'chai': 'lib/chai/chai',
    'jquery': 'lib/jquery.1.7.2',
    'underscore': 'lib/underscore',
    'backbone': 'lib/backbone',
    'Backbone.Advice': 'advice',
    'Mixin': 'mixin'
  },

  deps: allTestFiles,

  callback: window.__testacular__.start
});
