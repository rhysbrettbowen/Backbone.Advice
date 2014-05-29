var allTestFiles = [];
var TEST_REGEXP = /test/;

Object.keys(window.__karma__.files).forEach(function(file) {
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
    'chai': 'app/bower_components/chai/chai',
    'jquery': 'app/bower_components/jquery/jquery.min',
    'underscore': 'app/bower_components/underscore/underscore',
    'backbone': 'app/bower_components/backbone/backbone',
    'Backbone.Advice': 'advice',
    'Mixin': 'mixin'
  },

  deps: allTestFiles,

  callback: window.__karma__.start
});
