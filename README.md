# Backbone.Advice #

Use requireJS to import -- or whatever you want.

Based on the Advice functional mixin library by Angus Croll. Adds functional mixin abilities for Backbone objects.

There can be issues when extending classes that already have mixins and you may overrwrite needed functionality that has been mixed in. To get around this we use [Backbone.AdviceFactory](https://github.com/rhysbrettbowen/Backbone.AdviceFactory).

## Features ##

Gives a convenient way to add functionality as needed and reuse components together.

## Installation ##
### Bower
To install Backbone.Advice via [Bower](http://bower.io):

    bower install backbone.advice

### From source
Download the [latest zip file](https://github.com/rhysbrettbowen/Backbone.Advice/archive/master.zip)
or clone the repository from GitHub:

    git clone https://github.com/rhysbrettbowen/Backbone.Advice

## Usage ##

Advice and Mixins are provided for use with requirejs, if you'd just like to add them in with script tags then just remove the define function call.

```javascript
// add the mixin capability (may already be done for you)
Backbone.Advice.addMixin(Backbone.View)

// define a mixin
var namer = function(options) {
	// options an object that may be passed in

	// any functions under clobber will be replaced
	this.clobber({
		initialize: function() {
			this.spoke = options.times || 0;
		}
	});

	// these will only be set if there is no existing function
	this.setDefaults({
		name: 'frank',
		getName: function() {
			return this.name;
		},
		speak: function() {
			console.log('hello ' + this.getName());
		}
	});

	// first argument will be the original function - can also take an object of functions
	this.around('getName', function(orig) {
		return orig().split(' ')[0];
	});

	// can even extend objects - useful for adding events
	this.addToObj({
		events: {
			'greeted' :'speak'
		}
	});

	// first argument will be the original function - can also take an object of functions
	this.before('speak', function() {
		this.spoke++;
	});

	// first argument will be the original function - can also take an object of functions
	this.after('speak', function() {
		console.log('for the ' + this.spoke + 'th time');
	});

}


var Speaker = Backbone.View.extend({
	name: 'Bob White' // the set defaults won't override this
}).mixin([
	namer
], { // options passed in
	times: 3
});

var bob = new Speaker();
bob.speak();  // Hello Bob
              // for the 4th time

```

You can even call addToObj, clobber, setDefaults, after, before and around straight on the constructor rather than creating the mixin function:

```javascript
var ShoutName = Speaker.extend().around('getName', function(orig) {
	return orig().toUpperCase();
});
```

We can also setup a sort of pseudo inheritance between mixins, say we wanted the previous example to work on it's own we could do this:

```javascript
var shouter = function(options) {

	// pull in any other mixins this one depends on
	this.mixin([
		namer
	], options);

	// now we can decorate
	this.around('getName', function(orig) {
		return orig().toUpperCase();
	});
}

var ShoutName = Backbone.View.extend().mixin([
	shouter
]);
```

Mixins will keep a record of what has been put on, so a mixin will only be applied once (this may cause issues if you'd like to re-apply a mixin with a different set of options).

notice that we're extending before the mixin to get the right prototype chain before mixing in.

Mixins can also be objects like this:

```javascript
var myMixin = {
	clobber: {
		clobbered: true;
	},
	addToObj: {
		events: {
			'click': 'onClick'
		}
	},
	after: {
		'render': function() {
			console.log('rendering done');
		}
	}
};
```

Be careful though, only mixins that were defined as functions are able to see if they have been applied before. To fix this you can return the object from a function:

```javascript
var myMixinFn = function() {
	return myMixin;
}
```

or even use the return method to pass in the options object:

```javascript
var myMixinFn = function(options) {
	return {
		setDefaults: {
			number: options.number
		}
	};
}
```

see Backbone.Advice.Mixins (mixin.js) for some useful mixins you can use today!

## Tests ##

Install dependencies

    bundle install

and open the file `test.html` in your browser.

_TBD_: re-enable testing with testacular/karma.

#Changelog

##Advice

###v1.0.0
- initial versioning

##Mixin

###v1.0.0
- initial versioning
