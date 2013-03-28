define('Mixin', [
  'underscore',
  'Backbone.Advice'
], function(_) {

  var Mixin = {
    view: {},
    ComponentView: {},
    model: {},
    collection: {},
    all: {}
  };

  /**
   * MIXIN
   * add anything in the options to the object
   */
  Mixin.all.overrideWithOptions = function overrideWithOptions() {
    this.after('initialize', function(options, options2) {
      var obj = options2;
      if (this instanceof Backbone.View)
        obj = options;
      _.each(_.keys(obj || {}), function(key) {
        this[key] = obj[key];
      }, this);
    });
  };

  /**
   * MIXIN
   * add in a decorate method (like render but sets the element)
   */
  Mixin.view.decorate = function() {
    this.setDefaults({
      wasDecorated_: false,
      decorate: function(el) {
        if (this.canDecorate(el))
          this.setElement(el);
        else
          return false;
        this.render();
        this.wasDecorated_ = true;
      },
      canDecorate: function() {
        return true;
      }
    });

    this.before('render', function() {
      this.wasDecorated_ = false;
    });
  };

  /**
   * MIXIN
   * adds on a selected paramenter for a view as well as methods to deal with
   * selected state and changes to the state.
   */
  Mixin.view.makeSelectable = function() {

    this.setDefaults({
      selectable: true,
      selected: false,
      select: function(sel) {
        if (!this.isSelectable())
          return;
        var temp = this.selected;
        this.selected = sel === undefined || !!sel;
        if (temp != this.selected) {
          if (this.selected)
            this.onSelect();
          else
            this.onDeselect();
        }
      },
      deselect: function() {
        this.select(false);
      },
      toggleSelect: function() {
        this.select(!this.selected);
      },
      isSelected: function() {
        return this.selected && this.isSelectable();
      },
      isSelectable: function() {
        return this.selectable;
      },
      onSelect: function() {},
      onDeselect: function() {}
    });


  };

  /**
   * MIXIN
   * will attempt to set focus to the views element when it is selected and
   * will blur if deselected.
   */
  Mixin.view.focusOnSelect = function() {

    this.mixin([
      Mixin.view.makeSelectable,
      Mixin.view.makeFocusable
    ]);


    this.after('onSelect', function() {
      this.setFocus();
    });
    this.after('onDeselect', function() {
      this.setBlur();
    });

  };


  /**
   * MIXIN
   * Allows the setting of the expanded attribute and will add an expanded
   * class the the parent element.
   */
  Mixin.view.expandable = function() {

    this.setDefaults({
      expanded: false,
      isExpanded: function() {
        return this.expanded;
      }
    });

    this.after('initialize', function() {
      if (this.expanded)
        this.expand();
    });

    this.around('expand', function(orig, exp) {
      var temp = this.expanded;
      this.expanded = exp === undefined || exp;
      if (temp == this.expanded)
        return;
      orig();
      if (this.expanded)
        this.onExpand();
      else
        this.onCollapse();
    });

    this.before('collapse', function() {
      this.expand(false);
    });

    this.after('onExpand', function() {
      this.$el.addClass('expanded');
    });

    this.after('onCollapse', function() {
      this.$el.removeClass('expanded');
    });
  };

  /**
   * MIXIN
   * Will automatically set expansion state based on selection state.
   */
  Mixin.view.expandWhenSelected = function() {

    this.mixin([
      Mixin.view.makeSelectable,
      Mixin.view.expandable
    ]);

    this.after('onSelect', function() {
      this.expand();
    });
    this.after('onDeselect', function() {
      this.collapse();
    });

  };

  /**
   * MIXIN
   * toggle selection state on click.
   */
  Mixin.view.clickSelect = function() {

    this.mixin(Mixin.view.makeSelectable);

    this.addToObj({
      events: {
        'click': 'onClick'
      }
    });

    this.after('onClick', function(event) {
      if (!document.getSelection().isCollapsed)
        return;
      if (this.selectableElement(event.target))
        this.toggleSelect();
    });

    this.around('selectableElement', function(fn, el) {
      return fn(el) ||
        el == this.el ||
        this.$el.contains(el);
    });
  };

  /**
   * MIXIN
   * Allow the view to be focusable by adding a tabindex and add in handlers
   * for focus state changes.
   */
  Mixin.view.makeFocusable = function() {

    this.after('initialize', function() {
      if (this.$el.prop('tabindex') === undefined)
        this.$el.prop('tabindex', 0);
    });

    this.addToObj({
      events: {
        'focus': 'onFocus',
        'blur' : 'onBlur'
      }
    });

    this.clobber({

      isFocusable: true,
      inFocus: false,

      setFocus: function(arg) {
        if (arg === undefined || arg)
          this.el.focus();
        else
          this.el.blur();
      },

      isFocused: function() {
        return this.inFocus;
      },

      setBlur: function() {
        this.setFocus(false);
      }

    });

    this.before('onFocus', function() {
      this.inFocus = true;
    });

    this.before('onBlur', function() {
      this.inFocus = false;
    });
  };

  /**
   * MIXIN
   * add in a handler for keyup.
   */
  Mixin.view.handleKeyboard = function(options) {
    this.mixin([
      Mixin.view.makeFocusable
    ], options);

    this.setDefaults({
      onKeyup: function(){},
      onKeydown: function(){}
    });

    this.addToObj({
      events: {
        'keyup': 'onKeyup',
        'keydown': 'onKeydown'
      }
    });
  };

  /**
   * MIXIN
   * add in a function to handle additions to the collection.
   */
  Mixin.view.handleAdd = function() {
    this.after('initialize', function() {
      this.collection.on('add', _.bind(function(item, collection, options) {
        this.onAdd(item, collection, options);
      }, this));
    });

    this.setDefaults({
      onAdd: function(item) {
        this.trigger('add', item);
      }
    });
  };

  /**
   * MIXIN
   * add in a function to handle removing from the collection.
   */
  Mixin.view.handleRemove = function() {
    this.after('initialize', function() {
      this.collection.on('remove', _.bind(function(item, collection, options) {
        this.onRemove(item, collection, options);
      }, this));
    });

    this.setDefaults({
      onRemove: function(item) {
        this.trigger('remove', item);
      }
    });
  };

  /**
   * MIXIN
   * add in a function to handle resetting the collection.
   */
  Mixin.view.handleReset = function() {
    this.after('initialize', function() {
      this.collection.on('reset', _.bind(function(collection, options) {
        this.onReset(collection, options);
      }, this));
    });

    this.setDefaults({
      onReset: function(collection) {
        this.trigger('reset', collection);
      }
    });
  };

  Mixin.view.handleEvents = function() {
    this.mixin([
      Mixin.view.handleAdd,
      Mixin.view.handleRemove,
      Mixin.view.handleReset
    ]);
  };

  /**
   * MIXIN
   * use when adding elements to the top, will keep scroll in position.
   */
  Mixin.view.keepScroll = function(opt) {
    this.around('onAdd', function(fn, item, collection, options) {
      var scrollEl = this.$(opt.scrollEl);
      if (!scrollEl.length)
        scrollEl = null;
      var el = scrollEl || this.$el;
      var bottom = el[0].scrollHeight - el.scrollTop();
      if (el.scrollTop() === 0)
        bottom = null;
      fn(item, collection, options);
      if (bottom !== null)
        el.scrollTop(el[0].scrollHeight - bottom);
    });
  };


  /**
   * MIXIN
   * register a collection with a model store and use that to check for models
   * before creating them. works with Backbone.ModelStore
   */
  Mixin.collection.modelStore = function(options) {

    this.setDefaults({
      idAttribute: 'index',
      modelStore: options.modelStore || { getModel: function() {} }
    });

    this.before('initialize', function(models, options) {
      if (options && options.modelStore)
        this.modelStore = options.modelStore;
      this.modelStore.registerCollection(this);
    });

    this.around('_prepareModel', function(fn, model, options) {
      var a = model;
      if (!(model instanceof Backbone.Model)) {
        model = this.modelStore.getModel(model[this.idAttribute]) || model;
      }
      var mod = fn(model, options);
      mod.set(a);
      return mod;
    });

  };

  /*******************************
  ** For use with LayoutManager **
  *******************************/

  /**
   * MIXIN
   * adds in getChildren method
   * NB: there are already getView and getViews methods
   */
  Mixin.view.getChildren = function(options) {
    options = options || {};

    this.setDefaults({
      defaultChildContainer: '.content',

      getChildren: function(container) {
        return this.views[container || options.childContainer || this.defaultChildContainer] || [];
      },

      getAllChildren: function() {
        return _.uniq(_.flatten(_.values(this.views)));
      }
    });
  };

  /**
   * MIXIN
   * can call getParent() on view insteand of __manager__.parent
   */
  Mixin.view.getParent = function() {
    this.setDefaults({
      getParent: function() {
        return this.__manager__ &&
          this.__manager__.parent;
      }
    });
  };

  /**
   * MIXIN
   * add in getChildByElement which takes an element and returns the
   * corresponding view objcet.
   */
  Mixin.view.getChildByElement = function(options) {
    this.mixin(Mixin.view.getChildren, options);

    this.setDefaults({
      getChildByElement: function(el){
        return _(this.getAllChildren()).find(function(child) {
          return child.el == el;
        });
      }
    });
  };


  /**
   * MIXIN
   * adds a getChildByModel function that takes a model instance and returns
   * the view that has the model.
   */
  Mixin.view.getChildByModel = function(options) {
    this.mixin(Mixin.view.getChildren, options);

    this.setDefaults({
      getChildByModel: function(model){
        return _(this.getChildren()).find(function(child) {
          return child.model == model;
        });
      }
    });
  };

  /**
   * MIXIN
   * add on to child views to allow them to append to the DOM in the order
   * of their collection (as long as existing order will not change).
   */
  Mixin.view.addInReverseOrder = function(options) {
    var reverse = options.reverse;
    this.clobber({
      append: function(root, el) {
        // declarations
        var parent = this.__manager__.parent;
        var model = this.model;
        var collection = parent.collection;
        var length = collection.length;
        var before = model;
        var beforeView = null;
        var views = parent.getViews().value();

        // try to get a view in the document to append after
        var modelIsBefore = function(view) {
          return before && view && view.model == before;
        };
        // console.log(_.map(collection.models, function(v) {return v && v.get('date')}));
        for (var index = collection.indexOf(model) + 1; index < length && !beforeView; index++) {
          before = collection.at(index);
          beforeView = _.find(views, modelIsBefore);
          if (!(beforeView && beforeView.el && beforeView.el.parentNode)) {
            beforeView = null;
          }
        }
        // if there is no element to append after then prepend
        if (!beforeView) {
          $(root).append(el);
        // append the view after the nearest view before it in the DOM
        } else {
          if (!reverse)
            $(el).insertBefore(beforeView.el);
          else
            $(el).insertAfter(beforeView.el);
        }
      }
    });
  };

  /**
   * MIXIN
   * toggle selection state on click.
   */
  Mixin.view.clickSelect = function() {

    this.mixin(Mixin.view.makeSelectable);

    this.addToObj({
      events: {
        'click': 'onClick'
      }
    });

    this.setDefaults({
      selectableElement: function() {return true;}
    });

    this.after('onClick', function(event) {
      if (!document.getSelection().isCollapsed)
        return;
      if (this.selectableElement(event.target))
        this.toggleSelect();
    });

  };

  /**
   * MIXIN
   * scroll the scrollEl to top of child on selectChild
   */
  Mixin.view.scrollToSelectedChild = function(options) {
    this.after('selectChild', function(child, select) {
      if (select === false)
        return;

      var el;
      if (_.isFunction(options.scrollEl)) {
        el = $(options.scrollEl(this));
      } else {
        el = this.$(options.scrollEl);
      }
      el.scrollTop(
        el.scrollTop() +
        child.$el.offset().top -
        el.offset().top
      );
    });
  };

  /**
   * MIXIN
   * Allow the list to keep track of select state on children and toggle their
   * states.
   */
  Mixin.view.allowSelectableChildren = function() {

    this.clobber({
      selectedChildren: [],
      selectChild: function(child, select) {
        if (select === false) {
          this.deselectChild(child);
          return;
        }

        if (!_.contains(this.getAllChildren(), child))
          return;

        if (!_.contains(this.selectedChildren, child))
          this.selectedChildren.push(child);

        if (child.hasMixin(Mixin.view.makeSelectable))
          child.select();

        return child;
      },
      deselectChild: function(child) {
        if (!_.contains(this.views, child))
          return;

        this.selectedChildren = _.without(this.selectedChildren, child);

        if (child.hasMixin(Mixin.view.makeSelectable))
          child.deselect();

        return child;
      }

    });
  };

  /**
   * MIXIN
   * Only allow one child at a time to be selected.
   */
  Mixin.view.singleSelectChild = function(options) {

    this.mixin([
      Mixin.view.allowSelectableChildren,
      Mixin.view.getChildren
    ], options);

    this.before('selectChild', function(child, select) {
      var children = this.getAllChildren();

      if (!_.contains(children, child))
        return;

      if (select === false) {
        if (this.selectedChild == child) {
          this.selectedChild = null;
          this.selectedChildren = [];
        }
        return;
      }

      _.chain(children).difference([child]).filter(function(child) {
        return child.hasMixin(Mixin.view.makeSelectable);
      }).each(function(child) {
        child.deselect();
      });

      this.selectedChildren = [];
      this.selectedChild = child;

    });

    this.clobber({
      selectNextChild: function() {
        this.selectRelativeChild(-1);
      },

      selectPreviousChild: function() {
        this.selectRelativeChild(1);
      },

      selectRelativeChild: function(rel) {
        if (!this.selectedChild)
          return;

        var children = _.filter(this.getAllChildren(), function(view) {
          return view.selectable && view.isSelectable();
        });

        var child = this.selectedChild;
        var length = children.length;
        var next = null;

        var nextInd = 0;
        var currInd = _.indexOf(children, child);

        if (!length)
          return;

        if (options.stopAtEnds && rel + currInd > length - 1) {
          nextInd = length - 1;
        } else if (options.stopAtEnds && rel + currInd < 0) {
          nextInd = 0;
        } else {
          // make sure relative is within limits
          rel = rel % length;
          // the index of the relative child (allows negatives)
          nextInd = (currInd + rel + length) % length;
        }

        next = children[nextInd];

        return this.selectChild(next);
      },

      selectFirstChild: function() {
        var children = this.getChildren();
        if (children.length)
          return this.selectChild(children[0]);
      },

      selectLastChild: function() {
        var children = this.getChildren();
        if (children.length)
          return this.selectChild(children[children.length - 1]);
      }
    });

  };

  /**
   * MIXIN
   * returns the selector that a view has been set under.
   */
  Mixin.view.getSelectorForView = function(options) {
    this.setDefaults({
      defaultSelector: options && options.defaultSelector || '.content',
      getSelectorForView: function(view) {
        for (var key in this.views) {
          if (this.views.hasOwnProperty(key) &&
              _.contains(this.views[key], view))
            return key;
        }
      }
    });
  };

  /**
   * MIXIN
   * keep a collection view's children in line with it's collection.
   */
  Mixin.view.collectionAutolist = function(options) {

    this.mixin([
      Mixin.view.getSelectorForView,
      Mixin.view.handleAdd
    ], options);

    this.setDefaults({
      itemView: options.itemView || Backbone.View,
      getNewItemView: function(item, options) {
        options = options || {};
        _.extend(options, {
          model: item
        });
        var MixItemView = this.itemView.extend({})
          .mixin([
            Mixin.view.addInReverseOrder
          ], {
            reverse: options.reverse
          });
        return new MixItemView(options);
      },
      addChildView: function(item, collection, options) {
        var view = this.getNewItemView(item, options);
        this.insertView(this.getIntendedSelector(view), view);
        this.sortViewArray(this.getIntendedSelector(view));
        return view;
      },
      getIntendedSelector: function() {
        return this.defaultSelector;
      },
      resetViewPositions: function(selector) {
        var root = this.$(selector)[0];
        this.sortViewArray(selector);
        this.getViews(selector).each(function(view) {
          view.append(root, view.el);
        }, this);
      },
      sortViewArray: function(selector) {
        var _this = this;
        this.views[selector].sort(function(a, b) {
          return _this.collection.indexOf(a.model) - _this.collection.indexOf(b.model);
        });
      },
      removeChildView: function(item) {
        if (!item)
          return;
        item.remove();
      }
    });

    this.before('beforeRender', function() {
      _.each(this.collection.models, function(mod) {
        this.addChildView(mod, this.collection);
      }, this);
    });

    this.after('initialize', function() {
      _.each(this.collection.models, this.addChildView, this);
      this.collection.on('remove', _.bind(function(model) {
        this.removeChildView(this.getView(function(view) {
          return view.model == model;
        }));
      }, this));
      this.collection.on('reset', _.bind(this.render, this));
    });

    this.after('onAdd', function(item, collection, options) {
      this.addChildView(item, collection, options).render();
    });

  };

  /**
   * MIXIN
   * fire a change event when the view should have changed
   */
  Mixin.view.onViewChange = function() {
    var changeRequest = false;

    this.after('onViewChange', function() {
      changeRequest = false;
    });

    var fireChange = function() {
      if (changeRequest)
        return;
      setTimeout(_.bind(this.onViewChange, this), 15);
      changeRequest = true;
    };

    this.after('initialize', function() {
      this.collection.on('add', _.bind(fireChange, this));

      this.collection.on('remove', _.bind(fireChange, this));

      this.collection.on('reset', _.bind(fireChange, this));
    });


  };

  window.Mixin = Mixin;
  return Mixin;

});