

require.config({
  // Testacular serves files under /base, which is the basePath from your config file


  // example of using shim, to load non AMD libraries (such as Backbone, jquery)
  shim: {
    underscore:{exports:"_"},
    backbone:{
      deps:["underscore","jquery"],
      exports:"Backbone"
    }
  },

  paths: {
    'chai': 'bower_components/chai/chai',
    'jquery': 'bower_components/jquery/jquery.min',
    'underscore': 'bower_components/underscore/underscore',
    'backbone': 'bower_components/backbone/backbone',
    'Backbone.Advice': 'advice',
    'Mixin': 'mixin',
    'test': 'test/test'
  },

  deps: [
    'test'
  ],

  callback: mocha.run

});
