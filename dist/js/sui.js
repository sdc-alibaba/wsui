// classmapstart

window.CLASSMAP = {
  alert: 'alert',
  close: 'close',
  modal: 'modal',
  btn: 'btn',
  carousel: 'carousel',
  panel: 'panel',
  dropdown: 'dropdown',
  dropdownMenu: 'dropdown-menu',
  popover: 'popover',
  tooltip: 'tooltip',
  nav: 'nav',
  pagination: 'pagination',
  tagGroup: 'tag-group'
}

/*jshint -W054 */
// use template in underscore: http://underscorejs.org/
// By default, Underscore uses ERB-style template delimiters, change the
// following template settings to use alternative delimiters.
!function ($) {
  'use strict';
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var keys = [];
    for(var k in escapeMap) keys.push(k);
    var source = '(?:' + keys.join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  $.escape = createEscaper(escapeMap);

  var templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  $.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = $.extend({}, settings, templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, $);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };
}(jQuery);

/* jshint laxcomma: true */
/* ========================================================================
 * Bootstrap: transition.js v3.3.1
 * http://getbootstrap.com/javascript/#transitions
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap')

    var transEndEventNames = {
      WebkitTransition : 'webkitTransitionEnd',
      MozTransition    : 'transitionend',
      OTransition      : 'oTransitionEnd otransitionend',
      transition       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }

    return false // explicit for ie8 (  ._.)
  }

  // http://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false
    var $el = this
    $(this).one('bsTransitionEnd', function () { called = true })
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    setTimeout(callback, duration)
    return this
  }

  $(function () {
    $.support.transition = transitionEnd()

    if (!$.support.transition) return

    $.event.special.bsTransitionEnd = {
      bindType: $.support.transition.end,
      delegateType: $.support.transition.end,
      handle: function (e) {
        if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
      }
    }
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: alert.js v3.3.1
 * http://getbootstrap.com/javascript/#alerts
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // ALERT CLASS DEFINITION
  // ======================

  var dismiss = '[data-dismiss="alert"]'
  var Alert   = function (el) {
    $(el).on('click', dismiss, this.close)
  }

  Alert.VERSION = '3.3.1'

  Alert.TRANSITION_DURATION = 150

  Alert.prototype.close = function (e) {
    var $this    = $(this)
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = $(selector)

    if (e) e.preventDefault()

    if (!$parent.length) {
      $parent = $this.closest('.' + CLASSMAP.alert)
    }

    $parent.trigger(e = $.Event('close'))

    if (e.isDefaultPrevented()) return

    $parent.removeClass('in')

    function removeElement() {
      // detach from parent, fire event then clean up data
      $parent.detach().trigger('closed').remove()
    }

    $.support.transition && $parent.hasClass('fade') ?
      $parent
        .one('bsTransitionEnd', removeElement)
        .emulateTransitionEnd(Alert.TRANSITION_DURATION) :
      removeElement()
  }


  // ALERT PLUGIN DEFINITION
  // =======================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('alert')

      if (!data) $this.data('alert', (data = new Alert(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.alert

  $.fn.alert             = Plugin
  $.fn.alert.Constructor = Alert


  // ALERT NO CONFLICT
  // =================

  $.fn.alert.noConflict = function () {
    $.fn.alert = old
    return this
  }


  // ALERT DATA-API
  // ==============

  $(document).on('click.alert.data-api', dismiss, Alert.prototype.close)

}(jQuery);

/* ========================================================================
 * Bootstrap: button.js v3.3.1
 * http://getbootstrap.com/javascript/#buttons
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // BUTTON PUBLIC CLASS DEFINITION
  // ==============================

  var Button = function (element, options) {
    this.$element  = $(element)
    this.options   = $.extend({}, Button.DEFAULTS, options)
    this.isLoading = false
  }

  Button.VERSION  = '3.3.1'

  Button.DEFAULTS = {
    loadingText: '加载中...'
  }

  Button.prototype.setState = function (state) {
    var d    = 'disabled'
    var $el  = this.$element
    var val  = $el.is('input') ? 'val' : 'html'
    var data = $el.data()

    state = state + 'Text'

    if (data.resetText == null) $el.data('resetText', $el[val]())

    // push to event loop to allow forms to submit
    setTimeout($.proxy(function () {
      $el[val](data[state] == null ? this.options[state] : data[state])

      if (state == 'loadingText') {
        this.isLoading = true
        $el.addClass(d).attr(d, d)
      } else if (this.isLoading) {
        this.isLoading = false
        $el.removeClass(d).removeAttr(d)
      }
    }, this), 0)
  }

  Button.prototype.toggle = function () {
    var changed = true
    var $parent = this.$element.closest('[data-toggle="buttons"]')

    if ($parent.length) {
      var $input = this.$element.find('input')
      if ($input.prop('type') == 'radio') {
        if ($input.prop('checked') && this.$element.hasClass('active')) changed = false
        else $parent.find('.active').removeClass('active')
      }
      if (changed) $input.prop('checked', !this.$element.hasClass('active')).trigger('change')
    } else {
      this.$element.attr('aria-pressed', !this.$element.hasClass('active'))
    }

    if (changed) this.$element.toggleClass('active')
  }


  // BUTTON PLUGIN DEFINITION
  // ========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('button')
      var options = typeof option == 'object' && option

      if (!data) $this.data('button', (data = new Button(this, options)))

      if (option == 'toggle') data.toggle()
      else if (option) data.setState(option)
    })
  }

  var old = $.fn.button

  $.fn.button             = Plugin
  $.fn.button.Constructor = Button


  // BUTTON NO CONFLICT
  // ==================

  $.fn.button.noConflict = function () {
    $.fn.button = old
    return this
  }


  // BUTTON DATA-API
  // ===============

  $(document)
    .on('click.button.data-api', '[data-toggle^="button"]', function (e) {
      var $btn = $(e.target)
      if (!$btn.hasClass(CLASSMAP.btn)) $btn = $btn.closest('.' + CLASSMAP.btn)
      Plugin.call($btn, 'toggle')
      e.preventDefault()
    })
    .on('focus.button.data-api blur.button.data-api', '[data-toggle^="button"]', function (e) {
      $(e.target).closest('.' + CLASSMAP.btn).toggleClass('focus', /^focus(in)?$/.test(e.type))
    })

}(jQuery);

/* ========================================================================
 * Bootstrap: carousel.js v3.3.1
 * http://getbootstrap.com/javascript/#carousel
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CAROUSEL CLASS DEFINITION
  // =========================

  var Carousel = function (element, options) {
    this.$element    = $(element)
    this.$indicators = this.$element.find('.carousel-indicators')
    this.options     = options
    this.paused      =
    this.sliding     =
    this.interval    =
    this.$active     =
    this.$items      = null

    this.options.keyboard && this.$element.on('keydown.carousel', $.proxy(this.keydown, this))

    this.options.pause == 'hover' && !('ontouchstart' in document.documentElement) && this.$element
      .on('mouseenter.carousel', $.proxy(this.pause, this))
      .on('mouseleave.carousel', $.proxy(this.cycle, this))
  }

  Carousel.VERSION  = '3.3.1'

  Carousel.TRANSITION_DURATION = 600

  Carousel.DEFAULTS = {
    interval: 5000,
    pause: 'hover',
    wrap: true,
    keyboard: true
  }

  Carousel.prototype.keydown = function (e) {
    if (/input|textarea/i.test(e.target.tagName)) return
    switch (e.which) {
      case 37: this.prev(); break
      case 39: this.next(); break
      default: return
    }

    e.preventDefault()
  }

  Carousel.prototype.cycle = function (e) {
    e || (this.paused = false)

    this.interval && clearInterval(this.interval)

    this.options.interval
      && !this.paused
      && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))

    return this
  }

  Carousel.prototype.getItemIndex = function (item) {
    this.$items = item.parent().children('.item')
    return this.$items.index(item || this.$active)
  }

  Carousel.prototype.getItemForDirection = function (direction, active) {
    var activeIndex = this.getItemIndex(active)
    var willWrap = (direction == 'prev' && activeIndex === 0)
                || (direction == 'next' && activeIndex == (this.$items.length - 1))
    if (willWrap && !this.options.wrap) return active
    var delta = direction == 'prev' ? -1 : 1
    var itemIndex = (activeIndex + delta) % this.$items.length
    return this.$items.eq(itemIndex)
  }

  Carousel.prototype.to = function (pos) {
    var that        = this
    var activeIndex = this.getItemIndex(this.$active = this.$element.find('.item.active'))

    if (pos > (this.$items.length - 1) || pos < 0) return

    if (this.sliding)       return this.$element.one('slid', function () { that.to(pos) }) // yes, "slid"
    if (activeIndex == pos) return this.pause().cycle()

    return this.slide(pos > activeIndex ? 'next' : 'prev', this.$items.eq(pos))
  }

  Carousel.prototype.pause = function (e) {
    e || (this.paused = true)

    if (this.$element.find('.next, .prev').length && $.support.transition) {
      this.$element.trigger($.support.transition.end)
      this.cycle(true)
    }

    this.interval = clearInterval(this.interval)

    return this
  }

  Carousel.prototype.next = function () {
    if (this.sliding) return
    return this.slide('next')
  }

  Carousel.prototype.prev = function () {
    if (this.sliding) return
    return this.slide('prev')
  }

  Carousel.prototype.slide = function (type, next) {
    var $active   = this.$element.find('.item.active')
    var $next     = next || this.getItemForDirection(type, $active)
    var isCycling = this.interval
    var direction = type == 'next' ? 'left' : 'right'
    var that      = this

    if ($next.hasClass('active')) return (this.sliding = false)

    var relatedTarget = $next[0]
    var slideEvent = $.Event('slide', {
      relatedTarget: relatedTarget,
      direction: direction
    })
    this.$element.trigger(slideEvent)
    if (slideEvent.isDefaultPrevented()) return

    this.sliding = true

    isCycling && this.pause()

    if (this.$indicators.length) {
      this.$indicators.find('.active').removeClass('active')
      var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)])
      $nextIndicator && $nextIndicator.addClass('active')
    }

    var slidEvent = $.Event('slid', { relatedTarget: relatedTarget, direction: direction }) // yes, "slid"
    if ($.support.transition && this.$element.hasClass('slide')) {
      $next.addClass(type)
      $next[0].offsetWidth // force reflow
      $active.addClass(direction)
      $next.addClass(direction)
      $active
        .one('bsTransitionEnd', function () {
          $next.removeClass([type, direction].join(' ')).addClass('active')
          $active.removeClass(['active', direction].join(' '))
          that.sliding = false
          setTimeout(function () {
            that.$element.trigger(slidEvent)
          }, 0)
        })
        .emulateTransitionEnd(Carousel.TRANSITION_DURATION)
    } else {
      $active.removeClass('active')
      $next.addClass('active')
      this.sliding = false
      this.$element.trigger(slidEvent)
    }

    isCycling && this.cycle()

    return this
  }


  // CAROUSEL PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('carousel')
      var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
      var action  = typeof option == 'string' ? option : options.slide

      if (!data) $this.data('carousel', (data = new Carousel(this, options)))
      if (typeof option == 'number') data.to(option)
      else if (action) data[action]()
      else if (options.interval) data.pause().cycle()
    })
  }

  var old = $.fn.carousel

  $.fn.carousel             = Plugin
  $.fn.carousel.Constructor = Carousel


  // CAROUSEL NO CONFLICT
  // ====================

  $.fn.carousel.noConflict = function () {
    $.fn.carousel = old
    return this
  }


  // CAROUSEL DATA-API
  // =================

  var clickHandler = function (e) {
    var href
    var $this   = $(this)
    var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) // strip for ie7
    if (!$target.hasClass(CLASSMAP.carousel)) return
    var options = $.extend({}, $target.data(), $this.data())
    var slideIndex = $this.attr('data-slide-to')
    if (slideIndex) options.interval = false

    Plugin.call($target, options)

    if (slideIndex) {
      $target.data('carousel').to(slideIndex)
    }

    e.preventDefault()
  }

  $(document)
    .on('click.carousel.data-api', '[data-slide]', clickHandler)
    .on('click.carousel.data-api', '[data-slide-to]', clickHandler)

  $(window).on('load', function () {
    $('[data-ride="carousel"]').each(function () {
      var $carousel = $(this)
      Plugin.call($carousel, $carousel.data())
    })
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: collapse.js v3.3.1
 * http://getbootstrap.com/javascript/#collapse
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================

  var Collapse = function (element, options) {
    this.$element      = $(element)
    this.options       = $.extend({}, Collapse.DEFAULTS, options)
    this.$trigger      = $(this.options.trigger).filter('[href="#' + element.id + '"], [data-target="#' + element.id + '"]')
    this.transitioning = null

    if (this.options.parent) {
      this.$parent = this.getParent()
    } else {
      this.addAriaAndCollapsedClass(this.$element, this.$trigger)
    }

    if (this.options.toggle) this.toggle()
  }

  Collapse.VERSION  = '3.3.1'

  Collapse.TRANSITION_DURATION = 350

  Collapse.DEFAULTS = {
    toggle: true,
    trigger: '[data-toggle="collapse"]'
  }

  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width')
    return hasWidth ? 'width' : 'height'
  }

  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in')) return

    var activesData
    var actives = this.$parent && this.$parent.children('.' + CLASSMAP.panel).children('.in, .collapsing')

    if (actives && actives.length) {
      activesData = actives.data('collapse')
      if (activesData && activesData.transitioning) return
    }

    var startEvent = $.Event('show')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    if (actives && actives.length) {
      Plugin.call(actives, 'hide')
      activesData || actives.data('collapse', null)
    }

    var dimension = this.dimension()

    this.$element
      .removeClass('collapse')
      .addClass('collapsing')[dimension](0)
      .attr('aria-expanded', true)

    this.$trigger
      .removeClass('collapsed')
      .attr('aria-expanded', true)

    this.transitioning = 1

    var complete = function () {
      this.$element
        .removeClass('collapsing')
        .addClass('collapse in')[dimension]('')
      this.transitioning = 0
      this.$element
        .trigger('shown')
    }

    if (!$.support.transition) return complete.call(this)

    var scrollSize = $.camelCase(['scroll', dimension].join('-'))

    this.$element
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)[dimension](this.$element[0][scrollSize])
  }

  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in')) return

    var startEvent = $.Event('hide')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var dimension = this.dimension()

    this.$element[dimension](this.$element[dimension]())[0].offsetHeight

    this.$element
      .addClass('collapsing')
      .removeClass('collapse in')
      .attr('aria-expanded', false)

    this.$trigger
      .addClass('collapsed')
      .attr('aria-expanded', false)

    this.transitioning = 1

    var complete = function () {
      this.transitioning = 0
      this.$element
        .removeClass('collapsing')
        .addClass('collapse')
        .trigger('hidden')
    }

    if (!$.support.transition) return complete.call(this)

    this.$element
      [dimension](0)
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)
  }

  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']()
  }

  Collapse.prototype.getParent = function () {
    return $(this.options.parent)
      .find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]')
      .each($.proxy(function (i, element) {
        var $element = $(element)
        this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element)
      }, this))
      .end()
  }

  Collapse.prototype.addAriaAndCollapsedClass = function ($element, $trigger) {
    var isOpen = $element.hasClass('in')

    $element.attr('aria-expanded', isOpen)
    $trigger
      .toggleClass('collapsed', !isOpen)
      .attr('aria-expanded', isOpen)
  }

  function getTargetFromTrigger($trigger) {
    var href
    var target = $trigger.attr('data-target')
      || (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') // strip for ie7

    return $(target)
  }


  // COLLAPSE PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('collapse')
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data && options.toggle && option == 'show') options.toggle = false
      if (!data) $this.data('collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.collapse

  $.fn.collapse             = Plugin
  $.fn.collapse.Constructor = Collapse


  // COLLAPSE NO CONFLICT
  // ====================

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


  // COLLAPSE DATA-API
  // =================

  $(document).on('click.collapse.data-api', '[data-toggle="collapse"]', function (e) {
    var $this   = $(this)

    if (!$this.attr('data-target')) e.preventDefault()

    var $target = getTargetFromTrigger($this)
    var data    = $target.data('collapse')
    var option  = data ? 'toggle' : $.extend({}, $this.data(), { trigger: this })

    Plugin.call($target, option)
  })

  // 增加 http://demo.alibaba-inc.com/categories/3361/projects/11545/vds/135616  效果
  $(document).on('mouseenter mouseleave', '.panel-toggle', function () {
    $(this).toggleClass('panel-primary')
  })
}(jQuery);

/* ========================================================================
 * Bootstrap: dropdown.js v3.3.1
 * http://getbootstrap.com/javascript/#dropdowns
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // DROPDOWN CLASS DEFINITION
  // =========================

  var backdrop = '.dropdown-backdrop'
  var toggle   = '[data-toggle="dropdown"]'
  var Dropdown = function (element) {
    $(element).on('click', this.toggle)
  }

  Dropdown.VERSION = '3.3.1'

  Dropdown.prototype.toggle = function (e) {
    var $this = $(this)

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    clearMenus()

    if (!isActive) {
      if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
        // if mobile we use a backdrop because click events don't delegate
        $('<div class="dropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus)
      }

      var relatedTarget = { relatedTarget: this }
      $parent.trigger(e = $.Event('show', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this
        .trigger('focus')
        .attr('aria-expanded', 'true')

      // 切换箭头方向
      $this
        .find('.wsif')
        .toggleClass('wsif-fold wsif-unfold')

      $parent
        .toggleClass('open')
        .trigger('shown', relatedTarget)
    }

    return false
  }

  Dropdown.prototype.keydown = function (e) {
    if (!/(38|40|27|32)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) return

    var $this = $(this)

    e.preventDefault()
    e.stopPropagation()

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    if ((!isActive && e.which != 27) || (isActive && e.which == 27)) {
      if (e.which == 27) $parent.find(toggle).trigger('focus')
      return $this.trigger('click')
    }

    var desc = ' li:not(.divider):visible a'
    var $items = $parent.find('[role="menu"]' + desc + ', [role="listbox"]' + desc)

    if (!$items.length) return

    var index = $items.index(e.target)

    if (e.which == 38 && index > 0)                 index--                        // up
    if (e.which == 40 && index < $items.length - 1) index++                        // down
    if (!~index)                                      index = 0

    $items.eq(index).trigger('focus')
  }

  function clearMenus(e) {
    if (e && e.which === 3) return
    $(backdrop).remove()
    $(toggle).each(function () {
      var $this         = $(this)
      var $parent       = getParent($this)
      var relatedTarget = { relatedTarget: this }

      if (!$parent.hasClass('open')) return

      $parent.trigger(e = $.Event('hide', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this.attr('aria-expanded', 'false')
      $parent.removeClass('open').trigger('hidden', relatedTarget)
      $this.find('.wsif').toggleClass('wsif-fold wsif-unfold')
    })
  }

  function getParent($this) {
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = selector && $(selector)

    return $parent && $parent.length ? $parent : $this.parent()
  }


  // DROPDOWN PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('dropdown')

      if (!data) $this.data('dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.dropdown

  $.fn.dropdown             = Plugin
  $.fn.dropdown.Constructor = Dropdown


  // DROPDOWN NO CONFLICT
  // ====================

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }


  // APPLY TO STANDARD DROPDOWN ELEMENTS
  // ===================================

  $(document)
    .on('click.dropdown.data-api', clearMenus)
    .on('click.dropdown.data-api', '.' + CLASSMAP.dropdown + ' form', function (e) { e.stopPropagation() })
    .on('click.dropdown.data-api', toggle, Dropdown.prototype.toggle)
    .on('keydown.dropdown.data-api', toggle, Dropdown.prototype.keydown)
    .on('keydown.dropdown.data-api', '[role="menu"]', Dropdown.prototype.keydown)
    .on('keydown.dropdown.data-api', '[role="listbox"]', Dropdown.prototype.keydown)
    // .on('mouseover.dropdown', '.dropdown', function () {
    //   var $container = $(this), el = $container.find('[data-trigger="hover"]')[0];
    //   var that = $(this).find('.dropdown-toggle')[0];
    //   if (el) {
    //     Dropdown.prototype.toggle.call(that);
    //   }
    // })
    // .on('mouseleave.dropdown', '.dropdown', function () {
    //   var $container = $(this), el = $container.find('[data-trigger="hover"]')[0];
    //   var that = $(this).find('.dropdown-toggle')[0];
    //   if (el) {
    //     Dropdown.prototype.toggle.call(that);
    //   }
    // })
}(jQuery);

/* jshint laxcomma: true */
/* ========================================================================
 * Bootstrap: modal.js v3.3.1
 * http://getbootstrap.com/javascript/#modals
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // MODAL CLASS DEFINITION
  // ======================

  var Modal = function (element, options) {
    this.options        = options
    this.$body          = $(document.body)
    if (element === null) {
      // 下行表示该对话框是静态方法调用生成的
      this.isStaticInvoke = true
      element = $(Modal.COMPILEDTPL({
        title: options.title,
        body: options.body,
        id: options.id,
        okbtn: options.okbtn,
        cancelbtn: options.cancelbtn
      }));
      this.$body.append(element)
    }
    this.$element       = $(element)
    this.$backdrop      =
    this.isShown        = null
    this.scrollbarWidth = 0
    // 初始化options参数差异
    this.initOptions()
  }

  Modal.VERSION  = '3.3.1'
  Modal.COMPILEDTPL  = $.template(''
    + '<div class="' + CLASSMAP.modal + ' fade" tabindex="-1" role="dialog" id="<%=id%>">'
      + '<div class="modal-dialog">'
        + '<div class="modal-content">'
          + '<div class="modal-header">'
            + '<i class="wsif wsif-close02 ' + CLASSMAP.close + '" data-dismiss="modal"></i>'
            + '<h4 class="modal-title"><%=title%></h4>'
          + '</div>'
          + '<div class="modal-body"><%=body%></div>'
          + '<div class="modal-footer">'
            // 增加data-ok="modal"参数
            + '<button type="button" class="' + CLASSMAP.btn + ' btn-lg" data-dismiss="modal"><%=cancelbtn%></button>'
            + '<button type="button" class="' + CLASSMAP.btn + ' btn-primary btn-lg" data-ok="modal"><%=okbtn%></button>'
          + '</div>'
        + '</div>'
      + '</div>'
    + '</div>');
  Modal.TRANSITION_DURATION = 300
  Modal.BACKDROP_TRANSITION_DURATION = 150

  Modal.prototype.toggle = function (_relatedTarget) {
    return this.isShown ? this.hide() : this.show(_relatedTarget)
  }

  // 初始化options参数差异
  Modal.prototype.initOptions = function () {
    var $ele = this.$element,
      $dialog = $ele.find('.modal-dialog'),
      options = this.options,
      optWidth = options.width

    // 设置是否加过渡动画
    !options.transition && $ele.removeClass('fade')
    // 是否显示关闭按钮
    !options.closebtn && $dialog.find('.' + CLASSMAP.close).remove()
    // 是否显示取消按钮
    !options.cancelbtn && $dialog.find('.modal-footer [data-dismiss]').remove()
    // 设置是否指定宽度类型
    if (optWidth) {
      var widthMap = {
        small: 'modal-sm',
        large: 'modal-lg',
        normal: ''
      }
      if (widthMap[optWidth]) {
        $dialog.removeClass('modal-sm modal-lg').addClass(widthMap[optWidth])
      } else {
        $dialog.width(optWidth)
      }
    }
    // 是否显示脚部
    !options.hasfoot && $dialog.find('.modal-footer').remove()
    // 加载远端内容
    if (this.options.remote) {
      $ele
        .find('.modal-content')
        .load(this.options.remote, $.proxy(function () {
          $ele.trigger('loaded')
        }, this))
    }
  }

  Modal.prototype.show = function (_relatedTarget) {
    var that = this
    var e    = $.Event('show', { relatedTarget: _relatedTarget })

    this.$element.trigger(e)

    if (this.isShown || e.isDefaultPrevented()) return

    this.isShown = true

    this.checkScrollbar()
    this.setScrollbar()
    this.$body.addClass('modal-open')

    this.escape()
    this.resize()

    // 分发okHide okHidden cancelHide cancelHidden事件
    this.$element.on('click.dismiss', '[data-dismiss="modal"]', $.proxy(this.hide, this)).on('click.ok', ':not(.disabled)[data-ok="modal"]', $.proxy(this.okHide, this))

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade')

      if (!that.$element.parent().length) {
        that.$element.appendTo(that.$body) // don't move modals dom position
      }

      that.$element
        .show()
        .scrollTop(0)

      if (that.options.backdrop) that.adjustBackdrop()
      that.selfAdapt()

      if (transition) {
        that.$element[0].offsetWidth // force reflow
      }

      that.$element
        .addClass('in')
        .attr('aria-hidden', false)

      that.enforceFocus()

      var e = $.Event('shown', { relatedTarget: _relatedTarget })

      function callbackAfterTransition () {
        that.$element.trigger('focus').trigger(e)
        if (that.options.timeout > 0) {
          that.timeid = setTimeout(function () {
            that.hide();
          }, that.options.timeout)
        }
      }

      transition ?
        that.$element.find('.modal-dialog') // wait for modal to slide in
          .one('bsTransitionEnd', function () {
            callbackAfterTransition()
          })
          .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
        callbackAfterTransition()

    })
    return that.$element
  }

  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault()
    var $ele = this.$element

    e = $.Event('hide')

    // 不需要显示trigger('okHide') okHide回调会在this.okHide方法里被调用.注意此时e.type不是okHide而是click
    this.hideReason != 'ok' && $ele.trigger('cancelHide')
    $ele.trigger(e)

    if (!this.isShown || e.isDefaultPrevented()) return

    this.isShown = false

    this.escape()
    this.resize()

    $(document).off('focusin')

    $ele
      .removeClass('in')
      .attr('aria-hidden', true)
      // 注销事件
      .off('click.dismiss click.ok')

    $.support.transition && $ele.hasClass('fade') ?
      $ele
        .one('bsTransitionEnd', $.proxy(this.hideModal, this))
        .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
      this.hideModal()
  }

  // 不需要显示trigger('okHide') okHide回调会在this.okHide方法里被调用.注意此时e.type不是okHide而是click
  Modal.prototype.okHide = function (e) {
    var that = this
    function hideWithOk () {
      that.hideReason = 'ok'
      that.hide(e)
    }
    // 如果e为undefined而不是事件对象，则说明不是点击确定按钮触发的执行，而是手工调用，
    // 那么直接执行hideWithOk
    if (!e) {
      hideWithOk()
      return
    }

    var fn = this.options.okHide,
      // 点击弹层脚部的确定后是否关闭弹层，默认关闭
      ifNeedHide = true
    if (!fn) {
      var eventArr = $._data(this.$element[0], 'events').okHide
      if (eventArr && eventArr.length) {
        fn = eventArr[eventArr.length - 1].handler;
      }
    }

    typeof fn == 'function' && (ifNeedHide = fn.call(this, e))
    // 显式返回false，则不关闭对话框
    if (ifNeedHide !== false) {
      hideWithOk()
    }

    return this.$element
  }
  Modal.prototype.enforceFocus = function () {
    $(document)
      .off('focusin') // guard against infinite focus loop
      .on('focusin', $.proxy(function (e) {
        if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
          this.$element.trigger('focus')
        }
      }, this))
  }

  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keydown.dismiss', $.proxy(function (e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keydown.dismiss')
    }
  }

  Modal.prototype.resize = function () {
    if (this.isShown) {
      $(window).on('resize', $.proxy(this.handleUpdate, this))
    } else {
      $(window).off('resize')
    }
  }

  Modal.prototype.hideModal = function () {
    var that = this,
      $ele = this.$element
    $ele.hide()
    this.backdrop(function () {
      that.$body.removeClass('modal-open')
      that.resetAdjustments()
      that.resetScrollbar()

      $ele.trigger(that.hideReason == 'ok' ? 'okHidden' : 'cancelHidden')
      that.hideReason = null
      $ele.trigger('hidden')

      // 销毁静态方法生成的dialog元素 , 默认只有静态方法是remove类型
      that.isStaticInvoke && $ele.remove()

    })
  }

  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }

  Modal.prototype.backdrop = function (callback) {
    var that = this,
      animate = this.$element.hasClass('fade') ? 'fade' : '',
      doAnimate, bgcolor, bgcolorStyle
    if (this.isShown && this.options.backdrop) {
      doAnimate = $.support.transition && animate,
      bgcolor = this.options.bgcolor,
      // 自定义背景色
      bgcolorStyle = bgcolor == '#000' ? '' : (' style="background:' + bgcolor + ';" ')

      this.$backdrop = $('<div class="modal-backdrop ' + animate + '"' + bgcolorStyle + '/>')
        .prependTo(this.$element)
        .on('click.dismiss', $.proxy(function (e) {
          if (e.target !== e.currentTarget) return
          this.options.backdrop == 'static'
            ? this.$element[0].focus.call(this.$element[0])
            : this.hide.call(this)
        }, this))

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      this.$backdrop.addClass('in')

      if (!callback) return

      doAnimate ?
        this.$backdrop
          .one('bsTransitionEnd', callback)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callback()

    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')

      var callbackRemove = function () {
        that.removeBackdrop()
        callback && callback()
      }
      $.support.transition && this.$element.hasClass('fade') ?
        this.$backdrop
          .one('bsTransitionEnd', callbackRemove)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callbackRemove()

    } else if (callback) {
      callback()
    }
  }

  // these following methods are used to handle overflowing modals

  Modal.prototype.handleUpdate = function () {
    if (this.options.backdrop) this.adjustBackdrop()
    this.selfAdapt()
  }

  Modal.prototype.adjustBackdrop = function () {
    this.$backdrop
      .css('height', 0)
      .css('height', this.$element[0].scrollHeight)
  }

  Modal.prototype.selfAdapt = function () {
    var $ele = this.$element,
      $dialog = $ele.find('.modal-dialog'),
      windowHeight = document.documentElement.clientHeight,
      dialogHeight = $dialog.height(),
      modalIsOverflowing = dialogHeight + 30 > windowHeight

    // 对话框高度较小则尽量居中定位
    if (!modalIsOverflowing) {
      $dialog.css('margin-top', Math.round((windowHeight - dialogHeight) / 2.618));
    } else {
      $dialog.css('margin-top', 30);
    }

    $ele.css({
      paddingLeft:  !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : '',
      paddingRight: this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ''
    })
  }

  Modal.prototype.resetAdjustments = function () {
    this.$element.css({
      paddingLeft: '',
      paddingRight: ''
    })
  }

  Modal.prototype.checkScrollbar = function () {
    this.bodyIsOverflowing = document.body.scrollHeight > document.documentElement.clientHeight
    this.scrollbarWidth = this.measureScrollbar()
  }

  Modal.prototype.setScrollbar = function () {
    var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
    if (this.bodyIsOverflowing) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
  }

  Modal.prototype.resetScrollbar = function () {
    this.$body.css('padding-right', '')
  }

  Modal.prototype.measureScrollbar = function () { // thx walsh
    var scrollDiv = document.createElement('div')
    scrollDiv.className = 'modal-scrollbar-measure'
    this.$body.append(scrollDiv)
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
    this.$body[0].removeChild(scrollDiv)
    return scrollbarWidth
  }


  // MODAL PLUGIN DEFINITION
  // =======================

  function Plugin(option, _relatedTarget) {
    // this指向dialog元素Dom，
    // each让诸如 $('#qqq, #eee').modal(options) 的用法可行。
    return this.each(function () {
      var $this   = $(this),
        data    = $this.data('modal'),
        options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)
      // 这里判断的目的是：第一次show时实例化dialog，之后的show则用缓存在data-modal里的对象。
      if (!data) $this.data('modal', (data = new Modal(this, options)))
      // 如果是$('#xx').modal('toggle'),务必保证传入的字符串是Modal类原型链里已存在的方法。否则会报错has no method。
      if (typeof option == 'string') data[option](_relatedTarget)
      else if (options.show) data.show(_relatedTarget)
    })
  }

  Modal.DEFAULTS = {
    backdrop: true,
    show: true,
    bgcolor: '#000',
    keyboard: true,
    hasfoot: true,
    cancelbtn: true,
    closebtn: true,
    transition: true
  }

  var old = $.fn.modal

  $.fn.modal             = Plugin
  $.fn.modal.Constructor = Modal


  // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }


  // MODAL DATA-API
  // ==============

  $(document).on('click.data-api', '[data-toggle="modal"]', function (e) {
    var $this   = $(this),
      href    = $this.attr('href'),
      // $target这里指dialog本体Dom(若存在),通过data-target="#foo"或href="#foo"指向
      $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))), // strip for ie7
      // remote,href属性如果以#开头，表示等同于data-target属性
      option  = $target.data('modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

    if ($this.is('a')) e.preventDefault()

    $target.one('show', function (showEvent) {
      if (showEvent.isDefaultPrevented()) return // only register focus restorer if modal will actually get shown
      $target.one('hidden', function () {
        $this.is(':visible') && $this.trigger('focus')
      })
    })
    Plugin.call($target, option, this)
  })

  /* 弹层静态方法，用于很少重复，不需记住状态的弹层，可方便的直接调用，最简单形式就是$.alert('我是alert')
   * 若弹层内容是复杂的Dom结构， 建议将弹层html结构写到模版里，用$(xx).modal(options) 调用
   *
   * example
   * $.alert({
   *  title: '自定义标题'
   *  body: 'html' // 必填
   *  okbtn : '好的'
   *  cancelbtn : '雅达'
   *  closebtn: true
   *  keyboard: true   是否可由esc按键关闭
   *  backdrop: true   决定是否为模态对话框添加一个背景遮罩层。另外，该属性指定'static'时，表示添加遮罩层，同时点击模态对话框的外部区域不会将其关闭。
   *  bgcolor : '#123456'  背景遮罩层颜色
   *  width: {number|string(px)|'small'|'normal'|'large'}推荐优先使用后三个描述性字符串，统一样式
   *  timeout: {number} 1000    单位毫秒ms ,dialog打开后多久自动关闭
   *  transition: {Boolean} 是否以动画弹出对话框，默认为true。HTML使用方式只需把模板里的fade的class去掉即可
   *  hasfoot: {Boolean}  是否显示脚部  默认true
   *  remote: {string} 如果提供了远程url地址，就会加载远端内容,之后触发loaded事件
   *  show:     fn --------------function(e) {}
   *  shown:    fn
   *  hide:     fn
   *  hidden:   fn
   *  okHide:   function(e) {alert('点击确认后、dialog消失前的逻辑,
   *            函数返回true（默认）则dialog关闭，反之不关闭;若不传入则默认是直接返回true的函数
   *            注意不要人肉返回undefined！！')}
   *  okHidden: function(e) {alert('点击确认后、dialog消失后的逻辑')}
   *  cancelHide: fn
   *  cancelHidden: fn
   * })
   *
   */
  $.extend({
    _modal: function (dialogCfg, customCfg) {
      var modalId = +new Date(),
        finalCfg = $.extend({}, Modal.DEFAULTS,
          dialogCfg,
          { id: modalId, okbtn: '确定', width: 'small' },
          (typeof customCfg == 'string' ? { body: customCfg } : customCfg)),
      // 第一个参数传null，使构造函数走TPL组装弹层的逻辑
        dialog = new Modal(null, finalCfg),
        $ele = dialog.$element

      // 添加各种弹层行为逻辑 监听器
      function _bind(id, eList) {
        var eType = ['show', 'shown', 'hide', 'hidden', 'okHidden', 'cancelHide', 'cancelHidden']
        $.each(eType, function (k, v) {
          if (typeof eList[v] == 'function') {
            $(document).on(v, '#' + id, $.proxy(eList[v], $('#' + id)[0]))
          }
        })
      }

      _bind(modalId, finalCfg)
      $ele.data('modal', dialog).modal('show')
      // 静态方法对话框返回对话框元素的jQuery对象
      return $ele
    },
    // 为最常见的alert，confirm建立$.modal的快捷方式，
    alert: function (title, content, hidden) {
      var defaults = {
        type: 'alert',
        title: '注意',
        cancelbtn: false
      }
      var config;
      if ($.isPlainObject(title)) {
        config = title;
      } else {
        if ($.isFunction(content)) {
          config = {
            title: '注意',
            body: title,
            hidden: content
          }
        } else {
          config = {
            title: title,
            body: content,
            hidden: hidden
          };
        }
      }
      return $._modal(defaults, config);
    },
    confirm: function (title, content, okHidden, cancelHidden) {
      var defaults = {
        type: 'confirm',
        title: '提示',
        cancelbtn: '取消'
      }
      var config;
      if ($.isPlainObject(title)) {
        config = title;
      } else {
        if ($.isFunction(content)) {
          config = {
            title: '提示',
            body: title,
            okHidden: content,
            cancelHidden: okHidden
          };
        } else {
          config = {
            title: title,
            body: content,
            okHidden: okHidden,
            cancelHidden: cancelHidden
          };
        }
      }
      return $._modal(defaults, config);
    }

  })

}(jQuery);

/* jshint laxcomma: true */
!function ($) {

  'use strict';

 /* TOOLTIP PUBLIC CLASS DEFINITION
  * =============================== */

  // element为触发元素，如标识文字链
  var Tooltip = function (element, options) {
    this.init('tooltip', element, options)
  }

  Tooltip.prototype = {
    constructor: Tooltip,

    init: function (type, element, options) {
      var eventIn,
        eventOut,
        triggers,
        trigger,
        i

      this.type = type
      this.$element = $(element)
      this.options = this.getOptions(options)
      this.enabled = true
      this.hoverState = 'out'

      triggers = this.options.trigger.split(' ')

      for (i = triggers.length; i--;) {
        trigger = triggers[i]
        if (trigger == 'click') {
          this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))

        } else if (trigger != 'manual') {
          eventIn = trigger == 'hover' ? 'mouseenter' : 'focus'
          eventOut = trigger == 'hover' ? 'mouseleave' : 'blur'
          this.$element.on(eventIn + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
          this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
        }
      }

      this.options.selector ?
        (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
        this.fixTitle()
    },

    getOptions: function (options) {
      options = $.extend({}, $.fn[this.type].defaults, this.$element.data(), options)

      // 根据tooltip的type类型构造tip模版
      options.template = '<div class="' + CLASSMAP.tooltip + ' tooltip-' + options.type + '"><div class="tooltip-arrow">' + (options.type == 'default' ? '<div class="tooltip-arrow cover"></div>' : '') + '</div><div class="tooltip-inner"></div></div>'

      if (options.delay && typeof options.delay == 'number') {
        options.delay = {
          show: options.delay,
          hide: options.delay
        }
      }

      return options
    },

    enter: function (e) {
      var defaults = $.fn[this.type].defaults,
        options = {},
        self

      this._options && $.each(this._options, function (key, value) {
        if (defaults[key] != value) options[key] = value
      }, this)

      self = $(e.currentTarget)[this.type](options).data(this.type)

      clearTimeout(self.timeout)
      if (this.hoverState == 'out') {
        this.hoverState = 'in'
        this.tip().off($.support.transition && $.support.transition.end)
        if (!this.options.delay || !this.options.delay.show) return this.show()
        this.timeout = setTimeout(function () {
          if (self.hoverState == 'in') self.show()
        }, self.options.delay.show)
      }
    },

    leave: function (e) {
      var self = $(e.currentTarget)[this.type](this._options).data(this.type)
      if (this.timeout) clearTimeout(this.timeout)
      if (!self.options.delay || !self.options.delay.hide) return self.hide()

      this.timeout = setTimeout(function () {
        // isHover 为0或undefined，undefined:没有移到tip上过
        if (!self.isTipHover) {
          self.hoverState = 'out'
        }
        if (self.hoverState == 'out') self.hide()
      }, self.options.delay.hide)
    },

    show: function () {
      var $tip, pos, actualWidth, actualHeight, placement, tp,
        e = $.Event('show'),
        opt = this.options,
        align = opt.align,
        self = this

      if (this.hasContent() && this.enabled) {
        this.$element.trigger(e)
        if (e.isDefaultPrevented()) return
        $tip = this.tip()
        this.setContent()

        if (opt.animation) {
          $tip.addClass('fade')
        }

        placement = typeof opt.placement == 'function' ?
          opt.placement.call(this, $tip[0], this.$element[0]) :
          opt.placement

        $tip
          .detach()
          .css({ top: 0, left: 0, display: 'block', opacity: 0.9 })

        opt.container ? $tip.appendTo(opt.container) : $tip.insertAfter(this.$element)
        if (/\bhover\b/.test(opt.trigger)) {
          $tip.hover(function () {
            self.isTipHover = 1
          }, function () {
            self.isTipHover = 0
            self.hoverState = 'out'
            $tip.detach()
          })
        }
        this.setWidth()
        pos = this.getPosition()

        actualWidth = $tip[0].offsetWidth
        actualHeight = $tip[0].offsetHeight

        // + - 7修正，和css对应，勿单独修改
        var d = opt.type == 'warning' ? 5 : 7

        // 确定tooltip布局对齐方式
        var positioning = function () {
          var _left = pos.left + pos.width / 2 - actualWidth / 2,
              _top = pos.top + pos.height / 2 - actualHeight / 2
          switch (align) {
            case 'left':
              _left = pos.left
              break
            case 'right':
              _left = pos.left - actualWidth + pos.width
              break
            case 'top':
              _top = pos.top
              break
            case 'bottom':
              _top = pos.top - actualHeight + pos.height
              break
          }
          switch (placement) {
            case 'bottom':
              tp = { top: pos.top + pos.height + d, left: _left }
              break
            case 'top':
              tp = { top: pos.top - actualHeight - d, left: _left }
              break
            case 'left':
              tp = { top: _top, left: pos.left - actualWidth - d }
              break
            case 'right':
              tp = { top: _top, left: pos.left + pos.width + d }
              break
          }
          return tp
        }

        tp = positioning();
        this.applyPlacement(tp, placement)
        this.applyAlign(align, pos)
        this.$element.trigger('shown')
      }

    },

    applyPlacement: function (offset, placement) {
      var $tip = this.tip(),
        width = $tip[0].offsetWidth,
        height = $tip[0].offsetHeight,
        actualWidth,
        actualHeight,
        delta,
        replace

      $tip
        .offset(offset)
        .addClass(placement)
        .addClass('in')

      actualWidth = $tip[0].offsetWidth
      actualHeight = $tip[0].offsetHeight

      if (placement == 'top' && actualHeight != height) {
        offset.top = offset.top + height - actualHeight
        replace = true
      }

      if (placement == 'bottom' || placement == 'top') {
        delta = 0

        if (offset.left < 0) {
          delta = offset.left * -2
          offset.left = 0
          $tip.offset(offset)
          actualWidth = $tip[0].offsetWidth
          actualHeight = $tip[0].offsetHeight
        }

        this.replaceArrow(delta - width + actualWidth, actualWidth, 'left')
      } else {
        this.replaceArrow(actualHeight - height, actualHeight, 'top')
      }

      if (replace) $tip.offset(offset)
    },
    applyAlign: function (align, tipPos) {
      var $tip = this.tip(),
        actualWidth = $tip[0].offsetWidth,
        actualHeight = $tip[0].offsetHeight,
        css = {}
      switch (align) {
        case 'left':
          if (tipPos.width < actualWidth)
            css = { left: tipPos.width / 2 }
          break
        case 'right':
          if (tipPos.width < actualWidth)
            css = { left: actualWidth - tipPos.width / 2 }
          break
        case 'top':
          if (tipPos.height < actualHeight)
            css = { top: tipPos.height / 2 }
          break
        case 'bottom':
          if (tipPos.height < actualHeight)
            css = { top: actualHeight - tipPos.height / 2 }
          break
      }
      align != 'center' && $tip.find('.tooltip-arrow').first().css(css)

    },

    replaceArrow: function (delta, dimension, position) {
      this
        .arrow()
        .css(position, delta ? (50 * (1 - delta / dimension) + '%') : '')
    },

    setWidth: function () {
      var opt = this.options,
        width = opt.width,
        widthLimit = opt.widthlimit,
        $tip = this.tip()
      // 人工设置宽度，则忽略最大宽度限制
      if (width) {
        $tip.width(width)
      } else {
        // 宽度限制逻辑
        if (widthLimit === true) {
          $tip.css('max-width', '400px')
        } else {
          var val
          widthLimit === false && (val = 'none')
          typeof opt.widthlimit == 'string' && (val = widthLimit)
          $tip.css('max-width', val)
        }
      }
    },

    setContent: function () {
      var $tip = this.tip(),
        title = this.getTitle()

      $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
      $tip.removeClass('fade in top bottom left right')
    },

    hide: function () {
      var $tip = this.tip(),
        e = $.Event('hide'),
        self = this,
        opt = this.options

      this.$element.trigger(e)
      if (e.isDefaultPrevented()) return

      $tip.removeClass('in')
      if (typeof opt.hide == 'function') {
        opt.hide.call(self.$element)
      }

      function removeWithAnimation () {
        self.timeout = setTimeout(function () {
          $tip.off($.support.transition.end).detach()
        }, 500)

        $tip.one($.support.transition.end, function () {
          clearTimeout(self.timeout)
          $tip.detach()
        })
      }

      $.support.transition && this.$tip.hasClass('fade') ?
        removeWithAnimation () :
        ($tip.detach())
      this.$element.trigger('hidden')

      return this
    },

    fixTitle: function () {
      var $e = this.$element
      // 只有无js激活方式才处理title属性。同时html属性data-original-title必须附加到触发元素,即使是js调用生成的tooltip。
      if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
        if ($e.data('toggle') == 'tooltip') {
          $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
        } else {
          $e.attr('data-original-title', '')
        }
      }
    },

    hasContent: function () {
      return this.getTitle()
    },

    getPosition: function () {
      var el = this.$element[0]
      return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : {
        width: el.offsetWidth,
        height: el.offsetHeight
      }, this.$element.offset())
    },

    getTitle: function () {
      var title,
        $e = this.$element,
        o = this.options

      title = $e.attr('data-original-title')
        || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)
      return title
    },

    tip: function () {
      this.$tip = this.$tip || $(this.options.template)
      return this.$tip
    },

    arrow: function () {
      this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow')
      return this.$arrow
    },

    validate: function () {
      if (!this.$element[0].parentNode) {
        this.hide()
        this.$element = null
        this.options = null
      }
    },

    enable: function () {
      this.enabled = true
    },

    disable: function () {
      this.enabled = false
    },

    toggleEnabled: function () {
      this.enabled = !this.enabled
    },

    toggle: function (e) {
      var self = e ? $(e.currentTarget)[this.type](this._options).data(this.type) : this
      self.tip().hasClass('in') ? self.hide() : self.show()
    },

    destroy: function () {
      this.hide().$element.off('.' + this.type).removeData(this.type)
    }

  }


 /* TOOLTIP PLUGIN DEFINITION
  * ========================= */

  var old = $.fn.tooltip

  $.fn.tooltip = function (option) {

    return this.each(function () {
      var $this = $(this),
        data = $this.data('tooltip'),
        options = typeof option == 'object' && option
      if (!data) $this.data('tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tooltip.Constructor = Tooltip

  $.fn.tooltip.defaults = {
    animation: true,
    type: 'default',   // tip 类型 {string} 'default'|'warning' ,区别见demo
    placement: 'top',
    selector: false,  // 通常要配合调用方法使用，如果tooltip元素很多，用此途径进行事件委托减少事件监听数量: $('body').tooltip({selector: '.tips'})
    trigger: 'hover focus',   // 触发方式，多选：click hover focus，如果希望手动触发，则传入'manual'
    title: 'it is default title',  // 默认tooltip的内容，如果给html元素添加了title属性则使用该html属性替代此属性
    delay: { show:0, hide: 200 },   // 如果只传number，则show、hide时都会使用这个延时，若想差异化则传入形如{show:400, hide: 600} 的对象   注：delay参数对manual触发方式的tooltip无效
    html: true,  // 决定是html()还是text()
    container: false,  // 将tooltip与输入框组一同使用时，为了避免不必要的影响，需要设置container.他用来将tooltip的dom节点插入到container指定的元素内的最后，可理解为 container.append(tooltipDom)。
    widthlimit: true,  // {Boolean|string} tooltip元素最大宽度限制，false不限宽，true限宽300px，也可传入"500px",人工限制宽度
    align: 'center'  // {string} tip元素的布局方式，默认居中：'center' ,'left','right','top','bottom'
  }


 /* TOOLTIP NO CONFLICT
  * =================== */

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old
    return this
  }

  // document ready init
  $(function () {
    $('[data-toggle="tooltip"]').tooltip()

    // mousedown外部可消失tooltip(为了在click回调执行前处理好dom状态)
    $(document).on('mousedown', function (e) {
      var tgt = $(e.target),
          tip = $('.' + CLASSMAP.tooltip),
          switchTgt = tip.prev(),
          tipContainer = tgt.parents('.' + CLASSMAP.tooltip)
      /* 逻辑执行条件一次注释：
       * 1、存在tip
       * 2、点击的不是tip内的某区域
       * 3、点击的不是触发元素本身
       * 4、触发元素为复杂HTML结构时，点击的不是触发元素内的区域
       */
       // 这里决定了data-original-title属性必须存在于触发元素上
      if (tip.length && !tipContainer.length && tgt[0] != switchTgt[0] && tgt.parents('[data-original-title]')[0] != switchTgt[0]) {
        switchTgt.trigger('click.tooltip')
      }
    })
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: tab.js v3.3.1
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TAB CLASS DEFINITION
  // ====================

  var Tab = function (element) {
    this.element = $(element)
  }

  Tab.VERSION = '3.3.1'

  Tab.TRANSITION_DURATION = 150

  Tab.prototype.show = function () {
    var $this    = this.element
    var $ul      = $this.closest('ul:not(.' + CLASSMAP.dropdownMenu + ')')
    var selector = $this.data('target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    if ($this.parent('li').hasClass('active')) return

    var $previous = $ul.find('.active:last a')
    var hideEvent = $.Event('hide', {
      relatedTarget: $this[0]
    })
    var showEvent = $.Event('show', {
      relatedTarget: $previous[0]
    })

    $previous.trigger(hideEvent)
    $this.trigger(showEvent)

    if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) return

    var $target = $(selector)

    this.activate($this.closest('li'), $ul)
    this.activate($target, $target.parent(), function () {
      $previous.trigger({
        type: 'hidden',
        relatedTarget: $this[0]
      })
      $this.trigger({
        type: 'shown',
        relatedTarget: $previous[0]
      })
    })
  }

  Tab.prototype.activate = function (element, container, callback) {
    var $active    = container.find('> .active')
    var transition = callback
      && $.support.transition
      && (($active.length && $active.hasClass('fade')) || !!container.find('> .fade').length)

    function next() {
      $active
        .removeClass('active')
        .find('> .' + CLASSMAP.dropdownMenu + ' > .active')
          .removeClass('active')
        .end()
        .find('[data-toggle="tab"]')
          .attr('aria-expanded', false)

      element
        .addClass('active')
        .find('[data-toggle="tab"]')
          .attr('aria-expanded', true)

      if (transition) {
        element[0].offsetWidth // reflow for transition
        element.addClass('in')
      } else {
        element.removeClass('fade')
      }

      if (element.parent('.' + CLASSMAP.dropdownMenu)) {
        element
          .closest('li.' + CLASSMAP.dropdown)
            .addClass('active')
          .end()
          .find('[data-toggle="tab"]')
            .attr('aria-expanded', true)
      }

      callback && callback()
    }

    $active.length && transition ?
      $active
        .one('bsTransitionEnd', next)
        .emulateTransitionEnd(Tab.TRANSITION_DURATION) :
      next()

    $active.removeClass('in')
  }


  // TAB PLUGIN DEFINITION
  // =====================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('tab')

      if (!data) $this.data('tab', (data = new Tab(this)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tab

  $.fn.tab             = Plugin
  $.fn.tab.Constructor = Tab


  // TAB NO CONFLICT
  // ===============

  $.fn.tab.noConflict = function () {
    $.fn.tab = old
    return this
  }


  // TAB DATA-API
  // ============

  var clickHandler = function (e) {
    e.preventDefault()
    Plugin.call($(this), 'show')
  }

  $(document)
    .on('click.tab.data-api', '[data-toggle="tab"]', clickHandler)
    .on('click.tab.data-api', '[data-toggle="pill"]', clickHandler)

}(jQuery);

/* jshint laxcomma: true */
!function ($) {

  'use strict';
  // document ready init
  $(document).on('input propertychange', '[data-max]', function () {
    var that = this,
        len = $(that).data('max'),
        count = $(that).val().length;
    $(that).siblings('.input-group-addon-count').html('<span class="' + (count < len ? '' : 'text-primary') + '">' + count + '/' + len + '</span>');
  });
}(jQuery);

!function ($) {
  'use strict';
  function Pagination(opts) {
    this.itemsCount = opts.itemsCount;
    this.pageSize = opts.pageSize;
    this.displayPage = opts.displayPage < 5 ? 5 : opts.displayPage;
    // itemsCount为0的时候应为1页
    this.pages = Math.ceil(opts.itemsCount / opts.pageSize) || 1;
    $.isNumeric(opts.pages) && (this.pages = opts.pages);
    this.currentPage = opts.currentPage;
    this.styleClass = opts.styleClass;
    this.onSelect = opts.onSelect;
    this.showCtrl = opts.showCtrl;
    this.remote = opts.remote;
    this.displayInfoType = ((opts.displayInfoType == 'itemsCount' && opts.itemsCount) ? 'itemsCount' : 'pages');
  }

  /* jshint ignore:start */
  Pagination.prototype = {
    // generate the outer wrapper with the config of custom style
    _draw: function () {
      var tpl = '<div class="' + CLASSMAP.pagination;
      for (var i = 0; i < this.styleClass.length; i++) {
        tpl += ' ' + this.styleClass[i];
      }
      tpl += '"></div>'
      this.hookNode.html(tpl);
      this._drawInner();
    },
    // generate the true pagination
    _drawInner: function () {
      var outer = this.hookNode.children('.' + CLASSMAP.pagination);
      var tpl = '<ul>' + '<li class="prev' + (this.currentPage - 1 <= 0 ? ' disabled' : ' ') + '"><a href="#" data="' + (this.currentPage - 1) + '">«上一页</a></li>';
      if (this.pages <= this.displayPage || this.pages == this.displayPage + 1) {
        for (var i = 1; i < this.pages + 1; i++) {
          i == this.currentPage ? (tpl += '<li class="active"><a href="#" data="' + i + '">' + i + '</a></li>') : (tpl += '<li><a href="#" data="' + i + '">' + i + '</a></li>');
        }

      } else {
        if (this.currentPage < this.displayPage - 1) {
          for (var i = 1; i < this.displayPage; i++) {
            i == this.currentPage ? (tpl += '<li class="active"><a href="#" data="' + i + '">' + i + '</a></li>') : (tpl += '<li><a href="#" data="' + i + '">' + i + '</a></li>');
          }
          tpl += '<li class="dotted"><span>...</span></li>';
          tpl += '<li><a href="#" data="' + this.pages + '">' + this.pages + '</a></li>';
        } else if (this.currentPage > this.pages - this.displayPage + 2 && this.currentPage <= this.pages) {
          tpl += '<li><a href="#" data="1">1</a></li>';
          tpl += '<li class="dotted"><span>...</span></li>';
          for (var i = this.pages - this.displayPage + 2; i <= this.pages; i++) {
            i == this.currentPage ? (tpl += '<li class="active"><a href="#" data="' + i + '">' + i + '</a></li>') : (tpl += '<li><a href="#" data="' + i + '">' + i + '</a></li>');
          }
        } else {
          tpl += '<li><a href="#" data="1">1</a></li>';
          tpl += '<li class="dotted"><span>...</span></li>';
          var frontPage,
              backPage,
              middle = (this.displayPage - 3) / 2;
          if ((this.displayPage - 3) % 2 == 0) {
            frontPage = backPage = middle;
          } else {
            frontPage = Math.floor(middle);
            backPage = Math.ceil(middle);
          }
          for (var i = this.currentPage - frontPage; i <= this.currentPage + backPage; i++) {
            i == this.currentPage ? (tpl += '<li class="active"><a href="#" data="' + i + '">' + i + '</a></li>') : (tpl += '<li><a href="#" data="' + i + '">' + i + '</a></li>');
          }
          tpl += '<li class="dotted"><span>...</span></li>';
          tpl += '<li><a href="#" data="' + this.pages + '">' + this.pages + '</a></li>';
        }
      }
      tpl += '<li class="next' + (this.currentPage + 1 > this.pages ? ' disabled' : ' ') + '"><a href="#" data="' + (this.currentPage + 1) + '">下一页»</a></li>' + '</ul>';
      this.showCtrl && (tpl += this._drawCtrl());
      outer.html(tpl);
    },
    // 值传递
    _drawCtrl: function () {
      var tpl = '<div>&nbsp;' + (this.displayInfoType == 'itemsCount' ? '<span>共' + this.itemsCount + '条</span> ' : '共<span class="text-muted">' + this.pages + '</span>页 ') +
        '<span>' + ' 去 ' + '<input type="text" class="page-num"/><button class="btn btn-primaty btn-sm">确定</button>' + ' 页' + '</span>' + '</div>';
      return tpl;
    },

    _ctrl: function () {
      var self = this,
      pag = self.hookNode.children('.' + CLASSMAP.pagination);

      function doPagination() {
        var tmpNum = parseInt(pag.find('.page-num').val());
        if ($.isNumeric(tmpNum) && tmpNum <= self.pages && tmpNum > 0) {
          if (!self.remote) {
            self.currentPage = tmpNum;
            self._drawInner();
          }
          if ($.isFunction(self.onSelect)) {
            self.onSelect.call($(this), tmpNum);
          }
        }
      }
      pag.on('click', '.page-confirm', function (e) {
        doPagination.call(this)
      })
      pag.on('keypress', '.page-num', function (e) {
        e.which == 13 && doPagination.call(this)
      })
    },

    _select: function () {
      var self = this;
      self.hookNode.children('.' + CLASSMAP.pagination).on('click', 'a', function (e) {
        e.preventDefault();
        var tmpNum = parseInt($(this).attr('data'));
        if (!$(this).parent().hasClass('disabled') && !$(this).parent().hasClass('active')) {
          if (!self.remote) {
            self.currentPage = tmpNum;
            self._drawInner();
          }
          if ($.isFunction(self.onSelect)) {
            self.onSelect.call($(this), tmpNum);
          }
        }
      })
    },

    init: function (opts, hookNode) {
      this.hookNode = hookNode;
      this._draw();
      this._select();
      this.showCtrl && this._ctrl();
      return this;
    },

    updateItemsCount: function (itemsCount, pageToGo) {
      $.isNumeric(itemsCount) && (this.pages = Math.ceil(itemsCount / this.pageSize));
      // 如果最后一页没有数据了，返回到剩余最大页数
      this.currentPage = this.currentPage > this.pages ? this.pages : this.currentPage;
      $.isNumeric(pageToGo) && (this.currentPage = pageToGo);
      this._drawInner();
    },

    updatePages: function (pages, pageToGo) {
      $.isNumeric(pages) && (this.pages = pages);
      this.currentPage = this.currentPage > this.pages ? this.pages : this.currentPage;
      $.isNumeric(pageToGo) && (this.currentPage = pageToGo);
      this._drawInner();
    },

    goToPage: function (page) {
      if ($.isNumeric(page) && page <= this.pages && page > 0) {
        this.currentPage = page;
        this._drawInner()
      }
    }
  }
  /* jshint ignore:end */

  var old = $.fn.pagination;

  $.fn.pagination = function (options) {
    var opts = $.extend({}, $.fn.pagination.defaults, typeof options == 'object' && options),
        args,
        $this = $(this),
        pag = $this.data('pagination');

    if (typeof options == 'string') {
      args = $.makeArray(arguments);
      args.shift();
    }
    if (!pag) $this.data('pagination', (pag = new Pagination(opts).init(opts, $(this))))
    else if (typeof options == 'string') {
      pag[options].apply(pag, args)
    }
    return pag;
  };

  $.fn.pagination.Constructor = Pagination;

  $.fn.pagination.noConflict = function () {
    $.fn.pagination = old;
    return this
  }

  $.fn.pagination.defaults = {
    pageSize: 10,
    displayPage: 5,
    currentPage: 1,
    itemsCount: 0,
    styleClass: [],
    pages: null,
    showCtrl: false,
    onSelect: null,
    remote: false
  }

}(window.jQuery)

//jscs:disable
/*jshint sub:true*/
/*jshint -W065 */
/*
 * js come from :bootstrap-datepicker.js
 * Started by Stefan Petre; improvements by Andrew Rowls + contributors
 * you con get the source from github: https://github.com/eternicode/bootstrap-datepicker
 */
! function($, undefined) {
  "use strict";

	var $window = $(window);

	function UTCDate() {
		return new Date(Date.UTC.apply(Date, arguments));
	}

	function UTCToday() {
		var today = new Date();
		return UTCDate(today.getFullYear(), today.getMonth(), today.getDate());
	}

	function alias(method) {
		return function() {
			return this[method].apply(this, arguments);
		};
	}

	var DateArray = (function() {
		var extras = {
			get: function(i) {
				return this.slice(i)[0];
			},
			contains: function(d) {
				// Array.indexOf is not cross-browser;
				// $.inArray doesn't work with Dates
				var val = d && d.valueOf();
				for (var i = 0, l = this.length; i < l; i++)
					if (this[i].valueOf() === val)
						return i;
				return -1;
			},
			remove: function(i) {
				this.splice(i, 1);
			},
			replace: function(new_array) {
				if (!new_array)
					return;
				if (!$.isArray(new_array))
					new_array = [new_array];
				this.clear();
				this.push.apply(this, new_array);
			},
			clear: function() {
				this.length = 0;
			},
			copy: function() {
				var a = new DateArray();
				a.replace(this);
				return a;
			}
		};

		return function() {
			var a = [];
			a.push.apply(a, arguments);
			$.extend(a, extras);
			return a;
		};
	})();


	// Picker object

	var Datepicker = function(element, options) {
		this.dates = new DateArray();
		this.viewDate = UTCToday();
		this.focusDate = null;

		this._process_options(options);

		this.element = $(element);
		this.isInline = false;
		this.isInput = this.element.is('input');
		this.component = this.element.is('.date') ? this.element.find('.add-on, .input-group-addon, .' + CLASSMAP.btn) : false;
		this.hasInput = this.component && this.element.find('input').length;
		if (this.component && this.component.length === 0)
			this.component = false;

		this.picker = $(DPGlobal.template);

		if (this.o.timepicker) {
			this.timepickerContainer = this.picker.find('.timepicker-container');
			this.timepickerContainer.timepicker();
			this.timepicker = this.timepickerContainer.data('timepicker');
			this.timepicker._render();
			//this.setTimeValue();
		}

		this._buildEvents();
		this._attachEvents();

		if (this.isInline) {
			this.picker.addClass('datepicker-inline').appendTo(this.element);
		} else {
			this.picker.addClass('datepicker-dropdown dropdown-menu');
		}

		if (this.o.rtl) {
			this.picker.addClass('datepicker-rtl');
		}

		if (this.o.size === 'small') {
			this.picker.addClass('datepicker-small');
		}

		this.viewMode = this.o.startView;

		if (this.o.calendarWeeks)
			this.picker.find('tfoot th.today')
			.attr('colspan', function(i, val) {
				return parseInt(val) + 1;
			});

		this._allow_update = false;

		this.setStartDate(this._o.startDate);
		this.setEndDate(this._o.endDate);
		this.setDaysOfWeekDisabled(this.o.daysOfWeekDisabled);

		this.fillDow();
		this.fillMonths();

		this._allow_update = true;

		this.update();
		this.showMode();

		if (this.isInline) {
			this.show();
		}
	};

	Datepicker.prototype = {
		constructor: Datepicker,

		_process_options: function(opts) {
			// Store raw options for reference
			this._o = $.extend({}, this._o, opts);
			// Processed options
			var o = this.o = $.extend({}, this._o);

			// Check if "de-DE" style date is available, if not language should
			// fallback to 2 letter code eg "de"
			var lang = o.language;
			if (!dates[lang]) {
				lang = lang.split('-')[0];
				if (!dates[lang])
					lang = defaults.language;
			}
			o.language = lang;

			switch (o.startView) {
				case 2:
				case 'decade':
					o.startView = 2;
					break;
				case 1:
				case 'year':
					o.startView = 1;
					break;
				default:
					o.startView = 0;
			}

			switch (o.minViewMode) {
				case 1:
				case 'months':
					o.minViewMode = 1;
					break;
				case 2:
				case 'years':
					o.minViewMode = 2;
					break;
				default:
					o.minViewMode = 0;
			}

			o.startView = Math.max(o.startView, o.minViewMode);

			// true, false, or Number > 0
			if (o.multidate !== true) {
				o.multidate = Number(o.multidate) || false;
				if (o.multidate !== false)
					o.multidate = Math.max(0, o.multidate);
				else
					o.multidate = 1;
			}
			o.multidateSeparator = String(o.multidateSeparator);

			o.weekStart %= 7;
			o.weekEnd = ((o.weekStart + 6) % 7);

			var format = DPGlobal.parseFormat(o.format);
			if (o.startDate !== -Infinity) {
				if (!!o.startDate) {
					if (o.startDate instanceof Date)
						o.startDate = this._local_to_utc(this._zero_time(o.startDate));
					else
						o.startDate = DPGlobal.parseDate(o.startDate, format, o.language);
				} else {
					o.startDate = -Infinity;
				}
			}
			if (o.endDate !== Infinity) {
				if (!!o.endDate) {
					if (o.endDate instanceof Date)
						o.endDate = this._local_to_utc(this._zero_time(o.endDate));
					else
						o.endDate = DPGlobal.parseDate(o.endDate, format, o.language);
				} else {
					o.endDate = Infinity;
				}
			}

			o.daysOfWeekDisabled = o.daysOfWeekDisabled || [];
			if (!$.isArray(o.daysOfWeekDisabled))
				o.daysOfWeekDisabled = o.daysOfWeekDisabled.split(/[,\s]*/);
			o.daysOfWeekDisabled = $.map(o.daysOfWeekDisabled, function(d) {
				return parseInt(d, 10);
			});

			var plc = String(o.orientation).toLowerCase().split(/\s+/g),
				_plc = o.orientation.toLowerCase();
			plc = $.grep(plc, function(word) {
				return (/^auto|left|right|top|bottom$/).test(word);
			});
			o.orientation = {
				x: 'auto',
				y: 'auto'
			};
			if (!_plc || _plc === 'auto')
			; // no action
			else if (plc.length === 1) {
				switch (plc[0]) {
					case 'top':
					case 'bottom':
						o.orientation.y = plc[0];
						break;
					case 'left':
					case 'right':
						o.orientation.x = plc[0];
						break;
				}
			} else {
				_plc = $.grep(plc, function(word) {
					return (/^left|right$/).test(word);
				});
				o.orientation.x = _plc[0] || 'auto';

				_plc = $.grep(plc, function(word) {
					return (/^top|bottom$/).test(word);
				});
				o.orientation.y = _plc[0] || 'auto';
			}
		},
		_events: [],
		_secondaryEvents: [],
		_applyEvents: function(evs) {
			for (var i = 0, el, ch, ev; i < evs.length; i++) {
				el = evs[i][0];
				if (evs[i].length === 2) {
					ch = undefined;
					ev = evs[i][1];
				} else if (evs[i].length === 3) {
					ch = evs[i][1];
					ev = evs[i][2];
				}
				el.on(ev, ch);
			}
		},
		_unapplyEvents: function(evs) {
			for (var i = 0, el, ev, ch; i < evs.length; i++) {
				el = evs[i][0];
				if (evs[i].length === 2) {
					ch = undefined;
					ev = evs[i][1];
				} else if (evs[i].length === 3) {
					ch = evs[i][1];
					ev = evs[i][2];
				}
				el.off(ev, ch);
			}
		},
		_buildEvents: function() {
			if (this.isInput) { // single input
				this._events = [
					[this.element, {
						focus: $.proxy(this.show, this),
						keyup: $.proxy(function(e) {
							if ($.inArray(e.keyCode, [27, 37, 39, 38, 40, 32, 13, 9]) === -1)
								this.update();
						}, this),
						keydown: $.proxy(this.keydown, this)
					}]
				];
			} else if (this.component && this.hasInput) { // component: input + button
				this._events = [
					// For components that are not readonly, allow keyboard nav
					[this.element.find('input'), {
						focus: $.proxy(this.show, this),
						keyup: $.proxy(function(e) {
							if ($.inArray(e.keyCode, [27, 37, 39, 38, 40, 32, 13, 9]) === -1)
								this.update();
						}, this),
						keydown: $.proxy(this.keydown, this)
					}],
					[this.component, {
						click: $.proxy(this.show, this)
					}]
				];
			} else if (this.element.is('div')) { // inline datepicker
				this.isInline = true;
			} else {
				this._events = [
					[this.element, {
						click: $.proxy(this.show, this)
					}]
				];
			}
			//timepicker change
			if (this.o.timepicker) {
				this._events.push(
					[this.timepickerContainer, {
						'time:change': $.proxy(this.timeChange, this)
					}]
				)
			}

			this._events.push(
				// Component: listen for blur on element descendants
				[this.element, '*', {
					blur: $.proxy(function(e) {
						this._focused_from = e.target;
					}, this)
				}],
				// Input: listen for blur on element
				[this.element, {
					blur: $.proxy(function(e) {
						this._focused_from = e.target;
					}, this)
				}]
			);

			this._secondaryEvents = [
				[this.picker, {
					click: $.proxy(this.click, this)
				}],
				[$(window), {
					resize: $.proxy(this.place, this)
				}],
				[$(document), {
					'mousedown touchstart': $.proxy(function(e) {
						// Clicked outside the datepicker, hide it
						if (!(
							this.element.is(e.target) ||
							this.element.find(e.target).length ||
							this.picker.is(e.target) ||
							this.picker.find(e.target).length
						)) {
							this.hide();
						}
					}, this)
				}]
			];
		},
		_attachEvents: function() {
			this._detachEvents();
			this._applyEvents(this._events);
		},
		_detachEvents: function() {
			this._unapplyEvents(this._events);
		},
		_attachSecondaryEvents: function() {
			this._detachSecondaryEvents();
			this._applyEvents(this._secondaryEvents);
			if (this.o.timepicker) {
				this.timepicker._attachSecondaryEvents();
			}
		},
		_detachSecondaryEvents: function() {
			this._unapplyEvents(this._secondaryEvents);
			if (this.o.timepicker) {
				this.timepicker._detachSecondaryEvents();
			}
		},
		_trigger: function(event, altdate) {
			var date = altdate || this.dates.get(-1),
				local_date = this._utc_to_local(date);

			this.element.trigger({
				type: event,
				date: local_date,
				dates: $.map(this.dates, this._utc_to_local),
				format: $.proxy(function(ix, format) {
					if (arguments.length === 0) {
						ix = this.dates.length - 1;
						format = this.o.format;
					} else if (typeof ix === 'string') {
						format = ix;
						ix = this.dates.length - 1;
					}
					format = format || this.o.format;
					var date = this.dates.get(ix);
					return DPGlobal.formatDate(date, format, this.o.language);
				}, this)
			});
		},
		timeChange: function() {
			this.setValue();
		},
		show: function(e) {
			if (e && e.type === "focus" && this.picker.is(":visible")) return;
			if (!this.isInline)
				this.picker.appendTo('body');
			this.picker.show();
			this.place();
			this._attachSecondaryEvents();
			if (this.o.timepicker) {
				this.timepicker._show();
			}
			this._trigger('show');
		},

		hide: function() {
			if (this.isInline)
				return;
			if (!this.picker.is(':visible'))
				return;
			this.focusDate = null;
			this.picker.hide().detach();
			this._detachSecondaryEvents();
			this.viewMode = this.o.startView;
			this.showMode();

			if (
				this.o.forceParse &&
				(
					this.isInput && this.element.val() ||
					this.hasInput && this.element.find('input').val()
				)
			)
				this.setValue();
			if (this.o.timepicker) {
				this.timepicker._hide();
			}
			this._trigger('hide');
		},

		remove: function() {
			this.hide();
			this._detachEvents();
			this._detachSecondaryEvents();
			this.picker.remove();
			delete this.element.data().datepicker;
			if (!this.isInput) {
				delete this.element.data().date;
			}
		},

		_utc_to_local: function(utc) {
			return utc && new Date(utc.getTime() + (utc.getTimezoneOffset() * 60000));
		},
		_local_to_utc: function(local) {
			return local && new Date(local.getTime() - (local.getTimezoneOffset() * 60000));
		},
		_zero_time: function(local) {
			return local && new Date(local.getFullYear(), local.getMonth(), local.getDate());
		},
		_zero_utc_time: function(utc) {
			return utc && new Date(Date.UTC(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate()));
		},

		getDates: function() {
			return $.map(this.dates, this._utc_to_local);
		},

		getUTCDates: function() {
			return $.map(this.dates, function(d) {
				return new Date(d);
			});
		},

		getDate: function() {
			return this._utc_to_local(this.getUTCDate());
		},

		getUTCDate: function() {
			return new Date(this.dates.get(-1));
		},

		setDates: function() {
			var args = $.isArray(arguments[0]) ? arguments[0] : arguments;
			this.update.apply(this, args);
			this._trigger('changeDate');
			this.setValue();
		},

		setUTCDates: function() {
			var args = $.isArray(arguments[0]) ? arguments[0] : arguments;
			this.update.apply(this, $.map(args, this._utc_to_local));
			this._trigger('changeDate');
			this.setValue();
		},

		setDate: alias('setDates'),
		setUTCDate: alias('setUTCDates'),

		setValue: function() {
			var formatted = this.getFormattedDate();
			if (!this.isInput) {
				if (this.component) {
					this.element.find('input').val(formatted).change();
				}
			} else {
				this.element.val(formatted).change();
			}
		},

		setTimeValue: function() {
			var val, minute, hour, time, element;
			time = {
				hour: (new Date()).getHours(),
				minute: (new Date()).getMinutes()
			};
			if (this.isInput) {
				element = this.element;
			} else if (this.component) {
				element = this.element.find('input');
			}
			if (element) {

				val = $.trim(element.val());
				if (val) {
					var tokens = val.split(" "); //datetime
					if (tokens.length === 2) {
						val = tokens[1];
					}
				}
				val = val.split(':');
				for (var i = val.length - 1; i >= 0; i--) {
					val[i] = $.trim(val[i]);
				}
				if (val.length === 2) {
					minute = parseInt(val[1], 10);
					if (minute >= 0 && minute < 60) {
						time.minute = minute;
					}
					hour = parseInt(val[0].slice(-2), 10);
					if (hour >= 0 && hour < 24) {
						time.hour = hour;
					}
				}
			}
			this.timepickerContainer.data("time", time.hour + ":" + time.minute);
		},

		getFormattedDate: function(format) {
			if (format === undefined)
				format = this.o.format;

			var lang = this.o.language;
			var text = $.map(this.dates, function(d) {
				return DPGlobal.formatDate(d, format, lang);
			}).join(this.o.multidateSeparator);
			if (this.o.timepicker) {
				if (!text) {
					text = DPGlobal.formatDate(new Date(), format, lang);
				}
				text = text + " " + this.timepickerContainer.data('time');
			}
			return text;
		},

		setStartDate: function(startDate) {
			this._process_options({
				startDate: startDate
			});
			this.update();
			this.updateNavArrows();
		},

		setEndDate: function(endDate) {
			this._process_options({
				endDate: endDate
			});
			this.update();
			this.updateNavArrows();
		},

		setDaysOfWeekDisabled: function(daysOfWeekDisabled) {
			this._process_options({
				daysOfWeekDisabled: daysOfWeekDisabled
			});
			this.update();
			this.updateNavArrows();
		},

		place: function() {
			if (this.isInline)
				return;
			var calendarWidth = this.picker.outerWidth(),
				calendarHeight = this.picker.outerHeight(),
				visualPadding = 10,
				windowWidth = $window.width(),
				windowHeight = $window.height(),
				scrollTop = $window.scrollTop();

			var zIndex = parseInt(this.element.parents().filter(function() {
				return $(this).css('z-index') !== 'auto';
			}).first().css('z-index')) + 10;
			var offset = this.component ? this.component.parent().offset() : this.element.offset();
			var height = this.component ? this.component.outerHeight(true) : this.element.outerHeight(false);
			var width = this.component ? this.component.outerWidth(true) : this.element.outerWidth(false);
			var left = offset.left,
				top = offset.top;

			this.picker.removeClass(
				'datepicker-orient-top datepicker-orient-bottom ' +
				'datepicker-orient-right datepicker-orient-left'
			);

			if (this.o.orientation.x !== 'auto') {
				this.picker.addClass('datepicker-orient-' + this.o.orientation.x);
				if (this.o.orientation.x === 'right')
					left -= calendarWidth - width;
			}
			// auto x orientation is best-placement: if it crosses a window
			// edge, fudge it sideways
			else {
				// Default to left
				this.picker.addClass('datepicker-orient-left');
				if (offset.left < 0)
					left -= offset.left - visualPadding;
				else if (offset.left + calendarWidth > windowWidth)
					left = windowWidth - calendarWidth - visualPadding;
			}

			// auto y orientation is best-situation: top or bottom, no fudging,
			// decision based on which shows more of the calendar
			var yorient = this.o.orientation.y,
				top_overflow, bottom_overflow;
			if (yorient === 'auto') {
				top_overflow = -scrollTop + offset.top - calendarHeight;
				bottom_overflow = scrollTop + windowHeight - (offset.top + height + calendarHeight);
				if (Math.max(top_overflow, bottom_overflow) === bottom_overflow)
					yorient = 'top';
				else
					yorient = 'bottom';
			}
			this.picker.addClass('datepicker-orient-' + yorient);
			if (yorient === 'top')
				top += height + 6;
			else
				top -= calendarHeight + parseInt(this.picker.css('padding-top')) + 6;

			this.picker.css({
				top: top,
				left: left,
				zIndex: zIndex
			});
		},
		_getTime:function(date){
			var h,m;
			date  = new Date(date);
			h = date.getHours();
			if (h<10) {
				h = "0" + h;
			}
			m = date.getMinutes();
			if (m<10) {
				m = "0" + m;
			}
			return h + ":" + m;
		},
		_allow_update: true,
		update: function() {
			if (!this._allow_update)
				return;

			var oldDates = this.dates.copy(),
				dates = [],
				fromArgs = false;
			if (arguments.length) {
				$.each(arguments, $.proxy(function(i, date) {
					//获取第一个的时间,用来update 时间
					if (this.o.timepicker&&i === 0) {

						this.timepicker.update(this._getTime(date)); //不要更新input
					}
					if (date instanceof Date)
						date = this._local_to_utc(date);
					else if(typeof date == "string" && this.o.timepicker){
						date = date.split(" ")[0];
					}
					dates.push(date);
				}, this));
				fromArgs = true;



			} else {
				dates = this.isInput ? this.element.val() : this.element.data('date') || this.element.find('input').val();
				if (dates&&this.o.timepicker) {//合体模式
					var tokens = dates.split(" ");
					if (tokens.length === 2) {  //有时间
						dates = tokens[0];
						//调用timepicker 的_updateUI
						this.timepicker.update(tokens[1],true); //不要更新input
					}
				}
				if (dates && this.o.multidate)
					dates = dates.split(this.o.multidateSeparator);
				else
					dates = [dates];
				delete this.element.data().date;
			}

			dates = $.map(dates, $.proxy(function(date) {
				return DPGlobal.parseDate(date, this.o.format, this.o.language);
			}, this));
			dates = $.grep(dates, $.proxy(function(date) {
				return (
					date < this.o.startDate ||
					date > this.o.endDate ||
					!date
				);
			}, this), true);
			this.dates.replace(dates);

			if (this.dates.length)
				this.viewDate = new Date(this.dates.get(-1));
			else if (this.viewDate < this.o.startDate)
				this.viewDate = new Date(this.o.startDate);
			else if (this.viewDate > this.o.endDate)
				this.viewDate = new Date(this.o.endDate);

			if (fromArgs) {
				// setting date by clicking
				this.setValue();
			} else if (dates.length) {
				// setting date by typing
				if (String(oldDates) !== String(this.dates))
					this._trigger('changeDate');
			}
			if (!this.dates.length && oldDates.length)
				this._trigger('clearDate');

			this.fill();
		},

		fillDow: function() {
			var dowCnt = this.o.weekStart,
				html = '<tr class="week-content">';
			if (this.o.calendarWeeks) {
				var cell = '<th class="cw">&nbsp;</th>';
				html += cell;
				this.picker.find('.datepicker-days thead tr:first-child').prepend(cell);
			}
			while (dowCnt < this.o.weekStart + 7) {
				html += '<th class="dow">' + dates[this.o.language].daysMin[(dowCnt++) % 7] + '</th>';
			}
			html += '</tr>';
			this.picker.find('.datepicker-days thead').append(html);
		},

		fillMonths: function() {
			var html = '',
				i = 0;
			while (i < 12) {
				html += '<span class="month">' + dates[this.o.language].monthsShort[i++] + '</span>';
			}
			this.picker.find('.datepicker-months td').html(html);
		},

		setRange: function(range) {
			if (!range || !range.length)
				delete this.range;
			else
				this.range = $.map(range, function(d) {
					return d.valueOf();
				});
			this.fill();
		},

		getClassNames: function(date) {
			var cls = [],
				year = this.viewDate.getUTCFullYear(),
				month = this.viewDate.getUTCMonth(),
				today = new Date();
			if (date.getUTCFullYear() < year || (date.getUTCFullYear() === year && date.getUTCMonth() < month)) {
				cls.push('old');
			} else if (date.getUTCFullYear() > year || (date.getUTCFullYear() === year && date.getUTCMonth() > month)) {
				cls.push('new');
			}
			if (this.focusDate && date.valueOf() === this.focusDate.valueOf())
				cls.push('focused');
			// Compare internal UTC date with local today, not UTC today
			if (this.o.todayHighlight &&
				date.getUTCFullYear() === today.getFullYear() &&
				date.getUTCMonth() === today.getMonth() &&
				date.getUTCDate() === today.getDate()) {
				cls.push('today');
			}
			if (this.dates.contains(date) !== -1)
				cls.push('active');
			if (date.valueOf() < this.o.startDate || date.valueOf() > this.o.endDate ||
				$.inArray(date.getUTCDay(), this.o.daysOfWeekDisabled) !== -1) {
				cls.push('disabled');
			}
			if (this.range) {
				if (date > this.range[0] && date < this.range[this.range.length - 1]) {
					cls.push('range');
				}
				if ($.inArray(date.valueOf(), this.range) !== -1) {
					cls.push('selected');
				}
			}
			return cls;
		},

		fill: function() {
			var d = new Date(this.viewDate),
				year = d.getUTCFullYear(),
				month = d.getUTCMonth(),
				startYear = this.o.startDate !== -Infinity ? this.o.startDate.getUTCFullYear() : -Infinity,
				startMonth = this.o.startDate !== -Infinity ? this.o.startDate.getUTCMonth() : -Infinity,
				endYear = this.o.endDate !== Infinity ? this.o.endDate.getUTCFullYear() : Infinity,
				endMonth = this.o.endDate !== Infinity ? this.o.endDate.getUTCMonth() : Infinity,
				todaytxt = dates[this.o.language].today || dates['en'].today || '',
				cleartxt = dates[this.o.language].clear || dates['en'].clear || '',
				tooltip;
			this.picker.find('.datepicker-days thead th.datepicker-switch')
				.text(year + '年 ' + dates[this.o.language].months[month]);
			this.picker.find('tfoot th.today')
				.text(todaytxt)
				.toggle(this.o.todayBtn !== false);
			this.picker.find('tfoot th.clear')
				.text(cleartxt)
				.toggle(this.o.clearBtn !== false);
			this.updateNavArrows();
			this.fillMonths();
			var prevMonth = UTCDate(year, month - 1, 28),
				day = DPGlobal.getDaysInMonth(prevMonth.getUTCFullYear(), prevMonth.getUTCMonth());
			prevMonth.setUTCDate(day);
			prevMonth.setUTCDate(day - (prevMonth.getUTCDay() - this.o.weekStart + 7) % 7);
			var nextMonth = new Date(prevMonth);
			nextMonth.setUTCDate(nextMonth.getUTCDate() + 42);
			nextMonth = nextMonth.valueOf();
			var html = [];
			var clsName;
			while (prevMonth.valueOf() < nextMonth) {
				if (prevMonth.getUTCDay() === this.o.weekStart) {
					html.push('<tr>');
					if (this.o.calendarWeeks) {
						// ISO 8601: First week contains first thursday.
						// ISO also states week starts on Monday, but we can be more abstract here.
						var
						// Start of current week: based on weekstart/current date
							ws = new Date(+prevMonth + (this.o.weekStart - prevMonth.getUTCDay() - 7) % 7 * 864e5),
							// Thursday of this week
							th = new Date(Number(ws) + (7 + 4 - ws.getUTCDay()) % 7 * 864e5),
							// First Thursday of year, year from thursday
							yth = new Date(Number(yth = UTCDate(th.getUTCFullYear(), 0, 1)) + (7 + 4 - yth.getUTCDay()) % 7 * 864e5),
							// Calendar week: ms between thursdays, div ms per day, div 7 days
							calWeek = (th - yth) / 864e5 / 7 + 1;
						html.push('<td class="cw">' + calWeek + '</td>');

					}
				}
				clsName = this.getClassNames(prevMonth);
				clsName.push('day');

				if (this.o.beforeShowDay !== $.noop) {
					var before = this.o.beforeShowDay(this._utc_to_local(prevMonth));
					if (before === undefined)
						before = {};
					else if (typeof(before) === 'boolean')
						before = {
							enabled: before
						};
					else if (typeof(before) === 'string')
						before = {
							classes: before
						};
					if (before.enabled === false)
						clsName.push('disabled');
					if (before.classes)
						clsName = clsName.concat(before.classes.split(/\s+/));
					if (before.tooltip)
						tooltip = before.tooltip;
				}

				clsName = $.unique(clsName);
				var currentDate;
				var today = new Date();
				if (this.o.todayHighlight &&
					prevMonth.getUTCFullYear() === today.getFullYear() &&
					prevMonth.getUTCMonth() === today.getMonth() &&
					prevMonth.getUTCDate() === today.getDate()) {
					currentDate = '今日';
				} else {
					currentDate = prevMonth.getUTCDate();
				}
				html.push('<td class="' + clsName.join(' ') + '"' + (tooltip ? ' title="' + tooltip + '"' : '') + 'data-day="' + prevMonth.getUTCDate() + '"' + '>' + currentDate + '</td>');
				if (prevMonth.getUTCDay() === this.o.weekEnd) {
					html.push('</tr>');
				}
				prevMonth.setUTCDate(prevMonth.getUTCDate() + 1);
			}
			this.picker.find('.datepicker-days tbody').empty().append(html.join(''));

			var months = this.picker.find('.datepicker-months')
				.find('th:eq(1)')
				.text(year)
				.end()
				.find('span').removeClass('active');

			$.each(this.dates, function(i, d) {
				if (d.getUTCFullYear() === year)
					months.eq(d.getUTCMonth()).addClass('active');
			});

			if (year < startYear || year > endYear) {
				months.addClass('disabled');
			}
			if (year === startYear) {
				months.slice(0, startMonth).addClass('disabled');
			}
			if (year === endYear) {
				months.slice(endMonth + 1).addClass('disabled');
			}

			html = '';
			year = parseInt(year / 10, 10) * 10;
			var yearCont = this.picker.find('.datepicker-years')
				.find('th:eq(1)')
				.text(year + '-' + (year + 9))
				.end()
				.find('td');
			year -= 1;
			var years = $.map(this.dates, function(d) {
					return d.getUTCFullYear();
				}),
				classes;
			for (var i = -1; i < 11; i++) {
				classes = ['year'];
				if (i === -1)
					classes.push('old');
				else if (i === 10)
					classes.push('new');
				if ($.inArray(year, years) !== -1)
					classes.push('active');
				if (year < startYear || year > endYear)
					classes.push('disabled');
				html += '<span class="' + classes.join(' ') + '">' + year + '</span>';
				year += 1;
			}
			yearCont.html(html);
		},

		updateNavArrows: function() {
			if (!this._allow_update)
				return;

			var d = new Date(this.viewDate),
				year = d.getUTCFullYear(),
				month = d.getUTCMonth();
			switch (this.viewMode) {
				case 0:
					if (this.o.startDate !== -Infinity && year <= this.o.startDate.getUTCFullYear() && month <= this.o.startDate.getUTCMonth()) {
						this.picker.find('.prev').css({
							visibility: 'hidden'
						});
					} else {
						this.picker.find('.prev').css({
							visibility: 'visible'
						});
					}
					if (this.o.endDate !== Infinity && year >= this.o.endDate.getUTCFullYear() && month >= this.o.endDate.getUTCMonth()) {
						this.picker.find('.next').css({
							visibility: 'hidden'
						});
					} else {
						this.picker.find('.next').css({
							visibility: 'visible'
						});
					}
					break;
				case 1:
				case 2:
					if (this.o.startDate !== -Infinity && year <= this.o.startDate.getUTCFullYear()) {
						this.picker.find('.prev').css({
							visibility: 'hidden'
						});
					} else {
						this.picker.find('.prev').css({
							visibility: 'visible'
						});
					}
					if (this.o.endDate !== Infinity && year >= this.o.endDate.getUTCFullYear()) {
						this.picker.find('.next').css({
							visibility: 'hidden'
						});
					} else {
						this.picker.find('.next').css({
							visibility: 'visible'
						});
					}
					break;
			}
		},

		click: function(e) {
			e.preventDefault();
			if ($(e.target).parents(".timepicker-container")[0]) {
				return;
			}
			var target = $(e.target).closest('span, td, th'),
				year, month, day;
			if (target.length === 1) {
				switch (target[0].nodeName.toLowerCase()) {
					case 'th':
						switch (target[0].className) {
							case 'datepicker-switch':
								this.showMode(1);
								break;
							case 'prev':
							case 'next':
								var dir = DPGlobal.modes[this.viewMode].navStep * (target[0].className === 'prev' ? -1 : 1);
								switch (this.viewMode) {
									case 0:
										this.viewDate = this.moveMonth(this.viewDate, dir);
										this._trigger('changeMonth', this.viewDate);
										break;
									case 1:
									case 2:
										this.viewDate = this.moveYear(this.viewDate, dir);
										if (this.viewMode === 1)
											this._trigger('changeYear', this.viewDate);
										break;
								}
								this.fill();
								break;
							case 'today':
								var date = new Date();
								date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);

								this.showMode(-2);
								var which = this.o.todayBtn === 'linked' ? null : 'view';
								this._setDate(date, which);
								break;
							case 'clear':
								var element;
								if (this.isInput)
									element = this.element;
								else if (this.component)
									element = this.element.find('input');
								if (element)
									element.val("").change();
								this.update();
								this._trigger('changeDate');
								if (this.o.autoclose)
									this.hide();
								break;
						}
						break;
					case 'span':
						if (!target.is('.disabled') && !target.is('[data-num]')) {
							this.viewDate.setUTCDate(1);
							if (target.is('.month')) {
								day = 1;
								month = target.parent().find('span').index(target);
								year = this.viewDate.getUTCFullYear();
								this.viewDate.setUTCMonth(month);
								this._trigger('changeMonth', this.viewDate);
								if (this.o.minViewMode === 1) {
									this._setDate(UTCDate(year, month, day));
								}
							} else {
								day = 1;
								month = 0;
								year = parseInt(target.text(), 10) || 0;
								this.viewDate.setUTCFullYear(year);
								this._trigger('changeYear', this.viewDate);
								if (this.o.minViewMode === 2) {
									this._setDate(UTCDate(year, month, day));
								}
							}
							this.showMode(-1);
							this.fill();
						}
						break;
					case 'td':
						if (target.is('.day') && !target.is('.disabled')) {
							day = target.data('day');
							day = parseInt(day, 10) || 1;
							year = this.viewDate.getUTCFullYear();
							month = this.viewDate.getUTCMonth();
							if (target.is('.old')) {
								if (month === 0) {
									month = 11;
									year -= 1;
								} else {
									month -= 1;
								}
							} else if (target.is('.new')) {
								if (month === 11) {
									month = 0;
									year += 1;
								} else {
									month += 1;
								}
							}
							this._setDate(UTCDate(year, month, day));
						}
						break;
				}
			}
			if (this.picker.is(':visible') && this._focused_from) {
				$(this._focused_from).focus();
			}
			delete this._focused_from;
		},

		_toggle_multidate: function(date) {
			var ix = this.dates.contains(date);
			if (!date) {
				this.dates.clear();
			} else if (ix !== -1) {
				this.dates.remove(ix);
			} else {
				this.dates.push(date);
			}
			if (typeof this.o.multidate === 'number')
				while (this.dates.length > this.o.multidate)
					this.dates.remove(0);
		},

		_setDate: function(date, which) {
			if (!which || which === 'date')
				this._toggle_multidate(date && new Date(date));
			if (!which || which === 'view')
				this.viewDate = date && new Date(date);

			this.fill();
			this.setValue();
			this._trigger('changeDate');
			var element;
			if (this.isInput) {
				element = this.element;
			} else if (this.component) {
				element = this.element.find('input');
			}
			if (element) {
				element.change();
			}
			if (this.o.autoclose && (!which || which === 'date')) {
				this.hide();
			}
		},

		moveMonth: function(date, dir) {
			if (!date)
				return undefined;
			if (!dir)
				return date;
			var new_date = new Date(date.valueOf()),
				day = new_date.getUTCDate(),
				month = new_date.getUTCMonth(),
				mag = Math.abs(dir),
				new_month, test;
			dir = dir > 0 ? 1 : -1;
			if (mag === 1) {
				test = dir === -1
				// If going back one month, make sure month is not current month
				// (eg, Mar 31 -> Feb 31 == Feb 28, not Mar 02)
				? function() {
					return new_date.getUTCMonth() === month;
				}
				// If going forward one month, make sure month is as expected
				// (eg, Jan 31 -> Feb 31 == Feb 28, not Mar 02)
				: function() {
					return new_date.getUTCMonth() !== new_month;
				};
				new_month = month + dir;
				new_date.setUTCMonth(new_month);
				// Dec -> Jan (12) or Jan -> Dec (-1) -- limit expected date to 0-11
				if (new_month < 0 || new_month > 11)
					new_month = (new_month + 12) % 12;
			} else {
				// For magnitudes >1, move one month at a time...
				for (var i = 0; i < mag; i++)
				// ...which might decrease the day (eg, Jan 31 to Feb 28, etc)...
					new_date = this.moveMonth(new_date, dir);
				// ...then reset the day, keeping it in the new month
				new_month = new_date.getUTCMonth();
				new_date.setUTCDate(day);
				test = function() {
					return new_month !== new_date.getUTCMonth();
				};
			}
			// Common date-resetting loop -- if date is beyond end of month, make it
			// end of month
			while (test()) {
				new_date.setUTCDate(--day);
				new_date.setUTCMonth(new_month);
			}
			return new_date;
		},

		moveYear: function(date, dir) {
			return this.moveMonth(date, dir * 12);
		},

		dateWithinRange: function(date) {
			return date >= this.o.startDate && date <= this.o.endDate;
		},

		keydown: function(e) {
			if (this.picker.is(':not(:visible)')) {
				if (e.keyCode === 27) // allow escape to hide and re-show picker
					this.show();
				return;
			}
			var dateChanged = false,
				dir, newDate, newViewDate,
				focusDate = this.focusDate || this.viewDate;
			switch (e.keyCode) {
				case 27: // escape
					if (this.focusDate) {
						this.focusDate = null;
						this.viewDate = this.dates.get(-1) || this.viewDate;
						this.fill();
					} else
						this.hide();
					e.preventDefault();
					break;
				case 37: // left
				case 39: // right
					if (!this.o.keyboardNavigation)
						break;
					dir = e.keyCode === 37 ? -1 : 1;
					if (e.ctrlKey) {
						newDate = this.moveYear(this.dates.get(-1) || UTCToday(), dir);
						newViewDate = this.moveYear(focusDate, dir);
						this._trigger('changeYear', this.viewDate);
					} else if (e.shiftKey) {
						newDate = this.moveMonth(this.dates.get(-1) || UTCToday(), dir);
						newViewDate = this.moveMonth(focusDate, dir);
						this._trigger('changeMonth', this.viewDate);
					} else {
						newDate = new Date(this.dates.get(-1) || UTCToday());
						newDate.setUTCDate(newDate.getUTCDate() + dir);
						newViewDate = new Date(focusDate);
						newViewDate.setUTCDate(focusDate.getUTCDate() + dir);
					}
					if (this.dateWithinRange(newDate)) {
						this.focusDate = this.viewDate = newViewDate;
						this.setValue();
						this.fill();
						e.preventDefault();
					}
					break;
				case 38: // up
				case 40: // down
					if (!this.o.keyboardNavigation)
						break;
					dir = e.keyCode === 38 ? -1 : 1;
					if (e.ctrlKey) {
						newDate = this.moveYear(this.dates.get(-1) || UTCToday(), dir);
						newViewDate = this.moveYear(focusDate, dir);
						this._trigger('changeYear', this.viewDate);
					} else if (e.shiftKey) {
						newDate = this.moveMonth(this.dates.get(-1) || UTCToday(), dir);
						newViewDate = this.moveMonth(focusDate, dir);
						this._trigger('changeMonth', this.viewDate);
					} else {
						newDate = new Date(this.dates.get(-1) || UTCToday());
						newDate.setUTCDate(newDate.getUTCDate() + dir * 7);
						newViewDate = new Date(focusDate);
						newViewDate.setUTCDate(focusDate.getUTCDate() + dir * 7);
					}
					if (this.dateWithinRange(newDate)) {
						this.focusDate = this.viewDate = newViewDate;
						this.setValue();
						this.fill();
						e.preventDefault();
					}
					break;
				case 32: // spacebar
					// Spacebar is used in manually typing dates in some formats.
					// As such, its behavior should not be hijacked.
					break;
				case 13: // enter
					focusDate = this.focusDate || this.dates.get(-1) || this.viewDate;
					this._toggle_multidate(focusDate);
					dateChanged = true;
					this.focusDate = null;
					this.viewDate = this.dates.get(-1) || this.viewDate;
					this.setValue();
					this.fill();
					if (this.picker.is(':visible')) {
						e.preventDefault();
						if (this.o.autoclose)
							this.hide();
					}
					break;
				case 9: // tab
					this.focusDate = null;
					this.viewDate = this.dates.get(-1) || this.viewDate;
					this.fill();
					this.hide();
					break;
			}
			if (dateChanged) {
				if (this.dates.length)
					this._trigger('changeDate');
				else
					this._trigger('clearDate');
				var element;
				if (this.isInput) {
					element = this.element;
				} else if (this.component) {
					element = this.element.find('input');
				}
				if (element) {
					element.change();
				}
			}
		},

		showMode: function(dir) {
			if (dir) {
				this.viewMode = Math.max(this.o.minViewMode, Math.min(2, this.viewMode + dir));
			}
			this.picker
				.find('>div')
				.hide()
				.filter('.datepicker-' + DPGlobal.modes[this.viewMode].clsName)
				.css('display', 'block');
			this.updateNavArrows();
		}
	};

	var DateRangePicker = function(element, options) {
		this.element = $(element);
		this.inputs = $.map(options.inputs, function(i) {
			return i.jquery ? i[0] : i;
		});
		delete options.inputs;

		$(this.inputs)
			.datepicker(options)
			.bind('changeDate', $.proxy(this.dateUpdated, this));

		this.pickers = $.map(this.inputs, function(i) {
			return $(i).data('datepicker');
		});
		this.updateDates();
	};
	DateRangePicker.prototype = {
		updateDates: function() {
			this.dates = $.map(this.pickers, function(i) {
				return i.getUTCDate();
			});
			this.updateRanges();
		},
		updateRanges: function() {
			var range = $.map(this.dates, function(d) {
				return d.valueOf();
			});
			$.each(this.pickers, function(i, p) {
				p.setRange(range);
			});
		},
		dateUpdated: function(e) {
			// `this.updating` is a workaround for preventing infinite recursion
			// between `changeDate` triggering and `setUTCDate` calling.  Until
			// there is a better mechanism.
			if (this.updating)
				return;
			this.updating = true;

			var dp = $(e.target).data('datepicker'),
				new_date = dp.getUTCDate(),
				i = $.inArray(e.target, this.inputs),
				l = this.inputs.length;
			if (i === -1)
				return;

			$.each(this.pickers, function(i, p) {
				if (!p.getUTCDate())
					p.setUTCDate(new_date);
			});

			//临时修复选择后面的日期不会自动修正前面日期的bug
			var j = 0;
			for (j = 0; j < this.pickers.length; j++) {
				this.dates[j] = this.pickers[j].getDate();
			}
			j = i - 1;
			while (j >= 0 && new_date < this.dates[j]) {
				this.pickers[j--].setUTCDate(new_date);
			}

			if (new_date < this.dates[i]) {
				// Date being moved earlier/left
				while (i >= 0 && new_date < this.dates[i]) {
					this.pickers[i--].setUTCDate(new_date);
				}
			} else if (new_date > this.dates[i]) {
				// Date being moved later/right
				while (i < l && new_date > this.dates[i]) {
					this.pickers[i++].setUTCDate(new_date);
				}
			}
			this.updateDates();

			delete this.updating;
		},
		remove: function() {
			$.map(this.pickers, function(p) {
				p.remove();
			});
			delete this.element.data().datepicker;
		}
	};

	function opts_from_el(el, prefix) {
		// Derive options from element data-attrs
		var data = $(el).data(),
			out = {},
			inkey,
			replace = new RegExp('^' + prefix.toLowerCase() + '([A-Z])');
		prefix = new RegExp('^' + prefix.toLowerCase());

		function re_lower(_, a) {
			return a.toLowerCase();
		}
		for (var key in data)
			if (prefix.test(key)) {
				inkey = key.replace(replace, re_lower);
				out[inkey] = data[key];
			}
		return out;
	}

	function opts_from_locale(lang) {
		// Derive options from locale plugins
		var out = {};
		// Check if "de-DE" style date is available, if not language should
		// fallback to 2 letter code eg "de"
		if (!dates[lang]) {
			lang = lang.split('-')[0];
			if (!dates[lang])
				return;
		}
		var d = dates[lang];
		$.each(locale_opts, function(i, k) {
			if (k in d)
				out[k] = d[k];
		});
		return out;
	}

	var old = $.fn.datepicker;
	$.fn.datepicker = function(option) {
		var args = Array.apply(null, arguments);
		args.shift();
		var internal_return;
		this.each(function() {
			var $this = $(this),
				data = $this.data('datepicker'),
				options = typeof option === 'object' && option;
			if (!data) {
				var elopts = opts_from_el(this, 'date'),
					// Preliminary otions
					xopts = $.extend({}, defaults, elopts, options),
					locopts = opts_from_locale(xopts.language),
					// Options priority: js args, data-attrs, locales, defaults
					opts = $.extend({}, defaults, locopts, elopts, options);
				if ($this.is('.input-daterange') || opts.inputs) {
					var ropts = {
						inputs: opts.inputs || $this.find('input').toArray()
					};
					$this.data('datepicker', (data = new DateRangePicker(this, $.extend(opts, ropts))));
				} else {
					$this.data('datepicker', (data = new Datepicker(this, opts)));
				}
			}
			if (typeof option === 'string' && typeof data[option] === 'function') {
				internal_return = data[option].apply(data, args);
				if (internal_return !== undefined)
					return false;
			}
		});
		if (internal_return !== undefined)
			return internal_return;
		else
			return this;
	};

	var defaults = $.fn.datepicker.defaults = {
		autoclose: true,
		beforeShowDay: $.noop,
		calendarWeeks: false,
		clearBtn: false,
		daysOfWeekDisabled: [],
		endDate: Infinity,
		forceParse: true,
		format: 'yyyy-mm-dd',
		keyboardNavigation: true,
		language: 'zh-CN',
		minViewMode: 0,
		multidate: false,
		multidateSeparator: ',',
		orientation: "auto",
		rtl: false,
		size: '',
		startDate: -Infinity,
		startView: 0,
		todayBtn: false,
		todayHighlight: true,
		weekStart: 0,
		timepicker: false
	};
	var locale_opts = $.fn.datepicker.locale_opts = [
		'format',
		'rtl',
		'weekStart'
	];
	$.fn.datepicker.Constructor = Datepicker;
	var dates = $.fn.datepicker.dates = {
		"en": {
			days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
			daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
			daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
			months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
			monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
			today: "Today",
			clear: "Clear"
		},
		"zh-CN": {
			days: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"],
			daysShort: ["周日", "周一", "周二", "周三", "周四", "周五", "周六", "周日"],
			daysMin: ["日", "一", "二", "三", "四", "五", "六", "日"],
			months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
			monthsShort: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
			today: "今日",
			weekStart: 0
		}
	};

	var DPGlobal = {
		modes: [{
			clsName: 'days',
			navFnc: 'Month',
			navStep: 1
		}, {
			clsName: 'months',
			navFnc: 'FullYear',
			navStep: 1
		}, {
			clsName: 'years',
			navFnc: 'FullYear',
			navStep: 10
		}],
		isLeapYear: function(year) {
			return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
		},
		getDaysInMonth: function(year, month) {
			return [31, (DPGlobal.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
		},
		validParts: /dd?|DD?|mm?|MM?|yy(?:yy)?/g,
		nonpunctuation: /[^ -\/:-@\[\u3400-\u9fff-`{-~\t\n\r]+/g,
		parseFormat: function(format) {
			// IE treats \0 as a string end in inputs (truncating the value),
			// so it's a bad format delimiter, anyway
			var separators = format.replace(this.validParts, '\0').split('\0'),
				parts = format.match(this.validParts);
			if (!separators || !separators.length || !parts || parts.length === 0) {
				throw new Error("Invalid date format.");
			}
			return {
				separators: separators,
				parts: parts
			};
		},
		parseDate: function(date, format, language) {
			if (!date)
				return undefined;
			if (date instanceof Date)
				return date;
			if (typeof format === 'string')
				format = DPGlobal.parseFormat(format);
			var part_re = /([\-+]\d+)([dmwy])/,
				parts = date.match(/([\-+]\d+)([dmwy])/g),
				part, dir, i;
			if (/^[\-+]\d+[dmwy]([\s,]+[\-+]\d+[dmwy])*$/.test(date)) {
				date = new Date();
				for (i = 0; i < parts.length; i++) {
					part = part_re.exec(parts[i]);
					dir = parseInt(part[1]);
					switch (part[2]) {
						case 'd':
							date.setUTCDate(date.getUTCDate() + dir);
							break;
						case 'm':
							date = Datepicker.prototype.moveMonth.call(Datepicker.prototype, date, dir);
							break;
						case 'w':
							date.setUTCDate(date.getUTCDate() + dir * 7);
							break;
						case 'y':
							date = Datepicker.prototype.moveYear.call(Datepicker.prototype, date, dir);
							break;
					}
				}
				return UTCDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0);
			}
			parts = date && date.match(this.nonpunctuation) || [];
			date = new Date();
			var parsed = {},
				setters_order = ['yyyy', 'yy', 'M', 'MM', 'm', 'mm', 'd', 'dd'],
				setters_map = {
					yyyy: function(d, v) {
						return d.setUTCFullYear(v);
					},
					yy: function(d, v) {
						return d.setUTCFullYear(2000 + v);
					},
					m: function(d, v) {
						if (isNaN(d))
							return d;
						v -= 1;
						while (v < 0) v += 12;
						v %= 12;
						d.setUTCMonth(v);
						while (d.getUTCMonth() !== v)
							d.setUTCDate(d.getUTCDate() - 1);
						return d;
					},
					d: function(d, v) {
						return d.setUTCDate(v);
					}
				},
				val, filtered;
			setters_map['M'] = setters_map['MM'] = setters_map['mm'] = setters_map['m'];
			setters_map['dd'] = setters_map['d'];
			date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
			var fparts = format.parts.slice();
			// Remove noop parts
			if (parts.length !== fparts.length) {
				fparts = $(fparts).filter(function(i, p) {
					return $.inArray(p, setters_order) !== -1;
				}).toArray();
			}
			// Process remainder
			function match_part() {
        /*jshint validthis: true */
				var m = this.slice(0, parts[i].length),
					p = parts[i].slice(0, m.length);
				return m === p;
			}
			if (parts.length === fparts.length) {
				var cnt;
				for (i = 0, cnt = fparts.length; i < cnt; i++) {
					val = parseInt(parts[i], 10);
					part = fparts[i];
					if (isNaN(val)) {
						switch (part) {
							case 'MM':
								filtered = $(dates[language].months).filter(match_part);
								val = $.inArray(filtered[0], dates[language].months) + 1;
								break;
							case 'M':
								filtered = $(dates[language].monthsShort).filter(match_part);
								val = $.inArray(filtered[0], dates[language].monthsShort) + 1;
								break;
						}
					}
					parsed[part] = val;
				}
				var _date, s;
				for (i = 0; i < setters_order.length; i++) {
					s = setters_order[i];
					if (s in parsed && !isNaN(parsed[s])) {
						_date = new Date(date);
						setters_map[s](_date, parsed[s]);
						if (!isNaN(_date))
							date = _date;
					}
				}
			}
			return date;
		},
		formatDate: function(date, format, language) {
			if (!date)
				return '';
			if (typeof format === 'string')
				format = DPGlobal.parseFormat(format);
			var val = {
				d: date.getUTCDate(),
				D: dates[language].daysShort[date.getUTCDay()],
				DD: dates[language].days[date.getUTCDay()],
				m: date.getUTCMonth() + 1,
				M: dates[language].monthsShort[date.getUTCMonth()],
				MM: dates[language].months[date.getUTCMonth()],
				yy: date.getUTCFullYear().toString().substring(2),
				yyyy: date.getUTCFullYear()
			};
			val.dd = (val.d < 10 ? '0' : '') + val.d;
			val.mm = (val.m < 10 ? '0' : '') + val.m;
			date = [];
			var seps = $.extend([], format.separators);
			for (var i = 0, cnt = format.parts.length; i <= cnt; i++) {
				if (seps.length)
					date.push(seps.shift());
				date.push(val[format.parts[i]]);
			}
			return date.join('');
		},
		headTemplate: '<thead>' +
			'<tr class="date-header">' +
			'<th class="prev"><b></b></th>' +
			'<th colspan="5" class="datepicker-switch"></th>' +
			'<th class="next"><b></b></th>' +
			'</tr>' +
			'</thead>',
		contTemplate: '<tbody><tr><td colspan="7"></td></tr></tbody>',
		footTemplate: '<tfoot>' +
			'<tr>' +
			'<th colspan="7" class="today"></th>' +
			'</tr>' +
			'<tr>' +
			'<th colspan="7" class="clear"></th>' +
			'</tr>' +
			'</tfoot>',
		timepicerTemplate: '<div class="timepicker-container"></div>'
	};
	DPGlobal.template = '<div class="datepicker">' +
		'<div class="datepicker-days clearfix">' +
		'<table class=" table-condensed">' +
		DPGlobal.headTemplate +
		'<tbody></tbody>' +
		DPGlobal.footTemplate +
		'</table>' +
		DPGlobal.timepicerTemplate +
		'</div>' +
		'<div class="datepicker-months">' +
		'<table class="table-condensed">' +
		DPGlobal.headTemplate +
		DPGlobal.contTemplate +
		DPGlobal.footTemplate +
		'</table>' +
		'</div>' +
		'<div class="datepicker-years">' +
		'<table class="table-condensed">' +
		DPGlobal.headTemplate +
		DPGlobal.contTemplate +
		DPGlobal.footTemplate +
		'</table>' +
		'</div>' +
		'</div>';

	$.fn.datepicker.DPGlobal = DPGlobal;


	/* DATEPICKER NO CONFLICT
	 * =================== */

	$.fn.datepicker.noConflict = function() {
		$.fn.datepicker = old;
		return this;
	};


	/* DATEPICKER DATA-API
	 * ================== */

	$(document).on(
		'focus.datepicker.data-api click.datepicker.data-api',
		'[data-toggle="datepicker"]',
		function(e) {
			var $this = $(this);
			if ($this.data('datepicker'))
				return;
			e.preventDefault();
			// component click requires us to explicitly show it
			$this.datepicker('show');
		}
	);
	$(function() {
		$('[data-toggle="datepicker-inline"]').datepicker();
	});

}(window.jQuery, undefined);

/*!
 * jQuery Validation Plugin v1.13.1
 *
 * http://jqueryvalidation.org/
 *
 * Copyright (c) 2014 Jörn Zaefferer
 * Released under the MIT license
 */
//jscs:disable
/*jshint sub:true*/
/*jshint -W065 */
! function( $ ) {
  "use strict";

$.extend($.fn, {
	// http://jqueryvalidation.org/validate/
	validate: function( options ) {

		// if nothing is selected, return nothing; can't chain anyway
		if ( !this.length ) {
			if ( options && options.debug && window.console ) {
				console.warn( "Nothing selected, can't validate, returning nothing." );
			}
			return;
		}

		// check if a validator for this form was already created
		var validator = $.data( this[ 0 ], "validator" );
		if ( validator ) {
			return validator;
		}

		// Add novalidate tag if HTML5.
		this.attr( "novalidate", "novalidate" );

		validator = new $.validator( options, this[ 0 ] );
		$.data( this[ 0 ], "validator", validator );

		if ( validator.settings.onsubmit ) {

			this.validateDelegate( ":submit", "click", function( event ) {
				if ( validator.settings.submitHandler ) {
					validator.submitButton = event.target;
				}
				// allow suppressing validation by adding a cancel class to the submit button
				if ( $( event.target ).hasClass( "cancel" ) ) {
					validator.cancelSubmit = true;
				}

				// allow suppressing validation by adding the html5 formnovalidate attribute to the submit button
				if ( $( event.target ).attr( "formnovalidate" ) !== undefined ) {
					validator.cancelSubmit = true;
				}
			});

			// validate the form on submit
			this.submit( function( event ) {
				if ( validator.settings.debug ) {
					// prevent form submit to be able to see console output
					event.preventDefault();
				}
				function handle() {
					var hidden, result;
					if ( validator.settings.submitHandler ) {
						if ( validator.submitButton ) {
							// insert a hidden input as a replacement for the missing submit button
							hidden = $( "<input type='hidden'/>" )
								.attr( "name", validator.submitButton.name )
								.val( $( validator.submitButton ).val() )
								.appendTo( validator.currentForm );
						}
						result = validator.settings.submitHandler.call( validator, validator.currentForm, event );
						if ( validator.submitButton ) {
							// and clean up afterwards; thanks to no-block-scope, hidden can be referenced
							hidden.remove();
						}
						if ( result !== undefined ) {
							return result;
						}
						return false;
					}
					return true;
				}

				// prevent submit for invalid forms or custom submit handlers
				if ( validator.cancelSubmit ) {
					validator.cancelSubmit = false;
					return handle();
				}
				if ( validator.form() ) {
					if ( validator.pendingRequest ) {
						validator.formSubmitted = true;
						return false;
					}
					return handle();
				} else {
					validator.focusInvalid();
					return false;
				}
			});
		}

		return validator;
	},
	// http://jqueryvalidation.org/valid/
	valid: function() {
		var valid, validator;

		if ( $( this[ 0 ] ).is( "form" ) ) {
			valid = this.validate().form();
		} else {
			valid = true;
			validator = $( this[ 0 ].form ).validate();
			this.each( function() {
				valid = validator.element( this ) && valid;
			});
		}
		return valid;
	},
	// attributes: space separated list of attributes to retrieve and remove
	removeAttrs: function( attributes ) {
		var result = {},
			$element = this;
		$.each( attributes.split( /\s/ ), function( index, value ) {
			result[ value ] = $element.attr( value );
			$element.removeAttr( value );
		});
		return result;
	},
	// http://jqueryvalidation.org/rules/
	rules: function( command, argument ) {
		var element = this[ 0 ],
			settings, staticRules, existingRules, data, param, filtered;

		if ( command ) {
			settings = $.data( element.form, "validator" ).settings;
			staticRules = settings.rules;
			existingRules = $.validator.staticRules( element );
			switch ( command ) {
			case "add":
				$.extend( existingRules, $.validator.normalizeRule( argument ) );
				// remove messages from rules, but allow them to be set separately
				delete existingRules.messages;
				staticRules[ element.name ] = existingRules;
				if ( argument.messages ) {
					settings.messages[ element.name ] = $.extend( settings.messages[ element.name ], argument.messages );
				}
				break;
			case "remove":
				if ( !argument ) {
					delete staticRules[ element.name ];
					return existingRules;
				}
				filtered = {};
				$.each( argument.split( /\s/ ), function( index, method ) {
					filtered[ method ] = existingRules[ method ];
					delete existingRules[ method ];
					if ( method === "required" ) {
						$( element ).removeAttr( "aria-required" );
					}
				});
				return filtered;
			}
		}

		data = $.validator.normalizeRules(
		$.extend(
			{},
			$.validator.classRules( element ),
			$.validator.attributeRules( element ),
			$.validator.dataRules( element ),
			$.validator.staticRules( element )
		), element );

		// make sure required is at front
		if ( data.required ) {
			param = data.required;
			delete data.required;
			data = $.extend( { required: param }, data );
			$( element ).attr( "aria-required", "true" );
		}

		// make sure remote is at back
		if ( data.remote ) {
			param = data.remote;
			delete data.remote;
			data = $.extend( data, { remote: param });
		}

		return data;
	}
});

// Custom selectors
$.extend( $.expr[ ":" ], {
	// http://jqueryvalidation.org/blank-selector/
	blank: function( a ) {
		return !$.trim( "" + $( a ).val() );
	},
	// http://jqueryvalidation.org/filled-selector/
	filled: function( a ) {
		return !!$.trim( "" + $( a ).val() );
	},
	// http://jqueryvalidation.org/unchecked-selector/
	unchecked: function( a ) {
		return !$( a ).prop( "checked" );
	}
});

// constructor for validator
$.validator = function( options, form ) {
	this.settings = $.extend( true, {}, $.validator.defaults, options );
	this.currentForm = form;
	this.init();
};

// http://jqueryvalidation.org/jQuery.validator.format/
$.validator.format = function( source, params ) {
	if ( arguments.length === 1 ) {
		return function() {
			var args = $.makeArray( arguments );
			args.unshift( source );
			return $.validator.format.apply( this, args );
		};
	}
	if ( arguments.length > 2 && params.constructor !== Array  ) {
		params = $.makeArray( arguments ).slice( 1 );
	}
	if ( params.constructor !== Array ) {
		params = [ params ];
	}
	$.each( params, function( i, n ) {
		source = source.replace( new RegExp( "\\{" + i + "\\}", "g" ), function() {
			return n;
		});
	});
	return source;
};

$.extend( $.validator, {

	defaults: {
		messages: {},
		groups: {},
		rules: {},
		errorClass: "has-error",
		validClass: "",
		errorElement: "label",
		errorElementClass: "text-danger form-control-static", //新配置，专门给错误消息设置的class
		focusCleanup: false,
		focusInvalid: true,
		errorContainer: $( [] ),
		errorLabelContainer: $( [] ),
		onsubmit: true,
		ignore: ":hidden",
		ignoreTitle: false,
		onfocusin: function( element ) {
			this.lastActive = element;

			// Hide error label and remove error class on focus if enabled
			if ( this.settings.focusCleanup ) {
				if ( this.settings.unhighlight ) {
					this.settings.unhighlight.call( this, element, this.settings.errorClass, this.settings.validClass );
				}
				this.hideThese( this.errorsFor( element ) );
			}
		},
		onfocusout: function( element ) {
			if ( !this.checkable( element ) && ( element.name in this.submitted || !this.optional( element ) ) ) {
				this.element( element );
			}
		},
		onkeyup: function( element, event ) {
			if ( event.which === 9 && this.elementValue( element ) === "" ) {
				return;
			} else if ( element.name in this.submitted || element === this.lastElement ) {
				this.element( element );
			}
		},
		onclick: function( element ) {
			// click on selects, radiobuttons and checkboxes
			if ( element.name in this.submitted ) {
				this.element( element );

			// or option elements, check parent select in that case
			} else if ( element.parentNode.name in this.submitted ) {
				this.element( element.parentNode );
			}
		},
		highlight: function( element, errorClass, validClass ) {
      var $group =  $(element).parents('.form-group');
      if($group[0]) {
        $group.addClass(errorClass).removeClass(validClass);
        return
      }
			if ( element.type === "radio" ) {
				this.findByName( element.name ).addClass( errorClass ).removeClass( validClass );
			} else {
				$( element ).addClass( errorClass ).removeClass( validClass );
			}
		},
		unhighlight: function( element, errorClass, validClass ) {
      var $group =  $(element).parents('.form-group');
      if($group[0]) {
        $group.removeClass(errorClass).addClass(validClass);
        return
      }
			if ( element.type === "radio" ) {
				this.findByName( element.name ).removeClass( errorClass ).addClass( validClass );
			} else {
				$( element ).removeClass( errorClass ).addClass( validClass );
			}
		},
    errorPlacement: function(error, element) {
      var $errorContainer = $(element).parents(".form-group").find(".error-container");
      if($errorContainer[0]) {
        $errorContainer.append(error);
      } else {
        $(error).insertAfter(element);
      }
    }
	},

	// http://jqueryvalidation.org/jQuery.validator.setDefaults/
	setDefaults: function( settings ) {
		$.extend( $.validator.defaults, settings );
	},

	messages: {
		required: "请填写",
		remote: "错误",
		email: "请输入正确的邮箱",
		url: "请输入正确的网址",
		date: "请输入正确的日期",
		dateISO: "Please enter a valid date ( ISO ).",
		number: "请输入正确的数字",
		digits: "只能输入整数",
		creditcard: "请输入正确的信用卡卡号",
		equalTo: "错误",
		maxlength: $.validator.format( "最多可以输入{0}个字符" ),
		minlength: $.validator.format( "请至少输入{0}个字符" ),
		rangelength: $.validator.format( "长度必须在{0}~{1}之间" ),
		range: $.validator.format( "范围必须在{0}~{1}之间" ),
		max: $.validator.format( "不能大于{0}." ),
		min: $.validator.format( "不能小于{0}." )
	},

	autoCreateRanges: false,

	prototype: {

		init: function() {
			this.labelContainer = $( this.settings.errorLabelContainer );
			this.errorContext = this.labelContainer.length && this.labelContainer || $( this.currentForm );
			this.containers = $( this.settings.errorContainer ).add( this.settings.errorLabelContainer );
			this.submitted = {};
			this.valueCache = {};
			this.pendingRequest = 0;
			this.pending = {};
			this.invalid = {};
			this.reset();

			var groups = ( this.groups = {} ),
				rules;
			$.each( this.settings.groups, function( key, value ) {
				if ( typeof value === "string" ) {
					value = value.split( /\s/ );
				}
				$.each( value, function( index, name ) {
					groups[ name ] = key;
				});
			});
			rules = this.settings.rules;
			$.each( rules, function( key, value ) {
				rules[ key ] = $.validator.normalizeRule( value );
			});

			function delegate( event ) {
        /*jshint validthis:true */
				var validator = $.data( this[ 0 ].form, "validator" ),
					eventType = "on" + event.type.replace( /^validate/, "" ),
					settings = validator.settings;
				if ( settings[ eventType ] && !this.is( settings.ignore ) ) {
					settings[ eventType ].call( validator, this[ 0 ], event );
				}
			}
			$( this.currentForm )
				.validateDelegate( ":text, [type='password'], [type='file'], select, textarea, " +
					"[type='number'], [type='search'] ,[type='tel'], [type='url'], " +
					"[type='email'], [type='datetime'], [type='date'], [type='month'], " +
					"[type='week'], [type='time'], [type='datetime-local'], " +
					"[type='range'], [type='color'], [type='radio'], [type='checkbox']",
					"focusin focusout keyup", delegate)
				// Support: Chrome, oldIE
				// "select" is provided as event.target when clicking a option
				.validateDelegate("select, option, [type='radio'], [type='checkbox']", "click", delegate);

			if ( this.settings.invalidHandler ) {
				$( this.currentForm ).bind( "invalid-form.validate", this.settings.invalidHandler );
			}

			// Add aria-required to any Static/Data/Class required fields before first validation
			// Screen readers require this attribute to be present before the initial submission http://www.w3.org/TR/WCAG-TECHS/ARIA2.html
			$( this.currentForm ).find( "[required], [data-rule-required], .required" ).attr( "aria-required", "true" );
		},

		// http://jqueryvalidation.org/Validator.form/
		form: function() {
			this.checkForm();
			$.extend( this.submitted, this.errorMap );
			this.invalid = $.extend({}, this.errorMap );
			if ( !this.valid() ) {
				$( this.currentForm ).triggerHandler( "invalid-form", [ this ]);
			}
			this.showErrors();
			return this.valid();
		},

		checkForm: function() {
			this.prepareForm();
			for ( var i = 0, elements = ( this.currentElements = this.elements() ); elements[ i ]; i++ ) {
				this.check( elements[ i ] );
			}
			return this.valid();
		},

		// http://jqueryvalidation.org/Validator.element/
		element: function( element ) {
			var cleanElement = this.clean( element ),
				checkElement = this.validationTargetFor( cleanElement ),
				result = true;

			this.lastElement = checkElement;

			if ( checkElement === undefined ) {
				delete this.invalid[ cleanElement.name ];
			} else {
				this.prepareElement( checkElement );
				this.currentElements = $( checkElement );

				result = this.check( checkElement ) !== false;
				if ( result ) {
					delete this.invalid[ checkElement.name ];
				} else {
					this.invalid[ checkElement.name ] = true;
				}
			}
			// Add aria-invalid status for screen readers
			$( element ).attr( "aria-invalid", !result );

			if ( !this.numberOfInvalids() ) {
				// Hide error containers on last error
				this.toHide = this.toHide.add( this.containers );
			}
			this.showErrors();
			return result;
		},

		// http://jqueryvalidation.org/Validator.showErrors/
		showErrors: function( errors ) {
			if ( errors ) {
				// add items to error list and map
				$.extend( this.errorMap, errors );
				this.errorList = [];
				for ( var name in errors ) {
					this.errorList.push({
						message: errors[ name ],
						element: this.findByName( name )[ 0 ]
					});
				}
				// remove items from success list
				this.successList = $.grep( this.successList, function( element ) {
					return !( element.name in errors );
				});
			}
			if ( this.settings.showErrors ) {
				this.settings.showErrors.call( this, this.errorMap, this.errorList );
			} else {
				this.defaultShowErrors();
			}
		},

		// http://jqueryvalidation.org/Validator.resetForm/
		resetForm: function() {
			if ( $.fn.resetForm ) {
				$( this.currentForm ).resetForm();
			}
			this.submitted = {};
			this.lastElement = null;
			this.prepareForm();
			this.hideErrors();
			this.elements()
					.removeClass( this.settings.errorClass )
					.removeData( "previousValue" )
					.removeAttr( "aria-invalid" );
		},

		numberOfInvalids: function() {
			return this.objectLength( this.invalid );
		},

		objectLength: function( obj ) {
			/* jshint unused: false */
			var count = 0,
				i;
			for ( i in obj ) {
				count++;
			}
			return count;
		},

		hideErrors: function() {
			this.hideThese( this.toHide );
		},

		hideThese: function( errors ) {
			errors.not( this.containers ).text( "" );
			this.addWrapper( errors ).hide();
		},

		valid: function() {
			return this.size() === 0;
		},

		size: function() {
			return this.errorList.length;
		},

		focusInvalid: function() {
			if ( this.settings.focusInvalid ) {
				try {
					$( this.findLastActive() || this.errorList.length && this.errorList[ 0 ].element || [])
					.filter( ":visible" )
					.focus()
					// manually trigger focusin event; without it, focusin handler isn't called, findLastActive won't have anything to find
					.trigger( "focusin" );
				} catch ( e ) {
					// ignore IE throwing errors when focusing hidden elements
				}
			}
		},

		findLastActive: function() {
			var lastActive = this.lastActive;
			return lastActive && $.grep( this.errorList, function( n ) {
				return n.element.name === lastActive.name;
			}).length === 1 && lastActive;
		},

		elements: function() {
			var validator = this,
				rulesCache = {};

			// select all valid inputs inside the form (no submit or reset buttons)
			return $( this.currentForm )
			.find( "input, select, textarea" )
			.not( ":submit, :reset, :image, [disabled], [readonly]" )
			.not( this.settings.ignore )
			.filter( function() {
				if ( !this.name && validator.settings.debug && window.console ) {
					console.error( "%o has no name assigned", this );
				}

				// select only the first element for each name, and only those with rules specified
				if ( this.name in rulesCache || !validator.objectLength( $( this ).rules() ) ) {
					return false;
				}

				rulesCache[ this.name ] = true;
				return true;
			});
		},

		clean: function( selector ) {
			return $( selector )[ 0 ];
		},

		errors: function() {
			var errorClass = this.settings.errorClass.split( " " ).join( "." );
			return $( this.settings.errorElement + "." + errorClass, this.errorContext );
		},

		reset: function() {
			this.successList = [];
			this.errorList = [];
			this.errorMap = {};
			this.toShow = $( [] );
			this.toHide = $( [] );
			this.currentElements = $( [] );
		},

		prepareForm: function() {
			this.reset();
			this.toHide = this.errors().add( this.containers );
		},

		prepareElement: function( element ) {
			this.reset();
			this.toHide = this.errorsFor( element );
		},

		elementValue: function( element ) {
			var val,
				$element = $( element ),
				type = element.type;

			if ( type === "radio" || type === "checkbox" ) {
				return $( "input[name='" + element.name + "']:checked" ).val();
			} else if ( type === "number" && typeof element.validity !== "undefined" ) {
				return element.validity.badInput ? false : $element.val();
			}

			val = $element.val();
			if ( typeof val === "string" ) {
				return val.replace(/\r/g, "" );
			}
			return val;
		},

		check: function( element ) {
			element = this.validationTargetFor( this.clean( element ) );

			var rules = $( element ).rules(),
				rulesCount = $.map( rules, function( n, i ) {
					return i;
				}).length,
				dependencyMismatch = false,
				val = this.elementValue( element ),
				result, method, rule;

			for ( method in rules ) {
				rule = { method: method, parameters: rules[ method ] };
				try {

					result = $.validator.methods[ method ].call( this, val, element, rule.parameters );

					// if a method indicates that the field is optional and therefore valid,
					// don't mark it as valid when there are no other rules
					if ( result === "dependency-mismatch" && rulesCount === 1 ) {
						dependencyMismatch = true;
						continue;
					}
					dependencyMismatch = false;

					if ( result === "pending" ) {
						this.toHide = this.toHide.not( this.errorsFor( element ) );
						return;
					}

					if ( !result ) {
						this.formatAndAdd( element, rule );
						return false;
					}
				} catch ( e ) {
					if ( this.settings.debug && window.console ) {
						console.log( "Exception occurred when checking element " + element.id + ", check the '" + rule.method + "' method.", e );
					}
					throw e;
				}
			}
			if ( dependencyMismatch ) {
				return;
			}
			if ( this.objectLength( rules ) ) {
				this.successList.push( element );
			}
			return true;
		},

		// return the custom message for the given element and validation method
		// specified in the element's HTML5 data attribute
		// return the generic message if present and no method specific message is present
		customDataMessage: function( element, method ) {
			return $( element ).data( "msg" + method.charAt( 0 ).toUpperCase() +
				method.substring( 1 ).toLowerCase() ) || $( element ).data( "msg" );
		},

		// return the custom message for the given element name and validation method
		customMessage: function( name, method ) {
			var m = this.settings.messages[ name ];
			return m && ( m.constructor === String ? m : m[ method ]);
		},

		// return the first defined argument, allowing empty strings
		findDefined: function() {
			for ( var i = 0; i < arguments.length; i++) {
				if ( arguments[ i ] !== undefined ) {
					return arguments[ i ];
				}
			}
			return undefined;
		},

		defaultMessage: function( element, method ) {
			return this.findDefined(
				this.customMessage( element.name, method ),
				this.customDataMessage( element, method ),
				// title is never undefined, so handle empty string as undefined
				!this.settings.ignoreTitle && element.title || undefined,
				$.validator.messages[ method ],
				"<strong>Warning: No message defined for " + element.name + "</strong>"
			);
		},

		formatAndAdd: function( element, rule ) {
			var message = this.defaultMessage( element, rule.method ),
				theregex = /\$?\{(\d+)\}/g;
			if ( typeof message === "function" ) {
				message = message.call( this, rule.parameters, element );
			} else if ( theregex.test( message ) ) {
				message = $.validator.format( message.replace( theregex, "{$1}" ), rule.parameters );
			}
			this.errorList.push({
				message: message,
				element: element,
				method: rule.method
			});

			this.errorMap[ element.name ] = message;
			this.submitted[ element.name ] = message;
		},

		addWrapper: function( toToggle ) {
			if ( this.settings.wrapper ) {
				toToggle = toToggle.add( toToggle.parent( this.settings.wrapper ) );
			}
			return toToggle;
		},

		defaultShowErrors: function() {
			var i, elements, error;
			for ( i = 0; this.errorList[ i ]; i++ ) {
				error = this.errorList[ i ];
				if ( this.settings.highlight ) {
					this.settings.highlight.call( this, error.element, this.settings.errorClass, this.settings.validClass );
				}
				this.showLabel( error.element, error.message );
			}
			if ( this.errorList.length ) {
				this.toShow = this.toShow.add( this.containers );
			}
			if ( this.settings.success ) {
				for ( i = 0; this.successList[ i ]; i++ ) {
					this.showLabel( this.successList[ i ] );
				}
			}
			if ( this.settings.unhighlight ) {
				for ( i = 0, elements = this.validElements(); elements[ i ]; i++ ) {
					this.settings.unhighlight.call( this, elements[ i ], this.settings.errorClass, this.settings.validClass );
				}
			}
			this.toHide = this.toHide.not( this.toShow );
			this.hideErrors();
			this.addWrapper( this.toShow ).show();
		},

		validElements: function() {
			return this.currentElements.not( this.invalidElements() );
		},

		invalidElements: function() {
			return $( this.errorList ).map(function() {
				return this.element;
			});
		},

		showLabel: function( element, message ) {
			var place, group, errorID,
				error = this.errorsFor( element ),
				elementID = this.idOrName( element ),
				describedBy = $( element ).attr( "aria-describedby" );
			if ( error.length ) {
				// refresh error/success class
				error.removeClass( this.settings.validClass ).addClass( this.settings.errorClass );
				// replace message on existing label
				error.html( message );
			} else {
				// create error element
				error = $( "<" + this.settings.errorElement + ">" )
					.attr( "id", elementID + "-error" )
					.addClass( this.settings.errorClass )
					.addClass( this.settings.errorElementClass)
					.html( message || "" );

				// Maintain reference to the element to be placed into the DOM
				place = error;
				if ( this.settings.wrapper ) {
					// make sure the element is visible, even in IE
					// actually showing the wrapped element is handled elsewhere
					place = error.hide().show().wrap( "<" + this.settings.wrapper + "/>" ).parent();
				}
				if ( this.labelContainer.length ) {
					this.labelContainer.append( place );
				} else if ( this.settings.errorPlacement ) {
					this.settings.errorPlacement( place, $( element ) );
				} else {
					place.insertAfter( element );
				}

				// Link error back to the element
				if ( error.is( "label" ) ) {
					// If the error is a label, then associate using 'for'
					error.attr( "for", elementID );
				} else if ( error.parents( "label[for='" + elementID + "']" ).length === 0 ) {
					// If the element is not a child of an associated label, then it's necessary
					// to explicitly apply aria-describedby

					errorID = error.attr( "id" ).replace( /(:|\.|\[|\])/g, "\\$1");
					// Respect existing non-error aria-describedby
					if ( !describedBy ) {
						describedBy = errorID;
					} else if ( !describedBy.match( new RegExp( "\\b" + errorID + "\\b" ) ) ) {
						// Add to end of list if not already present
						describedBy += " " + errorID;
					}
					$( element ).attr( "aria-describedby", describedBy );

					// If this element is grouped, then assign to all elements in the same group
					group = this.groups[ element.name ];
					if ( group ) {
						$.each( this.groups, function( name, testgroup ) {
							if ( testgroup === group ) {
								$( "[name='" + name + "']", this.currentForm )
									.attr( "aria-describedby", error.attr( "id" ) );
							}
						});
					}
				}
			}
			if ( !message && this.settings.success ) {
				error.text( "" );
				if ( typeof this.settings.success === "string" ) {
					error.addClass( this.settings.success );
				} else {
					this.settings.success( error, element );
				}
			}
			this.toShow = this.toShow.add( error );
		},

		errorsFor: function( element ) {
			var name = this.idOrName( element ),
				describer = $( element ).attr( "aria-describedby" ),
				selector = "label[for='" + name + "'], label[for='" + name + "'] *";

			// aria-describedby should directly reference the error element
			if ( describer ) {
				selector = selector + ", #" + describer.replace( /\s+/g, ", #" );
			}
			return this
				.errors()
				.filter( selector );
		},

		idOrName: function( element ) {
			return this.groups[ element.name ] || ( this.checkable( element ) ? element.name : element.id || element.name );
		},

		validationTargetFor: function( element ) {

			// If radio/checkbox, validate first element in group instead
			if ( this.checkable( element ) ) {
				element = this.findByName( element.name );
			}

			// Always apply ignore filter
			return $( element ).not( this.settings.ignore )[ 0 ];
		},

		checkable: function( element ) {
			return ( /radio|checkbox/i ).test( element.type );
		},

		findByName: function( name ) {
			return $( this.currentForm ).find( "[name='" + name + "']" );
		},

		getLength: function( value, element ) {
			switch ( element.nodeName.toLowerCase() ) {
			case "select":
				return $( "option:selected", element ).length;
			case "input":
				if ( this.checkable( element ) ) {
					return this.findByName( element.name ).filter( ":checked" ).length;
				}
			}
			return value.length;
		},

		depend: function( param, element ) {
			return this.dependTypes[typeof param] ? this.dependTypes[typeof param]( param, element ) : true;
		},

		dependTypes: {
			"boolean": function( param ) {
				return param;
			},
			"string": function( param, element ) {
				return !!$( param, element.form ).length;
			},
			"function": function( param, element ) {
				return param( element );
			}
		},

		optional: function( element ) {
			var val = this.elementValue( element );
			return !$.validator.methods.required.call( this, val, element ) && "dependency-mismatch";
		},

		startRequest: function( element ) {
			if ( !this.pending[ element.name ] ) {
				this.pendingRequest++;
				this.pending[ element.name ] = true;
			}
		},

		stopRequest: function( element, valid ) {
			this.pendingRequest--;
			// sometimes synchronization fails, make sure pendingRequest is never < 0
			if ( this.pendingRequest < 0 ) {
				this.pendingRequest = 0;
			}
			delete this.pending[ element.name ];
			if ( valid && this.pendingRequest === 0 && this.formSubmitted && this.form() ) {
				$( this.currentForm ).submit();
				this.formSubmitted = false;
			} else if (!valid && this.pendingRequest === 0 && this.formSubmitted ) {
				$( this.currentForm ).triggerHandler( "invalid-form", [ this ]);
				this.formSubmitted = false;
			}
		},

		previousValue: function( element ) {
			return $.data( element, "previousValue" ) || $.data( element, "previousValue", {
				old: null,
				valid: true,
				message: this.defaultMessage( element, "remote" )
			});
		}

	},

	classRuleSettings: {
		required: { required: true },
		email: { email: true },
		url: { url: true },
		date: { date: true },
		dateISO: { dateISO: true },
		number: { number: true },
		digits: { digits: true },
		creditcard: { creditcard: true }
	},

	addClassRules: function( className, rules ) {
		if ( className.constructor === String ) {
			this.classRuleSettings[ className ] = rules;
		} else {
			$.extend( this.classRuleSettings, className );
		}
	},

	classRules: function( element ) {
		var rules = {},
			classes = $( element ).attr( "class" );

		if ( classes ) {
			$.each( classes.split( " " ), function() {
				if ( this in $.validator.classRuleSettings ) {
					$.extend( rules, $.validator.classRuleSettings[ this ]);
				}
			});
		}
		return rules;
	},

	attributeRules: function( element ) {
		var rules = {},
			$element = $( element ),
			type = element.getAttribute( "type" ),
			method, value;

		for ( method in $.validator.methods ) {

			// support for <input required> in both html5 and older browsers
			if ( method === "required" ) {
				value = element.getAttribute( method );
				// Some browsers return an empty string for the required attribute
				// and non-HTML5 browsers might have required="" markup
				if ( value === "" ) {
					value = true;
				}
				// force non-HTML5 browsers to return bool
				value = !!value;
			} else {
				value = $element.attr( method );
			}

			// convert the value to a number for number inputs, and for text for backwards compability
			// allows type="date" and others to be compared as strings
			if ( /min|max/.test( method ) && ( type === null || /number|range|text/.test( type ) ) ) {
				value = Number( value );
			}

			if ( value || value === 0 ) {
				rules[ method ] = value;
			} else if ( type === method && type !== "range" ) {
				// exception: the jquery validate 'range' method
				// does not test for the html5 'range' type
				rules[ method ] = true;
			}
		}

		// maxlength may be returned as -1, 2147483647 ( IE ) and 524288 ( safari ) for text inputs
		if ( rules.maxlength && /-1|2147483647|524288/.test( rules.maxlength ) ) {
			delete rules.maxlength;
		}

		return rules;
	},

	dataRules: function( element ) {
		var method, value,
			rules = {}, $element = $( element );
		for ( method in $.validator.methods ) {
			value = $element.data( "rule" + method.charAt( 0 ).toUpperCase() + method.substring( 1 ).toLowerCase() );
			if ( value !== undefined ) {
				rules[ method ] = value;
			}
		}
		return rules;
	},

	staticRules: function( element ) {
		var rules = {},
			validator = $.data( element.form, "validator" );

		if ( validator.settings.rules ) {
			rules = $.validator.normalizeRule( validator.settings.rules[ element.name ] ) || {};
		}
		return rules;
	},

	normalizeRules: function( rules, element ) {
		// handle dependency check
		$.each( rules, function( prop, val ) {
			// ignore rule when param is explicitly false, eg. required:false
			if ( val === false ) {
				delete rules[ prop ];
				return;
			}
			if ( val.param || val.depends ) {
				var keepRule = true;
				switch ( typeof val.depends ) {
				case "string":
					keepRule = !!$( val.depends, element.form ).length;
					break;
				case "function":
					keepRule = val.depends.call( element, element );
					break;
				}
				if ( keepRule ) {
					rules[ prop ] = val.param !== undefined ? val.param : true;
				} else {
					delete rules[ prop ];
				}
			}
		});

		// evaluate parameters
		$.each( rules, function( rule, parameter ) {
			rules[ rule ] = $.isFunction( parameter ) ? parameter( element ) : parameter;
		});

		// clean number parameters
		$.each([ "minlength", "maxlength" ], function() {
			if ( rules[ this ] ) {
				rules[ this ] = Number( rules[ this ] );
			}
		});
		$.each([ "rangelength", "range" ], function() {
			var parts;
			if ( rules[ this ] ) {
				if ( $.isArray( rules[ this ] ) ) {
					rules[ this ] = [ Number( rules[ this ][ 0 ]), Number( rules[ this ][ 1 ] ) ];
				} else if ( typeof rules[ this ] === "string" ) {
					parts = rules[ this ].replace(/[\[\]]/g, "" ).split( /[\s,]+/ );
					rules[ this ] = [ Number( parts[ 0 ]), Number( parts[ 1 ] ) ];
				}
			}
		});

		if ( $.validator.autoCreateRanges ) {
			// auto-create ranges
			if ( rules.min != null && rules.max != null ) {
				rules.range = [ rules.min, rules.max ];
				delete rules.min;
				delete rules.max;
			}
			if ( rules.minlength != null && rules.maxlength != null ) {
				rules.rangelength = [ rules.minlength, rules.maxlength ];
				delete rules.minlength;
				delete rules.maxlength;
			}
		}

		return rules;
	},

	// Converts a simple string to a {string: true} rule, e.g., "required" to {required:true}
	normalizeRule: function( data ) {
		if ( typeof data === "string" ) {
			var transformed = {};
			$.each( data.split( /\s/ ), function() {
				transformed[ this ] = true;
			});
			data = transformed;
		}
		return data;
	},

	// http://jqueryvalidation.org/jQuery.validator.addMethod/
	addMethod: function( name, method, message ) {
		$.validator.methods[ name ] = method;
		$.validator.messages[ name ] = message !== undefined ? message : $.validator.messages[ name ];
		if ( method.length < 3 ) {
			$.validator.addClassRules( name, $.validator.normalizeRule( name ) );
		}
	},

	methods: {

		// http://jqueryvalidation.org/required-method/
		required: function( value, element, param ) {
			// check if dependency is met
			if ( !this.depend( param, element ) ) {
				return "dependency-mismatch";
			}
			if ( element.nodeName.toLowerCase() === "select" ) {
				// could be an array for select-multiple or a string, both are fine this way
				var val = $( element ).val();
				return val && val.length > 0;
			}
			if ( this.checkable( element ) ) {
				return this.getLength( value, element ) > 0;
			}
			return $.trim( value ).length > 0;
		},

		// http://jqueryvalidation.org/email-method/
		email: function( value, element ) {
			// From http://www.whatwg.org/specs/web-apps/current-work/multipage/states-of-the-type-attribute.html#e-mail-state-%28type=email%29
			// Retrieved 2014-01-14
			// If you have a problem with this implementation, report a bug against the above spec
			// Or use custom methods to implement your own email validation
			return this.optional( element ) || /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test( value );
		},

		// http://jqueryvalidation.org/url-method/
		url: function( value, element ) {
			// contributed by Scott Gonzalez: http://projects.scottsplayground.com/iri/
			return this.optional( element ) || /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test( value );
		},

		// http://jqueryvalidation.org/date-method/
		date: function( value, element ) {
			return this.optional( element ) || !/Invalid|NaN/.test( new Date( value ).toString() );
		},

		// http://jqueryvalidation.org/dateISO-method/
		dateISO: function( value, element ) {
			return this.optional( element ) || /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/.test( value );
		},

		// http://jqueryvalidation.org/number-method/
		number: function( value, element ) {
			return this.optional( element ) || /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test( value );
		},

		// http://jqueryvalidation.org/digits-method/
		digits: function( value, element ) {
			return this.optional( element ) || /^\d+$/.test( value );
		},

		// http://jqueryvalidation.org/creditcard-method/
		// based on http://en.wikipedia.org/wiki/Luhn/
		creditcard: function( value, element ) {
			if ( this.optional( element ) ) {
				return "dependency-mismatch";
			}
			// accept only spaces, digits and dashes
			if ( /[^0-9 \-]+/.test( value ) ) {
				return false;
			}
			var nCheck = 0,
				nDigit = 0,
				bEven = false,
				n, cDigit;

			value = value.replace( /\D/g, "" );

			// Basing min and max length on
			// http://developer.ean.com/general_info/Valid_Credit_Card_Types
			if ( value.length < 13 || value.length > 19 ) {
				return false;
			}

			for ( n = value.length - 1; n >= 0; n--) {
				cDigit = value.charAt( n );
				nDigit = parseInt( cDigit, 10 );
				if ( bEven ) {
					if ( ( nDigit *= 2 ) > 9 ) {
						nDigit -= 9;
					}
				}
				nCheck += nDigit;
				bEven = !bEven;
			}

			return ( nCheck % 10 ) === 0;
		},

		// http://jqueryvalidation.org/minlength-method/
		minlength: function( value, element, param ) {
			var length = $.isArray( value ) ? value.length : this.getLength( value, element );
			return this.optional( element ) || length >= param;
		},

		// http://jqueryvalidation.org/maxlength-method/
		maxlength: function( value, element, param ) {
			var length = $.isArray( value ) ? value.length : this.getLength( value, element );
			return this.optional( element ) || length <= param;
		},

		// http://jqueryvalidation.org/rangelength-method/
		rangelength: function( value, element, param ) {
			var length = $.isArray( value ) ? value.length : this.getLength( value, element );
			return this.optional( element ) || ( length >= param[ 0 ] && length <= param[ 1 ] );
		},

		// http://jqueryvalidation.org/min-method/
		min: function( value, element, param ) {
			return this.optional( element ) || value >= param;
		},

		// http://jqueryvalidation.org/max-method/
		max: function( value, element, param ) {
			return this.optional( element ) || value <= param;
		},

		// http://jqueryvalidation.org/range-method/
		range: function( value, element, param ) {
			return this.optional( element ) || ( value >= param[ 0 ] && value <= param[ 1 ] );
		},

		// http://jqueryvalidation.org/equalTo-method/
		equalTo: function( value, element, param ) {
			// bind to the blur event of the target in order to revalidate whenever the target field is updated
			// TODO find a way to bind the event just once, avoiding the unbind-rebind overhead
			var target = $( param );
			if ( this.settings.onfocusout ) {
				target.unbind( ".validate-equalTo" ).bind( "blur.validate-equalTo", function() {
					$( element ).valid();
				});
			}
			return value === target.val();
		},

		// http://jqueryvalidation.org/remote-method/
		remote: function( value, element, param ) {
			if ( this.optional( element ) ) {
				return "dependency-mismatch";
			}

			var previous = this.previousValue( element ),
				validator, data;

			if (!this.settings.messages[ element.name ] ) {
				this.settings.messages[ element.name ] = {};
			}
			previous.originalMessage = this.settings.messages[ element.name ].remote;
			this.settings.messages[ element.name ].remote = previous.message;

			param = typeof param === "string" && { url: param } || param;

			if ( previous.old === value ) {
				return previous.valid;
			}

			previous.old = value;
			validator = this;
			this.startRequest( element );
			data = {};
			data[ element.name ] = value;
			$.ajax( $.extend( true, {
				url: param,
				mode: "abort",
				port: "validate" + element.name,
				dataType: "json",
				data: data,
				context: validator.currentForm,
				success: function( response ) {
					var valid = response === true || response === "true",
						errors, message, submitted;

					validator.settings.messages[ element.name ].remote = previous.originalMessage;
					if ( valid ) {
						submitted = validator.formSubmitted;
						validator.prepareElement( element );
						validator.formSubmitted = submitted;
						validator.successList.push( element );
						delete validator.invalid[ element.name ];
						validator.showErrors();
					} else {
						errors = {};
						message = response || validator.defaultMessage( element, "remote" );
						errors[ element.name ] = previous.message = $.isFunction( message ) ? message( value ) : message;
						validator.invalid[ element.name ] = true;
						validator.showErrors( errors );
					}
					previous.valid = valid;
					validator.stopRequest( element, valid );
				}
			}, param ) );
			return "pending";
		}

	}

});

$.format = function deprecated() {
	throw "$.format has been deprecated. Please use $.validator.format instead.";
};

// ajax mode: abort
// usage: $.ajax({ mode: "abort"[, port: "uniqueport"]});
// if mode:"abort" is used, the previous request on that port (port can be undefined) is aborted via XMLHttpRequest.abort()

var pendingRequests = {},
	ajax;
// Use a prefilter if available (1.5+)
if ( $.ajaxPrefilter ) {
	$.ajaxPrefilter(function( settings, _, xhr ) {
		var port = settings.port;
		if ( settings.mode === "abort" ) {
			if ( pendingRequests[port] ) {
				pendingRequests[port].abort();
			}
			pendingRequests[port] = xhr;
		}
	});
} else {
	// Proxy ajax
	ajax = $.ajax;
	$.ajax = function( settings ) {
		var mode = ( "mode" in settings ? settings : $.ajaxSettings ).mode,
			port = ( "port" in settings ? settings : $.ajaxSettings ).port;
		if ( mode === "abort" ) {
			if ( pendingRequests[port] ) {
				pendingRequests[port].abort();
			}
			pendingRequests[port] = ajax.apply(this, arguments);
			return pendingRequests[port];
		}
		return ajax.apply(this, arguments);
	};
}

// provides delegate(type: String, delegate: Selector, handler: Callback) plugin for easier event delegation
// handler is only called when $(event.target).is(delegate), in the scope of the jquery-object for event.target

$.extend($.fn, {
	validateDelegate: function( delegate, type, handler ) {
		return this.bind(type, function( event ) {
			var target = $(event.target);
			if ( target.is(delegate) ) {
				return handler.apply(target, arguments);
			}
		});
	}
});

$(function(){
  $('[data-toggle="validate"]').each(function() {
    $(this).validate();
  })
})

}(window.jQuery, undefined);

 //jscs:disable 

 /**
 * toast.js
 /*jshint scripturl:true */
 /*jshint funcscope:true */
 /*jshint -W004 */
 /*jshint unused:false*/

 /* jshint -W099 */


!function ($) {
  "use strict";
  /*jshint validthis: true */
 /* BUTTON PUBLIC CLASS DEFINITION
  * ============================== */
  var template = '<div class=" toast"><h5 class="toast_text msg-con"></h5><s class="msg-icon"></s></div>';

  var Toast = function (options) {
    var $toast = null;
    if(typeof options === typeof 'a'){
      this.options = $.extend({}, this.defaults);
      this.options.text = options;
      if(arguments[2]){
        this.options.position= arguments[2];
      }
      if(arguments[1]){
        this.options.type = arguments[1];
      }
      
    }else{
      this.options = $.extend({}, this.defaults, options);
    }
    return this.render();
  }

  Toast.prototype = {
    Constructor : Toast,
     render: function(){
      var options = this.options;
      var message = ".toast";
      var text = ".toast_text";
      var cssPrefix = "toast-";
      $(message).remove();
      this.el = $(template);
      this.el.appendTo(document.body);
      $(text).html(options.text); //this.el.find(text)
      options.position.replace(/(\S+)/g, cssPrefix) ;
      this.el.addClass(options.position).addClass(cssPrefix+options.type);
      this.show();
    
      
      // if(options.closeButton){
      //   this.el.addClass('show-close-btn');
      // }
      if(options.closeOnClick){
        this.el.click($.proxy(this.hide,this));
      }
    },
    hide : function(callback){  // hide : function(duration, callback);
      this.el.removeClass('toast-in');
      var self = this.el;
      setTimeout(function(){self.remove()},1000);
    },
    show : function(duration, callback){  // show : function(duration, callback);
      var classes = this.el.attr("class");
      var vertical = this.el.hasClass('top')&&"top"||this.el.hasClass('bottom')&&"bottom"||"middle";
      var horizontal = this.el.hasClass('left')&&"left"||this.el.hasClass('right')&&"right"||"center";
      if(horizontal=="center"){
        var mlwidth = -(this.el.width()/2);
        this.el.css("margin-left",mlwidth+"px");
      }
      if(vertical=="middle"){
        var mtheight = -(this.el.height()/2);
        this.el.css("margin-top",mtheight);
      }
      var addclass = function(){
        this.el.addClass('toast-in')
      }
      setTimeout($.proxy(addclass,this));
      setTimeout($.proxy(this.hide,this),this.options.timeout);
    }
  } 

  var old = $.toast
  
  $.toast = function(arg1,arg2,arg3){
    return new Toast(arg1,arg2, arg3);
  }

  Toast.prototype.defaults = {
    position: 'center',
    type: 'default',
    // speed: 500,
    timeout: 3000,
    // closeButton: false,
    closeOnClick: true,
    text:''
  };

  $.toast.Constructor = Toast;

 /* BUTTON NO CONFLICT
  * ================== */

  $.toast.noConflict = function () {
    $.toast = old;
    return this;
  }

 /* BUTTON DATA-API
  * =============== */ 
}(window.jQuery);

+function ($) {
  'use strict';

  $(document).on('change', '[data-toggle="tag"] input[type]', function (e) {
    var $input = $(e.target);
    var $group = $input.parents('.' + CLASSMAP.tagGroup);
    $group.find('input[type]').each(function () {
      var $this = $(this);
      var checked = $this.is(':checked');
      $this.parents('.tag')[checked ? 'addClass' : 'removeClass']('active');
    });
  })
  $(document).on('click', '[data-toggle="tag"] [name="remove"]', function (e) {
    var $btn = $(e.target);
    $btn.parents('.tag').remove();
  })

}(jQuery);

/* global __picPlugin__ */
// jscs:disable
/**
 * @file picPlugin.js
 * @brief 快速调用图片空间插件实现选择/上传/裁剪图片
 * @author banbian, zangtao.zt@alibaba-inc.com
 * @param opt.triggerEle {string} 触发弹出图片空间插件弹层的元素的css选择器，通常是一些按钮、文字链
 * @param opt.noTab {boolean} 图片空间ifame打开时,不显示顶部的切换tab，默认是false。此时如果想指定主内容区显示upload区或list区，需要配合tab参数指定
 * @param opt.tab {string} 图片空间iframe打开时默认展现的标签页,默认是'list'， 取值为'list'或'upload'
 * @param opt.picMinSize {array} 从图片空间选择图片时的尺寸最小值，数组形式[宽，高]，例子： [200, 100]
 * @param opt.picMaxSize {array} 从图片空间选择图片时的尺寸最大值，数组形式[宽，高]，例子： [400, 200]
 * @param opt.previewHeight {number} 预览区高度，宽度会自动计算合适的值。用户也可以自行指定。
 * @param opt.needCrop {boolean} 是否需要在图片空间插件关闭后弹出图片裁剪弹层
 * @param opt.cancel {function} 打开图片空间弹层后，点击叉关闭弹层执行的回调（一般不需，针对业务弹层里的上传触发元素时可能会用）
 * @param opt.cropOptions {json}裁剪参数，详见[http://deepliquid.com/content/Jcrop_Manual.html]
 * @param opt.cropInit {function} Jcrop初始化完成后紧跟着会执行的一些逻辑，用于一些特殊目的控制
 * @param opt.beforeSend {function} 用户拖曳鼠标裁剪完后，点击弹层的“确定”按钮后立即执行的回调,第一个参数是即将发送给后端的json数据，包含裁剪信息。该函数若return false，中断后续逻辑（也就不会执行到success），否则会向后端发送裁剪的数据。
 * @param opt.success {function} 主流程完全顺利走完后的回调，第一个参数是图片url
 * @version 1.0.2
 * @date 2015-04-23
 */

//加载图片空间插件js
var protocol = (location.protocol === 'https:' ? 'https' : 'http:');
var picPluginUrl = location.hostname.indexOf('daily.taobao.net') > -1 ?
                   '//g.assets.daily.taobao.net/sj/pic/1.3.4/static/seller-v2/js/api.js' :
                   protocol + '//g.alicdn.com/sj/pic/1.3.4/static/seller-v2/js/api.js'

jQuery.ajax(picPluginUrl, {dataType: 'script', cache: true})

!function ($) {
  "use strict";

  // 判断域名环境,返回合理的URL
  var _getSourceUrl = function(path, hostkey) {
    var isDailyEnv = /\.taobao\.net$/.test(location.host), envHost
    if (hostkey) {
      envHost = '//' + hostkey + (isDailyEnv ? '.daily.taobao.net/' : '.taobao.com/')
    } else {
      envHost = isDailyEnv ? '//g-assets.daily.taobao.net/' : '//g.alicdn.com/';
    }
    return envHost + path;
  }

  var pic, $picDlg, pp = {}
  pp._bindEvents = function(triggerEle) {
    var self = this,
      options = this[$(triggerEle).data('ppid')]

    //高度自适应，第一个参数是iframe高度
    pic.on('heightUpdated', function() {
      $picDlg.modal('handleUpdate');
    })
    pic.on('picInserted', function(url) {

      //如果不需要裁剪，选完图片后就关闭iframe
      //如果需要裁剪，选完图片后只隐藏picDlg弹层，校验图片尺寸（如有需求），再弹出裁剪框，裁剪流程任意一处都可以返回到选择图片的弹层（即重新显示picDlg）
      function doCropOrSuccess() {
        if (options.needCrop) {
          $picDlg.hide()
          //弹出图片裁剪弹层。
          self._initJcrop(url, triggerEle)
        } else {
          options.success && options.success.call(self, url)
          pic.close();
        }
      }

      //如果对在图片空间选择的图片尺寸有限制：获取图片尺寸校验，再进行后续逻辑
      var tmpImg = new Image()
      tmpImg.onload = function(){
        if (options.picMinSize || options.picMaxSize) {
          if (validateSelectedImg(tmpImg.width, tmpImg.height)) {
            doCropOrSuccess()
          }
        } else {
          //如果没有限制：直接执行后续逻辑
          doCropOrSuccess()
        }
      }
      tmpImg.onerror = function(){
        $.toast('系统异常，请重新选择一次', 'danger')
      }
      tmpImg.src = url

      //校验图片宽高，返回值作为是否通过的判断
      function validateSelectedImg(w, h) {
        var minSize = options.picMinSize;
        if (minSize && (w < minSize[0] || h < minSize[1])) {
          $.toast('亲所选的图片尺寸过小(小于' + minSize.join('*') + ')，请重新选择', 'danger')
          return false
        }
        var maxSize = options.picMaxSize;
        if (maxSize && (w > maxSize[0] || h > maxSize[1])) {
          $.toast('亲所选的图片尺寸过大(大于' + maxSize.join('*') + ')，请重新选择', 'danger')
          return false
        }
        return true
      }

    })
    pic.on('close', function() {
      $picDlg.modal('okHide');
    })
  }

  pp._initJcrop = function(imgurl, triggerEle) {
    //方法调用返回值
    var options = this[$(triggerEle).data('ppid')],
      self = this,
      jcrop,
      onCropChange = function(c) {
        $('.current-size').html(c.w.toFixed(0) + ' * ' + c.h.toFixed(0))
      },
      cropdlg
    cropdlg = $.confirm({
      title: '裁剪图片<span class="current-size"></span>',
      //使用图片空间弹层的遮罩层即可
      backdrop: 'static',
      bgColor: 'rgba(0, 0, 0, 0)',
      width: 550,
      keyboard: false,
      body: '<img class="originpic" src="' + imgurl + '"/>',
      show: function() {
        //裁剪组件初始化参数
        var cropOptions = $.extend({
          keySupport: false,
          boxWidth: 500,
          boxHeight: 500,
          onChange: onCropChange,
          onSelect: onCropChange
        }, options.cropOptions)
        $(this).find('.originpic').Jcrop(cropOptions, function(){
          jcrop = this
          // 修正jcrop bug，如果图片尺寸大于裁剪区container大小，则maxSize计算会出错，但minSize没问题。
          if (cropOptions.maxSize) {
            jcrop.setOptions({
              maxSize: [cropOptions.maxSize[0] / jcrop.getScaleFactor()[0], cropOptions.maxSize[1] / jcrop.getScaleFactor()[1]]
            })
          }
          //执行初始化后的特殊逻辑控制回调
          options.cropInit && options.cropInit.call(self, jcrop)
        })
      },
      okHide: function() {
        var $ele = this.$element,
          $okBtn = $ele.find('[data-ok]'),
          sizeInfo = jcrop.tellSelect()
        // 四舍五入取整
        $.each(sizeInfo, function(k, v){
          sizeInfo[k] = +v.toFixed(0)
        })
        //防止多次提交裁剪请求
        if ($okBtn.hasClass('disabled')) return

        var sendData = $.extend({}, sizeInfo, { picTfs: imgurl[0] })
        if (options.beforeSend) {
          //beforeSend 回调调用方可以在最后return false来阻止后续的请求提交逻辑
          if (options.beforeSend.call(self, sendData) === false) return false;
        }
        //发送裁剪请求
        $.ajax(_getSourceUrl('action.do?api=primus_cover_crop', 'we'), {
          type: 'get',
          data: sendData,
          dataType: 'jsonp'
        }).done(function(res) {
          if (res.success) {
            //手工调用的okHide不会再进okHide回调
            cropdlg.modal('okHide')
            options.success && options.success.call(self, _getSourceUrl('tfscom/' + res.data.tfsFilePath, 'img01'), res.data)
            //把之前隐藏的图片空间iframe和弹层关闭
            pic.close()
          } else {
            $.toast(res.msg, 'danger')
          }
        }).always(function(){
          $okBtn.removeClass('disabled')
        })
        $okBtn.addClass('disabled')
        //阻止默认关闭弹层逻辑
        return false
      },
      cancelHide: function() {
        $picDlg.show()
      },
      cancelHidden: function() {
        $('body').addClass('modal-open')
      },
      hidden: function() {
        jcrop.destroy()
      }
    })
  }

  pp.init = function(opt) {
    var $ele = $(opt.triggerEle)
    $ele.data('ppid', 'pp_' + (+new Date()))

    this[$ele.data('ppid')] = $.extend({
      //默认配置
      needCrop: true
    }, opt)

    // 如果是非js调用的图片插件且需要裁剪，则对触发元素图片预览区进行宽高初始化处理
    if ($ele.data('toggle') == 'pic-uploader' && opt.needCrop) {
      pp._resizePreview(opt)
    }

    function _bindTriggerClick() {
      $ele.off('click.pp').on('click.pp', function(e){
        e.preventDefault()
        if ($ele.hasClass('pic-preview')) return

        pp.show(opt)
      })
    }

    //如果需要裁剪，且Jcrop尚未被加载进来，load it
    if (this[$ele.data('ppid')].needCrop && !$.fn.Jcrop) {
      $("head").append("<link rel='stylesheet' type='text/css' href='//g.alicdn.com/sj/lib/jcrop/css/jquery.Jcrop.min.css' />")

      $.ajax('//g.alicdn.com/sj/lib/jcrop/js/jquery.Jcrop.min.js', {dataType: 'script', cache: true})
      .done(function(){
        _bindTriggerClick()
      })
    } else {
      _bindTriggerClick()
    }


  }

  pp._resizePreview = function (opt) {
    var cropMinSize = opt.cropOptions.minSize,
      // 预览区宽高比
      aspectRatio = opt.cropOptions.aspectRatio ? opt.cropOptions.aspectRatio : (cropMinSize ? cropMinSize[0] / cropMinSize[1] : 1).toFixed(2),
      previewHeight = opt.previewHeight || 100
    $(opt.triggerEle).css({
      height: previewHeight,
      width: opt.previewWidth || (previewHeight * aspectRatio)
    })
  }

  pp.show = function(arg0) {
    // 判断如果第一个参数是json对象，则视为options，如果不是，则作为ppid并依次获取options
    var opt = typeof arg0 == 'object' ? arg0 : this[arg0]
    $picDlg = $.confirm({
      title: '选择图片',
      body: '<div id="picPluginWrap"></div>',
      hasfoot: false,
      width: 'large',
      shown: function(){
        pic = __picPlugin__.init({
          containerId: 'picPluginWrap',
          noTab: opt.noTab,
          tab: opt.tab,
          singleSelect: true
        })
        pp._bindEvents(opt.triggerEle)
        pic.run()
      },
      hide: function() {
        opt.cancel && opt.cancel.call(null, opt.triggerEle)
      },
      cancelHide: function() {
        pic && pic.close();
      }
    })
  }

  // 单例扩展到jQuery静态方法上,修正this
  $.fn.extend({
    picUploader: function (opt) {
      opt.triggerEle = this
      var config = $.extend({}, $.fn.picUploader.defaults, $(this).data(), opt)
      pp.init.call(pp, config)
    }
  })

  $.fn.picUploader.defaults = {
    picMinSize: [50, 50], // 从图片空间选择图片时的尺寸最小值，数组形式[宽，高]，例子： [200, 100]
    picMaxSize: [10000, 10000], // 从图片空间选择图片时的尺寸最大值，数组形式[宽，高]，例子： [400, 200]
    previewHeight: 100, // 预览区高度，宽度会自动计算合适的值。用户也可以自行指定。
    noTab: false,  //@param opt.noTab {boolean} 图片空间ifame打开时,不显示顶部的切换tab，默认是false。此时如果想指定主内容区显示upload区或list区，需要配合tab参数指定}
    tab: 'list',  //图片空间ifame打开时,不显示顶部的切换tab，默认是false。此时如果想指定主内容区显示upload区或list区，需要配合tab参数指定
    needCrop: true, // 是否需要在图片空间插件关闭后弹出图片裁剪弹层
    cropOptions: {}, // 裁剪参数，详见[http://deepliquid.com/content/Jcrop_Manual.html]
    cancel: $.noop, // 打开图片空间弹层后，点击叉关闭弹层执行的回调（一般不需，针对业务弹层里的上传触发元素时可能会用）
    cropInit: $.noop, // Jcrop初始化完成后紧跟着会执行的一些逻辑，用于一些特殊目的控制
    beforeSend: $.noop, // 用户拖曳鼠标裁剪完后，点击弹层的“确定”按钮后立即执行的回调,第一个参数是即将发送给后端的json数据，包含裁剪信息。该函数若return false，中断后续逻辑（也就不会执行到success），否则会向后端发送裁剪的数据。
    success: $.noop // 主流程完全顺利走完后的回调，第一个参数是图片url
  }

  $(function() {

    // 无JS调用类型的组件初始化
    $('[data-toggle="pic-uploader"]').each(function(k, v) {
      var param = $(this).data();
      param.success = function(url){
        $(v).addClass('pic-preview')
          .children('img').attr('src', url)
        $(v).children('input').val(url)
      }
      // 是否启用默认选框功能
      if (!param.allowSelect) {
        param.cropInit = function(instance) {
          instance.setSelect([0, 0].concat(param.picMinSize))
        }
      }
      $(v).picUploader(param);
    })

    // 更换图片
    $(document).on('click.pp', '.pic-uploader [name="replace"]', function() {
      pp.show($(this).parents('.pic-uploader').data('ppid'))
    })
    // 清除图片
    $(document).on('click.pp', '.pic-uploader [name="remove"]', function(e) {
      e.stopPropagation()
      var $picUploader= $(this).parents('.pic-uploader')
      $picUploader.removeClass('pic-preview')
        .children('img').removeAttr('src')
      $picUploader.children('input').val('')
    })
  })

}(jQuery)
