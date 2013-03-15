define(['chai', 'Backbone.Advice', 'Mixin'], function(chai) {


	chai.should();

	var after = {
		getNumber: function() {
			this.number *= 2;
		}
	};

	var objMixin = {
		setDefaults: {
			number: 1
		},
		before: {
			getNumber: function () {
				this.number += 1;
			}
		},
		mixin: after,
		test: {
			test: true
		}
	};

	var fnMixin = function(options) {
		var temp = _.clone(objMixin);
		temp.clobber = {
			clobber: options.clobber
		};
		return temp;
	};

	describe('Backbone.Advice', function() {

		describe('#addMixin', function() {
			var A = function() {};
			Backbone.Advice.addMixin(A);
			it('should have properties added from the mixin', function() {
				A.should.have.property('mixin').and.be.a('function');
				A.should.have.property('addToObj').and.be.a('function');
				A.should.have.property('setDefaults').and.be.a('function');
				A.should.have.property('findVal').and.be.a('function');
				A.should.have.property('clobber').and.be.a('function');
				A.should.have.property('hasMixin').and.be.a('function');
			});
		});

		describe('create new object', function() {
			var A = function() {};
			Backbone.Advice.addMixin(A);
			a = new A();
			it('should have hasMixin function', function() {
				A.should.have.property('hasMixin').and.be.a('function');
			});
		});

		describe('#around', function() {
			var A = function() {};
			A.prototype = {
				number: 1,
				getNumber: function() {
					return this.number;
				}
			};
			Backbone.Advice.addMixin(A);
			A.around('getNumber', function(orig) {
				return orig() + 1;
			});
			var a = new A();
			it('should multiply number is returned', function() {
				a.getNumber().should.equal(2);
			});
		});

		describe('#before', function() {
			var A = function() {};
			A.prototype = {
				number: 1,
				getNumber: function() {
					return this.number;
				}
			};
			Backbone.Advice.addMixin(A);
			A.before('getNumber', objMixin.before.getNumber);
			var a = new A();
			var number = a.getNumber();
			it('should be applied before the number is returned', function() {
				number.should.equal(2);
			});
		});

		describe('#after', function() {
			var A = function() {};
			A.prototype = {
				number: 1,
				getNumber: function() {
					return this.number;
				}
			};
			Backbone.Advice.addMixin(A);
			A.after('getNumber', after.getNumber);
			var a = new A();
			it('should alter the number after it is returned', function() {
				a.getNumber().should.equal(1);
				a.number.should.equal(2);
			});
		});

		describe('#mixin simple', function() {
			var A = function() {};
			A.prototype = {
				getNumber: function() {
					return this.number;
				}
			};
			Backbone.Advice.addMixin(A);
			A.mixin(objMixin);

			var a = new A();

			it('should apply the mixins from the object', function() {
				a.getNumber().should.equal(2);
				a.number.should.equal(4);
				a.test.test.should.equal(true);
			});
		});

		describe('#mixin advanced', function() {
			var B = function() {};
			B.prototype = {
				number: 2,
				clobber: false,
				getNumber: function() {
					return this.number;
				}
			};
			Backbone.Advice.addMixin(B);
			B.mixin(fnMixin, {
				clobber: true
			});

			var b = new B();

			it('should respect the default and options passed in', function() {
				b.clobber.should.be.true;
				b.getNumber().should.equal(3);
				b.number.should.equal(6);
			});
		});

		describe('#mixin more than once', function() {
			var A = function() {};
			A.prototype = {
				number: 1,
				getNumber: function() {
					return this.number;
				}
			};
			Backbone.Advice.addMixin(A);
			var mixin = function() {
				this.before('getNumber', function() {
					this.number += 1;
				});
			};
			A.mixin([mixin, mixin]).mixin(mixin);
			var a = new A();
			it('should only applied once', function() {
				a.getNumber().should.equal(2);
			});
		});

		describe('#hasMixin', function() {
			var mixin = function(){};
			var mixin2 = function(){};
			var A = function(){};
			Backbone.Advice.addMixin(A);
			A.mixin(mixin);
			var a = new A();
			it('should have mixin applied to constructor', function() {
				A.hasMixin(mixin).should.be.true;
				A.hasMixin(mixin2).should.be.false;
			});
			it('should have mixin applied to instance', function() {
				a.hasMixin(mixin).should.be.true;
				a.hasMixin(mixin2).should.be.false;
			});
		});

		describe('inherit mixin through extend', function() {
			var mixin = function mixin() {};
			var mixin2 = function mixin2() {};
			var A = Backbone.View.extend({});
			it('should have mixin function', function() {
				A.should.have.property('mixin');
			});
			A.mixin(mixin);
			var a = new A();
			window.a = a;
			var B = A.extend();
			B.mixin(mixin2);
			var b = new B();
			it('should have only mixin', function() {
				A.hasMixin(mixin).should.be.true;
				A.hasMixin(mixin2).should.be.false;
				a.hasMixin(mixin).should.be.true;
				a.hasMixin(mixin2).should.be.false;
			});
			it('should have both mixins', function() {
				B.hasMixin(mixin).should.be.true;
				B.hasMixin(mixin2).should.be.true;
				b.hasMixin(mixin).should.be.true;
				b.hasMixin(mixin2).should.be.true;
			});
		});
	});

	describe('Backbone.Advice.Mixins', function() {
		describe('Mixin.all.overrideWithOptions', function() {
			var A = Backbone.View.extend({}).mixin(Mixin.all.overrideWithOptions);
			var a = new A({
				foo: 'bar'
			});
			it('should gain any properties from the options object', function() {
				a.should.have.property('foo').and.equal('bar');
			});
		});

		describe('Mixin.view.makeSelectable', function() {
			var A = Backbone.View.extend({}).mixin(Mixin.view.makeSelectable);
			var a = new A();
			it('should have selet and deselect methods', function() {
				a.should.have.property('select').and.be.a('function');
				a.should.have.property('deselect').and.be.a('function');
			});
			it('should be selectable', function() {
				a.should.have.property('selectable');
				a.should.have.property('isSelectable').and.be.a('function');
			});
			it('should not be selected initially', function() {
				a.isSelected().should.be.false;
			});
			it('should be selectable', function() {
				a.select();
				a.isSelected().should.be.true;
			});
			it('should be able to toggle selected', function() {
				a.toggleSelect();
				a.isSelected().should.be.false;
				a.toggleSelect();
				a.isSelected().should.be.true;
			});
		});

		describe('Mixin.view.expandable', function(){
			var A = Backbone.View.extend({}).mixin(Mixin.view.expandable);
			var a = new A();
			it('should have expand and collapse methods', function() {
				a.should.have.property('expand').and.be.a('function');
				a.should.have.property('collapse').and.be.a('function');
			});
			it('should be expandable', function() {
				a.should.have.property('expanded');
				a.should.have.property('isExpanded').and.be.a('function');
			});
			it('should be collapsed', function() {
				a.$el.hasClass('expanded').should.be.false;
				a.isExpanded().should.be.false
			});
			it('should expand', function() {
				a.expand();
				a.$el.hasClass('expanded').should.be.true;
				a.isExpanded().should.be.true
			});
			it('should collapse', function() {
				a.collapse();
				a.$el.hasClass('expanded').should.be.false;
				a.isExpanded().should.be.false
			});
		});

		describe('Mixin.view.makeFocusable', function() {
			var A = Backbone.View.extend({}).mixin(Mixin.view.makeFocusable);
			var a = new A();
			it('should be focusable', function() {
				a.$el.appendTo(document.body);
				a.el.focus();
				a.isFocused().should.be.true;
				a.el.blur();
				a.isFocused().should.be.false;
				a.$el.remove();
			});
		});

		describe('Mixin.view.focusOnSelect', function() {
			var A = Backbone.View.extend({}).mixin(Mixin.view.focusOnSelect);
			var a = new A();
			it('should not be focused or selected', function() {
				a.$el.appendTo(document.body);
				a.isSelected().should.be.false;
				a.isFocused().should.be.false;
			});
			it('should focus on select', function() {
				a.select();
				a.isFocused().should.be.true;
			});
			it('should blur on deselect', function() {
				a.deselect();
				a.isFocused().should.be.false;
				a.$el.remove();
			});
		});

		describe('Mixin.view.expandWhenSelected', function() {
			var A = Backbone.View.extend({}).mixin(Mixin.view.expandWhenSelected);
			var a = new A();
			it('should not be focused or selected', function() {
				a.isSelected().should.be.false;
				a.isExpanded().should.be.false;
			});
			it('should focus on select', function() {
				a.select();
				a.isExpanded().should.be.true;
			});
			it('should blur on deselect', function() {
				a.deselect();
				a.isExpanded().should.be.false;
			});
		});
	});

});