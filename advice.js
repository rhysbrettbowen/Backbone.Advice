// v1.0.0

// ==========================================
// Copyright 2013 Dataminr
// Licensed under The MIT License
// http://opensource.org/licenses/MIT
// work derived from https://github.com/twitter/flight/blob/master/lib/advice.js
// ==========================================


// ==========================================
// Copyright 2013 Twitter, Inc
// Licensed under The MIT License
// http://opensource.org/licenses/MIT
// ==========================================

(function(root, factory) {
  if (typeof exports !== 'undefined') {
    // Define as CommonJS export:
    module.exports = factory(require('underscore'), require('backbone'));
  } else if (typeof define === 'function' && define.amd) {
    // Define as AMD:
    define('backbone.advice',['underscore', 'backbone'], factory);
  } else {
    // Just run it:
    factory(root._, root.Backbone);
  }
}(this, function(_, Backbone) { 

  Backbone.Advice = {

    // calls the wrapped function with base functions as first argument
    around: function(base, wrapped) {
      return function() {
        var args = [].slice.call(arguments, 0);
        return wrapped.apply(this, [_.bind(base, this)].concat(args));
      };
    },

    // will call the new function before the old one with same arguments
    before: function(base, before) {
      return this.around(base, function() {
        var args = [].slice.call(arguments, 0),
            orig = args.shift(),
            beforeFn;

        beforeFn = (typeof before == 'function') ? before : before.obj[before.fnName];
        beforeFn.apply(this, args);
        return (orig).apply(this, args);
      });
    },

    // will call the new function after the old one with same arguments
    after: function(base, after) {
      return this.around(base, function() {
        var args = [].slice.call(arguments, 0),
            orig = args.shift(),
            afterFn;

        // this is a separate statement for debugging purposes.
        var res = (orig.unbound || orig).apply(this, args);

        afterFn = (typeof after == 'function') ? after : after.obj[after.fnName];
        afterFn.apply(this, args);
        return res;
      });
    },

    /**
     * if it exists then overwrite
     */
    clobber: function(key, value) {
      var base = this;
      if (typeof base == 'function')
        base = this.prototype;
      if (_.isString(key)) {
        var temp = key;
        key = {};
        key[temp] = value;
      }
      _.extend(base, key);
      return this;
    },

    /**
     * will add values to an existing object (good for 'events')
     */
    addToObj: function(obj) {
      var base = this;
      if (typeof base == 'function')
        base = this.prototype;
      _.each(obj, function(val, key) {
        base[key] = _.extend(_.clone(Backbone.Advice.findVal(base, key)) || {}, val);
      });
      return this;
    },

    /**
     * will set only if doesn't exist
     */
    setDefaults: function(obj) {
      var base = this;
      if (typeof base == 'function')
        base = this.prototype;
      _.each(obj, function(val, key) {
        if (!Backbone.Advice.findVal(base, key))
          base[key] = val;
      });
      return this;
    },

    /**
     * find a value in a prototype chain
     */
    findVal: function(obj, name) {
      while (!obj[name] && obj.prototype)
        obj = obj.prototype;
      return obj[name];
    },

    /**
     * adds mixins to an object
     */
    mixin: function(mixins, options) {

      // used to saved applied mixins
      this.mixedIn = _.clone(this.mixedIn) || [];
      if (!this.__super__ ||
          this.mixedOptions == this.__super__.constructor.mixedOptions)
        this.mixedOptions = _.clone(this.mixedOptions) || {};
      _.extend(this.mixedOptions, options);

      // if only one passed in make it an array
      if (!_.isArray(mixins))
        mixins = [mixins];

      // if an array then run each mixin and save to mixedIn array
      mixins = _(mixins).map(function(mixin) {
        if (!_.isFunction(mixin))
          return mixin;
        if (!_.contains(this.mixedIn, mixin)) {
          this.mixedIn.push(mixin);
          if(mixin)
            return mixin.call(this, this.mixedOptions);
        }
      }, this);

      // if we have an object (can be returned by functions) - use them
      _(mixins).each(function(mixin) {

        if (!mixin) return;

        mixin = _.clone(mixin);

        // call the reserved keywords
        _([
          'mixin',
          'around',
          'after',
          'before',
          'clobber',
          'addToObj',
          'setDefaults'
        ]).each(function(key) {
          if (mixin[key]) {
            if (key == 'mixin')
              this[key](mixin[key], this.mixedOptions);
            else
              this[key](mixin[key]);
            delete mixin[key];
          }
        }, this);

        // on the remaining keywords, guess how to add them in
        _.each(_.keys(mixin), function(key) {

          // if it's a function then put it after
          if (_.isFunction(mixin[key])) {
            this.after(key, mixin[key]);

          // if it's an object then add it to any existing one
          } else if (_.isObject(mixin[key]) && !_.isArray(mixin[key])) {
            var obj = {};
            obj[key] = mixin[key];
            this.addToObj(obj);

          //else change the value
          } else {
            this.clobber(key, mixin[key]);
          }
        }, this);
      }, this);

      // chaining
      return this;
    },

    hasMixin: function(mixin) {
      var mixins = this.mixedIn || this.constructor.mixedIn;
      return _.contains(mixins, mixin);
    },

    /**
     * adds mixin functions to an object
     */
    addMixin: function(obj) {
      // adds before, after and around
      _.each(['before', 'after', 'around'], function(m) {
        obj[m] = function(method, fn) {

          // if an object is passed in then split that in to individual calls
          if (typeof method == 'object') {
            _.each(_.keys(method), function(key) {
              this[m](key, method[key]);
            }, this);
            return this;
          }

          // functions should go on a prototype if a constructor passed in
          var base = this;
          if (typeof base == 'function')
            base = this.prototype;

          // find original function in the prototype chain
          var orig = Backbone.Advice.findVal(base, method);

          // use an identity function if none found
          if (typeof orig != 'function')
            orig = _.identity;
          base[method] = Backbone.Advice[m](orig, fn);

          // chaining
          return this;
        };
      });

      // add in other functions
      obj.mixin = Backbone.Advice.mixin;
      obj.addToObj = Backbone.Advice.addToObj;
      obj.setDefaults = Backbone.Advice.setDefaults;
      obj.findVal = Backbone.Advice.findVal;
      obj.clobber = Backbone.Advice.clobber;
      obj.prototype.hasMixin = obj.hasMixin = Backbone.Advice.hasMixin;

    }
  };

  Backbone.Advice.addMixin(Backbone.View);
  Backbone.Advice.addMixin(Backbone.Model);
  Backbone.Advice.addMixin(Backbone.Collection);

  return Backbone.Advice;

}));
