/*!
 * Bootstrap v3.1.1 (http://getbootstrap.com)
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */

if (typeof jQuery === 'undefined') { throw new Error('Bootstrap\'s JavaScript requires jQuery') }

/* ========================================================================
 * Bootstrap: transition.js v3.1.1
 * http://getbootstrap.com/javascript/#transitions
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap')

    var transEndEventNames = {
      'WebkitTransition' : 'webkitTransitionEnd',
      'MozTransition'    : 'transitionend',
      'OTransition'      : 'oTransitionEnd otransitionend',
      'transition'       : 'transitionend'
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
    var called = false, $el = this
    $(this).one($.support.transition.end, function () { called = true })
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    setTimeout(callback, duration)
    return this
  }

  $(function () {
    $.support.transition = transitionEnd()
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: alert.js v3.1.1
 * http://getbootstrap.com/javascript/#alerts
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
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
      $parent = $this.hasClass('alert') ? $this : $this.parent()
    }

    $parent.trigger(e = $.Event('close.bs.alert'))

    if (e.isDefaultPrevented()) return

    $parent.removeClass('in')

    function removeElement() {
      $parent.trigger('closed.bs.alert').remove()
    }

    $.support.transition && $parent.hasClass('fade') ?
      $parent
        .one($.support.transition.end, removeElement)
        .emulateTransitionEnd(150) :
      removeElement()
  }


  // ALERT PLUGIN DEFINITION
  // =======================

  var old = $.fn.alert

  $.fn.alert = function (option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.alert')

      if (!data) $this.data('bs.alert', (data = new Alert(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  $.fn.alert.Constructor = Alert


  // ALERT NO CONFLICT
  // =================

  $.fn.alert.noConflict = function () {
    $.fn.alert = old
    return this
  }


  // ALERT DATA-API
  // ==============

  $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close)

}(jQuery);

/* ========================================================================
 * Bootstrap: button.js v3.1.1
 * http://getbootstrap.com/javascript/#buttons
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
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

  Button.DEFAULTS = {
    loadingText: 'loading...'
  }

  Button.prototype.setState = function (state) {
    var d    = 'disabled'
    var $el  = this.$element
    var val  = $el.is('input') ? 'val' : 'html'
    var data = $el.data()

    state = state + 'Text'

    if (!data.resetText) $el.data('resetText', $el[val]())

    $el[val](data[state] || this.options[state])

    // push to event loop to allow forms to submit
    setTimeout($.proxy(function () {
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
    }

    if (changed) this.$element.toggleClass('active')
  }


  // BUTTON PLUGIN DEFINITION
  // ========================

  var old = $.fn.button

  $.fn.button = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.button')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.button', (data = new Button(this, options)))

      if (option == 'toggle') data.toggle()
      else if (option) data.setState(option)
    })
  }

  $.fn.button.Constructor = Button


  // BUTTON NO CONFLICT
  // ==================

  $.fn.button.noConflict = function () {
    $.fn.button = old
    return this
  }


  // BUTTON DATA-API
  // ===============

  $(document).on('click.bs.button.data-api', '[data-toggle^=button]', function (e) {
    var $btn = $(e.target)
    if (!$btn.hasClass('btn')) $btn = $btn.closest('.btn')
    $btn.button('toggle')
    e.preventDefault()
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: carousel.js v3.1.1
 * http://getbootstrap.com/javascript/#carousel
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
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

    this.options.pause == 'hover' && this.$element
      .on('mouseenter', $.proxy(this.pause, this))
      .on('mouseleave', $.proxy(this.cycle, this))
  }

  Carousel.DEFAULTS = {
    interval: 5000,
    pause: 'hover',
    wrap: true
  }

  Carousel.prototype.cycle =  function (e) {
    e || (this.paused = false)

    this.interval && clearInterval(this.interval)

    this.options.interval
      && !this.paused
      && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))

    return this
  }

  Carousel.prototype.getActiveIndex = function () {
    this.$active = this.$element.find('.item.active')
    this.$items  = this.$active.parent().children()

    return this.$items.index(this.$active)
  }

  Carousel.prototype.to = function (pos) {
    var that        = this
    var activeIndex = this.getActiveIndex()

    if (pos > (this.$items.length - 1) || pos < 0) return

    if (this.sliding)       return this.$element.one('slid.bs.carousel', function () { that.to(pos) })
    if (activeIndex == pos) return this.pause().cycle()

    return this.slide(pos > activeIndex ? 'next' : 'prev', $(this.$items[pos]))
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
    var $next     = next || $active[type]()
    var isCycling = this.interval
    var direction = type == 'next' ? 'left' : 'right'
    var fallback  = type == 'next' ? 'first' : 'last'
    var that      = this

    if (!$next.length) {
      if (!this.options.wrap) return
      $next = this.$element.find('.item')[fallback]()
    }

    if ($next.hasClass('active')) return this.sliding = false

    var e = $.Event('slide.bs.carousel', { relatedTarget: $next[0], direction: direction })
    this.$element.trigger(e)
    if (e.isDefaultPrevented()) return

    this.sliding = true

    isCycling && this.pause()

    if (this.$indicators.length) {
      this.$indicators.find('.active').removeClass('active')
      this.$element.one('slid.bs.carousel', function () {
        var $nextIndicator = $(that.$indicators.children()[that.getActiveIndex()])
        $nextIndicator && $nextIndicator.addClass('active')
      })
    }

    if ($.support.transition && this.$element.hasClass('slide')) {
      $next.addClass(type)
      $next[0].offsetWidth // force reflow
      $active.addClass(direction)
      $next.addClass(direction)
      $active
        .one($.support.transition.end, function () {
          $next.removeClass([type, direction].join(' ')).addClass('active')
          $active.removeClass(['active', direction].join(' '))
          that.sliding = false
          setTimeout(function () { that.$element.trigger('slid.bs.carousel') }, 0)
        })
        .emulateTransitionEnd($active.css('transition-duration').slice(0, -1) * 1000)
    } else {
      $active.removeClass('active')
      $next.addClass('active')
      this.sliding = false
      this.$element.trigger('slid.bs.carousel')
    }

    isCycling && this.cycle()

    return this
  }


  // CAROUSEL PLUGIN DEFINITION
  // ==========================

  var old = $.fn.carousel

  $.fn.carousel = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.carousel')
      var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
      var action  = typeof option == 'string' ? option : options.slide

      if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)))
      if (typeof option == 'number') data.to(option)
      else if (action) data[action]()
      else if (options.interval) data.pause().cycle()
    })
  }

  $.fn.carousel.Constructor = Carousel


  // CAROUSEL NO CONFLICT
  // ====================

  $.fn.carousel.noConflict = function () {
    $.fn.carousel = old
    return this
  }


  // CAROUSEL DATA-API
  // =================

  $(document).on('click.bs.carousel.data-api', '[data-slide], [data-slide-to]', function (e) {
    var $this   = $(this), href
    var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) //strip for ie7
    var options = $.extend({}, $target.data(), $this.data())
    var slideIndex = $this.attr('data-slide-to')
    if (slideIndex) options.interval = false

    $target.carousel(options)

    if (slideIndex = $this.attr('data-slide-to')) {
      $target.data('bs.carousel').to(slideIndex)
    }

    e.preventDefault()
  })

  $(window).on('load', function () {
    $('[data-ride="carousel"]').each(function () {
      var $carousel = $(this)
      $carousel.carousel($carousel.data())
    })
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: collapse.js v3.1.1
 * http://getbootstrap.com/javascript/#collapse
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================

  var Collapse = function (element, options) {
    this.$element      = $(element)
    this.options       = $.extend({}, Collapse.DEFAULTS, options)
    this.transitioning = null

    if (this.options.parent) this.$parent = $(this.options.parent)
    if (this.options.toggle) this.toggle()
  }

  Collapse.DEFAULTS = {
    toggle: true
  }

  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width')
    return hasWidth ? 'width' : 'height'
  }

  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in')) return

    var startEvent = $.Event('show.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var actives = this.$parent && this.$parent.find('> .panel > .in')

    if (actives && actives.length) {
      var hasData = actives.data('bs.collapse')
      if (hasData && hasData.transitioning) return
      actives.collapse('hide')
      hasData || actives.data('bs.collapse', null)
    }

    var dimension = this.dimension()

    this.$element
      .removeClass('collapse')
      .addClass('collapsing')
      [dimension](0)

    this.transitioning = 1

    var complete = function () {
      this.$element
        .removeClass('collapsing')
        .addClass('collapse in')
        [dimension]('auto')
      this.transitioning = 0
      this.$element.trigger('shown.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    var scrollSize = $.camelCase(['scroll', dimension].join('-'))

    this.$element
      .one($.support.transition.end, $.proxy(complete, this))
      .emulateTransitionEnd(350)
      [dimension](this.$element[0][scrollSize])
  }

  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in')) return

    var startEvent = $.Event('hide.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var dimension = this.dimension()

    this.$element
      [dimension](this.$element[dimension]())
      [0].offsetHeight

    this.$element
      .addClass('collapsing')
      .removeClass('collapse')
      .removeClass('in')

    this.transitioning = 1

    var complete = function () {
      this.transitioning = 0
      this.$element
        .trigger('hidden.bs.collapse')
        .removeClass('collapsing')
        .addClass('collapse')
    }

    if (!$.support.transition) return complete.call(this)

    this.$element
      [dimension](0)
      .one($.support.transition.end, $.proxy(complete, this))
      .emulateTransitionEnd(350)
  }

  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']()
  }


  // COLLAPSE PLUGIN DEFINITION
  // ==========================

  var old = $.fn.collapse

  $.fn.collapse = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.collapse')
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data && options.toggle && option == 'show') option = !option
      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.collapse.Constructor = Collapse


  // COLLAPSE NO CONFLICT
  // ====================

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


  // COLLAPSE DATA-API
  // =================

  $(document).on('click.bs.collapse.data-api', '[data-toggle=collapse]', function (e) {
    var $this   = $(this), href
    var target  = $this.attr('data-target')
        || e.preventDefault()
        || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') //strip for ie7
    var $target = $(target)
    var data    = $target.data('bs.collapse')
    var option  = data ? 'toggle' : $this.data()
    var parent  = $this.attr('data-parent')
    var $parent = parent && $(parent)

    if (!data || !data.transitioning) {
      if ($parent) $parent.find('[data-toggle=collapse][data-parent="' + parent + '"]').not($this).addClass('collapsed')
      $this[$target.hasClass('in') ? 'addClass' : 'removeClass']('collapsed')
    }

    $target.collapse(option)
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: dropdown.js v3.1.1
 * http://getbootstrap.com/javascript/#dropdowns
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // DROPDOWN CLASS DEFINITION
  // =========================

  var backdrop = '.dropdown-backdrop'
  var toggle   = '[data-toggle=dropdown]'
  var Dropdown = function (element) {
    $(element).on('click.bs.dropdown', this.toggle)
  }

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
      $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $parent
        .toggleClass('open')
        .trigger('shown.bs.dropdown', relatedTarget)

      $this.focus()
    }

    return false
  }

  Dropdown.prototype.keydown = function (e) {
    if (!/(38|40|27)/.test(e.keyCode)) return

    var $this = $(this)

    e.preventDefault()
    e.stopPropagation()

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    if (!isActive || (isActive && e.keyCode == 27)) {
      if (e.which == 27) $parent.find(toggle).focus()
      return $this.click()
    }

    var desc = ' li:not(.divider):visible a'
    var $items = $parent.find('[role=menu]' + desc + ', [role=listbox]' + desc)

    if (!$items.length) return

    var index = $items.index($items.filter(':focus'))

    if (e.keyCode == 38 && index > 0)                 index--                        // up
    if (e.keyCode == 40 && index < $items.length - 1) index++                        // down
    if (!~index)                                      index = 0

    $items.eq(index).focus()
  }

  function clearMenus(e) {
    $(backdrop).remove()
    $(toggle).each(function () {
      var $parent = getParent($(this))
      var relatedTarget = { relatedTarget: this }
      if (!$parent.hasClass('open')) return
      $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget))
      if (e.isDefaultPrevented()) return
      $parent.removeClass('open').trigger('hidden.bs.dropdown', relatedTarget)
    })
  }

  function getParent($this) {
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
    }

    var $parent = selector && $(selector)

    return $parent && $parent.length ? $parent : $this.parent()
  }


  // DROPDOWN PLUGIN DEFINITION
  // ==========================

  var old = $.fn.dropdown

  $.fn.dropdown = function (option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.dropdown')

      if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

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
    .on('click.bs.dropdown.data-api', clearMenus)
    .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
    .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle)
    .on('keydown.bs.dropdown.data-api', toggle + ', [role=menu], [role=listbox]', Dropdown.prototype.keydown)

}(jQuery);

/* ========================================================================
 * Bootstrap: modal.js v3.1.1
 * http://getbootstrap.com/javascript/#modals
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // MODAL CLASS DEFINITION
  // ======================

  var Modal = function (element, options) {
    this.options   = options
    this.$element  = $(element)
    this.$backdrop =
    this.isShown   = null

    if (this.options.remote) {
      this.$element
        .find('.modal-content')
        .load(this.options.remote, $.proxy(function () {
          this.$element.trigger('loaded.bs.modal')
        }, this))
    }
  }

  Modal.DEFAULTS = {
    backdrop: true,
    keyboard: true,
    show: true
  }

  Modal.prototype.toggle = function (_relatedTarget) {
    return this[!this.isShown ? 'show' : 'hide'](_relatedTarget)
  }

  Modal.prototype.show = function (_relatedTarget) {
    var that = this
    var e    = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

    this.$element.trigger(e)

    if (this.isShown || e.isDefaultPrevented()) return

    this.isShown = true

    this.escape()

    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade')

      if (!that.$element.parent().length) {
        that.$element.appendTo(document.body) // don't move modals dom position
      }

      that.$element
        .show()
        .scrollTop(0)

      if (transition) {
        that.$element[0].offsetWidth // force reflow
      }

      that.$element
        .addClass('in')
        .attr('aria-hidden', false)

      that.enforceFocus()

      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

      transition ?
        that.$element.find('.modal-dialog') // wait for modal to slide in
          .one($.support.transition.end, function () {
            that.$element.focus().trigger(e)
          })
          .emulateTransitionEnd(300) :
        that.$element.focus().trigger(e)
    })
  }

  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault()

    e = $.Event('hide.bs.modal')

    this.$element.trigger(e)

    if (!this.isShown || e.isDefaultPrevented()) return

    this.isShown = false

    this.escape()

    $(document).off('focusin.bs.modal')

    this.$element
      .removeClass('in')
      .attr('aria-hidden', true)
      .off('click.dismiss.bs.modal')

    $.support.transition && this.$element.hasClass('fade') ?
      this.$element
        .one($.support.transition.end, $.proxy(this.hideModal, this))
        .emulateTransitionEnd(300) :
      this.hideModal()
  }

  Modal.prototype.enforceFocus = function () {
    $(document)
      .off('focusin.bs.modal') // guard against infinite focus loop
      .on('focusin.bs.modal', $.proxy(function (e) {
        if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
          this.$element.focus()
        }
      }, this))
  }

  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keyup.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keyup.dismiss.bs.modal')
    }
  }

  Modal.prototype.hideModal = function () {
    var that = this
    this.$element.hide()
    this.backdrop(function () {
      that.removeBackdrop()
      that.$element.trigger('hidden.bs.modal')
    })
  }

  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }

  Modal.prototype.backdrop = function (callback) {
    var animate = this.$element.hasClass('fade') ? 'fade' : ''

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate

      this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />')
        .appendTo(document.body)

      this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
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
          .one($.support.transition.end, callback)
          .emulateTransitionEnd(150) :
        callback()

    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')

      $.support.transition && this.$element.hasClass('fade') ?
        this.$backdrop
          .one($.support.transition.end, callback)
          .emulateTransitionEnd(150) :
        callback()

    } else if (callback) {
      callback()
    }
  }


  // MODAL PLUGIN DEFINITION
  // =======================

  var old = $.fn.modal

  $.fn.modal = function (option, _relatedTarget) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.modal')
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option](_relatedTarget)
      else if (options.show) data.show(_relatedTarget)
    })
  }

  $.fn.modal.Constructor = Modal


  // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }


  // MODAL DATA-API
  // ==============

  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this   = $(this)
    var href    = $this.attr('href')
    var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) //strip for ie7
    var option  = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

    if ($this.is('a')) e.preventDefault()

    $target
      .modal(option, this)
      .one('hide', function () {
        $this.is(':visible') && $this.focus()
      })
  })

  $(document)
    .on('show.bs.modal', '.modal', function () { $(document.body).addClass('modal-open') })
    .on('hidden.bs.modal', '.modal', function () { $(document.body).removeClass('modal-open') })

}(jQuery);

/* ========================================================================
 * Bootstrap: tooltip.js v3.1.1
 * http://getbootstrap.com/javascript/#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TOOLTIP PUBLIC CLASS DEFINITION
  // ===============================

  var Tooltip = function (element, options) {
    this.type       =
    this.options    =
    this.enabled    =
    this.timeout    =
    this.hoverState =
    this.$element   = null

    this.init('tooltip', element, options)
  }

  Tooltip.DEFAULTS = {
    animation: true,
    placement: 'top',
    selector: false,
    template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    container: false
  }

  Tooltip.prototype.init = function (type, element, options) {
    this.enabled  = true
    this.type     = type
    this.$element = $(element)
    this.options  = this.getOptions(options)

    var triggers = this.options.trigger.split(' ')

    for (var i = triggers.length; i--;) {
      var trigger = triggers[i]

      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
      } else if (trigger != 'manual') {
        var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin'
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'

        this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
      }
    }

    this.options.selector ?
      (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
      this.fixTitle()
  }

  Tooltip.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS
  }

  Tooltip.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options)

    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay,
        hide: options.delay
      }
    }

    return options
  }

  Tooltip.prototype.getDelegateOptions = function () {
    var options  = {}
    var defaults = this.getDefaults()

    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value) options[key] = value
    })

    return options
  }

  Tooltip.prototype.enter = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type)

    clearTimeout(self.timeout)

    self.hoverState = 'in'

    if (!self.options.delay || !self.options.delay.show) return self.show()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in') self.show()
    }, self.options.delay.show)
  }

  Tooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type)

    clearTimeout(self.timeout)

    self.hoverState = 'out'

    if (!self.options.delay || !self.options.delay.hide) return self.hide()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out') self.hide()
    }, self.options.delay.hide)
  }

  Tooltip.prototype.show = function () {
    var e = $.Event('show.bs.' + this.type)

    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e)

      if (e.isDefaultPrevented()) return
      var that = this;

      var $tip = this.tip()

      this.setContent()

      if (this.options.animation) $tip.addClass('fade')

      var placement = typeof this.options.placement == 'function' ?
        this.options.placement.call(this, $tip[0], this.$element[0]) :
        this.options.placement

      var autoToken = /\s?auto?\s?/i
      var autoPlace = autoToken.test(placement)
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

      $tip
        .detach()
        .css({ top: 0, left: 0, display: 'block' })
        .addClass(placement)

      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)

      var pos          = this.getPosition()
      var actualWidth  = $tip[0].offsetWidth
      var actualHeight = $tip[0].offsetHeight

      if (autoPlace) {
        var $parent = this.$element.parent()

        var orgPlacement = placement
        var docScroll    = document.documentElement.scrollTop || document.body.scrollTop
        var parentWidth  = this.options.container == 'body' ? window.innerWidth  : $parent.outerWidth()
        var parentHeight = this.options.container == 'body' ? window.innerHeight : $parent.outerHeight()
        var parentLeft   = this.options.container == 'body' ? 0 : $parent.offset().left

        placement = placement == 'bottom' && pos.top   + pos.height  + actualHeight - docScroll > parentHeight  ? 'top'    :
                    placement == 'top'    && pos.top   - docScroll   - actualHeight < 0                         ? 'bottom' :
                    placement == 'right'  && pos.right + actualWidth > parentWidth                              ? 'left'   :
                    placement == 'left'   && pos.left  - actualWidth < parentLeft                               ? 'right'  :
                    placement

        $tip
          .removeClass(orgPlacement)
          .addClass(placement)
      }

      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

      this.applyPlacement(calculatedOffset, placement)
      this.hoverState = null

      var complete = function() {
        that.$element.trigger('shown.bs.' + that.type)
      }

      $.support.transition && this.$tip.hasClass('fade') ?
        $tip
          .one($.support.transition.end, complete)
          .emulateTransitionEnd(150) :
        complete()
    }
  }

  Tooltip.prototype.applyPlacement = function (offset, placement) {
    var replace
    var $tip   = this.tip()
    var width  = $tip[0].offsetWidth
    var height = $tip[0].offsetHeight

    // manually read margins because getBoundingClientRect includes difference
    var marginTop = parseInt($tip.css('margin-top'), 10)
    var marginLeft = parseInt($tip.css('margin-left'), 10)

    // we must check for NaN for ie 8/9
    if (isNaN(marginTop))  marginTop  = 0
    if (isNaN(marginLeft)) marginLeft = 0

    offset.top  = offset.top  + marginTop
    offset.left = offset.left + marginLeft

    // $.fn.offset doesn't round pixel values
    // so we use setOffset directly with our own function B-0
    $.offset.setOffset($tip[0], $.extend({
      using: function (props) {
        $tip.css({
          top: Math.round(props.top),
          left: Math.round(props.left)
        })
      }
    }, offset), 0)

    $tip.addClass('in')

    // check to see if placing tip in new offset caused the tip to resize itself
    var actualWidth  = $tip[0].offsetWidth
    var actualHeight = $tip[0].offsetHeight

    if (placement == 'top' && actualHeight != height) {
      replace = true
      offset.top = offset.top + height - actualHeight
    }

    if (/bottom|top/.test(placement)) {
      var delta = 0

      if (offset.left < 0) {
        delta       = offset.left * -2
        offset.left = 0

        $tip.offset(offset)

        actualWidth  = $tip[0].offsetWidth
        actualHeight = $tip[0].offsetHeight
      }

      this.replaceArrow(delta - width + actualWidth, actualWidth, 'left')
    } else {
      this.replaceArrow(actualHeight - height, actualHeight, 'top')
    }

    if (replace) $tip.offset(offset)
  }

  Tooltip.prototype.replaceArrow = function (delta, dimension, position) {
    this.arrow().css(position, delta ? (50 * (1 - delta / dimension) + '%') : '')
  }

  Tooltip.prototype.setContent = function () {
    var $tip  = this.tip()
    var title = this.getTitle()

    $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
    $tip.removeClass('fade in top bottom left right')
  }

  Tooltip.prototype.hide = function () {
    var that = this
    var $tip = this.tip()
    var e    = $.Event('hide.bs.' + this.type)

    function complete() {
      if (that.hoverState != 'in') $tip.detach()
      that.$element.trigger('hidden.bs.' + that.type)
    }

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    $tip.removeClass('in')

    $.support.transition && this.$tip.hasClass('fade') ?
      $tip
        .one($.support.transition.end, complete)
        .emulateTransitionEnd(150) :
      complete()

    this.hoverState = null

    return this
  }

  Tooltip.prototype.fixTitle = function () {
    var $e = this.$element
    if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
    }
  }

  Tooltip.prototype.hasContent = function () {
    return this.getTitle()
  }

  Tooltip.prototype.getPosition = function () {
    var el = this.$element[0]
    return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : {
      width: el.offsetWidth,
      height: el.offsetHeight
    }, this.$element.offset())
  }

  Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
    return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2  } :
           placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2  } :
           placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
        /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width   }
  }

  Tooltip.prototype.getTitle = function () {
    var title
    var $e = this.$element
    var o  = this.options

    title = $e.attr('data-original-title')
      || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

    return title
  }

  Tooltip.prototype.tip = function () {
    return this.$tip = this.$tip || $(this.options.template)
  }

  Tooltip.prototype.arrow = function () {
    return this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow')
  }

  Tooltip.prototype.validate = function () {
    if (!this.$element[0].parentNode) {
      this.hide()
      this.$element = null
      this.options  = null
    }
  }

  Tooltip.prototype.enable = function () {
    this.enabled = true
  }

  Tooltip.prototype.disable = function () {
    this.enabled = false
  }

  Tooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled
  }

  Tooltip.prototype.toggle = function (e) {
    var self = e ? $(e.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type) : this
    self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
  }

  Tooltip.prototype.destroy = function () {
    clearTimeout(this.timeout)
    this.hide().$element.off('.' + this.type).removeData('bs.' + this.type)
  }


  // TOOLTIP PLUGIN DEFINITION
  // =========================

  var old = $.fn.tooltip

  $.fn.tooltip = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.tooltip')
      var options = typeof option == 'object' && option

      if (!data && option == 'destroy') return
      if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tooltip.Constructor = Tooltip


  // TOOLTIP NO CONFLICT
  // ===================

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old
    return this
  }

}(jQuery);

/* ========================================================================
 * Bootstrap: popover.js v3.1.1
 * http://getbootstrap.com/javascript/#popovers
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // POPOVER PUBLIC CLASS DEFINITION
  // ===============================

  var Popover = function (element, options) {
    this.init('popover', element, options)
  }

  if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js')

  Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
    placement: 'right',
    trigger: 'click',
    content: '',
    template: '<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
  })


  // NOTE: POPOVER EXTENDS tooltip.js
  // ================================

  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)

  Popover.prototype.constructor = Popover

  Popover.prototype.getDefaults = function () {
    return Popover.DEFAULTS
  }

  Popover.prototype.setContent = function () {
    var $tip    = this.tip()
    var title   = this.getTitle()
    var content = this.getContent()

    $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
    $tip.find('.popover-content')[ // we use append for html objects to maintain js events
      this.options.html ? (typeof content == 'string' ? 'html' : 'append') : 'text'
    ](content)

    $tip.removeClass('fade top bottom left right in')

    // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
    // this manually by checking the contents.
    if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
  }

  Popover.prototype.hasContent = function () {
    return this.getTitle() || this.getContent()
  }

  Popover.prototype.getContent = function () {
    var $e = this.$element
    var o  = this.options

    return $e.attr('data-content')
      || (typeof o.content == 'function' ?
            o.content.call($e[0]) :
            o.content)
  }

  Popover.prototype.arrow = function () {
    return this.$arrow = this.$arrow || this.tip().find('.arrow')
  }

  Popover.prototype.tip = function () {
    if (!this.$tip) this.$tip = $(this.options.template)
    return this.$tip
  }


  // POPOVER PLUGIN DEFINITION
  // =========================

  var old = $.fn.popover

  $.fn.popover = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.popover')
      var options = typeof option == 'object' && option

      if (!data && option == 'destroy') return
      if (!data) $this.data('bs.popover', (data = new Popover(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.popover.Constructor = Popover


  // POPOVER NO CONFLICT
  // ===================

  $.fn.popover.noConflict = function () {
    $.fn.popover = old
    return this
  }

}(jQuery);

/* ========================================================================
 * Bootstrap: scrollspy.js v3.1.1
 * http://getbootstrap.com/javascript/#scrollspy
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // SCROLLSPY CLASS DEFINITION
  // ==========================

  function ScrollSpy(element, options) {
    var href
    var process  = $.proxy(this.process, this)

    this.$element       = $(element).is('body') ? $(window) : $(element)
    this.$body          = $('body')
    this.$scrollElement = this.$element.on('scroll.bs.scroll-spy.data-api', process)
    this.options        = $.extend({}, ScrollSpy.DEFAULTS, options)
    this.selector       = (this.options.target
      || ((href = $(element).attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) //strip for ie7
      || '') + ' .nav li > a'
    this.offsets        = $([])
    this.targets        = $([])
    this.activeTarget   = null

    this.refresh()
    this.process()
  }

  ScrollSpy.DEFAULTS = {
    offset: 10
  }

  ScrollSpy.prototype.refresh = function () {
    var offsetMethod = this.$element[0] == window ? 'offset' : 'position'

    this.offsets = $([])
    this.targets = $([])

    var self     = this
    var $targets = this.$body
      .find(this.selector)
      .map(function () {
        var $el   = $(this)
        var href  = $el.data('target') || $el.attr('href')
        var $href = /^#./.test(href) && $(href)

        return ($href
          && $href.length
          && $href.is(':visible')
          && [[ $href[offsetMethod]().top + (!$.isWindow(self.$scrollElement.get(0)) && self.$scrollElement.scrollTop()), href ]]) || null
      })
      .sort(function (a, b) { return a[0] - b[0] })
      .each(function () {
        self.offsets.push(this[0])
        self.targets.push(this[1])
      })
  }

  ScrollSpy.prototype.process = function () {
    var scrollTop    = this.$scrollElement.scrollTop() + this.options.offset
    var scrollHeight = this.$scrollElement[0].scrollHeight || this.$body[0].scrollHeight
    var maxScroll    = scrollHeight - this.$scrollElement.height()
    var offsets      = this.offsets
    var targets      = this.targets
    var activeTarget = this.activeTarget
    var i

    if (scrollTop >= maxScroll) {
      return activeTarget != (i = targets.last()[0]) && this.activate(i)
    }

    if (activeTarget && scrollTop <= offsets[0]) {
      return activeTarget != (i = targets[0]) && this.activate(i)
    }

    for (i = offsets.length; i--;) {
      activeTarget != targets[i]
        && scrollTop >= offsets[i]
        && (!offsets[i + 1] || scrollTop <= offsets[i + 1])
        && this.activate( targets[i] )
    }
  }

  ScrollSpy.prototype.activate = function (target) {
    this.activeTarget = target

    $(this.selector)
      .parentsUntil(this.options.target, '.active')
      .removeClass('active')

    var selector = this.selector +
        '[data-target="' + target + '"],' +
        this.selector + '[href="' + target + '"]'

    var active = $(selector)
      .parents('li')
      .addClass('active')

    if (active.parent('.dropdown-menu').length) {
      active = active
        .closest('li.dropdown')
        .addClass('active')
    }

    active.trigger('activate.bs.scrollspy')
  }


  // SCROLLSPY PLUGIN DEFINITION
  // ===========================

  var old = $.fn.scrollspy

  $.fn.scrollspy = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.scrollspy')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.scrollspy.Constructor = ScrollSpy


  // SCROLLSPY NO CONFLICT
  // =====================

  $.fn.scrollspy.noConflict = function () {
    $.fn.scrollspy = old
    return this
  }


  // SCROLLSPY DATA-API
  // ==================

  $(window).on('load', function () {
    $('[data-spy="scroll"]').each(function () {
      var $spy = $(this)
      $spy.scrollspy($spy.data())
    })
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: tab.js v3.1.1
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TAB CLASS DEFINITION
  // ====================

  var Tab = function (element) {
    this.element = $(element)
  }

  Tab.prototype.show = function () {
    var $this    = this.element
    var $ul      = $this.closest('ul:not(.dropdown-menu)')
    var selector = $this.data('target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
    }

    if ($this.parent('li').hasClass('active')) return

    var previous = $ul.find('.active:last a')[0]
    var e        = $.Event('show.bs.tab', {
      relatedTarget: previous
    })

    $this.trigger(e)

    if (e.isDefaultPrevented()) return

    var $target = $(selector)

    this.activate($this.parent('li'), $ul)
    this.activate($target, $target.parent(), function () {
      $this.trigger({
        type: 'shown.bs.tab',
        relatedTarget: previous
      })
    })
  }

  Tab.prototype.activate = function (element, container, callback) {
    var $active    = container.find('> .active')
    var transition = callback
      && $.support.transition
      && $active.hasClass('fade')

    function next() {
      $active
        .removeClass('active')
        .find('> .dropdown-menu > .active')
        .removeClass('active')

      element.addClass('active')

      if (transition) {
        element[0].offsetWidth // reflow for transition
        element.addClass('in')
      } else {
        element.removeClass('fade')
      }

      if (element.parent('.dropdown-menu')) {
        element.closest('li.dropdown').addClass('active')
      }

      callback && callback()
    }

    transition ?
      $active
        .one($.support.transition.end, next)
        .emulateTransitionEnd(150) :
      next()

    $active.removeClass('in')
  }


  // TAB PLUGIN DEFINITION
  // =====================

  var old = $.fn.tab

  $.fn.tab = function ( option ) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.tab')

      if (!data) $this.data('bs.tab', (data = new Tab(this)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tab.Constructor = Tab


  // TAB NO CONFLICT
  // ===============

  $.fn.tab.noConflict = function () {
    $.fn.tab = old
    return this
  }


  // TAB DATA-API
  // ============

  $(document).on('click.bs.tab.data-api', '[data-toggle="tab"], [data-toggle="pill"]', function (e) {
    e.preventDefault()
    $(this).tab('show')
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: affix.js v3.1.1
 * http://getbootstrap.com/javascript/#affix
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // AFFIX CLASS DEFINITION
  // ======================

  var Affix = function (element, options) {
    this.options = $.extend({}, Affix.DEFAULTS, options)
    this.$window = $(window)
      .on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this))
      .on('click.bs.affix.data-api',  $.proxy(this.checkPositionWithEventLoop, this))

    this.$element     = $(element)
    this.affixed      =
    this.unpin        =
    this.pinnedOffset = null

    this.checkPosition()
  }

  Affix.RESET = 'affix affix-top affix-bottom'

  Affix.DEFAULTS = {
    offset: 0
  }

  Affix.prototype.getPinnedOffset = function () {
    if (this.pinnedOffset) return this.pinnedOffset
    this.$element.removeClass(Affix.RESET).addClass('affix')
    var scrollTop = this.$window.scrollTop()
    var position  = this.$element.offset()
    return (this.pinnedOffset = position.top - scrollTop)
  }

  Affix.prototype.checkPositionWithEventLoop = function () {
    setTimeout($.proxy(this.checkPosition, this), 1)
  }

  Affix.prototype.checkPosition = function () {
    if (!this.$element.is(':visible')) return

    var scrollHeight = $(document).height()
    var scrollTop    = this.$window.scrollTop()
    var position     = this.$element.offset()
    var offset       = this.options.offset
    var offsetTop    = offset.top
    var offsetBottom = offset.bottom

    if (this.affixed == 'top') position.top += scrollTop

    if (typeof offset != 'object')         offsetBottom = offsetTop = offset
    if (typeof offsetTop == 'function')    offsetTop    = offset.top(this.$element)
    if (typeof offsetBottom == 'function') offsetBottom = offset.bottom(this.$element)

    var affix = this.unpin   != null && (scrollTop + this.unpin <= position.top) ? false :
                offsetBottom != null && (position.top + this.$element.height() >= scrollHeight - offsetBottom) ? 'bottom' :
                offsetTop    != null && (scrollTop <= offsetTop) ? 'top' : false

    if (this.affixed === affix) return
    if (this.unpin) this.$element.css('top', '')

    var affixType = 'affix' + (affix ? '-' + affix : '')
    var e         = $.Event(affixType + '.bs.affix')

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    this.affixed = affix
    this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null

    this.$element
      .removeClass(Affix.RESET)
      .addClass(affixType)
      .trigger($.Event(affixType.replace('affix', 'affixed')))

    if (affix == 'bottom') {
      this.$element.offset({ top: scrollHeight - offsetBottom - this.$element.height() })
    }
  }


  // AFFIX PLUGIN DEFINITION
  // =======================

  var old = $.fn.affix

  $.fn.affix = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.affix')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.affix', (data = new Affix(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.affix.Constructor = Affix


  // AFFIX NO CONFLICT
  // =================

  $.fn.affix.noConflict = function () {
    $.fn.affix = old
    return this
  }


  // AFFIX DATA-API
  // ==============

  $(window).on('load', function () {
    $('[data-spy="affix"]').each(function () {
      var $spy = $(this)
      var data = $spy.data()

      data.offset = data.offset || {}

      if (data.offsetBottom) data.offset.bottom = data.offsetBottom
      if (data.offsetTop)    data.offset.top    = data.offsetTop

      $spy.affix(data)
    })
  })

}(jQuery);
/*
 * jQuery FlexSlider v2.2.2
 * Copyright 2012 WooThemes
 * Contributing Author: Tyler Smith
 */
;
(function ($) {

  //FlexSlider: Object Instance
  $.flexslider = function(el, options) {
    var slider = $(el);

    // making variables public
    slider.vars = $.extend({}, $.flexslider.defaults, options);

    var namespace = slider.vars.namespace,
        msGesture = window.navigator && window.navigator.msPointerEnabled && window.MSGesture,
        touch = (( "ontouchstart" in window ) || msGesture || window.DocumentTouch && document instanceof DocumentTouch) && slider.vars.touch,
        // depricating this idea, as devices are being released with both of these events
        //eventType = (touch) ? "touchend" : "click",
        eventType = "click touchend MSPointerUp",
        watchedEvent = "",
        watchedEventClearTimer,
        vertical = slider.vars.direction === "vertical",
        reverse = slider.vars.reverse,
        carousel = (slider.vars.itemWidth > 0),
        fade = slider.vars.animation === "fade",
        asNav = slider.vars.asNavFor !== "",
        methods = {},
        focused = true;

    // Store a reference to the slider object
    $.data(el, "flexslider", slider);

    // Private slider methods
    methods = {
      init: function() {
        slider.animating = false;
        // Get current slide and make sure it is a number
        slider.currentSlide = parseInt( ( slider.vars.startAt ? slider.vars.startAt : 0), 10 );
        if ( isNaN( slider.currentSlide ) ) slider.currentSlide = 0;
        slider.animatingTo = slider.currentSlide;
        slider.atEnd = (slider.currentSlide === 0 || slider.currentSlide === slider.last);
        slider.containerSelector = slider.vars.selector.substr(0,slider.vars.selector.search(' '));
        slider.slides = $(slider.vars.selector, slider);
        slider.container = $(slider.containerSelector, slider);
        slider.count = slider.slides.length;
        // SYNC:
        slider.syncExists = $(slider.vars.sync).length > 0;
        // SLIDE:
        if (slider.vars.animation === "slide") slider.vars.animation = "swing";
        slider.prop = (vertical) ? "top" : "marginLeft";
        slider.args = {};
        // SLIDESHOW:
        slider.manualPause = false;
        slider.stopped = false;
        //PAUSE WHEN INVISIBLE
        slider.started = false;
        slider.startTimeout = null;
        // TOUCH/USECSS:
        slider.transitions = !slider.vars.video && !fade && slider.vars.useCSS && (function() {
          var obj = document.createElement('div'),
              props = ['perspectiveProperty', 'WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective'];
          for (var i in props) {
            if ( obj.style[ props[i] ] !== undefined ) {
              slider.pfx = props[i].replace('Perspective','').toLowerCase();
              slider.prop = "-" + slider.pfx + "-transform";
              return true;
            }
          }
          return false;
        }());
        slider.ensureAnimationEnd = '';
        // CONTROLSCONTAINER:
        if (slider.vars.controlsContainer !== "") slider.controlsContainer = $(slider.vars.controlsContainer).length > 0 && $(slider.vars.controlsContainer);
        // MANUAL:
        if (slider.vars.manualControls !== "") slider.manualControls = $(slider.vars.manualControls).length > 0 && $(slider.vars.manualControls);

        // RANDOMIZE:
        if (slider.vars.randomize) {
          slider.slides.sort(function() { return (Math.round(Math.random())-0.5); });
          slider.container.empty().append(slider.slides);
        }

        slider.doMath();

        // INIT
        slider.setup("init");

        // CONTROLNAV:
        if (slider.vars.controlNav) methods.controlNav.setup();

        // DIRECTIONNAV:
        if (slider.vars.directionNav) methods.directionNav.setup();

        // KEYBOARD:
        if (slider.vars.keyboard && ($(slider.containerSelector).length === 1 || slider.vars.multipleKeyboard)) {
          $(document).bind('keyup', function(event) {
            var keycode = event.keyCode;
            if (!slider.animating && (keycode === 39 || keycode === 37)) {
              var target = (keycode === 39) ? slider.getTarget('next') :
                           (keycode === 37) ? slider.getTarget('prev') : false;
              slider.flexAnimate(target, slider.vars.pauseOnAction);
            }
          });
        }
        // MOUSEWHEEL:
        if (slider.vars.mousewheel) {
          slider.bind('mousewheel', function(event, delta, deltaX, deltaY) {
            event.preventDefault();
            var target = (delta < 0) ? slider.getTarget('next') : slider.getTarget('prev');
            slider.flexAnimate(target, slider.vars.pauseOnAction);
          });
        }

        // PAUSEPLAY
        if (slider.vars.pausePlay) methods.pausePlay.setup();

        //PAUSE WHEN INVISIBLE
        if (slider.vars.slideshow && slider.vars.pauseInvisible) methods.pauseInvisible.init();

        // SLIDSESHOW
        if (slider.vars.slideshow) {
          if (slider.vars.pauseOnHover) {
            slider.hover(function() {
              if (!slider.manualPlay && !slider.manualPause) slider.pause();
            }, function() {
              if (!slider.manualPause && !slider.manualPlay && !slider.stopped) slider.play();
            });
          }
          // initialize animation
          //If we're visible, or we don't use PageVisibility API
          if(!slider.vars.pauseInvisible || !methods.pauseInvisible.isHidden()) {
            (slider.vars.initDelay > 0) ? slider.startTimeout = setTimeout(slider.play, slider.vars.initDelay) : slider.play();
          }
        }

        // ASNAV:
        if (asNav) methods.asNav.setup();

        // TOUCH
        if (touch && slider.vars.touch) methods.touch();

        // FADE&&SMOOTHHEIGHT || SLIDE:
        if (!fade || (fade && slider.vars.smoothHeight)) $(window).bind("resize orientationchange focus", methods.resize);

        slider.find("img").attr("draggable", "false");

        // API: start() Callback
        setTimeout(function(){
          slider.vars.start(slider);
        }, 200);
      },
      asNav: {
        setup: function() {
          slider.asNav = true;
          slider.animatingTo = Math.floor(slider.currentSlide/slider.move);
          slider.currentItem = slider.currentSlide;
          slider.slides.removeClass(namespace + "active-slide").eq(slider.currentItem).addClass(namespace + "active-slide");
          if(!msGesture){
              slider.slides.on(eventType, function(e){
                e.preventDefault();
                var $slide = $(this),
                    target = $slide.index();
                var posFromLeft = $slide.offset().left - $(slider).scrollLeft(); // Find position of slide relative to left of slider container
                if( posFromLeft <= 0 && $slide.hasClass( namespace + 'active-slide' ) ) {
                  slider.flexAnimate(slider.getTarget("prev"), true);
                } else if (!$(slider.vars.asNavFor).data('flexslider').animating && !$slide.hasClass(namespace + "active-slide")) {
                  slider.direction = (slider.currentItem < target) ? "next" : "prev";
                  slider.flexAnimate(target, slider.vars.pauseOnAction, false, true, true);
                }
              });
          }else{
              el._slider = slider;
              slider.slides.each(function (){
                  var that = this;
                  that._gesture = new MSGesture();
                  that._gesture.target = that;
                  that.addEventListener("MSPointerDown", function (e){
                      e.preventDefault();
                      if(e.currentTarget._gesture)
                          e.currentTarget._gesture.addPointer(e.pointerId);
                  }, false);
                  that.addEventListener("MSGestureTap", function (e){
                      e.preventDefault();
                      var $slide = $(this),
                          target = $slide.index();
                      if (!$(slider.vars.asNavFor).data('flexslider').animating && !$slide.hasClass('active')) {
                          slider.direction = (slider.currentItem < target) ? "next" : "prev";
                          slider.flexAnimate(target, slider.vars.pauseOnAction, false, true, true);
                      }
                  });
              });
          }
        }
      },
      controlNav: {
        setup: function() {
          if (!slider.manualControls) {
            methods.controlNav.setupPaging();
          } else { // MANUALCONTROLS:
            methods.controlNav.setupManual();
          }
        },
        setupPaging: function() {
          var type = (slider.vars.controlNav === "thumbnails") ? 'control-thumbs' : 'control-paging',
              j = 1,
              item,
              slide;

          slider.controlNavScaffold = $('<ol class="'+ namespace + 'control-nav ' + namespace + type + '"></ol>');

          if (slider.pagingCount > 1) {
            for (var i = 0; i < slider.pagingCount; i++) {
              slide = slider.slides.eq(i);
              item = (slider.vars.controlNav === "thumbnails") ? '<img src="' + slide.attr( 'data-thumb' ) + '"/>' : '<a>' + j + '</a>';
              if ( 'thumbnails' === slider.vars.controlNav && true === slider.vars.thumbCaptions ) {
                var captn = slide.attr( 'data-thumbcaption' );
                if ( '' != captn && undefined != captn ) item += '<span class="' + namespace + 'caption">' + captn + '</span>';
              }
              slider.controlNavScaffold.append('<li>' + item + '</li>');
              j++;
            }
          }

          // CONTROLSCONTAINER:
          (slider.controlsContainer) ? $(slider.controlsContainer).append(slider.controlNavScaffold) : slider.append(slider.controlNavScaffold);
          methods.controlNav.set();

          methods.controlNav.active();

          slider.controlNavScaffold.delegate('a, img', eventType, function(event) {
            event.preventDefault();

            if (watchedEvent === "" || watchedEvent === event.type) {
              var $this = $(this),
                  target = slider.controlNav.index($this);

              if (!$this.hasClass(namespace + 'active')) {
                slider.direction = (target > slider.currentSlide) ? "next" : "prev";
                slider.flexAnimate(target, slider.vars.pauseOnAction);
              }
            }

            // setup flags to prevent event duplication
            if (watchedEvent === "") {
              watchedEvent = event.type;
            }
            methods.setToClearWatchedEvent();

          });
        },
        setupManual: function() {
          slider.controlNav = slider.manualControls;
          methods.controlNav.active();

          slider.controlNav.bind(eventType, function(event) {
            event.preventDefault();

            if (watchedEvent === "" || watchedEvent === event.type) {
              var $this = $(this),
                  target = slider.controlNav.index($this);

              if (!$this.hasClass(namespace + 'active')) {
                (target > slider.currentSlide) ? slider.direction = "next" : slider.direction = "prev";
                slider.flexAnimate(target, slider.vars.pauseOnAction);
              }
            }

            // setup flags to prevent event duplication
            if (watchedEvent === "") {
              watchedEvent = event.type;
            }
            methods.setToClearWatchedEvent();
          });
        },
        set: function() {
          var selector = (slider.vars.controlNav === "thumbnails") ? 'img' : 'a';
          slider.controlNav = $('.' + namespace + 'control-nav li ' + selector, (slider.controlsContainer) ? slider.controlsContainer : slider);
        },
        active: function() {
          slider.controlNav.removeClass(namespace + "active").eq(slider.animatingTo).addClass(namespace + "active");
        },
        update: function(action, pos) {
          if (slider.pagingCount > 1 && action === "add") {
            slider.controlNavScaffold.append($('<li><a>' + slider.count + '</a></li>'));
          } else if (slider.pagingCount === 1) {
            slider.controlNavScaffold.find('li').remove();
          } else {
            slider.controlNav.eq(pos).closest('li').remove();
          }
          methods.controlNav.set();
          (slider.pagingCount > 1 && slider.pagingCount !== slider.controlNav.length) ? slider.update(pos, action) : methods.controlNav.active();
        }
      },
      directionNav: {
        setup: function() {
          var directionNavScaffold = $('<ul class="' + namespace + 'direction-nav"><li><a class="' + namespace + 'prev" href="#">' + slider.vars.prevText + '</a></li><li><a class="' + namespace + 'next" href="#">' + slider.vars.nextText + '</a></li></ul>');

          // CONTROLSCONTAINER:
          if (slider.controlsContainer) {
            $(slider.controlsContainer).append(directionNavScaffold);
            slider.directionNav = $('.' + namespace + 'direction-nav li a', slider.controlsContainer);
          } else {
            slider.append(directionNavScaffold);
            slider.directionNav = $('.' + namespace + 'direction-nav li a', slider);
          }

          methods.directionNav.update();

          slider.directionNav.bind(eventType, function(event) {
            event.preventDefault();
            var target;

            if (watchedEvent === "" || watchedEvent === event.type) {
              target = ($(this).hasClass(namespace + 'next')) ? slider.getTarget('next') : slider.getTarget('prev');
              slider.flexAnimate(target, slider.vars.pauseOnAction);
            }

            // setup flags to prevent event duplication
            if (watchedEvent === "") {
              watchedEvent = event.type;
            }
            methods.setToClearWatchedEvent();
          });
        },
        update: function() {
          var disabledClass = namespace + 'disabled';
          if (slider.pagingCount === 1) {
            slider.directionNav.addClass(disabledClass).attr('tabindex', '-1');
          } else if (!slider.vars.animationLoop) {
            if (slider.animatingTo === 0) {
              slider.directionNav.removeClass(disabledClass).filter('.' + namespace + "prev").addClass(disabledClass).attr('tabindex', '-1');
            } else if (slider.animatingTo === slider.last) {
              slider.directionNav.removeClass(disabledClass).filter('.' + namespace + "next").addClass(disabledClass).attr('tabindex', '-1');
            } else {
              slider.directionNav.removeClass(disabledClass).removeAttr('tabindex');
            }
          } else {
            slider.directionNav.removeClass(disabledClass).removeAttr('tabindex');
          }
        }
      },
      pausePlay: {
        setup: function() {
          var pausePlayScaffold = $('<div class="' + namespace + 'pauseplay"><a></a></div>');

          // CONTROLSCONTAINER:
          if (slider.controlsContainer) {
            slider.controlsContainer.append(pausePlayScaffold);
            slider.pausePlay = $('.' + namespace + 'pauseplay a', slider.controlsContainer);
          } else {
            slider.append(pausePlayScaffold);
            slider.pausePlay = $('.' + namespace + 'pauseplay a', slider);
          }

          methods.pausePlay.update((slider.vars.slideshow) ? namespace + 'pause' : namespace + 'play');

          slider.pausePlay.bind(eventType, function(event) {
            event.preventDefault();

            if (watchedEvent === "" || watchedEvent === event.type) {
              if ($(this).hasClass(namespace + 'pause')) {
                slider.manualPause = true;
                slider.manualPlay = false;
                slider.pause();
              } else {
                slider.manualPause = false;
                slider.manualPlay = true;
                slider.play();
              }
            }

            // setup flags to prevent event duplication
            if (watchedEvent === "") {
              watchedEvent = event.type;
            }
            methods.setToClearWatchedEvent();
          });
        },
        update: function(state) {
          (state === "play") ? slider.pausePlay.removeClass(namespace + 'pause').addClass(namespace + 'play').html(slider.vars.playText) : slider.pausePlay.removeClass(namespace + 'play').addClass(namespace + 'pause').html(slider.vars.pauseText);
        }
      },
      touch: function() {
        var startX,
          startY,
          offset,
          cwidth,
          dx,
          startT,
          scrolling = false,
          localX = 0,
          localY = 0,
          accDx = 0;

        if(!msGesture){
            el.addEventListener('touchstart', onTouchStart, false);

            function onTouchStart(e) {
              if (slider.animating) {
                e.preventDefault();
              } else if ( ( window.navigator.msPointerEnabled ) || e.touches.length === 1 ) {
                slider.pause();
                // CAROUSEL:
                cwidth = (vertical) ? slider.h : slider. w;
                startT = Number(new Date());
                // CAROUSEL:

                // Local vars for X and Y points.
                localX = e.touches[0].pageX;
                localY = e.touches[0].pageY;

                offset = (carousel && reverse && slider.animatingTo === slider.last) ? 0 :
                         (carousel && reverse) ? slider.limit - (((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.animatingTo) :
                         (carousel && slider.currentSlide === slider.last) ? slider.limit :
                         (carousel) ? ((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.currentSlide :
                         (reverse) ? (slider.last - slider.currentSlide + slider.cloneOffset) * cwidth : (slider.currentSlide + slider.cloneOffset) * cwidth;
                startX = (vertical) ? localY : localX;
                startY = (vertical) ? localX : localY;

                el.addEventListener('touchmove', onTouchMove, false);
                el.addEventListener('touchend', onTouchEnd, false);
              }
            }

            function onTouchMove(e) {
              // Local vars for X and Y points.

              localX = e.touches[0].pageX;
              localY = e.touches[0].pageY;

              dx = (vertical) ? startX - localY : startX - localX;
              scrolling = (vertical) ? (Math.abs(dx) < Math.abs(localX - startY)) : (Math.abs(dx) < Math.abs(localY - startY));

              var fxms = 500;

              if ( ! scrolling || Number( new Date() ) - startT > fxms ) {
                e.preventDefault();
                if (!fade && slider.transitions) {
                  if (!slider.vars.animationLoop) {
                    dx = dx/((slider.currentSlide === 0 && dx < 0 || slider.currentSlide === slider.last && dx > 0) ? (Math.abs(dx)/cwidth+2) : 1);
                  }
                  slider.setProps(offset + dx, "setTouch");
                }
              }
            }

            function onTouchEnd(e) {
              // finish the touch by undoing the touch session
              el.removeEventListener('touchmove', onTouchMove, false);

              if (slider.animatingTo === slider.currentSlide && !scrolling && !(dx === null)) {
                var updateDx = (reverse) ? -dx : dx,
                    target = (updateDx > 0) ? slider.getTarget('next') : slider.getTarget('prev');

                if (slider.canAdvance(target) && (Number(new Date()) - startT < 550 && Math.abs(updateDx) > 50 || Math.abs(updateDx) > cwidth/2)) {
                  slider.flexAnimate(target, slider.vars.pauseOnAction);
                } else {
                  if (!fade) slider.flexAnimate(slider.currentSlide, slider.vars.pauseOnAction, true);
                }
              }
              el.removeEventListener('touchend', onTouchEnd, false);

              startX = null;
              startY = null;
              dx = null;
              offset = null;
            }
        }else{
            el.style.msTouchAction = "none";
            el._gesture = new MSGesture();
            el._gesture.target = el;
            el.addEventListener("MSPointerDown", onMSPointerDown, false);
            el._slider = slider;
            el.addEventListener("MSGestureChange", onMSGestureChange, false);
            el.addEventListener("MSGestureEnd", onMSGestureEnd, false);

            function onMSPointerDown(e){
                e.stopPropagation();
                if (slider.animating) {
                    e.preventDefault();
                }else{
                    slider.pause();
                    el._gesture.addPointer(e.pointerId);
                    accDx = 0;
                    cwidth = (vertical) ? slider.h : slider. w;
                    startT = Number(new Date());
                    // CAROUSEL:

                    offset = (carousel && reverse && slider.animatingTo === slider.last) ? 0 :
                        (carousel && reverse) ? slider.limit - (((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.animatingTo) :
                            (carousel && slider.currentSlide === slider.last) ? slider.limit :
                                (carousel) ? ((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.currentSlide :
                                    (reverse) ? (slider.last - slider.currentSlide + slider.cloneOffset) * cwidth : (slider.currentSlide + slider.cloneOffset) * cwidth;
                }
            }

            function onMSGestureChange(e) {
                e.stopPropagation();
                var slider = e.target._slider;
                if(!slider){
                    return;
                }
                var transX = -e.translationX,
                    transY = -e.translationY;

                //Accumulate translations.
                accDx = accDx + ((vertical) ? transY : transX);
                dx = accDx;
                scrolling = (vertical) ? (Math.abs(accDx) < Math.abs(-transX)) : (Math.abs(accDx) < Math.abs(-transY));

                if(e.detail === e.MSGESTURE_FLAG_INERTIA){
                    setImmediate(function (){
                        el._gesture.stop();
                    });

                    return;
                }

                if (!scrolling || Number(new Date()) - startT > 500) {
                    e.preventDefault();
                    if (!fade && slider.transitions) {
                        if (!slider.vars.animationLoop) {
                            dx = accDx / ((slider.currentSlide === 0 && accDx < 0 || slider.currentSlide === slider.last && accDx > 0) ? (Math.abs(accDx) / cwidth + 2) : 1);
                        }
                        slider.setProps(offset + dx, "setTouch");
                    }
                }
            }

            function onMSGestureEnd(e) {
                e.stopPropagation();
                var slider = e.target._slider;
                if(!slider){
                    return;
                }
                if (slider.animatingTo === slider.currentSlide && !scrolling && !(dx === null)) {
                    var updateDx = (reverse) ? -dx : dx,
                        target = (updateDx > 0) ? slider.getTarget('next') : slider.getTarget('prev');

                    if (slider.canAdvance(target) && (Number(new Date()) - startT < 550 && Math.abs(updateDx) > 50 || Math.abs(updateDx) > cwidth/2)) {
                        slider.flexAnimate(target, slider.vars.pauseOnAction);
                    } else {
                        if (!fade) slider.flexAnimate(slider.currentSlide, slider.vars.pauseOnAction, true);
                    }
                }

                startX = null;
                startY = null;
                dx = null;
                offset = null;
                accDx = 0;
            }
        }
      },
      resize: function() {
        if (!slider.animating && slider.is(':visible')) {
          if (!carousel) slider.doMath();

          if (fade) {
            // SMOOTH HEIGHT:
            methods.smoothHeight();
          } else if (carousel) { //CAROUSEL:
            slider.slides.width(slider.computedW);
            slider.update(slider.pagingCount);
            slider.setProps();
          }
          else if (vertical) { //VERTICAL:
            slider.viewport.height(slider.h);
            slider.setProps(slider.h, "setTotal");
          } else {
            // SMOOTH HEIGHT:
            if (slider.vars.smoothHeight) methods.smoothHeight();
            slider.newSlides.width(slider.computedW);
            slider.setProps(slider.computedW, "setTotal");
          }
        }
      },
      smoothHeight: function(dur) {
        if (!vertical || fade) {
          var $obj = (fade) ? slider : slider.viewport;
          (dur) ? $obj.animate({"height": slider.slides.eq(slider.animatingTo).height()}, dur) : $obj.height(slider.slides.eq(slider.animatingTo).height());
        }
      },
      sync: function(action) {
        var $obj = $(slider.vars.sync).data("flexslider"),
            target = slider.animatingTo;

        switch (action) {
          case "animate": $obj.flexAnimate(target, slider.vars.pauseOnAction, false, true); break;
          case "play": if (!$obj.playing && !$obj.asNav) { $obj.play(); } break;
          case "pause": $obj.pause(); break;
        }
      },
      uniqueID: function($clone) {
        $clone.find( '[id]' ).each(function() {
          var $this = $(this);
          $this.attr( 'id', $this.attr( 'id' ) + '_clone' );
        });
        return $clone;
      },
      pauseInvisible: {
        visProp: null,
        init: function() {
          var prefixes = ['webkit','moz','ms','o'];

          if ('hidden' in document) return 'hidden';
          for (var i = 0; i < prefixes.length; i++) {
            if ((prefixes[i] + 'Hidden') in document)
            methods.pauseInvisible.visProp = prefixes[i] + 'Hidden';
          }
          if (methods.pauseInvisible.visProp) {
            var evtname = methods.pauseInvisible.visProp.replace(/[H|h]idden/,'') + 'visibilitychange';
            document.addEventListener(evtname, function() {
              if (methods.pauseInvisible.isHidden()) {
                if(slider.startTimeout) clearTimeout(slider.startTimeout); //If clock is ticking, stop timer and prevent from starting while invisible
                else slider.pause(); //Or just pause
              }
              else {
                if(slider.started) slider.play(); //Initiated before, just play
                else (slider.vars.initDelay > 0) ? setTimeout(slider.play, slider.vars.initDelay) : slider.play(); //Didn't init before: simply init or wait for it
              }
            });
          }
        },
        isHidden: function() {
          return document[methods.pauseInvisible.visProp] || false;
        }
      },
      setToClearWatchedEvent: function() {
        clearTimeout(watchedEventClearTimer);
        watchedEventClearTimer = setTimeout(function() {
          watchedEvent = "";
        }, 3000);
      }
    };

    // public methods
    slider.flexAnimate = function(target, pause, override, withSync, fromNav) {
      if (!slider.vars.animationLoop && target !== slider.currentSlide) {
        slider.direction = (target > slider.currentSlide) ? "next" : "prev";
      }

      if (asNav && slider.pagingCount === 1) slider.direction = (slider.currentItem < target) ? "next" : "prev";

      if (!slider.animating && (slider.canAdvance(target, fromNav) || override) && slider.is(":visible")) {
        if (asNav && withSync) {
          var master = $(slider.vars.asNavFor).data('flexslider');
          slider.atEnd = target === 0 || target === slider.count - 1;
          master.flexAnimate(target, true, false, true, fromNav);
          slider.direction = (slider.currentItem < target) ? "next" : "prev";
          master.direction = slider.direction;

          if (Math.ceil((target + 1)/slider.visible) - 1 !== slider.currentSlide && target !== 0) {
            slider.currentItem = target;
            slider.slides.removeClass(namespace + "active-slide").eq(target).addClass(namespace + "active-slide");
            target = Math.floor(target/slider.visible);
          } else {
            slider.currentItem = target;
            slider.slides.removeClass(namespace + "active-slide").eq(target).addClass(namespace + "active-slide");
            return false;
          }
        }

        slider.animating = true;
        slider.animatingTo = target;

        // SLIDESHOW:
        if (pause) slider.pause();

        // API: before() animation Callback
        slider.vars.before(slider);

        // SYNC:
        if (slider.syncExists && !fromNav) methods.sync("animate");

        // CONTROLNAV
        if (slider.vars.controlNav) methods.controlNav.active();

        // !CAROUSEL:
        // CANDIDATE: slide active class (for add/remove slide)
        if (!carousel) slider.slides.removeClass(namespace + 'active-slide').eq(target).addClass(namespace + 'active-slide');

        // INFINITE LOOP:
        // CANDIDATE: atEnd
        slider.atEnd = target === 0 || target === slider.last;

        // DIRECTIONNAV:
        if (slider.vars.directionNav) methods.directionNav.update();

        if (target === slider.last) {
          // API: end() of cycle Callback
          slider.vars.end(slider);
          // SLIDESHOW && !INFINITE LOOP:
          if (!slider.vars.animationLoop) slider.pause();
        }

        // SLIDE:
        if (!fade) {
          var dimension = (vertical) ? slider.slides.filter(':first').height() : slider.computedW,
              margin, slideString, calcNext;

          // INFINITE LOOP / REVERSE:
          if (carousel) {
            //margin = (slider.vars.itemWidth > slider.w) ? slider.vars.itemMargin * 2 : slider.vars.itemMargin;
            margin = slider.vars.itemMargin;
            calcNext = ((slider.itemW + margin) * slider.move) * slider.animatingTo;
            slideString = (calcNext > slider.limit && slider.visible !== 1) ? slider.limit : calcNext;
          } else if (slider.currentSlide === 0 && target === slider.count - 1 && slider.vars.animationLoop && slider.direction !== "next") {
            slideString = (reverse) ? (slider.count + slider.cloneOffset) * dimension : 0;
          } else if (slider.currentSlide === slider.last && target === 0 && slider.vars.animationLoop && slider.direction !== "prev") {
            slideString = (reverse) ? 0 : (slider.count + 1) * dimension;
          } else {
            slideString = (reverse) ? ((slider.count - 1) - target + slider.cloneOffset) * dimension : (target + slider.cloneOffset) * dimension;
          }
          slider.setProps(slideString, "", slider.vars.animationSpeed);
          if (slider.transitions) {
            if (!slider.vars.animationLoop || !slider.atEnd) {
              slider.animating = false;
              slider.currentSlide = slider.animatingTo;
            }
            
            // Unbind previous transitionEnd events and re-bind new transitionEnd event
            slider.container.unbind("webkitTransitionEnd transitionend");
            slider.container.bind("webkitTransitionEnd transitionend", function() {
              clearTimeout(slider.ensureAnimationEnd);
              slider.wrapup(dimension);
            });

            // Insurance for the ever-so-fickle transitionEnd event
            clearTimeout(slider.ensureAnimationEnd);
            slider.ensureAnimationEnd = setTimeout(function() {
              slider.wrapup(dimension);
            }, slider.vars.animationSpeed + 100);

          } else {
            slider.container.animate(slider.args, slider.vars.animationSpeed, slider.vars.easing, function(){
              slider.wrapup(dimension);
            });
          }
        } else { // FADE:
          if (!touch) {
            //slider.slides.eq(slider.currentSlide).fadeOut(slider.vars.animationSpeed, slider.vars.easing);
            //slider.slides.eq(target).fadeIn(slider.vars.animationSpeed, slider.vars.easing, slider.wrapup);

            slider.slides.eq(slider.currentSlide).css({"zIndex": 1}).animate({"opacity": 0}, slider.vars.animationSpeed, slider.vars.easing);
            slider.slides.eq(target).css({"zIndex": 2}).animate({"opacity": 1}, slider.vars.animationSpeed, slider.vars.easing, slider.wrapup);

          } else {
            slider.slides.eq(slider.currentSlide).css({ "opacity": 0, "zIndex": 1 });
            slider.slides.eq(target).css({ "opacity": 1, "zIndex": 2 });
            slider.wrapup(dimension);
          }
        }
        // SMOOTH HEIGHT:
        if (slider.vars.smoothHeight) methods.smoothHeight(slider.vars.animationSpeed);
      }
    };
    slider.wrapup = function(dimension) {
      // SLIDE:
      if (!fade && !carousel) {
        if (slider.currentSlide === 0 && slider.animatingTo === slider.last && slider.vars.animationLoop) {
          slider.setProps(dimension, "jumpEnd");
        } else if (slider.currentSlide === slider.last && slider.animatingTo === 0 && slider.vars.animationLoop) {
          slider.setProps(dimension, "jumpStart");
        }
      }
      slider.animating = false;
      slider.currentSlide = slider.animatingTo;
      // API: after() animation Callback
      slider.vars.after(slider);
    };

    // SLIDESHOW:
    slider.animateSlides = function() {
      if (!slider.animating && focused ) slider.flexAnimate(slider.getTarget("next"));
    };
    // SLIDESHOW:
    slider.pause = function() {
      clearInterval(slider.animatedSlides);
      slider.animatedSlides = null;
      slider.playing = false;
      // PAUSEPLAY:
      if (slider.vars.pausePlay) methods.pausePlay.update("play");
      // SYNC:
      if (slider.syncExists) methods.sync("pause");
    };
    // SLIDESHOW:
    slider.play = function() {
      if (slider.playing) clearInterval(slider.animatedSlides);
      slider.animatedSlides = slider.animatedSlides || setInterval(slider.animateSlides, slider.vars.slideshowSpeed);
      slider.started = slider.playing = true;
      // PAUSEPLAY:
      if (slider.vars.pausePlay) methods.pausePlay.update("pause");
      // SYNC:
      if (slider.syncExists) methods.sync("play");
    };
    // STOP:
    slider.stop = function () {
      slider.pause();
      slider.stopped = true;
    };
    slider.canAdvance = function(target, fromNav) {
      // ASNAV:
      var last = (asNav) ? slider.pagingCount - 1 : slider.last;
      return (fromNav) ? true :
             (asNav && slider.currentItem === slider.count - 1 && target === 0 && slider.direction === "prev") ? true :
             (asNav && slider.currentItem === 0 && target === slider.pagingCount - 1 && slider.direction !== "next") ? false :
             (target === slider.currentSlide && !asNav) ? false :
             (slider.vars.animationLoop) ? true :
             (slider.atEnd && slider.currentSlide === 0 && target === last && slider.direction !== "next") ? false :
             (slider.atEnd && slider.currentSlide === last && target === 0 && slider.direction === "next") ? false :
             true;
    };
    slider.getTarget = function(dir) {
      slider.direction = dir;
      if (dir === "next") {
        return (slider.currentSlide === slider.last) ? 0 : slider.currentSlide + 1;
      } else {
        return (slider.currentSlide === 0) ? slider.last : slider.currentSlide - 1;
      }
    };

    // SLIDE:
    slider.setProps = function(pos, special, dur) {
      var target = (function() {
        var posCheck = (pos) ? pos : ((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.animatingTo,
            posCalc = (function() {
              if (carousel) {
                return (special === "setTouch") ? pos :
                       (reverse && slider.animatingTo === slider.last) ? 0 :
                       (reverse) ? slider.limit - (((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.animatingTo) :
                       (slider.animatingTo === slider.last) ? slider.limit : posCheck;
              } else {
                switch (special) {
                  case "setTotal": return (reverse) ? ((slider.count - 1) - slider.currentSlide + slider.cloneOffset) * pos : (slider.currentSlide + slider.cloneOffset) * pos;
                  case "setTouch": return (reverse) ? pos : pos;
                  case "jumpEnd": return (reverse) ? pos : slider.count * pos;
                  case "jumpStart": return (reverse) ? slider.count * pos : pos;
                  default: return pos;
                }
              }
            }());

            return (posCalc * -1) + "px";
          }());

      if (slider.transitions) {
        target = (vertical) ? "translate3d(0," + target + ",0)" : "translate3d(" + target + ",0,0)";
        dur = (dur !== undefined) ? (dur/1000) + "s" : "0s";
        slider.container.css("-" + slider.pfx + "-transition-duration", dur);
         slider.container.css("transition-duration", dur);
      }

      slider.args[slider.prop] = target;
      if (slider.transitions || dur === undefined) slider.container.css(slider.args);

      slider.container.css('transform',target);
    };

    slider.setup = function(type) {
      // SLIDE:
      if (!fade) {
        var sliderOffset, arr;

        if (type === "init") {
          slider.viewport = $('<div class="' + namespace + 'viewport"></div>').css({"overflow": "hidden", "position": "relative"}).appendTo(slider).append(slider.container);
          // INFINITE LOOP:
          slider.cloneCount = 0;
          slider.cloneOffset = 0;
          // REVERSE:
          if (reverse) {
            arr = $.makeArray(slider.slides).reverse();
            slider.slides = $(arr);
            slider.container.empty().append(slider.slides);
          }
        }
        // INFINITE LOOP && !CAROUSEL:
        if (slider.vars.animationLoop && !carousel) {
          slider.cloneCount = 2;
          slider.cloneOffset = 1;
          // clear out old clones
          if (type !== "init") slider.container.find('.clone').remove();
          // slider.container.append(slider.slides.first().clone().addClass('clone').attr('aria-hidden', 'true')).prepend(slider.slides.last().clone().addClass('clone').attr('aria-hidden', 'true'));
		      methods.uniqueID( slider.slides.first().clone().addClass('clone').attr('aria-hidden', 'true') ).appendTo( slider.container );
		      methods.uniqueID( slider.slides.last().clone().addClass('clone').attr('aria-hidden', 'true') ).prependTo( slider.container );
        }
        slider.newSlides = $(slider.vars.selector, slider);

        sliderOffset = (reverse) ? slider.count - 1 - slider.currentSlide + slider.cloneOffset : slider.currentSlide + slider.cloneOffset;
        // VERTICAL:
        if (vertical && !carousel) {
          slider.container.height((slider.count + slider.cloneCount) * 200 + "%").css("position", "absolute").width("100%");
          setTimeout(function(){
            slider.newSlides.css({"display": "block"});
            slider.doMath();
            slider.viewport.height(slider.h);
            slider.setProps(sliderOffset * slider.h, "init");
          }, (type === "init") ? 100 : 0);
        } else {
          slider.container.width((slider.count + slider.cloneCount) * 200 + "%");
          slider.setProps(sliderOffset * slider.computedW, "init");
          setTimeout(function(){
            slider.doMath();
            slider.newSlides.css({"width": slider.computedW, "float": "left", "display": "block"});
            // SMOOTH HEIGHT:
            if (slider.vars.smoothHeight) methods.smoothHeight();
          }, (type === "init") ? 100 : 0);
        }
      } else { // FADE:
        slider.slides.css({"width": "100%", "float": "left", "marginRight": "-100%", "position": "relative"});
        if (type === "init") {
          if (!touch) {
            //slider.slides.eq(slider.currentSlide).fadeIn(slider.vars.animationSpeed, slider.vars.easing);
            slider.slides.css({ "opacity": 0, "display": "block", "zIndex": 1 }).eq(slider.currentSlide).css({"zIndex": 2}).animate({"opacity": 1},slider.vars.animationSpeed,slider.vars.easing);
          } else {
            slider.slides.css({ "opacity": 0, "display": "block", "webkitTransition": "opacity " + slider.vars.animationSpeed / 1000 + "s ease", "zIndex": 1 }).eq(slider.currentSlide).css({ "opacity": 1, "zIndex": 2});
          }
        }
        // SMOOTH HEIGHT:
        if (slider.vars.smoothHeight) methods.smoothHeight();
      }
      // !CAROUSEL:
      // CANDIDATE: active slide
      if (!carousel) slider.slides.removeClass(namespace + "active-slide").eq(slider.currentSlide).addClass(namespace + "active-slide");

      //FlexSlider: init() Callback
      slider.vars.init(slider);
    };

    slider.doMath = function() {
      var slide = slider.slides.first(),
          slideMargin = slider.vars.itemMargin,
          minItems = slider.vars.minItems,
          maxItems = slider.vars.maxItems;

      slider.w = (slider.viewport===undefined) ? slider.width() : slider.viewport.width();
      slider.h = slide.height();
      slider.boxPadding = slide.outerWidth() - slide.width();

      // CAROUSEL:
      if (carousel) {
        slider.itemT = slider.vars.itemWidth + slideMargin;
        slider.minW = (minItems) ? minItems * slider.itemT : slider.w;
        slider.maxW = (maxItems) ? (maxItems * slider.itemT) - slideMargin : slider.w;
        slider.itemW = (slider.minW > slider.w) ? (slider.w - (slideMargin * (minItems - 1)))/minItems :
                       (slider.maxW < slider.w) ? (slider.w - (slideMargin * (maxItems - 1)))/maxItems :
                       (slider.vars.itemWidth > slider.w) ? slider.w : slider.vars.itemWidth;

        slider.visible = Math.floor(slider.w/(slider.itemW));
        slider.move = (slider.vars.move > 0 && slider.vars.move < slider.visible ) ? slider.vars.move : slider.visible;
        slider.pagingCount = Math.ceil(((slider.count - slider.visible)/slider.move) + 1);
        slider.last =  slider.pagingCount - 1;
        slider.limit = (slider.pagingCount === 1) ? 0 :
                       (slider.vars.itemWidth > slider.w) ? (slider.itemW * (slider.count - 1)) + (slideMargin * (slider.count - 1)) : ((slider.itemW + slideMargin) * slider.count) - slider.w - slideMargin;
      } else {
        slider.itemW = slider.w;
        slider.pagingCount = slider.count;
        slider.last = slider.count - 1;
      }
      slider.computedW = slider.itemW - slider.boxPadding;
    };

    slider.update = function(pos, action) {
      slider.doMath();

      // update currentSlide and slider.animatingTo if necessary
      if (!carousel) {
        if (pos < slider.currentSlide) {
          slider.currentSlide += 1;
        } else if (pos <= slider.currentSlide && pos !== 0) {
          slider.currentSlide -= 1;
        }
        slider.animatingTo = slider.currentSlide;
      }

      // update controlNav
      if (slider.vars.controlNav && !slider.manualControls) {
        if ((action === "add" && !carousel) || slider.pagingCount > slider.controlNav.length) {
          methods.controlNav.update("add");
        } else if ((action === "remove" && !carousel) || slider.pagingCount < slider.controlNav.length) {
          if (carousel && slider.currentSlide > slider.last) {
            slider.currentSlide -= 1;
            slider.animatingTo -= 1;
          }
          methods.controlNav.update("remove", slider.last);
        }
      }
      // update directionNav
      if (slider.vars.directionNav) methods.directionNav.update();

    };

    slider.addSlide = function(obj, pos) {
      var $obj = $(obj);

      slider.count += 1;
      slider.last = slider.count - 1;

      // append new slide
      if (vertical && reverse) {
        (pos !== undefined) ? slider.slides.eq(slider.count - pos).after($obj) : slider.container.prepend($obj);
      } else {
        (pos !== undefined) ? slider.slides.eq(pos).before($obj) : slider.container.append($obj);
      }

      // update currentSlide, animatingTo, controlNav, and directionNav
      slider.update(pos, "add");

      // update slider.slides
      slider.slides = $(slider.vars.selector + ':not(.clone)', slider);
      // re-setup the slider to accomdate new slide
      slider.setup();

      //FlexSlider: added() Callback
      slider.vars.added(slider);
    };
    slider.removeSlide = function(obj) {
      var pos = (isNaN(obj)) ? slider.slides.index($(obj)) : obj;

      // update count
      slider.count -= 1;
      slider.last = slider.count - 1;

      // remove slide
      if (isNaN(obj)) {
        $(obj, slider.slides).remove();
      } else {
        (vertical && reverse) ? slider.slides.eq(slider.last).remove() : slider.slides.eq(obj).remove();
      }

      // update currentSlide, animatingTo, controlNav, and directionNav
      slider.doMath();
      slider.update(pos, "remove");

      // update slider.slides
      slider.slides = $(slider.vars.selector + ':not(.clone)', slider);
      // re-setup the slider to accomdate new slide
      slider.setup();

      // FlexSlider: removed() Callback
      slider.vars.removed(slider);
    };

    //FlexSlider: Initialize
    methods.init();
  };

  // Ensure the slider isn't focussed if the window loses focus.
  $( window ).blur( function ( e ) {
    focused = false;
  }).focus( function ( e ) {
    focused = true;
  });

  //FlexSlider: Default Settings
  $.flexslider.defaults = {
    namespace: "flex-",             //{NEW} String: Prefix string attached to the class of every element generated by the plugin
    selector: ".slides > li",       //{NEW} Selector: Must match a simple pattern. '{container} > {slide}' -- Ignore pattern at your own peril
    animation: "fade",              //String: Select your animation type, "fade" or "slide"
    easing: "swing",                //{NEW} String: Determines the easing method used in jQuery transitions. jQuery easing plugin is supported!
    direction: "horizontal",        //String: Select the sliding direction, "horizontal" or "vertical"
    reverse: false,                 //{NEW} Boolean: Reverse the animation direction
    animationLoop: true,            //Boolean: Should the animation loop? If false, directionNav will received "disable" classes at either end
    smoothHeight: false,            //{NEW} Boolean: Allow height of the slider to animate smoothly in horizontal mode
    startAt: 0,                     //Integer: The slide that the slider should start on. Array notation (0 = first slide)
    slideshow: true,                //Boolean: Animate slider automatically
    slideshowSpeed: 7000,           //Integer: Set the speed of the slideshow cycling, in milliseconds
    animationSpeed: 600,            //Integer: Set the speed of animations, in milliseconds
    initDelay: 0,                   //{NEW} Integer: Set an initialization delay, in milliseconds
    randomize: false,               //Boolean: Randomize slide order
    thumbCaptions: false,           //Boolean: Whether or not to put captions on thumbnails when using the "thumbnails" controlNav.

    // Usability features
    pauseOnAction: true,            //Boolean: Pause the slideshow when interacting with control elements, highly recommended.
    pauseOnHover: false,            //Boolean: Pause the slideshow when hovering over slider, then resume when no longer hovering
    pauseInvisible: true,   		//{NEW} Boolean: Pause the slideshow when tab is invisible, resume when visible. Provides better UX, lower CPU usage.
    useCSS: true,                   //{NEW} Boolean: Slider will use CSS3 transitions if available
    touch: true,                    //{NEW} Boolean: Allow touch swipe navigation of the slider on touch-enabled devices
    video: false,                   //{NEW} Boolean: If using video in the slider, will prevent CSS3 3D Transforms to avoid graphical glitches

    // Primary Controls
    controlNav: true,               //Boolean: Create navigation for paging control of each clide? Note: Leave true for manualControls usage
    directionNav: true,             //Boolean: Create navigation for previous/next navigation? (true/false)
    prevText: "Previous",           //String: Set the text for the "previous" directionNav item
    nextText: "Next",               //String: Set the text for the "next" directionNav item

    // Secondary Navigation
    keyboard: true,                 //Boolean: Allow slider navigating via keyboard left/right keys
    multipleKeyboard: false,        //{NEW} Boolean: Allow keyboard navigation to affect multiple sliders. Default behavior cuts out keyboard navigation with more than one slider present.
    mousewheel: false,              //{UPDATED} Boolean: Requires jquery.mousewheel.js (https://github.com/brandonaaron/jquery-mousewheel) - Allows slider navigating via mousewheel
    pausePlay: false,               //Boolean: Create pause/play dynamic element
    pauseText: "Pause",             //String: Set the text for the "pause" pausePlay item
    playText: "Play",               //String: Set the text for the "play" pausePlay item

    // Special properties
    controlsContainer: "",          //{UPDATED} jQuery Object/Selector: Declare which container the navigation elements should be appended too. Default container is the FlexSlider element. Example use would be $(".flexslider-container"). Property is ignored if given element is not found.
    manualControls: "",             //{UPDATED} jQuery Object/Selector: Declare custom control navigation. Examples would be $(".flex-control-nav li") or "#tabs-nav li img", etc. The number of elements in your controlNav should match the number of slides/tabs.
    sync: "",                       //{NEW} Selector: Mirror the actions performed on this slider with another slider. Use with care.
    asNavFor: "",                   //{NEW} Selector: Internal property exposed for turning the slider into a thumbnail navigation for another slider

    // Carousel Options
    itemWidth: 0,                   //{NEW} Integer: Box-model width of individual carousel items, including horizontal borders and padding.
    itemMargin: 0,                  //{NEW} Integer: Margin between carousel items.
    minItems: 1,                    //{NEW} Integer: Minimum number of carousel items that should be visible. Items will resize fluidly when below this.
    maxItems: 0,                    //{NEW} Integer: Maxmimum number of carousel items that should be visible. Items will resize fluidly when above this limit.
    move: 0,                        //{NEW} Integer: Number of carousel items that should move on animation. If 0, slider will move all visible items.
    allowOneSlide: true,           //{NEW} Boolean: Whether or not to allow a slider comprised of a single slide

    // Callback API
    start: function(){},            //Callback: function(slider) - Fires when the slider loads the first slide
    before: function(){},           //Callback: function(slider) - Fires asynchronously with each slider animation
    after: function(){},            //Callback: function(slider) - Fires after each slider animation completes
    end: function(){},              //Callback: function(slider) - Fires when the slider reaches the last slide (asynchronous)
    added: function(){},            //{NEW} Callback: function(slider) - Fires after a slide is added
    removed: function(){},           //{NEW} Callback: function(slider) - Fires after a slide is removed
    init: function() {}             //{NEW} Callback: function(slider) - Fires after the slider is initially setup
  };

  //FlexSlider: Plugin Function
  $.fn.flexslider = function(options) {
    if (options === undefined) options = {};

    if (typeof options === "object") {
      return this.each(function() {
        var $this = $(this),
            selector = (options.selector) ? options.selector : ".slides > li",
            $slides = $this.find(selector);

      if ( ( $slides.length === 1 && options.allowOneSlide === true ) || $slides.length === 0 ) {
          $slides.fadeIn(400);
          if (options.start) options.start($this);
        } else if ($this.data('flexslider') === undefined) {
          new $.flexslider(this, options);
        }
      });
    } else {
      // Helper strings to quickly perform functions on the slider
      var $slider = $(this).data('flexslider');
      switch (options) {
        case "play": $slider.play(); break;
        case "pause": $slider.pause(); break;
        case "stop": $slider.stop(); break;
        case "next": $slider.flexAnimate($slider.getTarget("next"), true); break;
        case "prev":
        case "previous": $slider.flexAnimate($slider.getTarget("prev"), true); break;
        default: if (typeof options === "number") $slider.flexAnimate(options, true);
      }
    }
  };
})(jQuery);
/*!
 * Created by mario on 15/05/14.
 */
// Can also be used with $(document).ready()
$(window).load(function () {
    $('.flexslider-principal').flexslider({
        animation: "slide",
        slideshowSpeed: 5000,
        startAt: 0,
        slideshow: true
    });
    $('.flexslider-destaque').flexslider({
        animation: "slide",
        controlNav: "thumbnails",
        randomize: false,
        slideshow: false
    });

    // Detalhe
    $('#flexslider-detalhe-thumb').flexslider({
        animation: "slide",
        controlNav: false,
        animationLoop: false,
        slideshow: false,
        itemWidth: 120,
        itemMargin: 5,
        asNavFor: '#flexslider-detalhe'
    });
    $('#flexslider-detalhe').flexslider({
        animation: "slide",
        controlNav: false,
        animationLoop: false,
        slideshow: false,
        sync: "#flexslider-detalhe-thumb"
    });
});/*!
 * Bootstrap v3.1.1 (http://getbootstrap.com)
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */
;if(typeof jQuery==="undefined"){throw new Error("Bootstrap's JavaScript requires jQuery")}+function(b){function a(){var e=document.createElement("bootstrap");var d={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"};for(var c in d){if(e.style[c]!==undefined){return{end:d[c]}}}return false}b.fn.emulateTransitionEnd=function(e){var d=false,c=this;b(this).one(b.support.transition.end,function(){d=true});var f=function(){if(!d){b(c).trigger(b.support.transition.end)}};setTimeout(f,e);return this};b(function(){b.support.transition=a()})}(jQuery);+function(d){var c='[data-dismiss="alert"]';var b=function(e){d(e).on("click",c,this.close)};b.prototype.close=function(j){var i=d(this);var g=i.attr("data-target");if(!g){g=i.attr("href");g=g&&g.replace(/.*(?=#[^\s]*$)/,"")}var h=d(g);if(j){j.preventDefault()}if(!h.length){h=i.hasClass("alert")?i:i.parent()}h.trigger(j=d.Event("close.bs.alert"));if(j.isDefaultPrevented()){return}h.removeClass("in");function f(){h.trigger("closed.bs.alert").remove()}d.support.transition&&h.hasClass("fade")?h.one(d.support.transition.end,f).emulateTransitionEnd(150):f()};var a=d.fn.alert;d.fn.alert=function(e){return this.each(function(){var g=d(this);var f=g.data("bs.alert");if(!f){g.data("bs.alert",(f=new b(this)))}if(typeof e=="string"){f[e].call(g)}})};d.fn.alert.Constructor=b;d.fn.alert.noConflict=function(){d.fn.alert=a;return this};d(document).on("click.bs.alert.data-api",c,b.prototype.close)}(jQuery);+function(c){var b=function(e,d){this.$element=c(e);this.options=c.extend({},b.DEFAULTS,d);this.isLoading=false};b.DEFAULTS={loadingText:"loading..."};b.prototype.setState=function(g){var i="disabled";var e=this.$element;var h=e.is("input")?"val":"html";var f=e.data();g=g+"Text";if(!f.resetText){e.data("resetText",e[h]())}e[h](f[g]||this.options[g]);setTimeout(c.proxy(function(){if(g=="loadingText"){this.isLoading=true;e.addClass(i).attr(i,i)}else{if(this.isLoading){this.isLoading=false;e.removeClass(i).removeAttr(i)}}},this),0)};b.prototype.toggle=function(){var e=true;var d=this.$element.closest('[data-toggle="buttons"]');if(d.length){var f=this.$element.find("input");if(f.prop("type")=="radio"){if(f.prop("checked")&&this.$element.hasClass("active")){e=false}else{d.find(".active").removeClass("active")}}if(e){f.prop("checked",!this.$element.hasClass("active")).trigger("change")}}if(e){this.$element.toggleClass("active")}};var a=c.fn.button;c.fn.button=function(d){return this.each(function(){var g=c(this);var f=g.data("bs.button");var e=typeof d=="object"&&d;if(!f){g.data("bs.button",(f=new b(this,e)))}if(d=="toggle"){f.toggle()}else{if(d){f.setState(d)}}})};c.fn.button.Constructor=b;c.fn.button.noConflict=function(){c.fn.button=a;return this};c(document).on("click.bs.button.data-api","[data-toggle^=button]",function(f){var d=c(f.target);if(!d.hasClass("btn")){d=d.closest(".btn")}d.button("toggle");f.preventDefault()})}(jQuery);+function(b){var c=function(e,d){this.$element=b(e);this.$indicators=this.$element.find(".carousel-indicators");this.options=d;this.paused=this.sliding=this.interval=this.$active=this.$items=null;this.options.pause=="hover"&&this.$element.on("mouseenter",b.proxy(this.pause,this)).on("mouseleave",b.proxy(this.cycle,this))};c.DEFAULTS={interval:5000,pause:"hover",wrap:true};c.prototype.cycle=function(d){d||(this.paused=false);this.interval&&clearInterval(this.interval);this.options.interval&&!this.paused&&(this.interval=setInterval(b.proxy(this.next,this),this.options.interval));return this};c.prototype.getActiveIndex=function(){this.$active=this.$element.find(".item.active");this.$items=this.$active.parent().children();return this.$items.index(this.$active)};c.prototype.to=function(f){var e=this;var d=this.getActiveIndex();if(f>(this.$items.length-1)||f<0){return}if(this.sliding){return this.$element.one("slid.bs.carousel",function(){e.to(f)})}if(d==f){return this.pause().cycle()}return this.slide(f>d?"next":"prev",b(this.$items[f]))};c.prototype.pause=function(d){d||(this.paused=true);if(this.$element.find(".next, .prev").length&&b.support.transition){this.$element.trigger(b.support.transition.end);this.cycle(true)}this.interval=clearInterval(this.interval);return this};c.prototype.next=function(){if(this.sliding){return}return this.slide("next")};c.prototype.prev=function(){if(this.sliding){return}return this.slide("prev")};c.prototype.slide=function(k,f){var m=this.$element.find(".item.active");var d=f||m[k]();var j=this.interval;var l=k=="next"?"left":"right";var g=k=="next"?"first":"last";var h=this;if(!d.length){if(!this.options.wrap){return}d=this.$element.find(".item")[g]()}if(d.hasClass("active")){return this.sliding=false}var i=b.Event("slide.bs.carousel",{relatedTarget:d[0],direction:l});this.$element.trigger(i);if(i.isDefaultPrevented()){return}this.sliding=true;j&&this.pause();if(this.$indicators.length){this.$indicators.find(".active").removeClass("active");this.$element.one("slid.bs.carousel",function(){var e=b(h.$indicators.children()[h.getActiveIndex()]);e&&e.addClass("active")})}if(b.support.transition&&this.$element.hasClass("slide")){d.addClass(k);d[0].offsetWidth;m.addClass(l);d.addClass(l);m.one(b.support.transition.end,function(){d.removeClass([k,l].join(" ")).addClass("active");m.removeClass(["active",l].join(" "));h.sliding=false;setTimeout(function(){h.$element.trigger("slid.bs.carousel")},0)}).emulateTransitionEnd(m.css("transition-duration").slice(0,-1)*1000)}else{m.removeClass("active");d.addClass("active");this.sliding=false;this.$element.trigger("slid.bs.carousel")}j&&this.cycle();return this};var a=b.fn.carousel;b.fn.carousel=function(d){return this.each(function(){var h=b(this);var g=h.data("bs.carousel");var e=b.extend({},c.DEFAULTS,h.data(),typeof d=="object"&&d);var f=typeof d=="string"?d:e.slide;if(!g){h.data("bs.carousel",(g=new c(this,e)))}if(typeof d=="number"){g.to(d)}else{if(f){g[f]()}else{if(e.interval){g.pause().cycle()}}}})};b.fn.carousel.Constructor=c;b.fn.carousel.noConflict=function(){b.fn.carousel=a;return this};b(document).on("click.bs.carousel.data-api","[data-slide], [data-slide-to]",function(j){var i=b(this),f;var d=b(i.attr("data-target")||(f=i.attr("href"))&&f.replace(/.*(?=#[^\s]+$)/,""));var g=b.extend({},d.data(),i.data());var h=i.attr("data-slide-to");if(h){g.interval=false}d.carousel(g);if(h=i.attr("data-slide-to")){d.data("bs.carousel").to(h)}j.preventDefault()});b(window).on("load",function(){b('[data-ride="carousel"]').each(function(){var d=b(this);d.carousel(d.data())})})}(jQuery);+function(b){var c=function(e,d){this.$element=b(e);this.options=b.extend({},c.DEFAULTS,d);this.transitioning=null;if(this.options.parent){this.$parent=b(this.options.parent)}if(this.options.toggle){this.toggle()}};c.DEFAULTS={toggle:true};c.prototype.dimension=function(){var d=this.$element.hasClass("width");return d?"width":"height"};c.prototype.show=function(){if(this.transitioning||this.$element.hasClass("in")){return}var e=b.Event("show.bs.collapse");this.$element.trigger(e);if(e.isDefaultPrevented()){return}var h=this.$parent&&this.$parent.find("> .panel > .in");if(h&&h.length){var f=h.data("bs.collapse");if(f&&f.transitioning){return}h.collapse("hide");f||h.data("bs.collapse",null)}var i=this.dimension();this.$element.removeClass("collapse").addClass("collapsing")[i](0);this.transitioning=1;var d=function(){this.$element.removeClass("collapsing").addClass("collapse in")[i]("auto");this.transitioning=0;this.$element.trigger("shown.bs.collapse")};if(!b.support.transition){return d.call(this)}var g=b.camelCase(["scroll",i].join("-"));this.$element.one(b.support.transition.end,b.proxy(d,this)).emulateTransitionEnd(350)[i](this.$element[0][g])};c.prototype.hide=function(){if(this.transitioning||!this.$element.hasClass("in")){return}var e=b.Event("hide.bs.collapse");this.$element.trigger(e);if(e.isDefaultPrevented()){return}var f=this.dimension();this.$element[f](this.$element[f]())[0].offsetHeight;this.$element.addClass("collapsing").removeClass("collapse").removeClass("in");this.transitioning=1;var d=function(){this.transitioning=0;this.$element.trigger("hidden.bs.collapse").removeClass("collapsing").addClass("collapse")};if(!b.support.transition){return d.call(this)}this.$element[f](0).one(b.support.transition.end,b.proxy(d,this)).emulateTransitionEnd(350)};c.prototype.toggle=function(){this[this.$element.hasClass("in")?"hide":"show"]()};var a=b.fn.collapse;b.fn.collapse=function(d){return this.each(function(){var g=b(this);var f=g.data("bs.collapse");var e=b.extend({},c.DEFAULTS,g.data(),typeof d=="object"&&d);if(!f&&e.toggle&&d=="show"){d=!d}if(!f){g.data("bs.collapse",(f=new c(this,e)))}if(typeof d=="string"){f[d]()}})};b.fn.collapse.Constructor=c;b.fn.collapse.noConflict=function(){b.fn.collapse=a;return this};b(document).on("click.bs.collapse.data-api","[data-toggle=collapse]",function(j){var l=b(this),d;var k=l.attr("data-target")||j.preventDefault()||(d=l.attr("href"))&&d.replace(/.*(?=#[^\s]+$)/,"");var f=b(k);var h=f.data("bs.collapse");var i=h?"toggle":l.data();var m=l.attr("data-parent");var g=m&&b(m);if(!h||!h.transitioning){if(g){g.find('[data-toggle=collapse][data-parent="'+m+'"]').not(l).addClass("collapsed")}l[f.hasClass("in")?"addClass":"removeClass"]("collapsed")}f.collapse(i)})}(jQuery);+function(g){var e=".dropdown-backdrop";var b="[data-toggle=dropdown]";var a=function(h){g(h).on("click.bs.dropdown",this.toggle)};a.prototype.toggle=function(l){var k=g(this);if(k.is(".disabled, :disabled")){return}var j=f(k);var i=j.hasClass("open");d();if(!i){if("ontouchstart" in document.documentElement&&!j.closest(".navbar-nav").length){g('<div class="dropdown-backdrop"/>').insertAfter(g(this)).on("click",d)}var h={relatedTarget:this};j.trigger(l=g.Event("show.bs.dropdown",h));if(l.isDefaultPrevented()){return}j.toggleClass("open").trigger("shown.bs.dropdown",h);k.focus()}return false};a.prototype.keydown=function(l){if(!/(38|40|27)/.test(l.keyCode)){return}var k=g(this);l.preventDefault();l.stopPropagation();if(k.is(".disabled, :disabled")){return}var j=f(k);var i=j.hasClass("open");if(!i||(i&&l.keyCode==27)){if(l.which==27){j.find(b).focus()}return k.click()}var m=" li:not(.divider):visible a";var n=j.find("[role=menu]"+m+", [role=listbox]"+m);if(!n.length){return}var h=n.index(n.filter(":focus"));if(l.keyCode==38&&h>0){h--}if(l.keyCode==40&&h<n.length-1){h++}if(!~h){h=0}n.eq(h).focus()};function d(h){g(e).remove();g(b).each(function(){var j=f(g(this));var i={relatedTarget:this};if(!j.hasClass("open")){return}j.trigger(h=g.Event("hide.bs.dropdown",i));if(h.isDefaultPrevented()){return}j.removeClass("open").trigger("hidden.bs.dropdown",i)})}function f(j){var h=j.attr("data-target");if(!h){h=j.attr("href");h=h&&/#[A-Za-z]/.test(h)&&h.replace(/.*(?=#[^\s]*$)/,"")}var i=h&&g(h);return i&&i.length?i:j.parent()}var c=g.fn.dropdown;g.fn.dropdown=function(h){return this.each(function(){var j=g(this);var i=j.data("bs.dropdown");if(!i){j.data("bs.dropdown",(i=new a(this)))}if(typeof h=="string"){i[h].call(j)}})};g.fn.dropdown.Constructor=a;g.fn.dropdown.noConflict=function(){g.fn.dropdown=c;return this};g(document).on("click.bs.dropdown.data-api",d).on("click.bs.dropdown.data-api",".dropdown form",function(h){h.stopPropagation()}).on("click.bs.dropdown.data-api",b,a.prototype.toggle).on("keydown.bs.dropdown.data-api",b+", [role=menu], [role=listbox]",a.prototype.keydown)}(jQuery);+function(c){var b=function(e,d){this.options=d;this.$element=c(e);this.$backdrop=this.isShown=null;if(this.options.remote){this.$element.find(".modal-content").load(this.options.remote,c.proxy(function(){this.$element.trigger("loaded.bs.modal")},this))}};b.DEFAULTS={backdrop:true,keyboard:true,show:true};b.prototype.toggle=function(d){return this[!this.isShown?"show":"hide"](d)};b.prototype.show=function(g){var d=this;var f=c.Event("show.bs.modal",{relatedTarget:g});this.$element.trigger(f);if(this.isShown||f.isDefaultPrevented()){return}this.isShown=true;this.escape();this.$element.on("click.dismiss.bs.modal",'[data-dismiss="modal"]',c.proxy(this.hide,this));this.backdrop(function(){var i=c.support.transition&&d.$element.hasClass("fade");if(!d.$element.parent().length){d.$element.appendTo(document.body)}d.$element.show().scrollTop(0);if(i){d.$element[0].offsetWidth}d.$element.addClass("in").attr("aria-hidden",false);d.enforceFocus();var h=c.Event("shown.bs.modal",{relatedTarget:g});i?d.$element.find(".modal-dialog").one(c.support.transition.end,function(){d.$element.focus().trigger(h)}).emulateTransitionEnd(300):d.$element.focus().trigger(h)})};b.prototype.hide=function(d){if(d){d.preventDefault()}d=c.Event("hide.bs.modal");this.$element.trigger(d);if(!this.isShown||d.isDefaultPrevented()){return}this.isShown=false;this.escape();c(document).off("focusin.bs.modal");this.$element.removeClass("in").attr("aria-hidden",true).off("click.dismiss.bs.modal");c.support.transition&&this.$element.hasClass("fade")?this.$element.one(c.support.transition.end,c.proxy(this.hideModal,this)).emulateTransitionEnd(300):this.hideModal()};b.prototype.enforceFocus=function(){c(document).off("focusin.bs.modal").on("focusin.bs.modal",c.proxy(function(d){if(this.$element[0]!==d.target&&!this.$element.has(d.target).length){this.$element.focus()}},this))};b.prototype.escape=function(){if(this.isShown&&this.options.keyboard){this.$element.on("keyup.dismiss.bs.modal",c.proxy(function(d){d.which==27&&this.hide()},this))}else{if(!this.isShown){this.$element.off("keyup.dismiss.bs.modal")}}};b.prototype.hideModal=function(){var d=this;this.$element.hide();this.backdrop(function(){d.removeBackdrop();d.$element.trigger("hidden.bs.modal")})};b.prototype.removeBackdrop=function(){this.$backdrop&&this.$backdrop.remove();this.$backdrop=null};b.prototype.backdrop=function(f){var e=this.$element.hasClass("fade")?"fade":"";if(this.isShown&&this.options.backdrop){var d=c.support.transition&&e;this.$backdrop=c('<div class="modal-backdrop '+e+'" />').appendTo(document.body);this.$element.on("click.dismiss.bs.modal",c.proxy(function(g){if(g.target!==g.currentTarget){return}this.options.backdrop=="static"?this.$element[0].focus.call(this.$element[0]):this.hide.call(this)},this));if(d){this.$backdrop[0].offsetWidth}this.$backdrop.addClass("in");if(!f){return}d?this.$backdrop.one(c.support.transition.end,f).emulateTransitionEnd(150):f()}else{if(!this.isShown&&this.$backdrop){this.$backdrop.removeClass("in");c.support.transition&&this.$element.hasClass("fade")?this.$backdrop.one(c.support.transition.end,f).emulateTransitionEnd(150):f()}else{if(f){f()}}}};var a=c.fn.modal;c.fn.modal=function(d,e){return this.each(function(){var h=c(this);var g=h.data("bs.modal");var f=c.extend({},b.DEFAULTS,h.data(),typeof d=="object"&&d);if(!g){h.data("bs.modal",(g=new b(this,f)))}if(typeof d=="string"){g[d](e)}else{if(f.show){g.show(e)}}})};c.fn.modal.Constructor=b;c.fn.modal.noConflict=function(){c.fn.modal=a;return this};c(document).on("click.bs.modal.data-api",'[data-toggle="modal"]',function(i){var h=c(this);var f=h.attr("href");var d=c(h.attr("data-target")||(f&&f.replace(/.*(?=#[^\s]+$)/,"")));var g=d.data("bs.modal")?"toggle":c.extend({remote:!/#/.test(f)&&f},d.data(),h.data());if(h.is("a")){i.preventDefault()}d.modal(g,this).one("hide",function(){h.is(":visible")&&h.focus()})});c(document).on("show.bs.modal",".modal",function(){c(document.body).addClass("modal-open")}).on("hidden.bs.modal",".modal",function(){c(document.body).removeClass("modal-open")})}(jQuery);+function(c){var b=function(e,d){this.type=this.options=this.enabled=this.timeout=this.hoverState=this.$element=null;this.init("tooltip",e,d)};b.DEFAULTS={animation:true,placement:"top",selector:false,template:'<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:false,container:false};b.prototype.init=function(k,h,f){this.enabled=true;this.type=k;this.$element=c(h);this.options=this.getOptions(f);var j=this.options.trigger.split(" ");for(var g=j.length;g--;){var e=j[g];if(e=="click"){this.$element.on("click."+this.type,this.options.selector,c.proxy(this.toggle,this))}else{if(e!="manual"){var l=e=="hover"?"mouseenter":"focusin";var d=e=="hover"?"mouseleave":"focusout";this.$element.on(l+"."+this.type,this.options.selector,c.proxy(this.enter,this));this.$element.on(d+"."+this.type,this.options.selector,c.proxy(this.leave,this))}}}this.options.selector?(this._options=c.extend({},this.options,{trigger:"manual",selector:""})):this.fixTitle()};b.prototype.getDefaults=function(){return b.DEFAULTS};b.prototype.getOptions=function(d){d=c.extend({},this.getDefaults(),this.$element.data(),d);if(d.delay&&typeof d.delay=="number"){d.delay={show:d.delay,hide:d.delay}}return d};b.prototype.getDelegateOptions=function(){var d={};var e=this.getDefaults();this._options&&c.each(this._options,function(f,g){if(e[f]!=g){d[f]=g}});return d};b.prototype.enter=function(e){var d=e instanceof this.constructor?e:c(e.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type);clearTimeout(d.timeout);d.hoverState="in";if(!d.options.delay||!d.options.delay.show){return d.show()}d.timeout=setTimeout(function(){if(d.hoverState=="in"){d.show()}},d.options.delay.show)};b.prototype.leave=function(e){var d=e instanceof this.constructor?e:c(e.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type);clearTimeout(d.timeout);d.hoverState="out";if(!d.options.delay||!d.options.delay.hide){return d.hide()}d.timeout=setTimeout(function(){if(d.hoverState=="out"){d.hide()}},d.options.delay.hide)};b.prototype.show=function(){var p=c.Event("show.bs."+this.type);if(this.hasContent()&&this.enabled){this.$element.trigger(p);if(p.isDefaultPrevented()){return}var o=this;var k=this.tip();this.setContent();if(this.options.animation){k.addClass("fade")}var j=typeof this.options.placement=="function"?this.options.placement.call(this,k[0],this.$element[0]):this.options.placement;var t=/\s?auto?\s?/i;var u=t.test(j);if(u){j=j.replace(t,"")||"top"}k.detach().css({top:0,left:0,display:"block"}).addClass(j);this.options.container?k.appendTo(this.options.container):k.insertAfter(this.$element);var q=this.getPosition();var d=k[0].offsetWidth;var m=k[0].offsetHeight;if(u){var i=this.$element.parent();var h=j;var r=document.documentElement.scrollTop||document.body.scrollTop;var s=this.options.container=="body"?window.innerWidth:i.outerWidth();var n=this.options.container=="body"?window.innerHeight:i.outerHeight();var l=this.options.container=="body"?0:i.offset().left;j=j=="bottom"&&q.top+q.height+m-r>n?"top":j=="top"&&q.top-r-m<0?"bottom":j=="right"&&q.right+d>s?"left":j=="left"&&q.left-d<l?"right":j;k.removeClass(h).addClass(j)}var g=this.getCalculatedOffset(j,q,d,m);this.applyPlacement(g,j);this.hoverState=null;var f=function(){o.$element.trigger("shown.bs."+o.type)};c.support.transition&&this.$tip.hasClass("fade")?k.one(c.support.transition.end,f).emulateTransitionEnd(150):f()}};b.prototype.applyPlacement=function(i,j){var g;var k=this.tip();var f=k[0].offsetWidth;var n=k[0].offsetHeight;var e=parseInt(k.css("margin-top"),10);var h=parseInt(k.css("margin-left"),10);if(isNaN(e)){e=0}if(isNaN(h)){h=0}i.top=i.top+e;i.left=i.left+h;c.offset.setOffset(k[0],c.extend({using:function(o){k.css({top:Math.round(o.top),left:Math.round(o.left)})}},i),0);k.addClass("in");var d=k[0].offsetWidth;var l=k[0].offsetHeight;if(j=="top"&&l!=n){g=true;i.top=i.top+n-l}if(/bottom|top/.test(j)){var m=0;if(i.left<0){m=i.left*-2;i.left=0;k.offset(i);d=k[0].offsetWidth;l=k[0].offsetHeight}this.replaceArrow(m-f+d,d,"left")}else{this.replaceArrow(l-n,l,"top")}if(g){k.offset(i)}};b.prototype.replaceArrow=function(f,e,d){this.arrow().css(d,f?(50*(1-f/e)+"%"):"")};b.prototype.setContent=function(){var e=this.tip();var d=this.getTitle();e.find(".tooltip-inner")[this.options.html?"html":"text"](d);e.removeClass("fade in top bottom left right")};b.prototype.hide=function(){var f=this;var h=this.tip();var g=c.Event("hide.bs."+this.type);function d(){if(f.hoverState!="in"){h.detach()}f.$element.trigger("hidden.bs."+f.type)}this.$element.trigger(g);if(g.isDefaultPrevented()){return}h.removeClass("in");c.support.transition&&this.$tip.hasClass("fade")?h.one(c.support.transition.end,d).emulateTransitionEnd(150):d();this.hoverState=null;return this};b.prototype.fixTitle=function(){var d=this.$element;if(d.attr("title")||typeof(d.attr("data-original-title"))!="string"){d.attr("data-original-title",d.attr("title")||"").attr("title","")}};b.prototype.hasContent=function(){return this.getTitle()};b.prototype.getPosition=function(){var d=this.$element[0];return c.extend({},(typeof d.getBoundingClientRect=="function")?d.getBoundingClientRect():{width:d.offsetWidth,height:d.offsetHeight},this.$element.offset())};b.prototype.getCalculatedOffset=function(d,g,e,f){return d=="bottom"?{top:g.top+g.height,left:g.left+g.width/2-e/2}:d=="top"?{top:g.top-f,left:g.left+g.width/2-e/2}:d=="left"?{top:g.top+g.height/2-f/2,left:g.left-e}:{top:g.top+g.height/2-f/2,left:g.left+g.width}};b.prototype.getTitle=function(){var f;var d=this.$element;var e=this.options;f=d.attr("data-original-title")||(typeof e.title=="function"?e.title.call(d[0]):e.title);return f};b.prototype.tip=function(){return this.$tip=this.$tip||c(this.options.template)};b.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".tooltip-arrow")};b.prototype.validate=function(){if(!this.$element[0].parentNode){this.hide();this.$element=null;this.options=null}};b.prototype.enable=function(){this.enabled=true};b.prototype.disable=function(){this.enabled=false};b.prototype.toggleEnabled=function(){this.enabled=!this.enabled};b.prototype.toggle=function(f){var d=f?c(f.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type):this;d.tip().hasClass("in")?d.leave(d):d.enter(d)};b.prototype.destroy=function(){clearTimeout(this.timeout);this.hide().$element.off("."+this.type).removeData("bs."+this.type)};var a=c.fn.tooltip;c.fn.tooltip=function(d){return this.each(function(){var g=c(this);var f=g.data("bs.tooltip");var e=typeof d=="object"&&d;if(!f&&d=="destroy"){return}if(!f){g.data("bs.tooltip",(f=new b(this,e)))}if(typeof d=="string"){f[d]()}})};c.fn.tooltip.Constructor=b;c.fn.tooltip.noConflict=function(){c.fn.tooltip=a;return this}}(jQuery);+function(c){var b=function(e,d){this.init("popover",e,d)};if(!c.fn.tooltip){throw new Error("Popover requires tooltip.js")}b.DEFAULTS=c.extend({},c.fn.tooltip.Constructor.DEFAULTS,{placement:"right",trigger:"click",content:"",template:'<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'});b.prototype=c.extend({},c.fn.tooltip.Constructor.prototype);b.prototype.constructor=b;b.prototype.getDefaults=function(){return b.DEFAULTS};b.prototype.setContent=function(){var f=this.tip();var e=this.getTitle();var d=this.getContent();f.find(".popover-title")[this.options.html?"html":"text"](e);f.find(".popover-content")[this.options.html?(typeof d=="string"?"html":"append"):"text"](d);f.removeClass("fade top bottom left right in");if(!f.find(".popover-title").html()){f.find(".popover-title").hide()}};b.prototype.hasContent=function(){return this.getTitle()||this.getContent()};b.prototype.getContent=function(){var d=this.$element;var e=this.options;return d.attr("data-content")||(typeof e.content=="function"?e.content.call(d[0]):e.content)};b.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".arrow")};b.prototype.tip=function(){if(!this.$tip){this.$tip=c(this.options.template)}return this.$tip};var a=c.fn.popover;c.fn.popover=function(d){return this.each(function(){var g=c(this);var f=g.data("bs.popover");var e=typeof d=="object"&&d;if(!f&&d=="destroy"){return}if(!f){g.data("bs.popover",(f=new b(this,e)))}if(typeof d=="string"){f[d]()}})};c.fn.popover.Constructor=b;c.fn.popover.noConflict=function(){c.fn.popover=a;return this}}(jQuery);+function(c){function b(f,e){var d;var g=c.proxy(this.process,this);this.$element=c(f).is("body")?c(window):c(f);this.$body=c("body");this.$scrollElement=this.$element.on("scroll.bs.scroll-spy.data-api",g);this.options=c.extend({},b.DEFAULTS,e);this.selector=(this.options.target||((d=c(f).attr("href"))&&d.replace(/.*(?=#[^\s]+$)/,""))||"")+" .nav li > a";this.offsets=c([]);this.targets=c([]);this.activeTarget=null;this.refresh();this.process()}b.DEFAULTS={offset:10};b.prototype.refresh=function(){var d=this.$element[0]==window?"offset":"position";this.offsets=c([]);this.targets=c([]);var e=this;var f=this.$body.find(this.selector).map(function(){var h=c(this);var g=h.data("target")||h.attr("href");var i=/^#./.test(g)&&c(g);return(i&&i.length&&i.is(":visible")&&[[i[d]().top+(!c.isWindow(e.$scrollElement.get(0))&&e.$scrollElement.scrollTop()),g]])||null}).sort(function(h,g){return h[0]-g[0]}).each(function(){e.offsets.push(this[0]);e.targets.push(this[1])})};b.prototype.process=function(){var j=this.$scrollElement.scrollTop()+this.options.offset;var f=this.$scrollElement[0].scrollHeight||this.$body[0].scrollHeight;var h=f-this.$scrollElement.height();var g=this.offsets;var d=this.targets;var k=this.activeTarget;var e;if(j>=h){return k!=(e=d.last()[0])&&this.activate(e)}if(k&&j<=g[0]){return k!=(e=d[0])&&this.activate(e)}for(e=g.length;e--;){k!=d[e]&&j>=g[e]&&(!g[e+1]||j<=g[e+1])&&this.activate(d[e])}};b.prototype.activate=function(f){this.activeTarget=f;c(this.selector).parentsUntil(this.options.target,".active").removeClass("active");var d=this.selector+'[data-target="'+f+'"],'+this.selector+'[href="'+f+'"]';var e=c(d).parents("li").addClass("active");if(e.parent(".dropdown-menu").length){e=e.closest("li.dropdown").addClass("active")}e.trigger("activate.bs.scrollspy")};var a=c.fn.scrollspy;c.fn.scrollspy=function(d){return this.each(function(){var g=c(this);var f=g.data("bs.scrollspy");var e=typeof d=="object"&&d;if(!f){g.data("bs.scrollspy",(f=new b(this,e)))}if(typeof d=="string"){f[d]()}})};c.fn.scrollspy.Constructor=b;c.fn.scrollspy.noConflict=function(){c.fn.scrollspy=a;return this};c(window).on("load",function(){c('[data-spy="scroll"]').each(function(){var d=c(this);d.scrollspy(d.data())})})}(jQuery);+function(c){var b=function(d){this.element=c(d)};b.prototype.show=function(){var j=this.element;var g=j.closest("ul:not(.dropdown-menu)");var f=j.data("target");if(!f){f=j.attr("href");f=f&&f.replace(/.*(?=#[^\s]*$)/,"")}if(j.parent("li").hasClass("active")){return}var h=g.find(".active:last a")[0];var i=c.Event("show.bs.tab",{relatedTarget:h});j.trigger(i);if(i.isDefaultPrevented()){return}var d=c(f);this.activate(j.parent("li"),g);this.activate(d,d.parent(),function(){j.trigger({type:"shown.bs.tab",relatedTarget:h})})};b.prototype.activate=function(f,e,i){var d=e.find("> .active");var h=i&&c.support.transition&&d.hasClass("fade");function g(){d.removeClass("active").find("> .dropdown-menu > .active").removeClass("active");f.addClass("active");if(h){f[0].offsetWidth;f.addClass("in")}else{f.removeClass("fade")}if(f.parent(".dropdown-menu")){f.closest("li.dropdown").addClass("active")}i&&i()}h?d.one(c.support.transition.end,g).emulateTransitionEnd(150):g();d.removeClass("in")};var a=c.fn.tab;c.fn.tab=function(d){return this.each(function(){var f=c(this);var e=f.data("bs.tab");if(!e){f.data("bs.tab",(e=new b(this)))}if(typeof d=="string"){e[d]()}})};c.fn.tab.Constructor=b;c.fn.tab.noConflict=function(){c.fn.tab=a;return this};c(document).on("click.bs.tab.data-api",'[data-toggle="tab"], [data-toggle="pill"]',function(d){d.preventDefault();c(this).tab("show")})}(jQuery);+function(c){var b=function(e,d){this.options=c.extend({},b.DEFAULTS,d);this.$window=c(window).on("scroll.bs.affix.data-api",c.proxy(this.checkPosition,this)).on("click.bs.affix.data-api",c.proxy(this.checkPositionWithEventLoop,this));this.$element=c(e);this.affixed=this.unpin=this.pinnedOffset=null;this.checkPosition()};b.RESET="affix affix-top affix-bottom";b.DEFAULTS={offset:0};b.prototype.getPinnedOffset=function(){if(this.pinnedOffset){return this.pinnedOffset}this.$element.removeClass(b.RESET).addClass("affix");var e=this.$window.scrollTop();var d=this.$element.offset();return(this.pinnedOffset=d.top-e)};b.prototype.checkPositionWithEventLoop=function(){setTimeout(c.proxy(this.checkPosition,this),1)};b.prototype.checkPosition=function(){if(!this.$element.is(":visible")){return}var m=c(document).height();var d=this.$window.scrollTop();var j=this.$element.offset();var h=this.options.offset;var f=h.top;var g=h.bottom;if(this.affixed=="top"){j.top+=d}if(typeof h!="object"){g=f=h}if(typeof f=="function"){f=h.top(this.$element)}if(typeof g=="function"){g=h.bottom(this.$element)}var i=this.unpin!=null&&(d+this.unpin<=j.top)?false:g!=null&&(j.top+this.$element.height()>=m-g)?"bottom":f!=null&&(d<=f)?"top":false;if(this.affixed===i){return}if(this.unpin){this.$element.css("top","")}var l="affix"+(i?"-"+i:"");var k=c.Event(l+".bs.affix");this.$element.trigger(k);if(k.isDefaultPrevented()){return}this.affixed=i;this.unpin=i=="bottom"?this.getPinnedOffset():null;this.$element.removeClass(b.RESET).addClass(l).trigger(c.Event(l.replace("affix","affixed")));if(i=="bottom"){this.$element.offset({top:m-g-this.$element.height()})}};var a=c.fn.affix;c.fn.affix=function(d){return this.each(function(){var g=c(this);var f=g.data("bs.affix");var e=typeof d=="object"&&d;if(!f){g.data("bs.affix",(f=new b(this,e)))}if(typeof d=="string"){f[d]()}})};c.fn.affix.Constructor=b;c.fn.affix.noConflict=function(){c.fn.affix=a;return this};c(window).on("load",function(){c('[data-spy="affix"]').each(function(){var e=c(this);var d=e.data();d.offset=d.offset||{};if(d.offsetBottom){d.offset.bottom=d.offsetBottom}if(d.offsetTop){d.offset.top=d.offsetTop}e.affix(d)})})}(jQuery);(function(a){a.flexslider=function(f,q){var c=a(f);c.vars=a.extend({},a.flexslider.defaults,q);var j=c.vars.namespace,e=window.navigator&&window.navigator.msPointerEnabled&&window.MSGesture,k=(("ontouchstart" in window)||e||window.DocumentTouch&&document instanceof DocumentTouch)&&c.vars.touch,d="click touchend MSPointerUp",b="",p,i=c.vars.direction==="vertical",l=c.vars.reverse,o=(c.vars.itemWidth>0),h=c.vars.animation==="fade",m=c.vars.asNavFor!=="",g={},n=true;a.data(f,"flexslider",c);g={init:function(){c.animating=false;c.currentSlide=parseInt((c.vars.startAt?c.vars.startAt:0),10);if(isNaN(c.currentSlide)){c.currentSlide=0}c.animatingTo=c.currentSlide;c.atEnd=(c.currentSlide===0||c.currentSlide===c.last);c.containerSelector=c.vars.selector.substr(0,c.vars.selector.search(" "));c.slides=a(c.vars.selector,c);c.container=a(c.containerSelector,c);c.count=c.slides.length;c.syncExists=a(c.vars.sync).length>0;if(c.vars.animation==="slide"){c.vars.animation="swing"}c.prop=(i)?"top":"marginLeft";c.args={};c.manualPause=false;c.stopped=false;c.started=false;c.startTimeout=null;c.transitions=!c.vars.video&&!h&&c.vars.useCSS&&(function(){var t=document.createElement("div"),s=["perspectiveProperty","WebkitPerspective","MozPerspective","OPerspective","msPerspective"];for(var r in s){if(t.style[s[r]]!==undefined){c.pfx=s[r].replace("Perspective","").toLowerCase();c.prop="-"+c.pfx+"-transform";return true}}return false}());c.ensureAnimationEnd="";if(c.vars.controlsContainer!==""){c.controlsContainer=a(c.vars.controlsContainer).length>0&&a(c.vars.controlsContainer)}if(c.vars.manualControls!==""){c.manualControls=a(c.vars.manualControls).length>0&&a(c.vars.manualControls)}if(c.vars.randomize){c.slides.sort(function(){return(Math.round(Math.random())-0.5)});c.container.empty().append(c.slides)}c.doMath();c.setup("init");if(c.vars.controlNav){g.controlNav.setup()}if(c.vars.directionNav){g.directionNav.setup()}if(c.vars.keyboard&&(a(c.containerSelector).length===1||c.vars.multipleKeyboard)){a(document).bind("keyup",function(s){var r=s.keyCode;if(!c.animating&&(r===39||r===37)){var t=(r===39)?c.getTarget("next"):(r===37)?c.getTarget("prev"):false;c.flexAnimate(t,c.vars.pauseOnAction)}})}if(c.vars.mousewheel){c.bind("mousewheel",function(t,v,s,r){t.preventDefault();var u=(v<0)?c.getTarget("next"):c.getTarget("prev");c.flexAnimate(u,c.vars.pauseOnAction)})}if(c.vars.pausePlay){g.pausePlay.setup()}if(c.vars.slideshow&&c.vars.pauseInvisible){g.pauseInvisible.init()}if(c.vars.slideshow){if(c.vars.pauseOnHover){c.hover(function(){if(!c.manualPlay&&!c.manualPause){c.pause()}},function(){if(!c.manualPause&&!c.manualPlay&&!c.stopped){c.play()}})}if(!c.vars.pauseInvisible||!g.pauseInvisible.isHidden()){(c.vars.initDelay>0)?c.startTimeout=setTimeout(c.play,c.vars.initDelay):c.play()}}if(m){g.asNav.setup()}if(k&&c.vars.touch){g.touch()}if(!h||(h&&c.vars.smoothHeight)){a(window).bind("resize orientationchange focus",g.resize)}c.find("img").attr("draggable","false");setTimeout(function(){c.vars.start(c)},200)},asNav:{setup:function(){c.asNav=true;c.animatingTo=Math.floor(c.currentSlide/c.move);c.currentItem=c.currentSlide;c.slides.removeClass(j+"active-slide").eq(c.currentItem).addClass(j+"active-slide");if(!e){c.slides.on(d,function(t){t.preventDefault();var s=a(this),r=s.index();var u=s.offset().left-a(c).scrollLeft();if(u<=0&&s.hasClass(j+"active-slide")){c.flexAnimate(c.getTarget("prev"),true)}else{if(!a(c.vars.asNavFor).data("flexslider").animating&&!s.hasClass(j+"active-slide")){c.direction=(c.currentItem<r)?"next":"prev";c.flexAnimate(r,c.vars.pauseOnAction,false,true,true)}}})}else{f._slider=c;c.slides.each(function(){var r=this;r._gesture=new MSGesture();r._gesture.target=r;r.addEventListener("MSPointerDown",function(s){s.preventDefault();if(s.currentTarget._gesture){s.currentTarget._gesture.addPointer(s.pointerId)}},false);r.addEventListener("MSGestureTap",function(u){u.preventDefault();var t=a(this),s=t.index();if(!a(c.vars.asNavFor).data("flexslider").animating&&!t.hasClass("active")){c.direction=(c.currentItem<s)?"next":"prev";c.flexAnimate(s,c.vars.pauseOnAction,false,true,true)}})})}}},controlNav:{setup:function(){if(!c.manualControls){g.controlNav.setupPaging()}else{g.controlNav.setupManual()}},setupPaging:function(){var u=(c.vars.controlNav==="thumbnails")?"control-thumbs":"control-paging",s=1,v,r;c.controlNavScaffold=a('<ol class="'+j+"control-nav "+j+u+'"></ol>');if(c.pagingCount>1){for(var t=0;t<c.pagingCount;t++){r=c.slides.eq(t);v=(c.vars.controlNav==="thumbnails")?'<img src="'+r.attr("data-thumb")+'"/>':"<a>"+s+"</a>";if("thumbnails"===c.vars.controlNav&&true===c.vars.thumbCaptions){var w=r.attr("data-thumbcaption");if(""!=w&&undefined!=w){v+='<span class="'+j+'caption">'+w+"</span>"}}c.controlNavScaffold.append("<li>"+v+"</li>");s++}}(c.controlsContainer)?a(c.controlsContainer).append(c.controlNavScaffold):c.append(c.controlNavScaffold);g.controlNav.set();g.controlNav.active();c.controlNavScaffold.delegate("a, img",d,function(x){x.preventDefault();if(b===""||b===x.type){var z=a(this),y=c.controlNav.index(z);if(!z.hasClass(j+"active")){c.direction=(y>c.currentSlide)?"next":"prev";c.flexAnimate(y,c.vars.pauseOnAction)}}if(b===""){b=x.type}g.setToClearWatchedEvent()})},setupManual:function(){c.controlNav=c.manualControls;g.controlNav.active();c.controlNav.bind(d,function(r){r.preventDefault();if(b===""||b===r.type){var t=a(this),s=c.controlNav.index(t);if(!t.hasClass(j+"active")){(s>c.currentSlide)?c.direction="next":c.direction="prev";c.flexAnimate(s,c.vars.pauseOnAction)}}if(b===""){b=r.type}g.setToClearWatchedEvent()})},set:function(){var r=(c.vars.controlNav==="thumbnails")?"img":"a";c.controlNav=a("."+j+"control-nav li "+r,(c.controlsContainer)?c.controlsContainer:c)},active:function(){c.controlNav.removeClass(j+"active").eq(c.animatingTo).addClass(j+"active")},update:function(r,s){if(c.pagingCount>1&&r==="add"){c.controlNavScaffold.append(a("<li><a>"+c.count+"</a></li>"))}else{if(c.pagingCount===1){c.controlNavScaffold.find("li").remove()}else{c.controlNav.eq(s).closest("li").remove()}}g.controlNav.set();(c.pagingCount>1&&c.pagingCount!==c.controlNav.length)?c.update(s,r):g.controlNav.active()}},directionNav:{setup:function(){var r=a('<ul class="'+j+'direction-nav"><li><a class="'+j+'prev" href="#">'+c.vars.prevText+'</a></li><li><a class="'+j+'next" href="#">'+c.vars.nextText+"</a></li></ul>");if(c.controlsContainer){a(c.controlsContainer).append(r);c.directionNav=a("."+j+"direction-nav li a",c.controlsContainer)}else{c.append(r);c.directionNav=a("."+j+"direction-nav li a",c)}g.directionNav.update();c.directionNav.bind(d,function(s){s.preventDefault();var t;if(b===""||b===s.type){t=(a(this).hasClass(j+"next"))?c.getTarget("next"):c.getTarget("prev");c.flexAnimate(t,c.vars.pauseOnAction)}if(b===""){b=s.type}g.setToClearWatchedEvent()})},update:function(){var r=j+"disabled";if(c.pagingCount===1){c.directionNav.addClass(r).attr("tabindex","-1")}else{if(!c.vars.animationLoop){if(c.animatingTo===0){c.directionNav.removeClass(r).filter("."+j+"prev").addClass(r).attr("tabindex","-1")}else{if(c.animatingTo===c.last){c.directionNav.removeClass(r).filter("."+j+"next").addClass(r).attr("tabindex","-1")}else{c.directionNav.removeClass(r).removeAttr("tabindex")}}}else{c.directionNav.removeClass(r).removeAttr("tabindex")}}}},pausePlay:{setup:function(){var r=a('<div class="'+j+'pauseplay"><a></a></div>');if(c.controlsContainer){c.controlsContainer.append(r);c.pausePlay=a("."+j+"pauseplay a",c.controlsContainer)}else{c.append(r);c.pausePlay=a("."+j+"pauseplay a",c)}g.pausePlay.update((c.vars.slideshow)?j+"pause":j+"play");c.pausePlay.bind(d,function(s){s.preventDefault();if(b===""||b===s.type){if(a(this).hasClass(j+"pause")){c.manualPause=true;c.manualPlay=false;c.pause()}else{c.manualPause=false;c.manualPlay=true;c.play()}}if(b===""){b=s.type}g.setToClearWatchedEvent()})},update:function(r){(r==="play")?c.pausePlay.removeClass(j+"pause").addClass(j+"play").html(c.vars.playText):c.pausePlay.removeClass(j+"play").addClass(j+"pause").html(c.vars.pauseText)}},touch:function(){var C,z,x,D,G,E,B=false,u=0,t=0,w=0;if(!e){f.addEventListener("touchstart",y,false);function y(H){if(c.animating){H.preventDefault()}else{if((window.navigator.msPointerEnabled)||H.touches.length===1){c.pause();D=(i)?c.h:c.w;E=Number(new Date());u=H.touches[0].pageX;t=H.touches[0].pageY;x=(o&&l&&c.animatingTo===c.last)?0:(o&&l)?c.limit-(((c.itemW+c.vars.itemMargin)*c.move)*c.animatingTo):(o&&c.currentSlide===c.last)?c.limit:(o)?((c.itemW+c.vars.itemMargin)*c.move)*c.currentSlide:(l)?(c.last-c.currentSlide+c.cloneOffset)*D:(c.currentSlide+c.cloneOffset)*D;C=(i)?t:u;z=(i)?u:t;f.addEventListener("touchmove",s,false);f.addEventListener("touchend",F,false)}}}function s(H){u=H.touches[0].pageX;t=H.touches[0].pageY;G=(i)?C-t:C-u;B=(i)?(Math.abs(G)<Math.abs(u-z)):(Math.abs(G)<Math.abs(t-z));var I=500;if(!B||Number(new Date())-E>I){H.preventDefault();if(!h&&c.transitions){if(!c.vars.animationLoop){G=G/((c.currentSlide===0&&G<0||c.currentSlide===c.last&&G>0)?(Math.abs(G)/D+2):1)}c.setProps(x+G,"setTouch")}}}function F(J){f.removeEventListener("touchmove",s,false);if(c.animatingTo===c.currentSlide&&!B&&!(G===null)){var I=(l)?-G:G,H=(I>0)?c.getTarget("next"):c.getTarget("prev");if(c.canAdvance(H)&&(Number(new Date())-E<550&&Math.abs(I)>50||Math.abs(I)>D/2)){c.flexAnimate(H,c.vars.pauseOnAction)}else{if(!h){c.flexAnimate(c.currentSlide,c.vars.pauseOnAction,true)}}}f.removeEventListener("touchend",F,false);C=null;z=null;G=null;x=null}}else{f.style.msTouchAction="none";f._gesture=new MSGesture();f._gesture.target=f;f.addEventListener("MSPointerDown",r,false);f._slider=c;f.addEventListener("MSGestureChange",A,false);f.addEventListener("MSGestureEnd",v,false);function r(H){H.stopPropagation();if(c.animating){H.preventDefault()}else{c.pause();f._gesture.addPointer(H.pointerId);w=0;D=(i)?c.h:c.w;E=Number(new Date());x=(o&&l&&c.animatingTo===c.last)?0:(o&&l)?c.limit-(((c.itemW+c.vars.itemMargin)*c.move)*c.animatingTo):(o&&c.currentSlide===c.last)?c.limit:(o)?((c.itemW+c.vars.itemMargin)*c.move)*c.currentSlide:(l)?(c.last-c.currentSlide+c.cloneOffset)*D:(c.currentSlide+c.cloneOffset)*D}}function A(K){K.stopPropagation();var J=K.target._slider;if(!J){return}var I=-K.translationX,H=-K.translationY;w=w+((i)?H:I);G=w;B=(i)?(Math.abs(w)<Math.abs(-I)):(Math.abs(w)<Math.abs(-H));if(K.detail===K.MSGESTURE_FLAG_INERTIA){setImmediate(function(){f._gesture.stop()});return}if(!B||Number(new Date())-E>500){K.preventDefault();if(!h&&J.transitions){if(!J.vars.animationLoop){G=w/((J.currentSlide===0&&w<0||J.currentSlide===J.last&&w>0)?(Math.abs(w)/D+2):1)}J.setProps(x+G,"setTouch")}}}function v(K){K.stopPropagation();var H=K.target._slider;if(!H){return}if(H.animatingTo===H.currentSlide&&!B&&!(G===null)){var J=(l)?-G:G,I=(J>0)?H.getTarget("next"):H.getTarget("prev");if(H.canAdvance(I)&&(Number(new Date())-E<550&&Math.abs(J)>50||Math.abs(J)>D/2)){H.flexAnimate(I,H.vars.pauseOnAction)}else{if(!h){H.flexAnimate(H.currentSlide,H.vars.pauseOnAction,true)}}}C=null;z=null;G=null;x=null;w=0}}},resize:function(){if(!c.animating&&c.is(":visible")){if(!o){c.doMath()}if(h){g.smoothHeight()}else{if(o){c.slides.width(c.computedW);c.update(c.pagingCount);c.setProps()}else{if(i){c.viewport.height(c.h);c.setProps(c.h,"setTotal")}else{if(c.vars.smoothHeight){g.smoothHeight()}c.newSlides.width(c.computedW);c.setProps(c.computedW,"setTotal")}}}}},smoothHeight:function(r){if(!i||h){var s=(h)?c:c.viewport;(r)?s.animate({height:c.slides.eq(c.animatingTo).height()},r):s.height(c.slides.eq(c.animatingTo).height())}},sync:function(r){var t=a(c.vars.sync).data("flexslider"),s=c.animatingTo;switch(r){case"animate":t.flexAnimate(s,c.vars.pauseOnAction,false,true);break;case"play":if(!t.playing&&!t.asNav){t.play()}break;case"pause":t.pause();break}},uniqueID:function(r){r.find("[id]").each(function(){var s=a(this);s.attr("id",s.attr("id")+"_clone")});return r},pauseInvisible:{visProp:null,init:function(){var t=["webkit","moz","ms","o"];if("hidden" in document){return"hidden"}for(var s=0;s<t.length;s++){if((t[s]+"Hidden") in document){g.pauseInvisible.visProp=t[s]+"Hidden"}}if(g.pauseInvisible.visProp){var r=g.pauseInvisible.visProp.replace(/[H|h]idden/,"")+"visibilitychange";document.addEventListener(r,function(){if(g.pauseInvisible.isHidden()){if(c.startTimeout){clearTimeout(c.startTimeout)}else{c.pause()}}else{if(c.started){c.play()}else{(c.vars.initDelay>0)?setTimeout(c.play,c.vars.initDelay):c.play()}}})}},isHidden:function(){return document[g.pauseInvisible.visProp]||false}},setToClearWatchedEvent:function(){clearTimeout(p);p=setTimeout(function(){b=""},3000)}};c.flexAnimate=function(z,A,t,v,w){if(!c.vars.animationLoop&&z!==c.currentSlide){c.direction=(z>c.currentSlide)?"next":"prev"}if(m&&c.pagingCount===1){c.direction=(c.currentItem<z)?"next":"prev"}if(!c.animating&&(c.canAdvance(z,w)||t)&&c.is(":visible")){if(m&&v){var s=a(c.vars.asNavFor).data("flexslider");c.atEnd=z===0||z===c.count-1;s.flexAnimate(z,true,false,true,w);c.direction=(c.currentItem<z)?"next":"prev";s.direction=c.direction;if(Math.ceil((z+1)/c.visible)-1!==c.currentSlide&&z!==0){c.currentItem=z;c.slides.removeClass(j+"active-slide").eq(z).addClass(j+"active-slide");z=Math.floor(z/c.visible)}else{c.currentItem=z;c.slides.removeClass(j+"active-slide").eq(z).addClass(j+"active-slide");return false}}c.animating=true;c.animatingTo=z;if(A){c.pause()}c.vars.before(c);if(c.syncExists&&!w){g.sync("animate")}if(c.vars.controlNav){g.controlNav.active()}if(!o){c.slides.removeClass(j+"active-slide").eq(z).addClass(j+"active-slide")}c.atEnd=z===0||z===c.last;if(c.vars.directionNav){g.directionNav.update()}if(z===c.last){c.vars.end(c);if(!c.vars.animationLoop){c.pause()}}if(!h){var y=(i)?c.slides.filter(":first").height():c.computedW,x,u,r;if(o){x=c.vars.itemMargin;r=((c.itemW+x)*c.move)*c.animatingTo;u=(r>c.limit&&c.visible!==1)?c.limit:r}else{if(c.currentSlide===0&&z===c.count-1&&c.vars.animationLoop&&c.direction!=="next"){u=(l)?(c.count+c.cloneOffset)*y:0}else{if(c.currentSlide===c.last&&z===0&&c.vars.animationLoop&&c.direction!=="prev"){u=(l)?0:(c.count+1)*y}else{u=(l)?((c.count-1)-z+c.cloneOffset)*y:(z+c.cloneOffset)*y}}}c.setProps(u,"",c.vars.animationSpeed);if(c.transitions){if(!c.vars.animationLoop||!c.atEnd){c.animating=false;c.currentSlide=c.animatingTo}c.container.unbind("webkitTransitionEnd transitionend");c.container.bind("webkitTransitionEnd transitionend",function(){clearTimeout(c.ensureAnimationEnd);c.wrapup(y)});clearTimeout(c.ensureAnimationEnd);c.ensureAnimationEnd=setTimeout(function(){c.wrapup(y)},c.vars.animationSpeed+100)}else{c.container.animate(c.args,c.vars.animationSpeed,c.vars.easing,function(){c.wrapup(y)})}}else{if(!k){c.slides.eq(c.currentSlide).css({zIndex:1}).animate({opacity:0},c.vars.animationSpeed,c.vars.easing);c.slides.eq(z).css({zIndex:2}).animate({opacity:1},c.vars.animationSpeed,c.vars.easing,c.wrapup)}else{c.slides.eq(c.currentSlide).css({opacity:0,zIndex:1});c.slides.eq(z).css({opacity:1,zIndex:2});c.wrapup(y)}}if(c.vars.smoothHeight){g.smoothHeight(c.vars.animationSpeed)}}};c.wrapup=function(r){if(!h&&!o){if(c.currentSlide===0&&c.animatingTo===c.last&&c.vars.animationLoop){c.setProps(r,"jumpEnd")}else{if(c.currentSlide===c.last&&c.animatingTo===0&&c.vars.animationLoop){c.setProps(r,"jumpStart")}}}c.animating=false;c.currentSlide=c.animatingTo;c.vars.after(c)};c.animateSlides=function(){if(!c.animating&&n){c.flexAnimate(c.getTarget("next"))}};c.pause=function(){clearInterval(c.animatedSlides);c.animatedSlides=null;c.playing=false;if(c.vars.pausePlay){g.pausePlay.update("play")}if(c.syncExists){g.sync("pause")}};c.play=function(){if(c.playing){clearInterval(c.animatedSlides)}c.animatedSlides=c.animatedSlides||setInterval(c.animateSlides,c.vars.slideshowSpeed);c.started=c.playing=true;if(c.vars.pausePlay){g.pausePlay.update("pause")}if(c.syncExists){g.sync("play")}};c.stop=function(){c.pause();c.stopped=true};c.canAdvance=function(t,r){var s=(m)?c.pagingCount-1:c.last;return(r)?true:(m&&c.currentItem===c.count-1&&t===0&&c.direction==="prev")?true:(m&&c.currentItem===0&&t===c.pagingCount-1&&c.direction!=="next")?false:(t===c.currentSlide&&!m)?false:(c.vars.animationLoop)?true:(c.atEnd&&c.currentSlide===0&&t===s&&c.direction!=="next")?false:(c.atEnd&&c.currentSlide===s&&t===0&&c.direction==="next")?false:true};c.getTarget=function(r){c.direction=r;if(r==="next"){return(c.currentSlide===c.last)?0:c.currentSlide+1}else{return(c.currentSlide===0)?c.last:c.currentSlide-1}};c.setProps=function(u,r,s){var t=(function(){var v=(u)?u:((c.itemW+c.vars.itemMargin)*c.move)*c.animatingTo,w=(function(){if(o){return(r==="setTouch")?u:(l&&c.animatingTo===c.last)?0:(l)?c.limit-(((c.itemW+c.vars.itemMargin)*c.move)*c.animatingTo):(c.animatingTo===c.last)?c.limit:v}else{switch(r){case"setTotal":return(l)?((c.count-1)-c.currentSlide+c.cloneOffset)*u:(c.currentSlide+c.cloneOffset)*u;case"setTouch":return(l)?u:u;case"jumpEnd":return(l)?u:c.count*u;case"jumpStart":return(l)?c.count*u:u;default:return u}}}());return(w*-1)+"px"}());if(c.transitions){t=(i)?"translate3d(0,"+t+",0)":"translate3d("+t+",0,0)";s=(s!==undefined)?(s/1000)+"s":"0s";c.container.css("-"+c.pfx+"-transition-duration",s);c.container.css("transition-duration",s)}c.args[c.prop]=t;if(c.transitions||s===undefined){c.container.css(c.args)}c.container.css("transform",t)};c.setup=function(s){if(!h){var t,r;if(s==="init"){c.viewport=a('<div class="'+j+'viewport"></div>').css({overflow:"hidden",position:"relative"}).appendTo(c).append(c.container);c.cloneCount=0;c.cloneOffset=0;if(l){r=a.makeArray(c.slides).reverse();c.slides=a(r);c.container.empty().append(c.slides)}}if(c.vars.animationLoop&&!o){c.cloneCount=2;c.cloneOffset=1;if(s!=="init"){c.container.find(".clone").remove()}g.uniqueID(c.slides.first().clone().addClass("clone").attr("aria-hidden","true")).appendTo(c.container);g.uniqueID(c.slides.last().clone().addClass("clone").attr("aria-hidden","true")).prependTo(c.container)}c.newSlides=a(c.vars.selector,c);t=(l)?c.count-1-c.currentSlide+c.cloneOffset:c.currentSlide+c.cloneOffset;if(i&&!o){c.container.height((c.count+c.cloneCount)*200+"%").css("position","absolute").width("100%");setTimeout(function(){c.newSlides.css({display:"block"});c.doMath();c.viewport.height(c.h);c.setProps(t*c.h,"init")},(s==="init")?100:0)}else{c.container.width((c.count+c.cloneCount)*200+"%");c.setProps(t*c.computedW,"init");setTimeout(function(){c.doMath();c.newSlides.css({width:c.computedW,"float":"left",display:"block"});if(c.vars.smoothHeight){g.smoothHeight()}},(s==="init")?100:0)}}else{c.slides.css({width:"100%","float":"left",marginRight:"-100%",position:"relative"});if(s==="init"){if(!k){c.slides.css({opacity:0,display:"block",zIndex:1}).eq(c.currentSlide).css({zIndex:2}).animate({opacity:1},c.vars.animationSpeed,c.vars.easing)}else{c.slides.css({opacity:0,display:"block",webkitTransition:"opacity "+c.vars.animationSpeed/1000+"s ease",zIndex:1}).eq(c.currentSlide).css({opacity:1,zIndex:2})}}if(c.vars.smoothHeight){g.smoothHeight()}}if(!o){c.slides.removeClass(j+"active-slide").eq(c.currentSlide).addClass(j+"active-slide")}c.vars.init(c)};c.doMath=function(){var r=c.slides.first(),u=c.vars.itemMargin,s=c.vars.minItems,t=c.vars.maxItems;c.w=(c.viewport===undefined)?c.width():c.viewport.width();c.h=r.height();c.boxPadding=r.outerWidth()-r.width();if(o){c.itemT=c.vars.itemWidth+u;c.minW=(s)?s*c.itemT:c.w;c.maxW=(t)?(t*c.itemT)-u:c.w;c.itemW=(c.minW>c.w)?(c.w-(u*(s-1)))/s:(c.maxW<c.w)?(c.w-(u*(t-1)))/t:(c.vars.itemWidth>c.w)?c.w:c.vars.itemWidth;c.visible=Math.floor(c.w/(c.itemW));c.move=(c.vars.move>0&&c.vars.move<c.visible)?c.vars.move:c.visible;c.pagingCount=Math.ceil(((c.count-c.visible)/c.move)+1);c.last=c.pagingCount-1;c.limit=(c.pagingCount===1)?0:(c.vars.itemWidth>c.w)?(c.itemW*(c.count-1))+(u*(c.count-1)):((c.itemW+u)*c.count)-c.w-u}else{c.itemW=c.w;c.pagingCount=c.count;c.last=c.count-1}c.computedW=c.itemW-c.boxPadding};c.update=function(s,r){c.doMath();if(!o){if(s<c.currentSlide){c.currentSlide+=1}else{if(s<=c.currentSlide&&s!==0){c.currentSlide-=1}}c.animatingTo=c.currentSlide}if(c.vars.controlNav&&!c.manualControls){if((r==="add"&&!o)||c.pagingCount>c.controlNav.length){g.controlNav.update("add")}else{if((r==="remove"&&!o)||c.pagingCount<c.controlNav.length){if(o&&c.currentSlide>c.last){c.currentSlide-=1;c.animatingTo-=1}g.controlNav.update("remove",c.last)}}}if(c.vars.directionNav){g.directionNav.update()}};c.addSlide=function(r,t){var s=a(r);c.count+=1;c.last=c.count-1;if(i&&l){(t!==undefined)?c.slides.eq(c.count-t).after(s):c.container.prepend(s)}else{(t!==undefined)?c.slides.eq(t).before(s):c.container.append(s)}c.update(t,"add");c.slides=a(c.vars.selector+":not(.clone)",c);c.setup();c.vars.added(c)};c.removeSlide=function(r){var s=(isNaN(r))?c.slides.index(a(r)):r;c.count-=1;c.last=c.count-1;if(isNaN(r)){a(r,c.slides).remove()}else{(i&&l)?c.slides.eq(c.last).remove():c.slides.eq(r).remove()}c.doMath();c.update(s,"remove");c.slides=a(c.vars.selector+":not(.clone)",c);c.setup();c.vars.removed(c)};g.init()};a(window).blur(function(b){focused=false}).focus(function(b){focused=true});a.flexslider.defaults={namespace:"flex-",selector:".slides > li",animation:"fade",easing:"swing",direction:"horizontal",reverse:false,animationLoop:true,smoothHeight:false,startAt:0,slideshow:true,slideshowSpeed:7000,animationSpeed:600,initDelay:0,randomize:false,thumbCaptions:false,pauseOnAction:true,pauseOnHover:false,pauseInvisible:true,useCSS:true,touch:true,video:false,controlNav:true,directionNav:true,prevText:"Previous",nextText:"Next",keyboard:true,multipleKeyboard:false,mousewheel:false,pausePlay:false,pauseText:"Pause",playText:"Play",controlsContainer:"",manualControls:"",sync:"",asNavFor:"",itemWidth:0,itemMargin:0,minItems:1,maxItems:0,move:0,allowOneSlide:true,start:function(){},before:function(){},after:function(){},end:function(){},added:function(){},removed:function(){},init:function(){}};a.fn.flexslider=function(b){if(b===undefined){b={}}if(typeof b==="object"){return this.each(function(){var f=a(this),d=(b.selector)?b.selector:".slides > li",e=f.find(d);if((e.length===1&&b.allowOneSlide===true)||e.length===0){e.fadeIn(400);if(b.start){b.start(f)}}else{if(f.data("flexslider")===undefined){new a.flexslider(this,b)}}})}else{var c=a(this).data("flexslider");switch(b){case"play":c.play();break;case"pause":c.pause();break;case"stop":c.stop();break;case"next":c.flexAnimate(c.getTarget("next"),true);break;case"prev":case"previous":c.flexAnimate(c.getTarget("prev"),true);break;default:if(typeof b==="number"){c.flexAnimate(b,true)}}}}})(jQuery);
/*!
 * Created by mario on 15/05/14.
 */
;$(window).load(function(){$(".flexslider-principal").flexslider({animation:"slide",slideshowSpeed:5000,startAt:0,slideshow:true});$(".flexslider-destaque").flexslider({animation:"slide",controlNav:"thumbnails",randomize:false,slideshow:false});$("#flexslider-detalhe-thumb").flexslider({animation:"slide",controlNav:false,animationLoop:false,slideshow:false,itemWidth:120,itemMargin:5,asNavFor:"#flexslider-detalhe"});$("#flexslider-detalhe").flexslider({animation:"slide",controlNav:false,animationLoop:false,slideshow:false,sync:"#flexslider-detalhe-thumb"})});
/*!
 * Bootstrap v3.1.1 (http://getbootstrap.com)
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */
;if(typeof jQuery==="undefined"){throw new Error("Bootstrap's JavaScript requires jQuery")}+function(c){function d(){var a=document.createElement("bootstrap");var b={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"};for(var f in b){if(a.style[f]!==undefined){return{end:b[f]}}}return false}c.fn.emulateTransitionEnd=function(b){var g=false,h=this;c(this).one(c.support.transition.end,function(){g=true});var a=function(){if(!g){c(h).trigger(c.support.transition.end)}};setTimeout(a,b);return this};c(function(){c.support.transition=d()})}(jQuery);+function(g){var h='[data-dismiss="alert"]';var e=function(a){g(a).on("click",h,this.close)};e.prototype.close=function(a){var b=g(this);var d=b.attr("data-target");if(!d){d=b.attr("href");d=d&&d.replace(/.*(?=#[^\s]*$)/,"")}var c=g(d);if(a){a.preventDefault()}if(!c.length){c=b.hasClass("alert")?b:b.parent()}c.trigger(a=g.Event("close.bs.alert"));if(a.isDefaultPrevented()){return}c.removeClass("in");function k(){c.trigger("closed.bs.alert").remove()}g.support.transition&&c.hasClass("fade")?c.one(g.support.transition.end,k).emulateTransitionEnd(150):k()};var f=g.fn.alert;g.fn.alert=function(a){return this.each(function(){var b=g(this);var c=b.data("bs.alert");if(!c){b.data("bs.alert",(c=new e(this)))}if(typeof a=="string"){c[a].call(b)}})};g.fn.alert.Constructor=e;g.fn.alert.noConflict=function(){g.fn.alert=f;return this};g(document).on("click.bs.alert.data-api",h,e.prototype.close)}(jQuery);+function(f){var d=function(a,b){this.$element=f(a);this.options=f.extend({},d.DEFAULTS,b);this.isLoading=false};d.DEFAULTS={loadingText:"loading..."};d.prototype.setState=function(c){var a="disabled";var k=this.$element;var b=k.is("input")?"val":"html";var j=k.data();c=c+"Text";if(!j.resetText){k.data("resetText",k[b]())}k[b](j[c]||this.options[c]);setTimeout(f.proxy(function(){if(c=="loadingText"){this.isLoading=true;k.addClass(a).attr(a,a)}else{if(this.isLoading){this.isLoading=false;k.removeClass(a).removeAttr(a)}}},this),0)};d.prototype.toggle=function(){var b=true;var c=this.$element.closest('[data-toggle="buttons"]');if(c.length){var a=this.$element.find("input");if(a.prop("type")=="radio"){if(a.prop("checked")&&this.$element.hasClass("active")){b=false}else{c.find(".active").removeClass("active")}}if(b){a.prop("checked",!this.$element.hasClass("active")).trigger("change")}}if(b){this.$element.toggleClass("active")}};var e=f.fn.button;f.fn.button=function(a){return this.each(function(){var b=f(this);var c=b.data("bs.button");var h=typeof a=="object"&&a;if(!c){b.data("bs.button",(c=new d(this,h)))}if(a=="toggle"){c.toggle()}else{if(a){c.setState(a)}}})};f.fn.button.Constructor=d;f.fn.button.noConflict=function(){f.fn.button=e;return this};f(document).on("click.bs.button.data-api","[data-toggle^=button]",function(a){var b=f(a.target);if(!b.hasClass("btn")){b=b.closest(".btn")}b.button("toggle");a.preventDefault()})}(jQuery);+function(d){var f=function(a,b){this.$element=d(a);this.$indicators=this.$element.find(".carousel-indicators");this.options=b;this.paused=this.sliding=this.interval=this.$active=this.$items=null;this.options.pause=="hover"&&this.$element.on("mouseenter",d.proxy(this.pause,this)).on("mouseleave",d.proxy(this.cycle,this))};f.DEFAULTS={interval:5000,pause:"hover",wrap:true};f.prototype.cycle=function(a){a||(this.paused=false);this.interval&&clearInterval(this.interval);this.options.interval&&!this.paused&&(this.interval=setInterval(d.proxy(this.next,this),this.options.interval));return this};f.prototype.getActiveIndex=function(){this.$active=this.$element.find(".item.active");this.$items=this.$active.parent().children();return this.$items.index(this.$active)};f.prototype.to=function(a){var b=this;var c=this.getActiveIndex();if(a>(this.$items.length-1)||a<0){return}if(this.sliding){return this.$element.one("slid.bs.carousel",function(){b.to(a)})}if(c==a){return this.pause().cycle()}return this.slide(a>c?"next":"prev",d(this.$items[a]))};f.prototype.pause=function(a){a||(this.paused=true);if(this.$element.find(".next, .prev").length&&d.support.transition){this.$element.trigger(d.support.transition.end);this.cycle(true)}this.interval=clearInterval(this.interval);return this};f.prototype.next=function(){if(this.sliding){return}return this.slide("next")};f.prototype.prev=function(){if(this.sliding){return}return this.slide("prev")};f.prototype.slide=function(c,r){var a=this.$element.find(".item.active");var s=r||a[c]();var n=this.interval;var b=c=="next"?"left":"right";var q=c=="next"?"first":"last";var p=this;if(!s.length){if(!this.options.wrap){return}s=this.$element.find(".item")[q]()}if(s.hasClass("active")){return this.sliding=false}var o=d.Event("slide.bs.carousel",{relatedTarget:s[0],direction:b});this.$element.trigger(o);if(o.isDefaultPrevented()){return}this.sliding=true;n&&this.pause();if(this.$indicators.length){this.$indicators.find(".active").removeClass("active");this.$element.one("slid.bs.carousel",function(){var g=d(p.$indicators.children()[p.getActiveIndex()]);g&&g.addClass("active")})}if(d.support.transition&&this.$element.hasClass("slide")){s.addClass(c);s[0].offsetWidth;a.addClass(b);s.addClass(b);a.one(d.support.transition.end,function(){s.removeClass([c,b].join(" ")).addClass("active");a.removeClass(["active",b].join(" "));p.sliding=false;setTimeout(function(){p.$element.trigger("slid.bs.carousel")},0)}).emulateTransitionEnd(a.css("transition-duration").slice(0,-1)*1000)}else{a.removeClass("active");s.addClass("active");this.sliding=false;this.$element.trigger("slid.bs.carousel")}n&&this.cycle();return this};var e=d.fn.carousel;d.fn.carousel=function(a){return this.each(function(){var b=d(this);var c=b.data("bs.carousel");var j=d.extend({},f.DEFAULTS,b.data(),typeof a=="object"&&a);var i=typeof a=="string"?a:j.slide;if(!c){b.data("bs.carousel",(c=new f(this,j)))}if(typeof a=="number"){c.to(a)}else{if(i){c[i]()}else{if(j.interval){c.pause().cycle()}}}})};d.fn.carousel.Constructor=f;d.fn.carousel.noConflict=function(){d.fn.carousel=e;return this};d(document).on("click.bs.carousel.data-api","[data-slide], [data-slide-to]",function(a){var b=d(this),l;var m=d(b.attr("data-target")||(l=b.attr("href"))&&l.replace(/.*(?=#[^\s]+$)/,""));var k=d.extend({},m.data(),b.data());var c=b.attr("data-slide-to");if(c){k.interval=false}m.carousel(k);if(c=b.attr("data-slide-to")){m.data("bs.carousel").to(c)}a.preventDefault()});d(window).on("load",function(){d('[data-ride="carousel"]').each(function(){var a=d(this);a.carousel(a.data())})})}(jQuery);+function(d){var f=function(a,b){this.$element=d(a);this.options=d.extend({},f.DEFAULTS,b);this.transitioning=null;if(this.options.parent){this.$parent=d(this.options.parent)}if(this.options.toggle){this.toggle()}};f.DEFAULTS={toggle:true};f.prototype.dimension=function(){var a=this.$element.hasClass("width");return a?"width":"height"};f.prototype.show=function(){if(this.transitioning||this.$element.hasClass("in")){return}var k=d.Event("show.bs.collapse");this.$element.trigger(k);if(k.isDefaultPrevented()){return}var b=this.$parent&&this.$parent.find("> .panel > .in");if(b&&b.length){var j=b.data("bs.collapse");if(j&&j.transitioning){return}b.collapse("hide");j||b.data("bs.collapse",null)}var a=this.dimension();this.$element.removeClass("collapse").addClass("collapsing")[a](0);this.transitioning=1;var l=function(){this.$element.removeClass("collapsing").addClass("collapse in")[a]("auto");this.transitioning=0;this.$element.trigger("shown.bs.collapse")};if(!d.support.transition){return l.call(this)}var c=d.camelCase(["scroll",a].join("-"));this.$element.one(d.support.transition.end,d.proxy(l,this)).emulateTransitionEnd(350)[a](this.$element[0][c])};f.prototype.hide=function(){if(this.transitioning||!this.$element.hasClass("in")){return}var b=d.Event("hide.bs.collapse");this.$element.trigger(b);if(b.isDefaultPrevented()){return}var a=this.dimension();this.$element[a](this.$element[a]())[0].offsetHeight;this.$element.addClass("collapsing").removeClass("collapse").removeClass("in");this.transitioning=1;var c=function(){this.transitioning=0;this.$element.trigger("hidden.bs.collapse").removeClass("collapsing").addClass("collapse")};if(!d.support.transition){return c.call(this)}this.$element[a](0).one(d.support.transition.end,d.proxy(c,this)).emulateTransitionEnd(350)};f.prototype.toggle=function(){this[this.$element.hasClass("in")?"hide":"show"]()};var e=d.fn.collapse;d.fn.collapse=function(a){return this.each(function(){var b=d(this);var c=b.data("bs.collapse");var h=d.extend({},f.DEFAULTS,b.data(),typeof a=="object"&&a);if(!c&&h.toggle&&a=="show"){a=!a}if(!c){b.data("bs.collapse",(c=new f(this,h)))}if(typeof a=="string"){c[a]()}})};d.fn.collapse.Constructor=f;d.fn.collapse.noConflict=function(){d.fn.collapse=e;return this};d(document).on("click.bs.collapse.data-api","[data-toggle=collapse]",function(n){var b=d(this),s;var c=b.attr("data-target")||n.preventDefault()||(s=b.attr("href"))&&s.replace(/.*(?=#[^\s]+$)/,"");var r=d(c);var p=r.data("bs.collapse");var o=p?"toggle":b.data();var a=b.attr("data-parent");var q=a&&d(a);if(!p||!p.transitioning){if(q){q.find('[data-toggle=collapse][data-parent="'+a+'"]').not(b).addClass("collapsed")}b[r.hasClass("in")?"addClass":"removeClass"]("collapsed")}r.collapse(o)})}(jQuery);+function(j){var l=".dropdown-backdrop";var h="[data-toggle=dropdown]";var i=function(a){j(a).on("click.bs.dropdown",this.toggle)};i.prototype.toggle=function(a){var b=j(this);if(b.is(".disabled, :disabled")){return}var c=k(b);var d=c.hasClass("open");m();if(!d){if("ontouchstart" in document.documentElement&&!c.closest(".navbar-nav").length){j('<div class="dropdown-backdrop"/>').insertAfter(j(this)).on("click",m)}var e={relatedTarget:this};c.trigger(a=j.Event("show.bs.dropdown",e));if(a.isDefaultPrevented()){return}c.toggleClass("open").trigger("shown.bs.dropdown",e);b.focus()}return false};i.prototype.keydown=function(b){if(!/(38|40|27)/.test(b.keyCode)){return}var c=j(this);b.preventDefault();b.stopPropagation();if(c.is(".disabled, :disabled")){return}var d=k(c);var e=d.hasClass("open");if(!e||(e&&b.keyCode==27)){if(b.which==27){d.find(h).focus()}return c.click()}var a=" li:not(.divider):visible a";var g=d.find("[role=menu]"+a+", [role=listbox]"+a);if(!g.length){return}var f=g.index(g.filter(":focus"));if(b.keyCode==38&&f>0){f--}if(b.keyCode==40&&f<g.length-1){f++}if(!~f){f=0}g.eq(f).focus()};function m(a){j(l).remove();j(h).each(function(){var b=k(j(this));var c={relatedTarget:this};if(!b.hasClass("open")){return}b.trigger(a=j.Event("hide.bs.dropdown",c));if(a.isDefaultPrevented()){return}b.removeClass("open").trigger("hidden.bs.dropdown",c)})}function k(a){var c=a.attr("data-target");if(!c){c=a.attr("href");c=c&&/#[A-Za-z]/.test(c)&&c.replace(/.*(?=#[^\s]*$)/,"")}var b=c&&j(c);return b&&b.length?b:a.parent()}var n=j.fn.dropdown;j.fn.dropdown=function(a){return this.each(function(){var b=j(this);var c=b.data("bs.dropdown");if(!c){b.data("bs.dropdown",(c=new i(this)))}if(typeof a=="string"){c[a].call(b)}})};j.fn.dropdown.Constructor=i;j.fn.dropdown.noConflict=function(){j.fn.dropdown=n;return this};j(document).on("click.bs.dropdown.data-api",m).on("click.bs.dropdown.data-api",".dropdown form",function(a){a.stopPropagation()}).on("click.bs.dropdown.data-api",h,i.prototype.toggle).on("keydown.bs.dropdown.data-api",h+", [role=menu], [role=listbox]",i.prototype.keydown)}(jQuery);+function(f){var d=function(a,b){this.options=b;this.$element=f(a);this.$backdrop=this.isShown=null;if(this.options.remote){this.$element.find(".modal-content").load(this.options.remote,f.proxy(function(){this.$element.trigger("loaded.bs.modal")},this))}};d.DEFAULTS={backdrop:true,keyboard:true,show:true};d.prototype.toggle=function(a){return this[!this.isShown?"show":"hide"](a)};d.prototype.show=function(a){var c=this;var b=f.Event("show.bs.modal",{relatedTarget:a});this.$element.trigger(b);if(this.isShown||b.isDefaultPrevented()){return}this.isShown=true;this.escape();this.$element.on("click.dismiss.bs.modal",'[data-dismiss="modal"]',f.proxy(this.hide,this));this.backdrop(function(){var g=f.support.transition&&c.$element.hasClass("fade");if(!c.$element.parent().length){c.$element.appendTo(document.body)}c.$element.show().scrollTop(0);if(g){c.$element[0].offsetWidth}c.$element.addClass("in").attr("aria-hidden",false);c.enforceFocus();var j=f.Event("shown.bs.modal",{relatedTarget:a});g?c.$element.find(".modal-dialog").one(f.support.transition.end,function(){c.$element.focus().trigger(j)}).emulateTransitionEnd(300):c.$element.focus().trigger(j)})};d.prototype.hide=function(a){if(a){a.preventDefault()}a=f.Event("hide.bs.modal");this.$element.trigger(a);if(!this.isShown||a.isDefaultPrevented()){return}this.isShown=false;this.escape();f(document).off("focusin.bs.modal");this.$element.removeClass("in").attr("aria-hidden",true).off("click.dismiss.bs.modal");f.support.transition&&this.$element.hasClass("fade")?this.$element.one(f.support.transition.end,f.proxy(this.hideModal,this)).emulateTransitionEnd(300):this.hideModal()};d.prototype.enforceFocus=function(){f(document).off("focusin.bs.modal").on("focusin.bs.modal",f.proxy(function(a){if(this.$element[0]!==a.target&&!this.$element.has(a.target).length){this.$element.focus()}},this))};d.prototype.escape=function(){if(this.isShown&&this.options.keyboard){this.$element.on("keyup.dismiss.bs.modal",f.proxy(function(a){a.which==27&&this.hide()},this))}else{if(!this.isShown){this.$element.off("keyup.dismiss.bs.modal")}}};d.prototype.hideModal=function(){var a=this;this.$element.hide();this.backdrop(function(){a.removeBackdrop();a.$element.trigger("hidden.bs.modal")})};d.prototype.removeBackdrop=function(){this.$backdrop&&this.$backdrop.remove();this.$backdrop=null};d.prototype.backdrop=function(a){var b=this.$element.hasClass("fade")?"fade":"";if(this.isShown&&this.options.backdrop){var c=f.support.transition&&b;this.$backdrop=f('<div class="modal-backdrop '+b+'" />').appendTo(document.body);this.$element.on("click.dismiss.bs.modal",f.proxy(function(h){if(h.target!==h.currentTarget){return}this.options.backdrop=="static"?this.$element[0].focus.call(this.$element[0]):this.hide.call(this)},this));if(c){this.$backdrop[0].offsetWidth}this.$backdrop.addClass("in");if(!a){return}c?this.$backdrop.one(f.support.transition.end,a).emulateTransitionEnd(150):a()}else{if(!this.isShown&&this.$backdrop){this.$backdrop.removeClass("in");f.support.transition&&this.$element.hasClass("fade")?this.$backdrop.one(f.support.transition.end,a).emulateTransitionEnd(150):a()}else{if(a){a()}}}};var e=f.fn.modal;f.fn.modal=function(b,a){return this.each(function(){var c=f(this);var i=c.data("bs.modal");var j=f.extend({},d.DEFAULTS,c.data(),typeof b=="object"&&b);if(!i){c.data("bs.modal",(i=new d(this,j)))}if(typeof b=="string"){i[b](a)}else{if(j.show){i.show(a)}}})};f.fn.modal.Constructor=d;f.fn.modal.noConflict=function(){f.fn.modal=e;return this};f(document).on("click.bs.modal.data-api",'[data-toggle="modal"]',function(a){var b=f(this);var j=b.attr("href");var k=f(b.attr("data-target")||(j&&j.replace(/.*(?=#[^\s]+$)/,"")));var c=k.data("bs.modal")?"toggle":f.extend({remote:!/#/.test(j)&&j},k.data(),b.data());if(b.is("a")){a.preventDefault()}k.modal(c,this).one("hide",function(){b.is(":visible")&&b.focus()})});f(document).on("show.bs.modal",".modal",function(){f(document.body).addClass("modal-open")}).on("hidden.bs.modal",".modal",function(){f(document.body).removeClass("modal-open")})}(jQuery);+function(f){var d=function(a,b){this.type=this.options=this.enabled=this.timeout=this.hoverState=this.$element=null;this.init("tooltip",a,b)};d.DEFAULTS={animation:true,placement:"top",selector:false,template:'<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:false,container:false};d.prototype.init=function(b,i,n){this.enabled=true;this.type=b;this.$element=f(i);this.options=this.getOptions(n);var c=this.options.trigger.split(" ");for(var m=c.length;m--;){var o=c[m];if(o=="click"){this.$element.on("click."+this.type,this.options.selector,f.proxy(this.toggle,this))}else{if(o!="manual"){var a=o=="hover"?"mouseenter":"focusin";var p=o=="hover"?"mouseleave":"focusout";this.$element.on(a+"."+this.type,this.options.selector,f.proxy(this.enter,this));this.$element.on(p+"."+this.type,this.options.selector,f.proxy(this.leave,this))}}}this.options.selector?(this._options=f.extend({},this.options,{trigger:"manual",selector:""})):this.fixTitle()};d.prototype.getDefaults=function(){return d.DEFAULTS};d.prototype.getOptions=function(a){a=f.extend({},this.getDefaults(),this.$element.data(),a);if(a.delay&&typeof a.delay=="number"){a.delay={show:a.delay,hide:a.delay}}return a};d.prototype.getDelegateOptions=function(){var b={};var a=this.getDefaults();this._options&&f.each(this._options,function(h,c){if(a[h]!=c){b[h]=c}});return b};d.prototype.enter=function(a){var b=a instanceof this.constructor?a:f(a.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type);clearTimeout(b.timeout);b.hoverState="in";if(!b.options.delay||!b.options.delay.show){return b.show()}b.timeout=setTimeout(function(){if(b.hoverState=="in"){b.show()}},b.options.delay.show)};d.prototype.leave=function(a){var b=a instanceof this.constructor?a:f(a.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type);clearTimeout(b.timeout);b.hoverState="out";if(!b.options.delay||!b.options.delay.hide){return b.hide()}b.timeout=setTimeout(function(){if(b.hoverState=="out"){b.hide()}},b.options.delay.hide)};d.prototype.show=function(){var c=f.Event("show.bs."+this.type);if(this.hasContent()&&this.enabled){this.$element.trigger(c);if(c.isDefaultPrevented()){return}var v=this;var z=this.tip();this.setContent();if(this.options.animation){z.addClass("fade")}var A=typeof this.options.placement=="function"?this.options.placement.call(this,z[0],this.$element[0]):this.options.placement;var H=/\s?auto?\s?/i;var G=H.test(A);if(G){A=A.replace(H,"")||"top"}z.detach().css({top:0,left:0,display:"block"}).addClass(A);this.options.container?z.appendTo(this.options.container):z.insertAfter(this.$element);var b=this.getPosition();var F=z[0].offsetWidth;var x=z[0].offsetHeight;if(G){var B=this.$element.parent();var C=A;var a=document.documentElement.scrollTop||document.body.scrollTop;var I=this.options.container=="body"?window.innerWidth:B.outerWidth();var w=this.options.container=="body"?window.innerHeight:B.outerHeight();var y=this.options.container=="body"?0:B.offset().left;A=A=="bottom"&&b.top+b.height+x-a>w?"top":A=="top"&&b.top-a-x<0?"bottom":A=="right"&&b.right+F>I?"left":A=="left"&&b.left-F<y?"right":A;z.removeClass(C).addClass(A)}var D=this.getCalculatedOffset(A,b,F,x);this.applyPlacement(D,A);this.hoverState=null;var E=function(){v.$element.trigger("shown.bs."+v.type)};f.support.transition&&this.$tip.hasClass("fade")?z.one(f.support.transition.end,E).emulateTransitionEnd(150):E()}};d.prototype.applyPlacement=function(q,p){var s;var o=this.tip();var t=o[0].offsetWidth;var a=o[0].offsetHeight;var u=parseInt(o.css("margin-top"),10);var r=parseInt(o.css("margin-left"),10);if(isNaN(u)){u=0}if(isNaN(r)){r=0}q.top=q.top+u;q.left=q.left+r;f.offset.setOffset(o[0],f.extend({using:function(g){o.css({top:Math.round(g.top),left:Math.round(g.left)})}},q),0);o.addClass("in");var v=o[0].offsetWidth;var c=o[0].offsetHeight;if(p=="top"&&c!=a){s=true;q.top=q.top+a-c}if(/bottom|top/.test(p)){var b=0;if(q.left<0){b=q.left*-2;q.left=0;o.offset(q);v=o[0].offsetWidth;c=o[0].offsetHeight}this.replaceArrow(b-t+v,v,"left")}else{this.replaceArrow(c-a,c,"top")}if(s){o.offset(q)}};d.prototype.replaceArrow=function(a,b,c){this.arrow().css(c,a?(50*(1-a/b)+"%"):"")};d.prototype.setContent=function(){var a=this.tip();var b=this.getTitle();a.find(".tooltip-inner")[this.options.html?"html":"text"](b);a.removeClass("fade in top bottom left right")};d.prototype.hide=function(){var c=this;var a=this.tip();var b=f.Event("hide.bs."+this.type);function i(){if(c.hoverState!="in"){a.detach()}c.$element.trigger("hidden.bs."+c.type)}this.$element.trigger(b);if(b.isDefaultPrevented()){return}a.removeClass("in");f.support.transition&&this.$tip.hasClass("fade")?a.one(f.support.transition.end,i).emulateTransitionEnd(150):i();this.hoverState=null;return this};d.prototype.fixTitle=function(){var a=this.$element;if(a.attr("title")||typeof(a.attr("data-original-title"))!="string"){a.attr("data-original-title",a.attr("title")||"").attr("title","")}};d.prototype.hasContent=function(){return this.getTitle()};d.prototype.getPosition=function(){var a=this.$element[0];return f.extend({},(typeof a.getBoundingClientRect=="function")?a.getBoundingClientRect():{width:a.offsetWidth,height:a.offsetHeight},this.$element.offset())};d.prototype.getCalculatedOffset=function(h,a,c,b){return h=="bottom"?{top:a.top+a.height,left:a.left+a.width/2-c/2}:h=="top"?{top:a.top-b,left:a.left+a.width/2-c/2}:h=="left"?{top:a.top+a.height/2-b/2,left:a.left-c}:{top:a.top+a.height/2-b/2,left:a.left+a.width}};d.prototype.getTitle=function(){var a;var c=this.$element;var b=this.options;a=c.attr("data-original-title")||(typeof b.title=="function"?b.title.call(c[0]):b.title);return a};d.prototype.tip=function(){return this.$tip=this.$tip||f(this.options.template)};d.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".tooltip-arrow")};d.prototype.validate=function(){if(!this.$element[0].parentNode){this.hide();this.$element=null;this.options=null}};d.prototype.enable=function(){this.enabled=true};d.prototype.disable=function(){this.enabled=false};d.prototype.toggleEnabled=function(){this.enabled=!this.enabled};d.prototype.toggle=function(a){var b=a?f(a.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type):this;b.tip().hasClass("in")?b.leave(b):b.enter(b)};d.prototype.destroy=function(){clearTimeout(this.timeout);this.hide().$element.off("."+this.type).removeData("bs."+this.type)};var e=f.fn.tooltip;f.fn.tooltip=function(a){return this.each(function(){var b=f(this);var c=b.data("bs.tooltip");var h=typeof a=="object"&&a;if(!c&&a=="destroy"){return}if(!c){b.data("bs.tooltip",(c=new d(this,h)))}if(typeof a=="string"){c[a]()}})};f.fn.tooltip.Constructor=d;f.fn.tooltip.noConflict=function(){f.fn.tooltip=e;return this}}(jQuery);+function(f){var d=function(a,b){this.init("popover",a,b)};if(!f.fn.tooltip){throw new Error("Popover requires tooltip.js")}d.DEFAULTS=f.extend({},f.fn.tooltip.Constructor.DEFAULTS,{placement:"right",trigger:"click",content:"",template:'<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'});d.prototype=f.extend({},f.fn.tooltip.Constructor.prototype);d.prototype.constructor=d;d.prototype.getDefaults=function(){return d.DEFAULTS};d.prototype.setContent=function(){var a=this.tip();var b=this.getTitle();var c=this.getContent();a.find(".popover-title")[this.options.html?"html":"text"](b);a.find(".popover-content")[this.options.html?(typeof c=="string"?"html":"append"):"text"](c);a.removeClass("fade top bottom left right in");if(!a.find(".popover-title").html()){a.find(".popover-title").hide()}};d.prototype.hasContent=function(){return this.getTitle()||this.getContent()};d.prototype.getContent=function(){var b=this.$element;var a=this.options;return b.attr("data-content")||(typeof a.content=="function"?a.content.call(b[0]):a.content)};d.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".arrow")};d.prototype.tip=function(){if(!this.$tip){this.$tip=f(this.options.template)}return this.$tip};var e=f.fn.popover;f.fn.popover=function(a){return this.each(function(){var b=f(this);var c=b.data("bs.popover");var h=typeof a=="object"&&a;if(!c&&a=="destroy"){return}if(!c){b.data("bs.popover",(c=new d(this,h)))}if(typeof a=="string"){c[a]()}})};f.fn.popover.Constructor=d;f.fn.popover.noConflict=function(){f.fn.popover=e;return this}}(jQuery);+function(f){function d(b,c){var h;var a=f.proxy(this.process,this);this.$element=f(b).is("body")?f(window):f(b);this.$body=f("body");this.$scrollElement=this.$element.on("scroll.bs.scroll-spy.data-api",a);this.options=f.extend({},d.DEFAULTS,c);this.selector=(this.options.target||((h=f(b).attr("href"))&&h.replace(/.*(?=#[^\s]+$)/,""))||"")+" .nav li > a";this.offsets=f([]);this.targets=f([]);this.activeTarget=null;this.refresh();this.process()}d.DEFAULTS={offset:10};d.prototype.refresh=function(){var c=this.$element[0]==window?"offset":"position";this.offsets=f([]);this.targets=f([]);var b=this;var a=this.$body.find(this.selector).map(function(){var k=f(this);var l=k.data("target")||k.attr("href");var j=/^#./.test(l)&&f(l);return(j&&j.length&&j.is(":visible")&&[[j[c]().top+(!f.isWindow(b.$scrollElement.get(0))&&b.$scrollElement.scrollTop()),l]])||null}).sort(function(i,j){return i[0]-j[0]}).each(function(){b.offsets.push(this[0]);b.targets.push(this[1])})};d.prototype.process=function(){var b=this.$scrollElement.scrollTop()+this.options.offset;var l=this.$scrollElement[0].scrollHeight||this.$body[0].scrollHeight;var c=l-this.$scrollElement.height();var i=this.offsets;var n=this.targets;var a=this.activeTarget;var m;if(b>=c){return a!=(m=n.last()[0])&&this.activate(m)}if(a&&b<=i[0]){return a!=(m=n[0])&&this.activate(m)}for(m=i.length;m--;){a!=n[m]&&b>=i[m]&&(!i[m+1]||b<=i[m+1])&&this.activate(n[m])}};d.prototype.activate=function(a){this.activeTarget=a;f(this.selector).parentsUntil(this.options.target,".active").removeClass("active");var c=this.selector+'[data-target="'+a+'"],'+this.selector+'[href="'+a+'"]';var b=f(c).parents("li").addClass("active");if(b.parent(".dropdown-menu").length){b=b.closest("li.dropdown").addClass("active")}b.trigger("activate.bs.scrollspy")};var e=f.fn.scrollspy;f.fn.scrollspy=function(a){return this.each(function(){var b=f(this);var c=b.data("bs.scrollspy");var h=typeof a=="object"&&a;if(!c){b.data("bs.scrollspy",(c=new d(this,h)))}if(typeof a=="string"){c[a]()}})};f.fn.scrollspy.Constructor=d;f.fn.scrollspy.noConflict=function(){f.fn.scrollspy=e;return this};f(window).on("load",function(){f('[data-spy="scroll"]').each(function(){var a=f(this);a.scrollspy(a.data())})})}(jQuery);+function(f){var d=function(a){this.element=f(a)};d.prototype.show=function(){var a=this.element;var k=a.closest("ul:not(.dropdown-menu)");var l=a.data("target");if(!l){l=a.attr("href");l=l&&l.replace(/.*(?=#[^\s]*$)/,"")}if(a.parent("li").hasClass("active")){return}var c=k.find(".active:last a")[0];var b=f.Event("show.bs.tab",{relatedTarget:c});a.trigger(b);if(b.isDefaultPrevented()){return}var m=f(l);this.activate(a.parent("li"),k);this.activate(m,m.parent(),function(){a.trigger({type:"shown.bs.tab",relatedTarget:c})})};d.prototype.activate=function(j,k,a){var l=k.find("> .active");var b=a&&f.support.transition&&l.hasClass("fade");function c(){l.removeClass("active").find("> .dropdown-menu > .active").removeClass("active");j.addClass("active");if(b){j[0].offsetWidth;j.addClass("in")}else{j.removeClass("fade")}if(j.parent(".dropdown-menu")){j.closest("li.dropdown").addClass("active")}a&&a()}b?l.one(f.support.transition.end,c).emulateTransitionEnd(150):c();l.removeClass("in")};var e=f.fn.tab;f.fn.tab=function(a){return this.each(function(){var b=f(this);var c=b.data("bs.tab");if(!c){b.data("bs.tab",(c=new d(this)))}if(typeof a=="string"){c[a]()}})};f.fn.tab.Constructor=d;f.fn.tab.noConflict=function(){f.fn.tab=e;return this};f(document).on("click.bs.tab.data-api",'[data-toggle="tab"], [data-toggle="pill"]',function(a){a.preventDefault();f(this).tab("show")})}(jQuery);+function(f){var d=function(a,b){this.options=f.extend({},d.DEFAULTS,b);this.$window=f(window).on("scroll.bs.affix.data-api",f.proxy(this.checkPosition,this)).on("click.bs.affix.data-api",f.proxy(this.checkPositionWithEventLoop,this));this.$element=f(a);this.affixed=this.unpin=this.pinnedOffset=null;this.checkPosition()};d.RESET="affix affix-top affix-bottom";d.DEFAULTS={offset:0};d.prototype.getPinnedOffset=function(){if(this.pinnedOffset){return this.pinnedOffset}this.$element.removeClass(d.RESET).addClass("affix");var a=this.$window.scrollTop();var b=this.$element.offset();return(this.pinnedOffset=b.top-a)};d.prototype.checkPositionWithEventLoop=function(){setTimeout(f.proxy(this.checkPosition,this),1)};d.prototype.checkPosition=function(){if(!this.$element.is(":visible")){return}var a=f(document).height();var s=this.$window.scrollTop();var n=this.$element.offset();var p=this.options.offset;var r=p.top;var q=p.bottom;if(this.affixed=="top"){n.top+=s}if(typeof p!="object"){q=r=p}if(typeof r=="function"){r=p.top(this.$element)}if(typeof q=="function"){q=p.bottom(this.$element)}var o=this.unpin!=null&&(s+this.unpin<=n.top)?false:q!=null&&(n.top+this.$element.height()>=a-q)?"bottom":r!=null&&(s<=r)?"top":false;if(this.affixed===o){return}if(this.unpin){this.$element.css("top","")}var b="affix"+(o?"-"+o:"");var c=f.Event(b+".bs.affix");this.$element.trigger(c);if(c.isDefaultPrevented()){return}this.affixed=o;this.unpin=o=="bottom"?this.getPinnedOffset():null;this.$element.removeClass(d.RESET).addClass(b).trigger(f.Event(b.replace("affix","affixed")));if(o=="bottom"){this.$element.offset({top:a-q-this.$element.height()})}};var e=f.fn.affix;f.fn.affix=function(a){return this.each(function(){var b=f(this);var c=b.data("bs.affix");var h=typeof a=="object"&&a;if(!c){b.data("bs.affix",(c=new d(this,h)))}if(typeof a=="string"){c[a]()}})};f.fn.affix.Constructor=d;f.fn.affix.noConflict=function(){f.fn.affix=e;return this};f(window).on("load",function(){f('[data-spy="affix"]').each(function(){var a=f(this);var b=a.data();b.offset=b.offset||{};if(b.offsetBottom){b.offset.bottom=b.offsetBottom}if(b.offsetTop){b.offset.top=b.offsetTop}a.affix(b)})})}(jQuery);(function(b){b.flexslider=function(B,a){var E=b(B);E.vars=b.extend({},b.flexslider.defaults,a);var x=E.vars.namespace,C=window.navigator&&window.navigator.msPointerEnabled&&window.MSGesture,w=(("ontouchstart" in window)||C||window.DocumentTouch&&document instanceof DocumentTouch)&&E.vars.touch,D="click touchend MSPointerUp",F="",r,y=E.vars.direction==="vertical",v=E.vars.reverse,s=(E.vars.itemWidth>0),z=E.vars.animation==="fade",u=E.vars.asNavFor!=="",A={},t=true;b.data(B,"flexslider",E);A={init:function(){E.animating=false;E.currentSlide=parseInt((E.vars.startAt?E.vars.startAt:0),10);if(isNaN(E.currentSlide)){E.currentSlide=0}E.animatingTo=E.currentSlide;E.atEnd=(E.currentSlide===0||E.currentSlide===E.last);E.containerSelector=E.vars.selector.substr(0,E.vars.selector.search(" "));E.slides=b(E.vars.selector,E);E.container=b(E.containerSelector,E);E.count=E.slides.length;E.syncExists=b(E.vars.sync).length>0;if(E.vars.animation==="slide"){E.vars.animation="swing"}E.prop=(y)?"top":"marginLeft";E.args={};E.manualPause=false;E.stopped=false;E.started=false;E.startTimeout=null;E.transitions=!E.vars.video&&!z&&E.vars.useCSS&&(function(){var c=document.createElement("div"),d=["perspectiveProperty","WebkitPerspective","MozPerspective","OPerspective","msPerspective"];for(var e in d){if(c.style[d[e]]!==undefined){E.pfx=d[e].replace("Perspective","").toLowerCase();E.prop="-"+E.pfx+"-transform";return true}}return false}());E.ensureAnimationEnd="";if(E.vars.controlsContainer!==""){E.controlsContainer=b(E.vars.controlsContainer).length>0&&b(E.vars.controlsContainer)}if(E.vars.manualControls!==""){E.manualControls=b(E.vars.manualControls).length>0&&b(E.vars.manualControls)}if(E.vars.randomize){E.slides.sort(function(){return(Math.round(Math.random())-0.5)});E.container.empty().append(E.slides)}E.doMath();E.setup("init");if(E.vars.controlNav){A.controlNav.setup()}if(E.vars.directionNav){A.directionNav.setup()}if(E.vars.keyboard&&(b(E.containerSelector).length===1||E.vars.multipleKeyboard)){b(document).bind("keyup",function(d){var e=d.keyCode;if(!E.animating&&(e===39||e===37)){var c=(e===39)?E.getTarget("next"):(e===37)?E.getTarget("prev"):false;E.flexAnimate(c,E.vars.pauseOnAction)}})}if(E.vars.mousewheel){E.bind("mousewheel",function(e,c,f,g){e.preventDefault();var d=(c<0)?E.getTarget("next"):E.getTarget("prev");E.flexAnimate(d,E.vars.pauseOnAction)})}if(E.vars.pausePlay){A.pausePlay.setup()}if(E.vars.slideshow&&E.vars.pauseInvisible){A.pauseInvisible.init()}if(E.vars.slideshow){if(E.vars.pauseOnHover){E.hover(function(){if(!E.manualPlay&&!E.manualPause){E.pause()}},function(){if(!E.manualPause&&!E.manualPlay&&!E.stopped){E.play()}})}if(!E.vars.pauseInvisible||!A.pauseInvisible.isHidden()){(E.vars.initDelay>0)?E.startTimeout=setTimeout(E.play,E.vars.initDelay):E.play()}}if(u){A.asNav.setup()}if(w&&E.vars.touch){A.touch()}if(!z||(z&&E.vars.smoothHeight)){b(window).bind("resize orientationchange focus",A.resize)}E.find("img").attr("draggable","false");setTimeout(function(){E.vars.start(E)},200)},asNav:{setup:function(){E.asNav=true;E.animatingTo=Math.floor(E.currentSlide/E.move);E.currentItem=E.currentSlide;E.slides.removeClass(x+"active-slide").eq(E.currentItem).addClass(x+"active-slide");if(!C){E.slides.on(D,function(d){d.preventDefault();var e=b(this),f=e.index();var c=e.offset().left-b(E).scrollLeft();if(c<=0&&e.hasClass(x+"active-slide")){E.flexAnimate(E.getTarget("prev"),true)}else{if(!b(E.vars.asNavFor).data("flexslider").animating&&!e.hasClass(x+"active-slide")){E.direction=(E.currentItem<f)?"next":"prev";E.flexAnimate(f,E.vars.pauseOnAction,false,true,true)}}})}else{B._slider=E;E.slides.each(function(){var c=this;c._gesture=new MSGesture();c._gesture.target=c;c.addEventListener("MSPointerDown",function(d){d.preventDefault();if(d.currentTarget._gesture){d.currentTarget._gesture.addPointer(d.pointerId)}},false);c.addEventListener("MSGestureTap",function(d){d.preventDefault();var e=b(this),f=e.index();if(!b(E.vars.asNavFor).data("flexslider").animating&&!e.hasClass("active")){E.direction=(E.currentItem<f)?"next":"prev";E.flexAnimate(f,E.vars.pauseOnAction,false,true,true)}})})}}},controlNav:{setup:function(){if(!E.manualControls){A.controlNav.setupPaging()}else{A.controlNav.setupManual()}},setupPaging:function(){var e=(E.vars.controlNav==="thumbnails")?"control-thumbs":"control-paging",g=1,d,h;E.controlNavScaffold=b('<ol class="'+x+"control-nav "+x+e+'"></ol>');if(E.pagingCount>1){for(var f=0;f<E.pagingCount;f++){h=E.slides.eq(f);d=(E.vars.controlNav==="thumbnails")?'<img src="'+h.attr("data-thumb")+'"/>':"<a>"+g+"</a>";if("thumbnails"===E.vars.controlNav&&true===E.vars.thumbCaptions){var c=h.attr("data-thumbcaption");if(""!=c&&undefined!=c){d+='<span class="'+x+'caption">'+c+"</span>"}}E.controlNavScaffold.append("<li>"+d+"</li>");g++}}(E.controlsContainer)?b(E.controlsContainer).append(E.controlNavScaffold):E.append(E.controlNavScaffold);A.controlNav.set();A.controlNav.active();E.controlNavScaffold.delegate("a, img",D,function(i){i.preventDefault();if(F===""||F===i.type){var j=b(this),k=E.controlNav.index(j);if(!j.hasClass(x+"active")){E.direction=(k>E.currentSlide)?"next":"prev";E.flexAnimate(k,E.vars.pauseOnAction)}}if(F===""){F=i.type}A.setToClearWatchedEvent()})},setupManual:function(){E.controlNav=E.manualControls;A.controlNav.active();E.controlNav.bind(D,function(e){e.preventDefault();if(F===""||F===e.type){var c=b(this),d=E.controlNav.index(c);if(!c.hasClass(x+"active")){(d>E.currentSlide)?E.direction="next":E.direction="prev";E.flexAnimate(d,E.vars.pauseOnAction)}}if(F===""){F=e.type}A.setToClearWatchedEvent()})},set:function(){var c=(E.vars.controlNav==="thumbnails")?"img":"a";E.controlNav=b("."+x+"control-nav li "+c,(E.controlsContainer)?E.controlsContainer:E)},active:function(){E.controlNav.removeClass(x+"active").eq(E.animatingTo).addClass(x+"active")},update:function(d,c){if(E.pagingCount>1&&d==="add"){E.controlNavScaffold.append(b("<li><a>"+E.count+"</a></li>"))}else{if(E.pagingCount===1){E.controlNavScaffold.find("li").remove()}else{E.controlNav.eq(c).closest("li").remove()}}A.controlNav.set();(E.pagingCount>1&&E.pagingCount!==E.controlNav.length)?E.update(c,d):A.controlNav.active()}},directionNav:{setup:function(){var c=b('<ul class="'+x+'direction-nav"><li><a class="'+x+'prev" href="#">'+E.vars.prevText+'</a></li><li><a class="'+x+'next" href="#">'+E.vars.nextText+"</a></li></ul>");if(E.controlsContainer){b(E.controlsContainer).append(c);E.directionNav=b("."+x+"direction-nav li a",E.controlsContainer)}else{E.append(c);E.directionNav=b("."+x+"direction-nav li a",E)}A.directionNav.update();E.directionNav.bind(D,function(e){e.preventDefault();var d;if(F===""||F===e.type){d=(b(this).hasClass(x+"next"))?E.getTarget("next"):E.getTarget("prev");E.flexAnimate(d,E.vars.pauseOnAction)}if(F===""){F=e.type}A.setToClearWatchedEvent()})},update:function(){var c=x+"disabled";if(E.pagingCount===1){E.directionNav.addClass(c).attr("tabindex","-1")}else{if(!E.vars.animationLoop){if(E.animatingTo===0){E.directionNav.removeClass(c).filter("."+x+"prev").addClass(c).attr("tabindex","-1")}else{if(E.animatingTo===E.last){E.directionNav.removeClass(c).filter("."+x+"next").addClass(c).attr("tabindex","-1")}else{E.directionNav.removeClass(c).removeAttr("tabindex")}}}else{E.directionNav.removeClass(c).removeAttr("tabindex")}}}},pausePlay:{setup:function(){var c=b('<div class="'+x+'pauseplay"><a></a></div>');if(E.controlsContainer){E.controlsContainer.append(c);E.pausePlay=b("."+x+"pauseplay a",E.controlsContainer)}else{E.append(c);E.pausePlay=b("."+x+"pauseplay a",E)}A.pausePlay.update((E.vars.slideshow)?x+"pause":x+"play");E.pausePlay.bind(D,function(d){d.preventDefault();if(F===""||F===d.type){if(b(this).hasClass(x+"pause")){E.manualPause=true;E.manualPlay=false;E.pause()}else{E.manualPause=false;E.manualPlay=true;E.play()}}if(F===""){F=d.type}A.setToClearWatchedEvent()})},update:function(c){(c==="play")?E.pausePlay.removeClass(x+"pause").addClass(x+"play").html(E.vars.playText):E.pausePlay.removeClass(x+"play").addClass(x+"pause").html(E.vars.pauseText)}},touch:function(){var e,h,j,d,m,H,f=false,n=0,p=0,k=0;if(!C){B.addEventListener("touchstart",i,false);function i(G){if(E.animating){G.preventDefault()}else{if((window.navigator.msPointerEnabled)||G.touches.length===1){E.pause();d=(y)?E.h:E.w;H=Number(new Date());n=G.touches[0].pageX;p=G.touches[0].pageY;j=(s&&v&&E.animatingTo===E.last)?0:(s&&v)?E.limit-(((E.itemW+E.vars.itemMargin)*E.move)*E.animatingTo):(s&&E.currentSlide===E.last)?E.limit:(s)?((E.itemW+E.vars.itemMargin)*E.move)*E.currentSlide:(v)?(E.last-E.currentSlide+E.cloneOffset)*d:(E.currentSlide+E.cloneOffset)*d;e=(y)?p:n;h=(y)?n:p;B.addEventListener("touchmove",q,false);B.addEventListener("touchend",o,false)}}}function q(J){n=J.touches[0].pageX;p=J.touches[0].pageY;m=(y)?e-p:e-n;f=(y)?(Math.abs(m)<Math.abs(n-h)):(Math.abs(m)<Math.abs(p-h));var G=500;if(!f||Number(new Date())-H>G){J.preventDefault();if(!z&&E.transitions){if(!E.vars.animationLoop){m=m/((E.currentSlide===0&&m<0||E.currentSlide===E.last&&m>0)?(Math.abs(m)/d+2):1)}E.setProps(j+m,"setTouch")}}}function o(G){B.removeEventListener("touchmove",q,false);if(E.animatingTo===E.currentSlide&&!f&&!(m===null)){var K=(v)?-m:m,L=(K>0)?E.getTarget("next"):E.getTarget("prev");if(E.canAdvance(L)&&(Number(new Date())-H<550&&Math.abs(K)>50||Math.abs(K)>d/2)){E.flexAnimate(L,E.vars.pauseOnAction)}else{if(!z){E.flexAnimate(E.currentSlide,E.vars.pauseOnAction,true)}}}B.removeEventListener("touchend",o,false);e=null;h=null;m=null;j=null}}else{B.style.msTouchAction="none";B._gesture=new MSGesture();B._gesture.target=B;B.addEventListener("MSPointerDown",c,false);B._slider=E;B.addEventListener("MSGestureChange",g,false);B.addEventListener("MSGestureEnd",l,false);function c(G){G.stopPropagation();if(E.animating){G.preventDefault()}else{E.pause();B._gesture.addPointer(G.pointerId);k=0;d=(y)?E.h:E.w;H=Number(new Date());j=(s&&v&&E.animatingTo===E.last)?0:(s&&v)?E.limit-(((E.itemW+E.vars.itemMargin)*E.move)*E.animatingTo):(s&&E.currentSlide===E.last)?E.limit:(s)?((E.itemW+E.vars.itemMargin)*E.move)*E.currentSlide:(v)?(E.last-E.currentSlide+E.cloneOffset)*d:(E.currentSlide+E.cloneOffset)*d}}function g(G){G.stopPropagation();var L=G.target._slider;if(!L){return}var M=-G.translationX,N=-G.translationY;k=k+((y)?N:M);m=k;f=(y)?(Math.abs(k)<Math.abs(-M)):(Math.abs(k)<Math.abs(-N));if(G.detail===G.MSGESTURE_FLAG_INERTIA){setImmediate(function(){B._gesture.stop()});return}if(!f||Number(new Date())-H>500){G.preventDefault();if(!z&&L.transitions){if(!L.vars.animationLoop){m=k/((L.currentSlide===0&&k<0||L.currentSlide===L.last&&k>0)?(Math.abs(k)/d+2):1)}L.setProps(j+m,"setTouch")}}}function l(G){G.stopPropagation();var N=G.target._slider;if(!N){return}if(N.animatingTo===N.currentSlide&&!f&&!(m===null)){var L=(v)?-m:m,M=(L>0)?N.getTarget("next"):N.getTarget("prev");if(N.canAdvance(M)&&(Number(new Date())-H<550&&Math.abs(L)>50||Math.abs(L)>d/2)){N.flexAnimate(M,N.vars.pauseOnAction)}else{if(!z){N.flexAnimate(N.currentSlide,N.vars.pauseOnAction,true)}}}e=null;h=null;m=null;j=null;k=0}}},resize:function(){if(!E.animating&&E.is(":visible")){if(!s){E.doMath()}if(z){A.smoothHeight()}else{if(s){E.slides.width(E.computedW);E.update(E.pagingCount);E.setProps()}else{if(y){E.viewport.height(E.h);E.setProps(E.h,"setTotal")}else{if(E.vars.smoothHeight){A.smoothHeight()}E.newSlides.width(E.computedW);E.setProps(E.computedW,"setTotal")}}}}},smoothHeight:function(d){if(!y||z){var c=(z)?E:E.viewport;(d)?c.animate({height:E.slides.eq(E.animatingTo).height()},d):c.height(E.slides.eq(E.animatingTo).height())}},sync:function(e){var c=b(E.vars.sync).data("flexslider"),d=E.animatingTo;switch(e){case"animate":c.flexAnimate(d,E.vars.pauseOnAction,false,true);break;case"play":if(!c.playing&&!c.asNav){c.play()}break;case"pause":c.pause();break}},uniqueID:function(c){c.find("[id]").each(function(){var d=b(this);d.attr("id",d.attr("id")+"_clone")});return c},pauseInvisible:{visProp:null,init:function(){var c=["webkit","moz","ms","o"];if("hidden" in document){return"hidden"}for(var d=0;d<c.length;d++){if((c[d]+"Hidden") in document){A.pauseInvisible.visProp=c[d]+"Hidden"}}if(A.pauseInvisible.visProp){var e=A.pauseInvisible.visProp.replace(/[H|h]idden/,"")+"visibilitychange";document.addEventListener(e,function(){if(A.pauseInvisible.isHidden()){if(E.startTimeout){clearTimeout(E.startTimeout)}else{E.pause()}}else{if(E.started){E.play()}else{(E.vars.initDelay>0)?setTimeout(E.play,E.vars.initDelay):E.play()}}})}},isHidden:function(){return document[A.pauseInvisible.visProp]||false}},setToClearWatchedEvent:function(){clearTimeout(r);r=setTimeout(function(){F=""},3000)}};E.flexAnimate=function(e,d,k,i,h){if(!E.vars.animationLoop&&e!==E.currentSlide){E.direction=(e>E.currentSlide)?"next":"prev"}if(u&&E.pagingCount===1){E.direction=(E.currentItem<e)?"next":"prev"}if(!E.animating&&(E.canAdvance(e,h)||k)&&E.is(":visible")){if(u&&i){var l=b(E.vars.asNavFor).data("flexslider");E.atEnd=e===0||e===E.count-1;l.flexAnimate(e,true,false,true,h);E.direction=(E.currentItem<e)?"next":"prev";l.direction=E.direction;if(Math.ceil((e+1)/E.visible)-1!==E.currentSlide&&e!==0){E.currentItem=e;E.slides.removeClass(x+"active-slide").eq(e).addClass(x+"active-slide");e=Math.floor(e/E.visible)}else{E.currentItem=e;E.slides.removeClass(x+"active-slide").eq(e).addClass(x+"active-slide");return false}}E.animating=true;E.animatingTo=e;if(d){E.pause()}E.vars.before(E);if(E.syncExists&&!h){A.sync("animate")}if(E.vars.controlNav){A.controlNav.active()}if(!s){E.slides.removeClass(x+"active-slide").eq(e).addClass(x+"active-slide")}E.atEnd=e===0||e===E.last;if(E.vars.directionNav){A.directionNav.update()}if(e===E.last){E.vars.end(E);if(!E.vars.animationLoop){E.pause()}}if(!z){var f=(y)?E.slides.filter(":first").height():E.computedW,g,j,c;if(s){g=E.vars.itemMargin;c=((E.itemW+g)*E.move)*E.animatingTo;j=(c>E.limit&&E.visible!==1)?E.limit:c}else{if(E.currentSlide===0&&e===E.count-1&&E.vars.animationLoop&&E.direction!=="next"){j=(v)?(E.count+E.cloneOffset)*f:0}else{if(E.currentSlide===E.last&&e===0&&E.vars.animationLoop&&E.direction!=="prev"){j=(v)?0:(E.count+1)*f}else{j=(v)?((E.count-1)-e+E.cloneOffset)*f:(e+E.cloneOffset)*f}}}E.setProps(j,"",E.vars.animationSpeed);if(E.transitions){if(!E.vars.animationLoop||!E.atEnd){E.animating=false;E.currentSlide=E.animatingTo}E.container.unbind("webkitTransitionEnd transitionend");E.container.bind("webkitTransitionEnd transitionend",function(){clearTimeout(E.ensureAnimationEnd);E.wrapup(f)});clearTimeout(E.ensureAnimationEnd);E.ensureAnimationEnd=setTimeout(function(){E.wrapup(f)},E.vars.animationSpeed+100)}else{E.container.animate(E.args,E.vars.animationSpeed,E.vars.easing,function(){E.wrapup(f)})}}else{if(!w){E.slides.eq(E.currentSlide).css({zIndex:1}).animate({opacity:0},E.vars.animationSpeed,E.vars.easing);E.slides.eq(e).css({zIndex:2}).animate({opacity:1},E.vars.animationSpeed,E.vars.easing,E.wrapup)}else{E.slides.eq(E.currentSlide).css({opacity:0,zIndex:1});E.slides.eq(e).css({opacity:1,zIndex:2});E.wrapup(f)}}if(E.vars.smoothHeight){A.smoothHeight(E.vars.animationSpeed)}}};E.wrapup=function(c){if(!z&&!s){if(E.currentSlide===0&&E.animatingTo===E.last&&E.vars.animationLoop){E.setProps(c,"jumpEnd")}else{if(E.currentSlide===E.last&&E.animatingTo===0&&E.vars.animationLoop){E.setProps(c,"jumpStart")}}}E.animating=false;E.currentSlide=E.animatingTo;E.vars.after(E)};E.animateSlides=function(){if(!E.animating&&t){E.flexAnimate(E.getTarget("next"))}};E.pause=function(){clearInterval(E.animatedSlides);E.animatedSlides=null;E.playing=false;if(E.vars.pausePlay){A.pausePlay.update("play")}if(E.syncExists){A.sync("pause")}};E.play=function(){if(E.playing){clearInterval(E.animatedSlides)}E.animatedSlides=E.animatedSlides||setInterval(E.animateSlides,E.vars.slideshowSpeed);E.started=E.playing=true;if(E.vars.pausePlay){A.pausePlay.update("pause")}if(E.syncExists){A.sync("play")}};E.stop=function(){E.pause();E.stopped=true};E.canAdvance=function(c,e){var d=(u)?E.pagingCount-1:E.last;return(e)?true:(u&&E.currentItem===E.count-1&&c===0&&E.direction==="prev")?true:(u&&E.currentItem===0&&c===E.pagingCount-1&&E.direction!=="next")?false:(c===E.currentSlide&&!u)?false:(E.vars.animationLoop)?true:(E.atEnd&&E.currentSlide===0&&c===d&&E.direction!=="next")?false:(E.atEnd&&E.currentSlide===d&&c===0&&E.direction==="next")?false:true};E.getTarget=function(c){E.direction=c;if(c==="next"){return(E.currentSlide===E.last)?0:E.currentSlide+1}else{return(E.currentSlide===0)?E.last:E.currentSlide-1}};E.setProps=function(c,f,e){var d=(function(){var h=(c)?c:((E.itemW+E.vars.itemMargin)*E.move)*E.animatingTo,g=(function(){if(s){return(f==="setTouch")?c:(v&&E.animatingTo===E.last)?0:(v)?E.limit-(((E.itemW+E.vars.itemMargin)*E.move)*E.animatingTo):(E.animatingTo===E.last)?E.limit:h}else{switch(f){case"setTotal":return(v)?((E.count-1)-E.currentSlide+E.cloneOffset)*c:(E.currentSlide+E.cloneOffset)*c;case"setTouch":return(v)?c:c;case"jumpEnd":return(v)?c:E.count*c;case"jumpStart":return(v)?E.count*c:c;default:return c}}}());return(g*-1)+"px"}());if(E.transitions){d=(y)?"translate3d(0,"+d+",0)":"translate3d("+d+",0,0)";e=(e!==undefined)?(e/1000)+"s":"0s";E.container.css("-"+E.pfx+"-transition-duration",e);E.container.css("transition-duration",e)}E.args[E.prop]=d;if(E.transitions||e===undefined){E.container.css(E.args)}E.container.css("transform",d)};E.setup=function(d){if(!z){var c,e;if(d==="init"){E.viewport=b('<div class="'+x+'viewport"></div>').css({overflow:"hidden",position:"relative"}).appendTo(E).append(E.container);E.cloneCount=0;E.cloneOffset=0;if(v){e=b.makeArray(E.slides).reverse();E.slides=b(e);E.container.empty().append(E.slides)}}if(E.vars.animationLoop&&!s){E.cloneCount=2;E.cloneOffset=1;if(d!=="init"){E.container.find(".clone").remove()}A.uniqueID(E.slides.first().clone().addClass("clone").attr("aria-hidden","true")).appendTo(E.container);A.uniqueID(E.slides.last().clone().addClass("clone").attr("aria-hidden","true")).prependTo(E.container)}E.newSlides=b(E.vars.selector,E);c=(v)?E.count-1-E.currentSlide+E.cloneOffset:E.currentSlide+E.cloneOffset;if(y&&!s){E.container.height((E.count+E.cloneCount)*200+"%").css("position","absolute").width("100%");setTimeout(function(){E.newSlides.css({display:"block"});E.doMath();E.viewport.height(E.h);E.setProps(c*E.h,"init")},(d==="init")?100:0)}else{E.container.width((E.count+E.cloneCount)*200+"%");E.setProps(c*E.computedW,"init");setTimeout(function(){E.doMath();E.newSlides.css({width:E.computedW,"float":"left",display:"block"});if(E.vars.smoothHeight){A.smoothHeight()}},(d==="init")?100:0)}}else{E.slides.css({width:"100%","float":"left",marginRight:"-100%",position:"relative"});if(d==="init"){if(!w){E.slides.css({opacity:0,display:"block",zIndex:1}).eq(E.currentSlide).css({zIndex:2}).animate({opacity:1},E.vars.animationSpeed,E.vars.easing)}else{E.slides.css({opacity:0,display:"block",webkitTransition:"opacity "+E.vars.animationSpeed/1000+"s ease",zIndex:1}).eq(E.currentSlide).css({opacity:1,zIndex:2})}}if(E.vars.smoothHeight){A.smoothHeight()}}if(!s){E.slides.removeClass(x+"active-slide").eq(E.currentSlide).addClass(x+"active-slide")}E.vars.init(E)};E.doMath=function(){var f=E.slides.first(),c=E.vars.itemMargin,e=E.vars.minItems,d=E.vars.maxItems;E.w=(E.viewport===undefined)?E.width():E.viewport.width();E.h=f.height();E.boxPadding=f.outerWidth()-f.width();if(s){E.itemT=E.vars.itemWidth+c;E.minW=(e)?e*E.itemT:E.w;E.maxW=(d)?(d*E.itemT)-c:E.w;E.itemW=(E.minW>E.w)?(E.w-(c*(e-1)))/e:(E.maxW<E.w)?(E.w-(c*(d-1)))/d:(E.vars.itemWidth>E.w)?E.w:E.vars.itemWidth;E.visible=Math.floor(E.w/(E.itemW));E.move=(E.vars.move>0&&E.vars.move<E.visible)?E.vars.move:E.visible;E.pagingCount=Math.ceil(((E.count-E.visible)/E.move)+1);E.last=E.pagingCount-1;E.limit=(E.pagingCount===1)?0:(E.vars.itemWidth>E.w)?(E.itemW*(E.count-1))+(c*(E.count-1)):((E.itemW+c)*E.count)-E.w-c}else{E.itemW=E.w;E.pagingCount=E.count;E.last=E.count-1}E.computedW=E.itemW-E.boxPadding};E.update=function(c,d){E.doMath();if(!s){if(c<E.currentSlide){E.currentSlide+=1}else{if(c<=E.currentSlide&&c!==0){E.currentSlide-=1}}E.animatingTo=E.currentSlide}if(E.vars.controlNav&&!E.manualControls){if((d==="add"&&!s)||E.pagingCount>E.controlNav.length){A.controlNav.update("add")}else{if((d==="remove"&&!s)||E.pagingCount<E.controlNav.length){if(s&&E.currentSlide>E.last){E.currentSlide-=1;E.animatingTo-=1}A.controlNav.update("remove",E.last)}}}if(E.vars.directionNav){A.directionNav.update()}};E.addSlide=function(e,c){var d=b(e);E.count+=1;E.last=E.count-1;if(y&&v){(c!==undefined)?E.slides.eq(E.count-c).after(d):E.container.prepend(d)}else{(c!==undefined)?E.slides.eq(c).before(d):E.container.append(d)}E.update(c,"add");E.slides=b(E.vars.selector+":not(.clone)",E);E.setup();E.vars.added(E)};E.removeSlide=function(d){var c=(isNaN(d))?E.slides.index(b(d)):d;E.count-=1;E.last=E.count-1;if(isNaN(d)){b(d,E.slides).remove()}else{(y&&v)?E.slides.eq(E.last).remove():E.slides.eq(d).remove()}E.doMath();E.update(c,"remove");E.slides=b(E.vars.selector+":not(.clone)",E);E.setup();E.vars.removed(E)};A.init()};b(window).blur(function(a){focused=false}).focus(function(a){focused=true});b.flexslider.defaults={namespace:"flex-",selector:".slides > li",animation:"fade",easing:"swing",direction:"horizontal",reverse:false,animationLoop:true,smoothHeight:false,startAt:0,slideshow:true,slideshowSpeed:7000,animationSpeed:600,initDelay:0,randomize:false,thumbCaptions:false,pauseOnAction:true,pauseOnHover:false,pauseInvisible:true,useCSS:true,touch:true,video:false,controlNav:true,directionNav:true,prevText:"Previous",nextText:"Next",keyboard:true,multipleKeyboard:false,mousewheel:false,pausePlay:false,pauseText:"Pause",playText:"Play",controlsContainer:"",manualControls:"",sync:"",asNavFor:"",itemWidth:0,itemMargin:0,minItems:1,maxItems:0,move:0,allowOneSlide:true,start:function(){},before:function(){},after:function(){},end:function(){},added:function(){},removed:function(){},init:function(){}};b.fn.flexslider=function(a){if(a===undefined){a={}}if(typeof a==="object"){return this.each(function(){var c=b(this),h=(a.selector)?a.selector:".slides > li",g=c.find(h);if((g.length===1&&a.allowOneSlide===true)||g.length===0){g.fadeIn(400);if(a.start){a.start(c)}}else{if(c.data("flexslider")===undefined){new b.flexslider(this,a)}}})}else{var d=b(this).data("flexslider");switch(a){case"play":d.play();break;case"pause":d.pause();break;case"stop":d.stop();break;case"next":d.flexAnimate(d.getTarget("next"),true);break;case"prev":case"previous":d.flexAnimate(d.getTarget("prev"),true);break;default:if(typeof a==="number"){d.flexAnimate(a,true)}}}}})(jQuery);
/*!
 * Created by mario on 15/05/14.
 */
;$(window).load(function(){$(".flexslider-principal").flexslider({animation:"slide",slideshowSpeed:5000,startAt:0,slideshow:true});$(".flexslider-destaque").flexslider({animation:"slide",controlNav:"thumbnails",randomize:false,slideshow:false});$("#flexslider-detalhe-thumb").flexslider({animation:"slide",controlNav:false,animationLoop:false,slideshow:false,itemWidth:120,itemMargin:5,asNavFor:"#flexslider-detalhe"});$("#flexslider-detalhe").flexslider({animation:"slide",controlNav:false,animationLoop:false,slideshow:false,sync:"#flexslider-detalhe-thumb"})});
/*!
 * Bootstrap v3.1.1 (http://getbootstrap.com)
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */
;if(typeof jQuery==="undefined"){throw new Error("Bootstrap's JavaScript requires jQuery")}+function(b){function a(){var d=document.createElement("bootstrap");var c={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"};for(var e in c){if(d.style[e]!==undefined){return{end:c[e]}}}return false}b.fn.emulateTransitionEnd=function(c){var f=false,e=this;b(this).one(b.support.transition.end,function(){f=true});var d=function(){if(!f){b(e).trigger(b.support.transition.end)}};setTimeout(d,c);return this};b(function(){b.support.transition=a()})}(jQuery);+function(b){var a='[data-dismiss="alert"]';var d=function(e){b(e).on("click",a,this.close)};d.prototype.close=function(f){var e=b(this);var h=e.attr("data-target");if(!h){h=e.attr("href");h=h&&h.replace(/.*(?=#[^\s]*$)/,"")}var i=b(h);if(f){f.preventDefault()}if(!i.length){i=e.hasClass("alert")?e:e.parent()}i.trigger(f=b.Event("close.bs.alert"));if(f.isDefaultPrevented()){return}i.removeClass("in");function g(){i.trigger("closed.bs.alert").remove()}b.support.transition&&i.hasClass("fade")?i.one(b.support.transition.end,g).emulateTransitionEnd(150):g()};var c=b.fn.alert;b.fn.alert=function(e){return this.each(function(){var f=b(this);var g=f.data("bs.alert");if(!g){f.data("bs.alert",(g=new d(this)))}if(typeof e=="string"){g[e].call(f)}})};b.fn.alert.Constructor=d;b.fn.alert.noConflict=function(){b.fn.alert=c;return this};b(document).on("click.bs.alert.data-api",a,d.prototype.close)}(jQuery);+function(a){var c=function(e,d){this.$element=a(e);this.options=a.extend({},c.DEFAULTS,d);this.isLoading=false};c.DEFAULTS={loadingText:"loading..."};c.prototype.setState=function(h){var e="disabled";var f=this.$element;var d=f.is("input")?"val":"html";var g=f.data();h=h+"Text";if(!g.resetText){f.data("resetText",f[d]())}f[d](g[h]||this.options[h]);setTimeout(a.proxy(function(){if(h=="loadingText"){this.isLoading=true;f.addClass(e).attr(e,e)}else{if(this.isLoading){this.isLoading=false;f.removeClass(e).removeAttr(e)}}},this),0)};c.prototype.toggle=function(){var d=true;var f=this.$element.closest('[data-toggle="buttons"]');if(f.length){var e=this.$element.find("input");if(e.prop("type")=="radio"){if(e.prop("checked")&&this.$element.hasClass("active")){d=false}else{f.find(".active").removeClass("active")}}if(d){e.prop("checked",!this.$element.hasClass("active")).trigger("change")}}if(d){this.$element.toggleClass("active")}};var b=a.fn.button;a.fn.button=function(d){return this.each(function(){var e=a(this);var g=e.data("bs.button");var f=typeof d=="object"&&d;if(!g){e.data("bs.button",(g=new c(this,f)))}if(d=="toggle"){g.toggle()}else{if(d){g.setState(d)}}})};a.fn.button.Constructor=c;a.fn.button.noConflict=function(){a.fn.button=b;return this};a(document).on("click.bs.button.data-api","[data-toggle^=button]",function(e){var d=a(e.target);if(!d.hasClass("btn")){d=d.closest(".btn")}d.button("toggle");e.preventDefault()})}(jQuery);+function(c){var a=function(e,d){this.$element=c(e);this.$indicators=this.$element.find(".carousel-indicators");this.options=d;this.paused=this.sliding=this.interval=this.$active=this.$items=null;this.options.pause=="hover"&&this.$element.on("mouseenter",c.proxy(this.pause,this)).on("mouseleave",c.proxy(this.cycle,this))};a.DEFAULTS={interval:5000,pause:"hover",wrap:true};a.prototype.cycle=function(d){d||(this.paused=false);this.interval&&clearInterval(this.interval);this.options.interval&&!this.paused&&(this.interval=setInterval(c.proxy(this.next,this),this.options.interval));return this};a.prototype.getActiveIndex=function(){this.$active=this.$element.find(".item.active");this.$items=this.$active.parent().children();return this.$items.index(this.$active)};a.prototype.to=function(e){var d=this;var f=this.getActiveIndex();if(e>(this.$items.length-1)||e<0){return}if(this.sliding){return this.$element.one("slid.bs.carousel",function(){d.to(e)})}if(f==e){return this.pause().cycle()}return this.slide(e>f?"next":"prev",c(this.$items[e]))};a.prototype.pause=function(d){d||(this.paused=true);if(this.$element.find(".next, .prev").length&&c.support.transition){this.$element.trigger(c.support.transition.end);this.cycle(true)}this.interval=clearInterval(this.interval);return this};a.prototype.next=function(){if(this.sliding){return}return this.slide("next")};a.prototype.prev=function(){if(this.sliding){return}return this.slide("prev")};a.prototype.slide=function(i,d){var k=this.$element.find(".item.active");var l=d||k[i]();var h=this.interval;var j=i=="next"?"left":"right";var e=i=="next"?"first":"last";var f=this;if(!l.length){if(!this.options.wrap){return}l=this.$element.find(".item")[e]()}if(l.hasClass("active")){return this.sliding=false}var g=c.Event("slide.bs.carousel",{relatedTarget:l[0],direction:j});this.$element.trigger(g);if(g.isDefaultPrevented()){return}this.sliding=true;h&&this.pause();if(this.$indicators.length){this.$indicators.find(".active").removeClass("active");this.$element.one("slid.bs.carousel",function(){var m=c(f.$indicators.children()[f.getActiveIndex()]);m&&m.addClass("active")})}if(c.support.transition&&this.$element.hasClass("slide")){l.addClass(i);l[0].offsetWidth;k.addClass(j);l.addClass(j);k.one(c.support.transition.end,function(){l.removeClass([i,j].join(" ")).addClass("active");k.removeClass(["active",j].join(" "));f.sliding=false;setTimeout(function(){f.$element.trigger("slid.bs.carousel")},0)}).emulateTransitionEnd(k.css("transition-duration").slice(0,-1)*1000)}else{k.removeClass("active");l.addClass("active");this.sliding=false;this.$element.trigger("slid.bs.carousel")}h&&this.cycle();return this};var b=c.fn.carousel;c.fn.carousel=function(d){return this.each(function(){var e=c(this);var h=e.data("bs.carousel");var f=c.extend({},a.DEFAULTS,e.data(),typeof d=="object"&&d);var g=typeof d=="string"?d:f.slide;if(!h){e.data("bs.carousel",(h=new a(this,f)))}if(typeof d=="number"){h.to(d)}else{if(g){h[g]()}else{if(f.interval){h.pause().cycle()}}}})};c.fn.carousel.Constructor=a;c.fn.carousel.noConflict=function(){c.fn.carousel=b;return this};c(document).on("click.bs.carousel.data-api","[data-slide], [data-slide-to]",function(g){var e=c(this),f;var d=c(e.attr("data-target")||(f=e.attr("href"))&&f.replace(/.*(?=#[^\s]+$)/,""));var h=c.extend({},d.data(),e.data());var i=e.attr("data-slide-to");if(i){h.interval=false}d.carousel(h);if(i=e.attr("data-slide-to")){d.data("bs.carousel").to(i)}g.preventDefault()});c(window).on("load",function(){c('[data-ride="carousel"]').each(function(){var d=c(this);d.carousel(d.data())})})}(jQuery);+function(c){var a=function(e,d){this.$element=c(e);this.options=c.extend({},a.DEFAULTS,d);this.transitioning=null;if(this.options.parent){this.$parent=c(this.options.parent)}if(this.options.toggle){this.toggle()}};a.DEFAULTS={toggle:true};a.prototype.dimension=function(){var d=this.$element.hasClass("width");return d?"width":"height"};a.prototype.show=function(){if(this.transitioning||this.$element.hasClass("in")){return}var g=c.Event("show.bs.collapse");this.$element.trigger(g);if(g.isDefaultPrevented()){return}var d=this.$parent&&this.$parent.find("> .panel > .in");if(d&&d.length){var h=d.data("bs.collapse");if(h&&h.transitioning){return}d.collapse("hide");h||d.data("bs.collapse",null)}var f=this.dimension();this.$element.removeClass("collapse").addClass("collapsing")[f](0);this.transitioning=1;var e=function(){this.$element.removeClass("collapsing").addClass("collapse in")[f]("auto");this.transitioning=0;this.$element.trigger("shown.bs.collapse")};if(!c.support.transition){return e.call(this)}var i=c.camelCase(["scroll",f].join("-"));this.$element.one(c.support.transition.end,c.proxy(e,this)).emulateTransitionEnd(350)[f](this.$element[0][i])};a.prototype.hide=function(){if(this.transitioning||!this.$element.hasClass("in")){return}var d=c.Event("hide.bs.collapse");this.$element.trigger(d);if(d.isDefaultPrevented()){return}var e=this.dimension();this.$element[e](this.$element[e]())[0].offsetHeight;this.$element.addClass("collapsing").removeClass("collapse").removeClass("in");this.transitioning=1;var f=function(){this.transitioning=0;this.$element.trigger("hidden.bs.collapse").removeClass("collapsing").addClass("collapse")};if(!c.support.transition){return f.call(this)}this.$element[e](0).one(c.support.transition.end,c.proxy(f,this)).emulateTransitionEnd(350)};a.prototype.toggle=function(){this[this.$element.hasClass("in")?"hide":"show"]()};var b=c.fn.collapse;c.fn.collapse=function(d){return this.each(function(){var e=c(this);var g=e.data("bs.collapse");var f=c.extend({},a.DEFAULTS,e.data(),typeof d=="object"&&d);if(!g&&f.toggle&&d=="show"){d=!d}if(!g){e.data("bs.collapse",(g=new a(this,f)))}if(typeof d=="string"){g[d]()}})};c.fn.collapse.Constructor=a;c.fn.collapse.noConflict=function(){c.fn.collapse=b;return this};c(document).on("click.bs.collapse.data-api","[data-toggle=collapse]",function(h){var j=c(this),l;var i=j.attr("data-target")||h.preventDefault()||(l=j.attr("href"))&&l.replace(/.*(?=#[^\s]+$)/,"");var d=c(i);var f=d.data("bs.collapse");var g=f?"toggle":j.data();var k=j.attr("data-parent");var e=k&&c(k);if(!f||!f.transitioning){if(e){e.find('[data-toggle=collapse][data-parent="'+k+'"]').not(j).addClass("collapsed")}j[d.hasClass("in")?"addClass":"removeClass"]("collapsed")}d.collapse(g)})}(jQuery);+function(d){var b=".dropdown-backdrop";var f="[data-toggle=dropdown]";var e=function(h){d(h).on("click.bs.dropdown",this.toggle)};e.prototype.toggle=function(i){var h=d(this);if(h.is(".disabled, :disabled")){return}var l=c(h);var k=l.hasClass("open");a();if(!k){if("ontouchstart" in document.documentElement&&!l.closest(".navbar-nav").length){d('<div class="dropdown-backdrop"/>').insertAfter(d(this)).on("click",a)}var j={relatedTarget:this};l.trigger(i=d.Event("show.bs.dropdown",j));if(i.isDefaultPrevented()){return}l.toggleClass("open").trigger("shown.bs.dropdown",j);h.focus()}return false};e.prototype.keydown=function(h){if(!/(38|40|27)/.test(h.keyCode)){return}var n=d(this);h.preventDefault();h.stopPropagation();if(n.is(".disabled, :disabled")){return}var m=c(n);var l=m.hasClass("open");if(!l||(l&&h.keyCode==27)){if(h.which==27){m.find(f).focus()}return n.click()}var i=" li:not(.divider):visible a";var j=m.find("[role=menu]"+i+", [role=listbox]"+i);if(!j.length){return}var k=j.index(j.filter(":focus"));if(h.keyCode==38&&k>0){k--}if(h.keyCode==40&&k<j.length-1){k++}if(!~k){k=0}j.eq(k).focus()};function a(h){d(b).remove();d(f).each(function(){var i=c(d(this));var j={relatedTarget:this};if(!i.hasClass("open")){return}i.trigger(h=d.Event("hide.bs.dropdown",j));if(h.isDefaultPrevented()){return}i.removeClass("open").trigger("hidden.bs.dropdown",j)})}function c(i){var j=i.attr("data-target");if(!j){j=i.attr("href");j=j&&/#[A-Za-z]/.test(j)&&j.replace(/.*(?=#[^\s]*$)/,"")}var h=j&&d(j);return h&&h.length?h:i.parent()}var g=d.fn.dropdown;d.fn.dropdown=function(h){return this.each(function(){var i=d(this);var j=i.data("bs.dropdown");if(!j){i.data("bs.dropdown",(j=new e(this)))}if(typeof h=="string"){j[h].call(i)}})};d.fn.dropdown.Constructor=e;d.fn.dropdown.noConflict=function(){d.fn.dropdown=g;return this};d(document).on("click.bs.dropdown.data-api",a).on("click.bs.dropdown.data-api",".dropdown form",function(h){h.stopPropagation()}).on("click.bs.dropdown.data-api",f,e.prototype.toggle).on("keydown.bs.dropdown.data-api",f+", [role=menu], [role=listbox]",e.prototype.keydown)}(jQuery);+function(a){var c=function(e,d){this.options=d;this.$element=a(e);this.$backdrop=this.isShown=null;if(this.options.remote){this.$element.find(".modal-content").load(this.options.remote,a.proxy(function(){this.$element.trigger("loaded.bs.modal")},this))}};c.DEFAULTS={backdrop:true,keyboard:true,show:true};c.prototype.toggle=function(d){return this[!this.isShown?"show":"hide"](d)};c.prototype.show=function(e){var f=this;var d=a.Event("show.bs.modal",{relatedTarget:e});this.$element.trigger(d);if(this.isShown||d.isDefaultPrevented()){return}this.isShown=true;this.escape();this.$element.on("click.dismiss.bs.modal",'[data-dismiss="modal"]',a.proxy(this.hide,this));this.backdrop(function(){var i=a.support.transition&&f.$element.hasClass("fade");if(!f.$element.parent().length){f.$element.appendTo(document.body)}f.$element.show().scrollTop(0);if(i){f.$element[0].offsetWidth}f.$element.addClass("in").attr("aria-hidden",false);f.enforceFocus();var h=a.Event("shown.bs.modal",{relatedTarget:e});i?f.$element.find(".modal-dialog").one(a.support.transition.end,function(){f.$element.focus().trigger(h)}).emulateTransitionEnd(300):f.$element.focus().trigger(h)})};c.prototype.hide=function(d){if(d){d.preventDefault()}d=a.Event("hide.bs.modal");this.$element.trigger(d);if(!this.isShown||d.isDefaultPrevented()){return}this.isShown=false;this.escape();a(document).off("focusin.bs.modal");this.$element.removeClass("in").attr("aria-hidden",true).off("click.dismiss.bs.modal");a.support.transition&&this.$element.hasClass("fade")?this.$element.one(a.support.transition.end,a.proxy(this.hideModal,this)).emulateTransitionEnd(300):this.hideModal()};c.prototype.enforceFocus=function(){a(document).off("focusin.bs.modal").on("focusin.bs.modal",a.proxy(function(d){if(this.$element[0]!==d.target&&!this.$element.has(d.target).length){this.$element.focus()}},this))};c.prototype.escape=function(){if(this.isShown&&this.options.keyboard){this.$element.on("keyup.dismiss.bs.modal",a.proxy(function(d){d.which==27&&this.hide()},this))}else{if(!this.isShown){this.$element.off("keyup.dismiss.bs.modal")}}};c.prototype.hideModal=function(){var d=this;this.$element.hide();this.backdrop(function(){d.removeBackdrop();d.$element.trigger("hidden.bs.modal")})};c.prototype.removeBackdrop=function(){this.$backdrop&&this.$backdrop.remove();this.$backdrop=null};c.prototype.backdrop=function(e){var d=this.$element.hasClass("fade")?"fade":"";if(this.isShown&&this.options.backdrop){var f=a.support.transition&&d;this.$backdrop=a('<div class="modal-backdrop '+d+'" />').appendTo(document.body);this.$element.on("click.dismiss.bs.modal",a.proxy(function(g){if(g.target!==g.currentTarget){return}this.options.backdrop=="static"?this.$element[0].focus.call(this.$element[0]):this.hide.call(this)},this));if(f){this.$backdrop[0].offsetWidth}this.$backdrop.addClass("in");if(!e){return}f?this.$backdrop.one(a.support.transition.end,e).emulateTransitionEnd(150):e()}else{if(!this.isShown&&this.$backdrop){this.$backdrop.removeClass("in");a.support.transition&&this.$element.hasClass("fade")?this.$backdrop.one(a.support.transition.end,e).emulateTransitionEnd(150):e()}else{if(e){e()}}}};var b=a.fn.modal;a.fn.modal=function(d,e){return this.each(function(){var h=a(this);var g=h.data("bs.modal");var f=a.extend({},c.DEFAULTS,h.data(),typeof d=="object"&&d);if(!g){h.data("bs.modal",(g=new c(this,f)))}if(typeof d=="string"){g[d](e)}else{if(f.show){g.show(e)}}})};a.fn.modal.Constructor=c;a.fn.modal.noConflict=function(){a.fn.modal=b;return this};a(document).on("click.bs.modal.data-api",'[data-toggle="modal"]',function(e){var d=a(this);var g=d.attr("href");var f=a(d.attr("data-target")||(g&&g.replace(/.*(?=#[^\s]+$)/,"")));var h=f.data("bs.modal")?"toggle":a.extend({remote:!/#/.test(g)&&g},f.data(),d.data());if(d.is("a")){e.preventDefault()}f.modal(h,this).one("hide",function(){d.is(":visible")&&d.focus()})});a(document).on("show.bs.modal",".modal",function(){a(document.body).addClass("modal-open")}).on("hidden.bs.modal",".modal",function(){a(document.body).removeClass("modal-open")})}(jQuery);+function(a){var c=function(e,d){this.type=this.options=this.enabled=this.timeout=this.hoverState=this.$element=null;this.init("tooltip",e,d)};c.DEFAULTS={animation:true,placement:"top",selector:false,template:'<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:false,container:false};c.prototype.init=function(e,g,l){this.enabled=true;this.type=e;this.$element=a(g);this.options=this.getOptions(l);var k=this.options.trigger.split(" ");for(var d=k.length;d--;){var j=k[d];if(j=="click"){this.$element.on("click."+this.type,this.options.selector,a.proxy(this.toggle,this))}else{if(j!="manual"){var f=j=="hover"?"mouseenter":"focusin";var h=j=="hover"?"mouseleave":"focusout";this.$element.on(f+"."+this.type,this.options.selector,a.proxy(this.enter,this));this.$element.on(h+"."+this.type,this.options.selector,a.proxy(this.leave,this))}}}this.options.selector?(this._options=a.extend({},this.options,{trigger:"manual",selector:""})):this.fixTitle()};c.prototype.getDefaults=function(){return c.DEFAULTS};c.prototype.getOptions=function(d){d=a.extend({},this.getDefaults(),this.$element.data(),d);if(d.delay&&typeof d.delay=="number"){d.delay={show:d.delay,hide:d.delay}}return d};c.prototype.getDelegateOptions=function(){var d={};var e=this.getDefaults();this._options&&a.each(this._options,function(f,g){if(e[f]!=g){d[f]=g}});return d};c.prototype.enter=function(e){var d=e instanceof this.constructor?e:a(e.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type);clearTimeout(d.timeout);d.hoverState="in";if(!d.options.delay||!d.options.delay.show){return d.show()}d.timeout=setTimeout(function(){if(d.hoverState=="in"){d.show()}},d.options.delay.show)};c.prototype.leave=function(e){var d=e instanceof this.constructor?e:a(e.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type);clearTimeout(d.timeout);d.hoverState="out";if(!d.options.delay||!d.options.delay.hide){return d.hide()}d.timeout=setTimeout(function(){if(d.hoverState=="out"){d.hide()}},d.options.delay.hide)};c.prototype.show=function(){var h=a.Event("show.bs."+this.type);if(this.hasContent()&&this.enabled){this.$element.trigger(h);if(h.isDefaultPrevented()){return}var q=this;var i=this.tip();this.setContent();if(this.options.animation){i.addClass("fade")}var g=typeof this.options.placement=="function"?this.options.placement.call(this,i[0],this.$element[0]):this.options.placement;var p=/\s?auto?\s?/i;var r=p.test(g);if(r){g=g.replace(p,"")||"top"}i.detach().css({top:0,left:0,display:"block"}).addClass(g);this.options.container?i.appendTo(this.options.container):i.insertAfter(this.$element);var k=this.getPosition();var s=i[0].offsetWidth;var m=i[0].offsetHeight;if(r){var f=this.$element.parent();var e=g;var l=document.documentElement.scrollTop||document.body.scrollTop;var o=this.options.container=="body"?window.innerWidth:f.outerWidth();var n=this.options.container=="body"?window.innerHeight:f.outerHeight();var j=this.options.container=="body"?0:f.offset().left;g=g=="bottom"&&k.top+k.height+m-l>n?"top":g=="top"&&k.top-l-m<0?"bottom":g=="right"&&k.right+s>o?"left":g=="left"&&k.left-s<j?"right":g;i.removeClass(e).addClass(g)}var d=this.getCalculatedOffset(g,k,s,m);this.applyPlacement(d,g);this.hoverState=null;var t=function(){q.$element.trigger("shown.bs."+q.type)};a.support.transition&&this.$tip.hasClass("fade")?i.one(a.support.transition.end,t).emulateTransitionEnd(150):t()}};c.prototype.applyPlacement=function(e,f){var n;var g=this.tip();var m=g[0].offsetWidth;var j=g[0].offsetHeight;var l=parseInt(g.css("margin-top"),10);var d=parseInt(g.css("margin-left"),10);if(isNaN(l)){l=0}if(isNaN(d)){d=0}e.top=e.top+l;e.left=e.left+d;a.offset.setOffset(g[0],a.extend({using:function(o){g.css({top:Math.round(o.top),left:Math.round(o.left)})}},e),0);g.addClass("in");var k=g[0].offsetWidth;var h=g[0].offsetHeight;if(f=="top"&&h!=j){n=true;e.top=e.top+j-h}if(/bottom|top/.test(f)){var i=0;if(e.left<0){i=e.left*-2;e.left=0;g.offset(e);k=g[0].offsetWidth;h=g[0].offsetHeight}this.replaceArrow(i-m+k,k,"left")}else{this.replaceArrow(h-j,h,"top")}if(n){g.offset(e)}};c.prototype.replaceArrow=function(e,d,f){this.arrow().css(f,e?(50*(1-e/d)+"%"):"")};c.prototype.setContent=function(){var e=this.tip();var d=this.getTitle();e.find(".tooltip-inner")[this.options.html?"html":"text"](d);e.removeClass("fade in top bottom left right")};c.prototype.hide=function(){var g=this;var e=this.tip();var d=a.Event("hide.bs."+this.type);function f(){if(g.hoverState!="in"){e.detach()}g.$element.trigger("hidden.bs."+g.type)}this.$element.trigger(d);if(d.isDefaultPrevented()){return}e.removeClass("in");a.support.transition&&this.$tip.hasClass("fade")?e.one(a.support.transition.end,f).emulateTransitionEnd(150):f();this.hoverState=null;return this};c.prototype.fixTitle=function(){var d=this.$element;if(d.attr("title")||typeof(d.attr("data-original-title"))!="string"){d.attr("data-original-title",d.attr("title")||"").attr("title","")}};c.prototype.hasContent=function(){return this.getTitle()};c.prototype.getPosition=function(){var d=this.$element[0];return a.extend({},(typeof d.getBoundingClientRect=="function")?d.getBoundingClientRect():{width:d.offsetWidth,height:d.offsetHeight},this.$element.offset())};c.prototype.getCalculatedOffset=function(f,e,g,d){return f=="bottom"?{top:e.top+e.height,left:e.left+e.width/2-g/2}:f=="top"?{top:e.top-d,left:e.left+e.width/2-g/2}:f=="left"?{top:e.top+e.height/2-d/2,left:e.left-g}:{top:e.top+e.height/2-d/2,left:e.left+e.width}};c.prototype.getTitle=function(){var e;var f=this.$element;var d=this.options;e=f.attr("data-original-title")||(typeof d.title=="function"?d.title.call(f[0]):d.title);return e};c.prototype.tip=function(){return this.$tip=this.$tip||a(this.options.template)};c.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".tooltip-arrow")};c.prototype.validate=function(){if(!this.$element[0].parentNode){this.hide();this.$element=null;this.options=null}};c.prototype.enable=function(){this.enabled=true};c.prototype.disable=function(){this.enabled=false};c.prototype.toggleEnabled=function(){this.enabled=!this.enabled};c.prototype.toggle=function(e){var d=e?a(e.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type):this;d.tip().hasClass("in")?d.leave(d):d.enter(d)};c.prototype.destroy=function(){clearTimeout(this.timeout);this.hide().$element.off("."+this.type).removeData("bs."+this.type)};var b=a.fn.tooltip;a.fn.tooltip=function(d){return this.each(function(){var e=a(this);var g=e.data("bs.tooltip");var f=typeof d=="object"&&d;if(!g&&d=="destroy"){return}if(!g){e.data("bs.tooltip",(g=new c(this,f)))}if(typeof d=="string"){g[d]()}})};a.fn.tooltip.Constructor=c;a.fn.tooltip.noConflict=function(){a.fn.tooltip=b;return this}}(jQuery);+function(a){var c=function(e,d){this.init("popover",e,d)};if(!a.fn.tooltip){throw new Error("Popover requires tooltip.js")}c.DEFAULTS=a.extend({},a.fn.tooltip.Constructor.DEFAULTS,{placement:"right",trigger:"click",content:"",template:'<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'});c.prototype=a.extend({},a.fn.tooltip.Constructor.prototype);c.prototype.constructor=c;c.prototype.getDefaults=function(){return c.DEFAULTS};c.prototype.setContent=function(){var e=this.tip();var d=this.getTitle();var f=this.getContent();e.find(".popover-title")[this.options.html?"html":"text"](d);e.find(".popover-content")[this.options.html?(typeof f=="string"?"html":"append"):"text"](f);e.removeClass("fade top bottom left right in");if(!e.find(".popover-title").html()){e.find(".popover-title").hide()}};c.prototype.hasContent=function(){return this.getTitle()||this.getContent()};c.prototype.getContent=function(){var d=this.$element;var e=this.options;return d.attr("data-content")||(typeof e.content=="function"?e.content.call(d[0]):e.content)};c.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".arrow")};c.prototype.tip=function(){if(!this.$tip){this.$tip=a(this.options.template)}return this.$tip};var b=a.fn.popover;a.fn.popover=function(d){return this.each(function(){var e=a(this);var g=e.data("bs.popover");var f=typeof d=="object"&&d;if(!g&&d=="destroy"){return}if(!g){e.data("bs.popover",(g=new c(this,f)))}if(typeof d=="string"){g[d]()}})};a.fn.popover.Constructor=c;a.fn.popover.noConflict=function(){a.fn.popover=b;return this}}(jQuery);+function(a){function c(d,g){var f;var e=a.proxy(this.process,this);this.$element=a(d).is("body")?a(window):a(d);this.$body=a("body");this.$scrollElement=this.$element.on("scroll.bs.scroll-spy.data-api",e);this.options=a.extend({},c.DEFAULTS,g);this.selector=(this.options.target||((f=a(d).attr("href"))&&f.replace(/.*(?=#[^\s]+$)/,""))||"")+" .nav li > a";this.offsets=a([]);this.targets=a([]);this.activeTarget=null;this.refresh();this.process()}c.DEFAULTS={offset:10};c.prototype.refresh=function(){var f=this.$element[0]==window?"offset":"position";this.offsets=a([]);this.targets=a([]);var d=this;var e=this.$body.find(this.selector).map(function(){var h=a(this);var g=h.data("target")||h.attr("href");var i=/^#./.test(g)&&a(g);return(i&&i.length&&i.is(":visible")&&[[i[f]().top+(!a.isWindow(d.$scrollElement.get(0))&&d.$scrollElement.scrollTop()),g]])||null}).sort(function(h,g){return h[0]-g[0]}).each(function(){d.offsets.push(this[0]);d.targets.push(this[1])})};c.prototype.process=function(){var e=this.$scrollElement.scrollTop()+this.options.offset;var g=this.$scrollElement[0].scrollHeight||this.$body[0].scrollHeight;var k=g-this.$scrollElement.height();var h=this.offsets;var j=this.targets;var f=this.activeTarget;var d;if(e>=k){return f!=(d=j.last()[0])&&this.activate(d)}if(f&&e<=h[0]){return f!=(d=j[0])&&this.activate(d)}for(d=h.length;d--;){f!=j[d]&&e>=h[d]&&(!h[d+1]||e<=h[d+1])&&this.activate(j[d])}};c.prototype.activate=function(e){this.activeTarget=e;a(this.selector).parentsUntil(this.options.target,".active").removeClass("active");var f=this.selector+'[data-target="'+e+'"],'+this.selector+'[href="'+e+'"]';var d=a(f).parents("li").addClass("active");if(d.parent(".dropdown-menu").length){d=d.closest("li.dropdown").addClass("active")}d.trigger("activate.bs.scrollspy")};var b=a.fn.scrollspy;a.fn.scrollspy=function(d){return this.each(function(){var e=a(this);var g=e.data("bs.scrollspy");var f=typeof d=="object"&&d;if(!g){e.data("bs.scrollspy",(g=new c(this,f)))}if(typeof d=="string"){g[d]()}})};a.fn.scrollspy.Constructor=c;a.fn.scrollspy.noConflict=function(){a.fn.scrollspy=b;return this};a(window).on("load",function(){a('[data-spy="scroll"]').each(function(){var d=a(this);d.scrollspy(d.data())})})}(jQuery);+function(a){var c=function(d){this.element=a(d)};c.prototype.show=function(){var g=this.element;var h=g.closest("ul:not(.dropdown-menu)");var f=g.data("target");if(!f){f=g.attr("href");f=f&&f.replace(/.*(?=#[^\s]*$)/,"")}if(g.parent("li").hasClass("active")){return}var i=h.find(".active:last a")[0];var e=a.Event("show.bs.tab",{relatedTarget:i});g.trigger(e);if(e.isDefaultPrevented()){return}var d=a(f);this.activate(g.parent("li"),h);this.activate(d,d.parent(),function(){g.trigger({type:"shown.bs.tab",relatedTarget:i})})};c.prototype.activate=function(h,g,f){var e=g.find("> .active");var d=f&&a.support.transition&&e.hasClass("fade");function i(){e.removeClass("active").find("> .dropdown-menu > .active").removeClass("active");h.addClass("active");if(d){h[0].offsetWidth;h.addClass("in")}else{h.removeClass("fade")}if(h.parent(".dropdown-menu")){h.closest("li.dropdown").addClass("active")}f&&f()}d?e.one(a.support.transition.end,i).emulateTransitionEnd(150):i();e.removeClass("in")};var b=a.fn.tab;a.fn.tab=function(d){return this.each(function(){var e=a(this);var f=e.data("bs.tab");if(!f){e.data("bs.tab",(f=new c(this)))}if(typeof d=="string"){f[d]()}})};a.fn.tab.Constructor=c;a.fn.tab.noConflict=function(){a.fn.tab=b;return this};a(document).on("click.bs.tab.data-api",'[data-toggle="tab"], [data-toggle="pill"]',function(d){d.preventDefault();a(this).tab("show")})}(jQuery);+function(a){var c=function(e,d){this.options=a.extend({},c.DEFAULTS,d);this.$window=a(window).on("scroll.bs.affix.data-api",a.proxy(this.checkPosition,this)).on("click.bs.affix.data-api",a.proxy(this.checkPositionWithEventLoop,this));this.$element=a(e);this.affixed=this.unpin=this.pinnedOffset=null;this.checkPosition()};c.RESET="affix affix-top affix-bottom";c.DEFAULTS={offset:0};c.prototype.getPinnedOffset=function(){if(this.pinnedOffset){return this.pinnedOffset}this.$element.removeClass(c.RESET).addClass("affix");var e=this.$window.scrollTop();var d=this.$element.offset();return(this.pinnedOffset=d.top-e)};c.prototype.checkPositionWithEventLoop=function(){setTimeout(a.proxy(this.checkPosition,this),1)};c.prototype.checkPosition=function(){if(!this.$element.is(":visible")){return}var k=a(document).height();var l=this.$window.scrollTop();var h=this.$element.offset();var f=this.options.offset;var d=f.top;var e=f.bottom;if(this.affixed=="top"){h.top+=l}if(typeof f!="object"){e=d=f}if(typeof d=="function"){d=f.top(this.$element)}if(typeof e=="function"){e=f.bottom(this.$element)}var g=this.unpin!=null&&(l+this.unpin<=h.top)?false:e!=null&&(h.top+this.$element.height()>=k-e)?"bottom":d!=null&&(l<=d)?"top":false;if(this.affixed===g){return}if(this.unpin){this.$element.css("top","")}var j="affix"+(g?"-"+g:"");var i=a.Event(j+".bs.affix");this.$element.trigger(i);if(i.isDefaultPrevented()){return}this.affixed=g;this.unpin=g=="bottom"?this.getPinnedOffset():null;this.$element.removeClass(c.RESET).addClass(j).trigger(a.Event(j.replace("affix","affixed")));if(g=="bottom"){this.$element.offset({top:k-e-this.$element.height()})}};var b=a.fn.affix;a.fn.affix=function(d){return this.each(function(){var e=a(this);var g=e.data("bs.affix");var f=typeof d=="object"&&d;if(!g){e.data("bs.affix",(g=new c(this,f)))}if(typeof d=="string"){g[d]()}})};a.fn.affix.Constructor=c;a.fn.affix.noConflict=function(){a.fn.affix=b;return this};a(window).on("load",function(){a('[data-spy="affix"]').each(function(){var e=a(this);var d=e.data();d.offset=d.offset||{};if(d.offsetBottom){d.offset.bottom=d.offsetBottom}if(d.offsetTop){d.offset.top=d.offsetTop}e.affix(d)})})}(jQuery);(function(a){a.flexslider=function(e,i){var q=a(e);q.vars=a.extend({},a.flexslider.defaults,i);var j=q.vars.namespace,d=window.navigator&&window.navigator.msPointerEnabled&&window.MSGesture,k=(("ontouchstart" in window)||d||window.DocumentTouch&&document instanceof DocumentTouch)&&q.vars.touch,c="click touchend MSPointerUp",o="",b,h=q.vars.direction==="vertical",l=q.vars.reverse,p=(q.vars.itemWidth>0),g=q.vars.animation==="fade",m=q.vars.asNavFor!=="",f={},n=true;a.data(e,"flexslider",q);f={init:function(){q.animating=false;q.currentSlide=parseInt((q.vars.startAt?q.vars.startAt:0),10);if(isNaN(q.currentSlide)){q.currentSlide=0}q.animatingTo=q.currentSlide;q.atEnd=(q.currentSlide===0||q.currentSlide===q.last);q.containerSelector=q.vars.selector.substr(0,q.vars.selector.search(" "));q.slides=a(q.vars.selector,q);q.container=a(q.containerSelector,q);q.count=q.slides.length;q.syncExists=a(q.vars.sync).length>0;if(q.vars.animation==="slide"){q.vars.animation="swing"}q.prop=(h)?"top":"marginLeft";q.args={};q.manualPause=false;q.stopped=false;q.started=false;q.startTimeout=null;q.transitions=!q.vars.video&&!g&&q.vars.useCSS&&(function(){var t=document.createElement("div"),s=["perspectiveProperty","WebkitPerspective","MozPerspective","OPerspective","msPerspective"];for(var r in s){if(t.style[s[r]]!==undefined){q.pfx=s[r].replace("Perspective","").toLowerCase();q.prop="-"+q.pfx+"-transform";return true}}return false}());q.ensureAnimationEnd="";if(q.vars.controlsContainer!==""){q.controlsContainer=a(q.vars.controlsContainer).length>0&&a(q.vars.controlsContainer)}if(q.vars.manualControls!==""){q.manualControls=a(q.vars.manualControls).length>0&&a(q.vars.manualControls)}if(q.vars.randomize){q.slides.sort(function(){return(Math.round(Math.random())-0.5)});q.container.empty().append(q.slides)}q.doMath();q.setup("init");if(q.vars.controlNav){f.controlNav.setup()}if(q.vars.directionNav){f.directionNav.setup()}if(q.vars.keyboard&&(a(q.containerSelector).length===1||q.vars.multipleKeyboard)){a(document).bind("keyup",function(s){var r=s.keyCode;if(!q.animating&&(r===39||r===37)){var t=(r===39)?q.getTarget("next"):(r===37)?q.getTarget("prev"):false;q.flexAnimate(t,q.vars.pauseOnAction)}})}if(q.vars.mousewheel){q.bind("mousewheel",function(t,v,s,r){t.preventDefault();var u=(v<0)?q.getTarget("next"):q.getTarget("prev");q.flexAnimate(u,q.vars.pauseOnAction)})}if(q.vars.pausePlay){f.pausePlay.setup()}if(q.vars.slideshow&&q.vars.pauseInvisible){f.pauseInvisible.init()}if(q.vars.slideshow){if(q.vars.pauseOnHover){q.hover(function(){if(!q.manualPlay&&!q.manualPause){q.pause()}},function(){if(!q.manualPause&&!q.manualPlay&&!q.stopped){q.play()}})}if(!q.vars.pauseInvisible||!f.pauseInvisible.isHidden()){(q.vars.initDelay>0)?q.startTimeout=setTimeout(q.play,q.vars.initDelay):q.play()}}if(m){f.asNav.setup()}if(k&&q.vars.touch){f.touch()}if(!g||(g&&q.vars.smoothHeight)){a(window).bind("resize orientationchange focus",f.resize)}q.find("img").attr("draggable","false");setTimeout(function(){q.vars.start(q)},200)},asNav:{setup:function(){q.asNav=true;q.animatingTo=Math.floor(q.currentSlide/q.move);q.currentItem=q.currentSlide;q.slides.removeClass(j+"active-slide").eq(q.currentItem).addClass(j+"active-slide");if(!d){q.slides.on(c,function(t){t.preventDefault();var s=a(this),r=s.index();var u=s.offset().left-a(q).scrollLeft();if(u<=0&&s.hasClass(j+"active-slide")){q.flexAnimate(q.getTarget("prev"),true)}else{if(!a(q.vars.asNavFor).data("flexslider").animating&&!s.hasClass(j+"active-slide")){q.direction=(q.currentItem<r)?"next":"prev";q.flexAnimate(r,q.vars.pauseOnAction,false,true,true)}}})}else{e._slider=q;q.slides.each(function(){var r=this;r._gesture=new MSGesture();r._gesture.target=r;r.addEventListener("MSPointerDown",function(s){s.preventDefault();if(s.currentTarget._gesture){s.currentTarget._gesture.addPointer(s.pointerId)}},false);r.addEventListener("MSGestureTap",function(u){u.preventDefault();var t=a(this),s=t.index();if(!a(q.vars.asNavFor).data("flexslider").animating&&!t.hasClass("active")){q.direction=(q.currentItem<s)?"next":"prev";q.flexAnimate(s,q.vars.pauseOnAction,false,true,true)}})})}}},controlNav:{setup:function(){if(!q.manualControls){f.controlNav.setupPaging()}else{f.controlNav.setupManual()}},setupPaging:function(){var u=(q.vars.controlNav==="thumbnails")?"control-thumbs":"control-paging",s=1,v,r;q.controlNavScaffold=a('<ol class="'+j+"control-nav "+j+u+'"></ol>');if(q.pagingCount>1){for(var t=0;t<q.pagingCount;t++){r=q.slides.eq(t);v=(q.vars.controlNav==="thumbnails")?'<img src="'+r.attr("data-thumb")+'"/>':"<a>"+s+"</a>";if("thumbnails"===q.vars.controlNav&&true===q.vars.thumbCaptions){var w=r.attr("data-thumbcaption");if(""!=w&&undefined!=w){v+='<span class="'+j+'caption">'+w+"</span>"}}q.controlNavScaffold.append("<li>"+v+"</li>");s++}}(q.controlsContainer)?a(q.controlsContainer).append(q.controlNavScaffold):q.append(q.controlNavScaffold);f.controlNav.set();f.controlNav.active();q.controlNavScaffold.delegate("a, img",c,function(z){z.preventDefault();if(o===""||o===z.type){var y=a(this),x=q.controlNav.index(y);if(!y.hasClass(j+"active")){q.direction=(x>q.currentSlide)?"next":"prev";q.flexAnimate(x,q.vars.pauseOnAction)}}if(o===""){o=z.type}f.setToClearWatchedEvent()})},setupManual:function(){q.controlNav=q.manualControls;f.controlNav.active();q.controlNav.bind(c,function(r){r.preventDefault();if(o===""||o===r.type){var t=a(this),s=q.controlNav.index(t);if(!t.hasClass(j+"active")){(s>q.currentSlide)?q.direction="next":q.direction="prev";q.flexAnimate(s,q.vars.pauseOnAction)}}if(o===""){o=r.type}f.setToClearWatchedEvent()})},set:function(){var r=(q.vars.controlNav==="thumbnails")?"img":"a";q.controlNav=a("."+j+"control-nav li "+r,(q.controlsContainer)?q.controlsContainer:q)},active:function(){q.controlNav.removeClass(j+"active").eq(q.animatingTo).addClass(j+"active")},update:function(r,s){if(q.pagingCount>1&&r==="add"){q.controlNavScaffold.append(a("<li><a>"+q.count+"</a></li>"))}else{if(q.pagingCount===1){q.controlNavScaffold.find("li").remove()}else{q.controlNav.eq(s).closest("li").remove()}}f.controlNav.set();(q.pagingCount>1&&q.pagingCount!==q.controlNav.length)?q.update(s,r):f.controlNav.active()}},directionNav:{setup:function(){var r=a('<ul class="'+j+'direction-nav"><li><a class="'+j+'prev" href="#">'+q.vars.prevText+'</a></li><li><a class="'+j+'next" href="#">'+q.vars.nextText+"</a></li></ul>");if(q.controlsContainer){a(q.controlsContainer).append(r);q.directionNav=a("."+j+"direction-nav li a",q.controlsContainer)}else{q.append(r);q.directionNav=a("."+j+"direction-nav li a",q)}f.directionNav.update();q.directionNav.bind(c,function(s){s.preventDefault();var t;if(o===""||o===s.type){t=(a(this).hasClass(j+"next"))?q.getTarget("next"):q.getTarget("prev");q.flexAnimate(t,q.vars.pauseOnAction)}if(o===""){o=s.type}f.setToClearWatchedEvent()})},update:function(){var r=j+"disabled";if(q.pagingCount===1){q.directionNav.addClass(r).attr("tabindex","-1")}else{if(!q.vars.animationLoop){if(q.animatingTo===0){q.directionNav.removeClass(r).filter("."+j+"prev").addClass(r).attr("tabindex","-1")}else{if(q.animatingTo===q.last){q.directionNav.removeClass(r).filter("."+j+"next").addClass(r).attr("tabindex","-1")}else{q.directionNav.removeClass(r).removeAttr("tabindex")}}}else{q.directionNav.removeClass(r).removeAttr("tabindex")}}}},pausePlay:{setup:function(){var r=a('<div class="'+j+'pauseplay"><a></a></div>');if(q.controlsContainer){q.controlsContainer.append(r);q.pausePlay=a("."+j+"pauseplay a",q.controlsContainer)}else{q.append(r);q.pausePlay=a("."+j+"pauseplay a",q)}f.pausePlay.update((q.vars.slideshow)?j+"pause":j+"play");q.pausePlay.bind(c,function(s){s.preventDefault();if(o===""||o===s.type){if(a(this).hasClass(j+"pause")){q.manualPause=true;q.manualPlay=false;q.pause()}else{q.manualPause=false;q.manualPlay=true;q.play()}}if(o===""){o=s.type}f.setToClearWatchedEvent()})},update:function(r){(r==="play")?q.pausePlay.removeClass(j+"pause").addClass(j+"play").html(q.vars.playText):q.pausePlay.removeClass(j+"play").addClass(j+"pause").html(q.vars.pauseText)}},touch:function(){var D,A,y,E,v,G,C=false,u=0,s=0,x=0;if(!d){e.addEventListener("touchstart",z,false);function z(H){if(q.animating){H.preventDefault()}else{if((window.navigator.msPointerEnabled)||H.touches.length===1){q.pause();E=(h)?q.h:q.w;G=Number(new Date());u=H.touches[0].pageX;s=H.touches[0].pageY;y=(p&&l&&q.animatingTo===q.last)?0:(p&&l)?q.limit-(((q.itemW+q.vars.itemMargin)*q.move)*q.animatingTo):(p&&q.currentSlide===q.last)?q.limit:(p)?((q.itemW+q.vars.itemMargin)*q.move)*q.currentSlide:(l)?(q.last-q.currentSlide+q.cloneOffset)*E:(q.currentSlide+q.cloneOffset)*E;D=(h)?s:u;A=(h)?u:s;e.addEventListener("touchmove",r,false);e.addEventListener("touchend",t,false)}}}function r(H){u=H.touches[0].pageX;s=H.touches[0].pageY;v=(h)?D-s:D-u;C=(h)?(Math.abs(v)<Math.abs(u-A)):(Math.abs(v)<Math.abs(s-A));var I=500;if(!C||Number(new Date())-G>I){H.preventDefault();if(!g&&q.transitions){if(!q.vars.animationLoop){v=v/((q.currentSlide===0&&v<0||q.currentSlide===q.last&&v>0)?(Math.abs(v)/E+2):1)}q.setProps(y+v,"setTouch")}}}function t(J){e.removeEventListener("touchmove",r,false);if(q.animatingTo===q.currentSlide&&!C&&!(v===null)){var I=(l)?-v:v,H=(I>0)?q.getTarget("next"):q.getTarget("prev");if(q.canAdvance(H)&&(Number(new Date())-G<550&&Math.abs(I)>50||Math.abs(I)>E/2)){q.flexAnimate(H,q.vars.pauseOnAction)}else{if(!g){q.flexAnimate(q.currentSlide,q.vars.pauseOnAction,true)}}}e.removeEventListener("touchend",t,false);D=null;A=null;v=null;y=null}}else{e.style.msTouchAction="none";e._gesture=new MSGesture();e._gesture.target=e;e.addEventListener("MSPointerDown",F,false);e._slider=q;e.addEventListener("MSGestureChange",B,false);e.addEventListener("MSGestureEnd",w,false);function F(H){H.stopPropagation();if(q.animating){H.preventDefault()}else{q.pause();e._gesture.addPointer(H.pointerId);x=0;E=(h)?q.h:q.w;G=Number(new Date());y=(p&&l&&q.animatingTo===q.last)?0:(p&&l)?q.limit-(((q.itemW+q.vars.itemMargin)*q.move)*q.animatingTo):(p&&q.currentSlide===q.last)?q.limit:(p)?((q.itemW+q.vars.itemMargin)*q.move)*q.currentSlide:(l)?(q.last-q.currentSlide+q.cloneOffset)*E:(q.currentSlide+q.cloneOffset)*E}}function B(I){I.stopPropagation();var H=I.target._slider;if(!H){return}var K=-I.translationX,J=-I.translationY;x=x+((h)?J:K);v=x;C=(h)?(Math.abs(x)<Math.abs(-K)):(Math.abs(x)<Math.abs(-J));if(I.detail===I.MSGESTURE_FLAG_INERTIA){setImmediate(function(){e._gesture.stop()});return}if(!C||Number(new Date())-G>500){I.preventDefault();if(!g&&H.transitions){if(!H.vars.animationLoop){v=x/((H.currentSlide===0&&x<0||H.currentSlide===H.last&&x>0)?(Math.abs(x)/E+2):1)}H.setProps(y+v,"setTouch")}}}function w(I){I.stopPropagation();var J=I.target._slider;if(!J){return}if(J.animatingTo===J.currentSlide&&!C&&!(v===null)){var H=(l)?-v:v,K=(H>0)?J.getTarget("next"):J.getTarget("prev");if(J.canAdvance(K)&&(Number(new Date())-G<550&&Math.abs(H)>50||Math.abs(H)>E/2)){J.flexAnimate(K,J.vars.pauseOnAction)}else{if(!g){J.flexAnimate(J.currentSlide,J.vars.pauseOnAction,true)}}}D=null;A=null;v=null;y=null;x=0}}},resize:function(){if(!q.animating&&q.is(":visible")){if(!p){q.doMath()}if(g){f.smoothHeight()}else{if(p){q.slides.width(q.computedW);q.update(q.pagingCount);q.setProps()}else{if(h){q.viewport.height(q.h);q.setProps(q.h,"setTotal")}else{if(q.vars.smoothHeight){f.smoothHeight()}q.newSlides.width(q.computedW);q.setProps(q.computedW,"setTotal")}}}}},smoothHeight:function(r){if(!h||g){var s=(g)?q:q.viewport;(r)?s.animate({height:q.slides.eq(q.animatingTo).height()},r):s.height(q.slides.eq(q.animatingTo).height())}},sync:function(r){var t=a(q.vars.sync).data("flexslider"),s=q.animatingTo;switch(r){case"animate":t.flexAnimate(s,q.vars.pauseOnAction,false,true);break;case"play":if(!t.playing&&!t.asNav){t.play()}break;case"pause":t.pause();break}},uniqueID:function(r){r.find("[id]").each(function(){var s=a(this);s.attr("id",s.attr("id")+"_clone")});return r},pauseInvisible:{visProp:null,init:function(){var t=["webkit","moz","ms","o"];if("hidden" in document){return"hidden"}for(var s=0;s<t.length;s++){if((t[s]+"Hidden") in document){f.pauseInvisible.visProp=t[s]+"Hidden"}}if(f.pauseInvisible.visProp){var r=f.pauseInvisible.visProp.replace(/[H|h]idden/,"")+"visibilitychange";document.addEventListener(r,function(){if(f.pauseInvisible.isHidden()){if(q.startTimeout){clearTimeout(q.startTimeout)}else{q.pause()}}else{if(q.started){q.play()}else{(q.vars.initDelay>0)?setTimeout(q.play,q.vars.initDelay):q.play()}}})}},isHidden:function(){return document[f.pauseInvisible.visProp]||false}},setToClearWatchedEvent:function(){clearTimeout(b);b=setTimeout(function(){o=""},3000)}};q.flexAnimate=function(y,z,s,u,v){if(!q.vars.animationLoop&&y!==q.currentSlide){q.direction=(y>q.currentSlide)?"next":"prev"}if(m&&q.pagingCount===1){q.direction=(q.currentItem<y)?"next":"prev"}if(!q.animating&&(q.canAdvance(y,v)||s)&&q.is(":visible")){if(m&&u){var r=a(q.vars.asNavFor).data("flexslider");q.atEnd=y===0||y===q.count-1;r.flexAnimate(y,true,false,true,v);q.direction=(q.currentItem<y)?"next":"prev";r.direction=q.direction;if(Math.ceil((y+1)/q.visible)-1!==q.currentSlide&&y!==0){q.currentItem=y;q.slides.removeClass(j+"active-slide").eq(y).addClass(j+"active-slide");y=Math.floor(y/q.visible)}else{q.currentItem=y;q.slides.removeClass(j+"active-slide").eq(y).addClass(j+"active-slide");return false}}q.animating=true;q.animatingTo=y;if(z){q.pause()}q.vars.before(q);if(q.syncExists&&!v){f.sync("animate")}if(q.vars.controlNav){f.controlNav.active()}if(!p){q.slides.removeClass(j+"active-slide").eq(y).addClass(j+"active-slide")}q.atEnd=y===0||y===q.last;if(q.vars.directionNav){f.directionNav.update()}if(y===q.last){q.vars.end(q);if(!q.vars.animationLoop){q.pause()}}if(!g){var x=(h)?q.slides.filter(":first").height():q.computedW,w,t,A;if(p){w=q.vars.itemMargin;A=((q.itemW+w)*q.move)*q.animatingTo;t=(A>q.limit&&q.visible!==1)?q.limit:A}else{if(q.currentSlide===0&&y===q.count-1&&q.vars.animationLoop&&q.direction!=="next"){t=(l)?(q.count+q.cloneOffset)*x:0}else{if(q.currentSlide===q.last&&y===0&&q.vars.animationLoop&&q.direction!=="prev"){t=(l)?0:(q.count+1)*x}else{t=(l)?((q.count-1)-y+q.cloneOffset)*x:(y+q.cloneOffset)*x}}}q.setProps(t,"",q.vars.animationSpeed);if(q.transitions){if(!q.vars.animationLoop||!q.atEnd){q.animating=false;q.currentSlide=q.animatingTo}q.container.unbind("webkitTransitionEnd transitionend");q.container.bind("webkitTransitionEnd transitionend",function(){clearTimeout(q.ensureAnimationEnd);q.wrapup(x)});clearTimeout(q.ensureAnimationEnd);q.ensureAnimationEnd=setTimeout(function(){q.wrapup(x)},q.vars.animationSpeed+100)}else{q.container.animate(q.args,q.vars.animationSpeed,q.vars.easing,function(){q.wrapup(x)})}}else{if(!k){q.slides.eq(q.currentSlide).css({zIndex:1}).animate({opacity:0},q.vars.animationSpeed,q.vars.easing);q.slides.eq(y).css({zIndex:2}).animate({opacity:1},q.vars.animationSpeed,q.vars.easing,q.wrapup)}else{q.slides.eq(q.currentSlide).css({opacity:0,zIndex:1});q.slides.eq(y).css({opacity:1,zIndex:2});q.wrapup(x)}}if(q.vars.smoothHeight){f.smoothHeight(q.vars.animationSpeed)}}};q.wrapup=function(r){if(!g&&!p){if(q.currentSlide===0&&q.animatingTo===q.last&&q.vars.animationLoop){q.setProps(r,"jumpEnd")}else{if(q.currentSlide===q.last&&q.animatingTo===0&&q.vars.animationLoop){q.setProps(r,"jumpStart")}}}q.animating=false;q.currentSlide=q.animatingTo;q.vars.after(q)};q.animateSlides=function(){if(!q.animating&&n){q.flexAnimate(q.getTarget("next"))}};q.pause=function(){clearInterval(q.animatedSlides);q.animatedSlides=null;q.playing=false;if(q.vars.pausePlay){f.pausePlay.update("play")}if(q.syncExists){f.sync("pause")}};q.play=function(){if(q.playing){clearInterval(q.animatedSlides)}q.animatedSlides=q.animatedSlides||setInterval(q.animateSlides,q.vars.slideshowSpeed);q.started=q.playing=true;if(q.vars.pausePlay){f.pausePlay.update("pause")}if(q.syncExists){f.sync("play")}};q.stop=function(){q.pause();q.stopped=true};q.canAdvance=function(t,r){var s=(m)?q.pagingCount-1:q.last;return(r)?true:(m&&q.currentItem===q.count-1&&t===0&&q.direction==="prev")?true:(m&&q.currentItem===0&&t===q.pagingCount-1&&q.direction!=="next")?false:(t===q.currentSlide&&!m)?false:(q.vars.animationLoop)?true:(q.atEnd&&q.currentSlide===0&&t===s&&q.direction!=="next")?false:(q.atEnd&&q.currentSlide===s&&t===0&&q.direction==="next")?false:true};q.getTarget=function(r){q.direction=r;if(r==="next"){return(q.currentSlide===q.last)?0:q.currentSlide+1}else{return(q.currentSlide===0)?q.last:q.currentSlide-1}};q.setProps=function(u,r,s){var t=(function(){var v=(u)?u:((q.itemW+q.vars.itemMargin)*q.move)*q.animatingTo,w=(function(){if(p){return(r==="setTouch")?u:(l&&q.animatingTo===q.last)?0:(l)?q.limit-(((q.itemW+q.vars.itemMargin)*q.move)*q.animatingTo):(q.animatingTo===q.last)?q.limit:v}else{switch(r){case"setTotal":return(l)?((q.count-1)-q.currentSlide+q.cloneOffset)*u:(q.currentSlide+q.cloneOffset)*u;case"setTouch":return(l)?u:u;case"jumpEnd":return(l)?u:q.count*u;case"jumpStart":return(l)?q.count*u:u;default:return u}}}());return(w*-1)+"px"}());if(q.transitions){t=(h)?"translate3d(0,"+t+",0)":"translate3d("+t+",0,0)";s=(s!==undefined)?(s/1000)+"s":"0s";q.container.css("-"+q.pfx+"-transition-duration",s);q.container.css("transition-duration",s)}q.args[q.prop]=t;if(q.transitions||s===undefined){q.container.css(q.args)}q.container.css("transform",t)};q.setup=function(s){if(!g){var t,r;if(s==="init"){q.viewport=a('<div class="'+j+'viewport"></div>').css({overflow:"hidden",position:"relative"}).appendTo(q).append(q.container);q.cloneCount=0;q.cloneOffset=0;if(l){r=a.makeArray(q.slides).reverse();q.slides=a(r);q.container.empty().append(q.slides)}}if(q.vars.animationLoop&&!p){q.cloneCount=2;q.cloneOffset=1;if(s!=="init"){q.container.find(".clone").remove()}f.uniqueID(q.slides.first().clone().addClass("clone").attr("aria-hidden","true")).appendTo(q.container);f.uniqueID(q.slides.last().clone().addClass("clone").attr("aria-hidden","true")).prependTo(q.container)}q.newSlides=a(q.vars.selector,q);t=(l)?q.count-1-q.currentSlide+q.cloneOffset:q.currentSlide+q.cloneOffset;if(h&&!p){q.container.height((q.count+q.cloneCount)*200+"%").css("position","absolute").width("100%");setTimeout(function(){q.newSlides.css({display:"block"});q.doMath();q.viewport.height(q.h);q.setProps(t*q.h,"init")},(s==="init")?100:0)}else{q.container.width((q.count+q.cloneCount)*200+"%");q.setProps(t*q.computedW,"init");setTimeout(function(){q.doMath();q.newSlides.css({width:q.computedW,"float":"left",display:"block"});if(q.vars.smoothHeight){f.smoothHeight()}},(s==="init")?100:0)}}else{q.slides.css({width:"100%","float":"left",marginRight:"-100%",position:"relative"});if(s==="init"){if(!k){q.slides.css({opacity:0,display:"block",zIndex:1}).eq(q.currentSlide).css({zIndex:2}).animate({opacity:1},q.vars.animationSpeed,q.vars.easing)}else{q.slides.css({opacity:0,display:"block",webkitTransition:"opacity "+q.vars.animationSpeed/1000+"s ease",zIndex:1}).eq(q.currentSlide).css({opacity:1,zIndex:2})}}if(q.vars.smoothHeight){f.smoothHeight()}}if(!p){q.slides.removeClass(j+"active-slide").eq(q.currentSlide).addClass(j+"active-slide")}q.vars.init(q)};q.doMath=function(){var r=q.slides.first(),u=q.vars.itemMargin,s=q.vars.minItems,t=q.vars.maxItems;q.w=(q.viewport===undefined)?q.width():q.viewport.width();q.h=r.height();q.boxPadding=r.outerWidth()-r.width();if(p){q.itemT=q.vars.itemWidth+u;q.minW=(s)?s*q.itemT:q.w;q.maxW=(t)?(t*q.itemT)-u:q.w;q.itemW=(q.minW>q.w)?(q.w-(u*(s-1)))/s:(q.maxW<q.w)?(q.w-(u*(t-1)))/t:(q.vars.itemWidth>q.w)?q.w:q.vars.itemWidth;q.visible=Math.floor(q.w/(q.itemW));q.move=(q.vars.move>0&&q.vars.move<q.visible)?q.vars.move:q.visible;q.pagingCount=Math.ceil(((q.count-q.visible)/q.move)+1);q.last=q.pagingCount-1;q.limit=(q.pagingCount===1)?0:(q.vars.itemWidth>q.w)?(q.itemW*(q.count-1))+(u*(q.count-1)):((q.itemW+u)*q.count)-q.w-u}else{q.itemW=q.w;q.pagingCount=q.count;q.last=q.count-1}q.computedW=q.itemW-q.boxPadding};q.update=function(s,r){q.doMath();if(!p){if(s<q.currentSlide){q.currentSlide+=1}else{if(s<=q.currentSlide&&s!==0){q.currentSlide-=1}}q.animatingTo=q.currentSlide}if(q.vars.controlNav&&!q.manualControls){if((r==="add"&&!p)||q.pagingCount>q.controlNav.length){f.controlNav.update("add")}else{if((r==="remove"&&!p)||q.pagingCount<q.controlNav.length){if(p&&q.currentSlide>q.last){q.currentSlide-=1;q.animatingTo-=1}f.controlNav.update("remove",q.last)}}}if(q.vars.directionNav){f.directionNav.update()}};q.addSlide=function(r,t){var s=a(r);q.count+=1;q.last=q.count-1;if(h&&l){(t!==undefined)?q.slides.eq(q.count-t).after(s):q.container.prepend(s)}else{(t!==undefined)?q.slides.eq(t).before(s):q.container.append(s)}q.update(t,"add");q.slides=a(q.vars.selector+":not(.clone)",q);q.setup();q.vars.added(q)};q.removeSlide=function(r){var s=(isNaN(r))?q.slides.index(a(r)):r;q.count-=1;q.last=q.count-1;if(isNaN(r)){a(r,q.slides).remove()}else{(h&&l)?q.slides.eq(q.last).remove():q.slides.eq(r).remove()}q.doMath();q.update(s,"remove");q.slides=a(q.vars.selector+":not(.clone)",q);q.setup();q.vars.removed(q)};f.init()};a(window).blur(function(b){focused=false}).focus(function(b){focused=true});a.flexslider.defaults={namespace:"flex-",selector:".slides > li",animation:"fade",easing:"swing",direction:"horizontal",reverse:false,animationLoop:true,smoothHeight:false,startAt:0,slideshow:true,slideshowSpeed:7000,animationSpeed:600,initDelay:0,randomize:false,thumbCaptions:false,pauseOnAction:true,pauseOnHover:false,pauseInvisible:true,useCSS:true,touch:true,video:false,controlNav:true,directionNav:true,prevText:"Previous",nextText:"Next",keyboard:true,multipleKeyboard:false,mousewheel:false,pausePlay:false,pauseText:"Pause",playText:"Play",controlsContainer:"",manualControls:"",sync:"",asNavFor:"",itemWidth:0,itemMargin:0,minItems:1,maxItems:0,move:0,allowOneSlide:true,start:function(){},before:function(){},after:function(){},end:function(){},added:function(){},removed:function(){},init:function(){}};a.fn.flexslider=function(b){if(b===undefined){b={}}if(typeof b==="object"){return this.each(function(){var f=a(this),d=(b.selector)?b.selector:".slides > li",e=f.find(d);if((e.length===1&&b.allowOneSlide===true)||e.length===0){e.fadeIn(400);if(b.start){b.start(f)}}else{if(f.data("flexslider")===undefined){new a.flexslider(this,b)}}})}else{var c=a(this).data("flexslider");switch(b){case"play":c.play();break;case"pause":c.pause();break;case"stop":c.stop();break;case"next":c.flexAnimate(c.getTarget("next"),true);break;case"prev":case"previous":c.flexAnimate(c.getTarget("prev"),true);break;default:if(typeof b==="number"){c.flexAnimate(b,true)}}}}})(jQuery);
/*!
 * Created by mario on 15/05/14.
 */
;$(window).load(function(){$(".flexslider-principal").flexslider({animation:"slide",slideshowSpeed:5000,startAt:0,slideshow:true});$(".flexslider-destaque").flexslider({animation:"slide",controlNav:"thumbnails",randomize:false,slideshow:false});$("#flexslider-detalhe-thumb").flexslider({animation:"slide",controlNav:false,animationLoop:false,slideshow:false,itemWidth:120,itemMargin:5,asNavFor:"#flexslider-detalhe"});$("#flexslider-detalhe").flexslider({animation:"slide",controlNav:false,animationLoop:false,slideshow:false,sync:"#flexslider-detalhe-thumb"})});
/*!
 * Bootstrap v3.1.1 (http://getbootstrap.com)
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */
;if(typeof jQuery==="undefined"){throw new Error("Bootstrap's JavaScript requires jQuery")}+function(c){function d(){var b=document.createElement("bootstrap");var f={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"};for(var a in f){if(b.style[a]!==undefined){return{end:f[a]}}}return false}c.fn.emulateTransitionEnd=function(h){var a=false,b=this;c(this).one(c.support.transition.end,function(){a=true});var g=function(){if(!a){c(b).trigger(c.support.transition.end)}};setTimeout(g,h);return this};c(function(){c.support.transition=d()})}(jQuery);+function(e){var f='[data-dismiss="alert"]';var g=function(a){e(a).on("click",f,this.close)};g.prototype.close=function(d){var j=e(this);var b=j.attr("data-target");if(!b){b=j.attr("href");b=b&&b.replace(/.*(?=#[^\s]*$)/,"")}var a=e(b);if(d){d.preventDefault()}if(!a.length){a=j.hasClass("alert")?j:j.parent()}a.trigger(d=e.Event("close.bs.alert"));if(d.isDefaultPrevented()){return}a.removeClass("in");function c(){a.trigger("closed.bs.alert").remove()}e.support.transition&&a.hasClass("fade")?a.one(e.support.transition.end,c).emulateTransitionEnd(150):c()};var h=e.fn.alert;e.fn.alert=function(a){return this.each(function(){var c=e(this);var b=c.data("bs.alert");if(!b){c.data("bs.alert",(b=new g(this)))}if(typeof a=="string"){b[a].call(c)}})};e.fn.alert.Constructor=g;e.fn.alert.noConflict=function(){e.fn.alert=h;return this};e(document).on("click.bs.alert.data-api",f,g.prototype.close)}(jQuery);+function(e){var f=function(a,b){this.$element=e(a);this.options=e.extend({},f.DEFAULTS,b);this.isLoading=false};f.DEFAULTS={loadingText:"loading..."};f.prototype.setState=function(a){var i="disabled";var c=this.$element;var j=c.is("input")?"val":"html";var b=c.data();a=a+"Text";if(!b.resetText){c.data("resetText",c[j]())}c[j](b[a]||this.options[a]);setTimeout(e.proxy(function(){if(a=="loadingText"){this.isLoading=true;c.addClass(i).attr(i,i)}else{if(this.isLoading){this.isLoading=false;c.removeClass(i).removeAttr(i)}}},this),0)};f.prototype.toggle=function(){var c=true;var a=this.$element.closest('[data-toggle="buttons"]');if(a.length){var b=this.$element.find("input");if(b.prop("type")=="radio"){if(b.prop("checked")&&this.$element.hasClass("active")){c=false}else{a.find(".active").removeClass("active")}}if(c){b.prop("checked",!this.$element.hasClass("active")).trigger("change")}}if(c){this.$element.toggleClass("active")}};var d=e.fn.button;e.fn.button=function(a){return this.each(function(){var h=e(this);var b=h.data("bs.button");var c=typeof a=="object"&&a;if(!b){h.data("bs.button",(b=new f(this,c)))}if(a=="toggle"){b.toggle()}else{if(a){b.setState(a)}}})};e.fn.button.Constructor=f;e.fn.button.noConflict=function(){e.fn.button=d;return this};e(document).on("click.bs.button.data-api","[data-toggle^=button]",function(a){var b=e(a.target);if(!b.hasClass("btn")){b=b.closest(".btn")}b.button("toggle");a.preventDefault()})}(jQuery);+function(f){var e=function(a,b){this.$element=f(a);this.$indicators=this.$element.find(".carousel-indicators");this.options=b;this.paused=this.sliding=this.interval=this.$active=this.$items=null;this.options.pause=="hover"&&this.$element.on("mouseenter",f.proxy(this.pause,this)).on("mouseleave",f.proxy(this.cycle,this))};e.DEFAULTS={interval:5000,pause:"hover",wrap:true};e.prototype.cycle=function(a){a||(this.paused=false);this.interval&&clearInterval(this.interval);this.options.interval&&!this.paused&&(this.interval=setInterval(f.proxy(this.next,this),this.options.interval));return this};e.prototype.getActiveIndex=function(){this.$active=this.$element.find(".item.active");this.$items=this.$active.parent().children();return this.$items.index(this.$active)};e.prototype.to=function(b){var c=this;var a=this.getActiveIndex();if(b>(this.$items.length-1)||b<0){return}if(this.sliding){return this.$element.one("slid.bs.carousel",function(){c.to(b)})}if(a==b){return this.pause().cycle()}return this.slide(b>a?"next":"prev",f(this.$items[b]))};e.prototype.pause=function(a){a||(this.paused=true);if(this.$element.find(".next, .prev").length&&f.support.transition){this.$element.trigger(f.support.transition.end);this.cycle(true)}this.interval=clearInterval(this.interval);return this};e.prototype.next=function(){if(this.sliding){return}return this.slide("next")};e.prototype.prev=function(){if(this.sliding){return}return this.slide("prev")};e.prototype.slide=function(m,r){var b=this.$element.find(".item.active");var a=r||b[m]();var n=this.interval;var c=m=="next"?"left":"right";var q=m=="next"?"first":"last";var p=this;if(!a.length){if(!this.options.wrap){return}a=this.$element.find(".item")[q]()}if(a.hasClass("active")){return this.sliding=false}var o=f.Event("slide.bs.carousel",{relatedTarget:a[0],direction:c});this.$element.trigger(o);if(o.isDefaultPrevented()){return}this.sliding=true;n&&this.pause();if(this.$indicators.length){this.$indicators.find(".active").removeClass("active");this.$element.one("slid.bs.carousel",function(){var g=f(p.$indicators.children()[p.getActiveIndex()]);g&&g.addClass("active")})}if(f.support.transition&&this.$element.hasClass("slide")){a.addClass(m);a[0].offsetWidth;b.addClass(c);a.addClass(c);b.one(f.support.transition.end,function(){a.removeClass([m,c].join(" ")).addClass("active");b.removeClass(["active",c].join(" "));p.sliding=false;setTimeout(function(){p.$element.trigger("slid.bs.carousel")},0)}).emulateTransitionEnd(b.css("transition-duration").slice(0,-1)*1000)}else{b.removeClass("active");a.addClass("active");this.sliding=false;this.$element.trigger("slid.bs.carousel")}n&&this.cycle();return this};var d=f.fn.carousel;f.fn.carousel=function(a){return this.each(function(){var j=f(this);var b=j.data("bs.carousel");var i=f.extend({},e.DEFAULTS,j.data(),typeof a=="object"&&a);var c=typeof a=="string"?a:i.slide;if(!b){j.data("bs.carousel",(b=new e(this,i)))}if(typeof a=="number"){b.to(a)}else{if(c){b[c]()}else{if(i.interval){b.pause().cycle()}}}})};f.fn.carousel.Constructor=e;f.fn.carousel.noConflict=function(){f.fn.carousel=d;return this};f(document).on("click.bs.carousel.data-api","[data-slide], [data-slide-to]",function(c){var k=f(this),j;var l=f(k.attr("data-target")||(j=k.attr("href"))&&j.replace(/.*(?=#[^\s]+$)/,""));var b=f.extend({},l.data(),k.data());var a=k.attr("data-slide-to");if(a){b.interval=false}l.carousel(b);if(a=k.attr("data-slide-to")){l.data("bs.carousel").to(a)}c.preventDefault()});f(window).on("load",function(){f('[data-ride="carousel"]').each(function(){var a=f(this);a.carousel(a.data())})})}(jQuery);+function(f){var e=function(a,b){this.$element=f(a);this.options=f.extend({},e.DEFAULTS,b);this.transitioning=null;if(this.options.parent){this.$parent=f(this.options.parent)}if(this.options.toggle){this.toggle()}};e.DEFAULTS={toggle:true};e.prototype.dimension=function(){var a=this.$element.hasClass("width");return a?"width":"height"};e.prototype.show=function(){if(this.transitioning||this.$element.hasClass("in")){return}var c=f.Event("show.bs.collapse");this.$element.trigger(c);if(c.isDefaultPrevented()){return}var l=this.$parent&&this.$parent.find("> .panel > .in");if(l&&l.length){var b=l.data("bs.collapse");if(b&&b.transitioning){return}l.collapse("hide");b||l.data("bs.collapse",null)}var j=this.dimension();this.$element.removeClass("collapse").addClass("collapsing")[j](0);this.transitioning=1;var k=function(){this.$element.removeClass("collapsing").addClass("collapse in")[j]("auto");this.transitioning=0;this.$element.trigger("shown.bs.collapse")};if(!f.support.transition){return k.call(this)}var a=f.camelCase(["scroll",j].join("-"));this.$element.one(f.support.transition.end,f.proxy(k,this)).emulateTransitionEnd(350)[j](this.$element[0][a])};e.prototype.hide=function(){if(this.transitioning||!this.$element.hasClass("in")){return}var c=f.Event("hide.bs.collapse");this.$element.trigger(c);if(c.isDefaultPrevented()){return}var b=this.dimension();this.$element[b](this.$element[b]())[0].offsetHeight;this.$element.addClass("collapsing").removeClass("collapse").removeClass("in");this.transitioning=1;var a=function(){this.transitioning=0;this.$element.trigger("hidden.bs.collapse").removeClass("collapsing").addClass("collapse")};if(!f.support.transition){return a.call(this)}this.$element[b](0).one(f.support.transition.end,f.proxy(a,this)).emulateTransitionEnd(350)};e.prototype.toggle=function(){this[this.$element.hasClass("in")?"hide":"show"]()};var d=f.fn.collapse;f.fn.collapse=function(a){return this.each(function(){var h=f(this);var b=h.data("bs.collapse");var c=f.extend({},e.DEFAULTS,h.data(),typeof a=="object"&&a);if(!b&&c.toggle&&a=="show"){a=!a}if(!b){h.data("bs.collapse",(b=new e(this,c)))}if(typeof a=="string"){b[a]()}})};f.fn.collapse.Constructor=e;f.fn.collapse.noConflict=function(){f.fn.collapse=d;return this};f(document).on("click.bs.collapse.data-api","[data-toggle=collapse]",function(n){var c=f(this),a;var m=c.attr("data-target")||n.preventDefault()||(a=c.attr("href"))&&a.replace(/.*(?=#[^\s]+$)/,"");var r=f(m);var p=r.data("bs.collapse");var o=p?"toggle":c.data();var b=c.attr("data-parent");var q=b&&f(b);if(!p||!p.transitioning){if(q){q.find('[data-toggle=collapse][data-parent="'+b+'"]').not(c).addClass("collapsed")}c[r.hasClass("in")?"addClass":"removeClass"]("collapsed")}r.collapse(o)})}(jQuery);+function(m){var h=".dropdown-backdrop";var k="[data-toggle=dropdown]";var l=function(a){m(a).on("click.bs.dropdown",this.toggle)};l.prototype.toggle=function(d){var e=m(this);if(e.is(".disabled, :disabled")){return}var a=n(e);var b=a.hasClass("open");i();if(!b){if("ontouchstart" in document.documentElement&&!a.closest(".navbar-nav").length){m('<div class="dropdown-backdrop"/>').insertAfter(m(this)).on("click",i)}var c={relatedTarget:this};a.trigger(d=m.Event("show.bs.dropdown",c));if(d.isDefaultPrevented()){return}a.toggleClass("open").trigger("shown.bs.dropdown",c);e.focus()}return false};l.prototype.keydown=function(f){if(!/(38|40|27)/.test(f.keyCode)){return}var g=m(this);f.preventDefault();f.stopPropagation();if(g.is(".disabled, :disabled")){return}var a=n(g);var b=a.hasClass("open");if(!b||(b&&f.keyCode==27)){if(f.which==27){a.find(k).focus()}return g.click()}var e=" li:not(.divider):visible a";var d=a.find("[role=menu]"+e+", [role=listbox]"+e);if(!d.length){return}var c=d.index(d.filter(":focus"));if(f.keyCode==38&&c>0){c--}if(f.keyCode==40&&c<d.length-1){c++}if(!~c){c=0}d.eq(c).focus()};function i(a){m(h).remove();m(k).each(function(){var c=n(m(this));var b={relatedTarget:this};if(!c.hasClass("open")){return}c.trigger(a=m.Event("hide.bs.dropdown",b));if(a.isDefaultPrevented()){return}c.removeClass("open").trigger("hidden.bs.dropdown",b)})}function n(b){var a=b.attr("data-target");if(!a){a=b.attr("href");a=a&&/#[A-Za-z]/.test(a)&&a.replace(/.*(?=#[^\s]*$)/,"")}var c=a&&m(a);return c&&c.length?c:b.parent()}var j=m.fn.dropdown;m.fn.dropdown=function(a){return this.each(function(){var c=m(this);var b=c.data("bs.dropdown");if(!b){c.data("bs.dropdown",(b=new l(this)))}if(typeof a=="string"){b[a].call(c)}})};m.fn.dropdown.Constructor=l;m.fn.dropdown.noConflict=function(){m.fn.dropdown=j;return this};m(document).on("click.bs.dropdown.data-api",i).on("click.bs.dropdown.data-api",".dropdown form",function(a){a.stopPropagation()}).on("click.bs.dropdown.data-api",k,l.prototype.toggle).on("keydown.bs.dropdown.data-api",k+", [role=menu], [role=listbox]",l.prototype.keydown)}(jQuery);+function(e){var f=function(a,b){this.options=b;this.$element=e(a);this.$backdrop=this.isShown=null;if(this.options.remote){this.$element.find(".modal-content").load(this.options.remote,e.proxy(function(){this.$element.trigger("loaded.bs.modal")},this))}};f.DEFAULTS={backdrop:true,keyboard:true,show:true};f.prototype.toggle=function(a){return this[!this.isShown?"show":"hide"](a)};f.prototype.show=function(b){var a=this;var c=e.Event("show.bs.modal",{relatedTarget:b});this.$element.trigger(c);if(this.isShown||c.isDefaultPrevented()){return}this.isShown=true;this.escape();this.$element.on("click.dismiss.bs.modal",'[data-dismiss="modal"]',e.proxy(this.hide,this));this.backdrop(function(){var g=e.support.transition&&a.$element.hasClass("fade");if(!a.$element.parent().length){a.$element.appendTo(document.body)}a.$element.show().scrollTop(0);if(g){a.$element[0].offsetWidth}a.$element.addClass("in").attr("aria-hidden",false);a.enforceFocus();var j=e.Event("shown.bs.modal",{relatedTarget:b});g?a.$element.find(".modal-dialog").one(e.support.transition.end,function(){a.$element.focus().trigger(j)}).emulateTransitionEnd(300):a.$element.focus().trigger(j)})};f.prototype.hide=function(a){if(a){a.preventDefault()}a=e.Event("hide.bs.modal");this.$element.trigger(a);if(!this.isShown||a.isDefaultPrevented()){return}this.isShown=false;this.escape();e(document).off("focusin.bs.modal");this.$element.removeClass("in").attr("aria-hidden",true).off("click.dismiss.bs.modal");e.support.transition&&this.$element.hasClass("fade")?this.$element.one(e.support.transition.end,e.proxy(this.hideModal,this)).emulateTransitionEnd(300):this.hideModal()};f.prototype.enforceFocus=function(){e(document).off("focusin.bs.modal").on("focusin.bs.modal",e.proxy(function(a){if(this.$element[0]!==a.target&&!this.$element.has(a.target).length){this.$element.focus()}},this))};f.prototype.escape=function(){if(this.isShown&&this.options.keyboard){this.$element.on("keyup.dismiss.bs.modal",e.proxy(function(a){a.which==27&&this.hide()},this))}else{if(!this.isShown){this.$element.off("keyup.dismiss.bs.modal")}}};f.prototype.hideModal=function(){var a=this;this.$element.hide();this.backdrop(function(){a.removeBackdrop();a.$element.trigger("hidden.bs.modal")})};f.prototype.removeBackdrop=function(){this.$backdrop&&this.$backdrop.remove();this.$backdrop=null};f.prototype.backdrop=function(b){var c=this.$element.hasClass("fade")?"fade":"";if(this.isShown&&this.options.backdrop){var a=e.support.transition&&c;this.$backdrop=e('<div class="modal-backdrop '+c+'" />').appendTo(document.body);this.$element.on("click.dismiss.bs.modal",e.proxy(function(h){if(h.target!==h.currentTarget){return}this.options.backdrop=="static"?this.$element[0].focus.call(this.$element[0]):this.hide.call(this)},this));if(a){this.$backdrop[0].offsetWidth}this.$backdrop.addClass("in");if(!b){return}a?this.$backdrop.one(e.support.transition.end,b).emulateTransitionEnd(150):b()}else{if(!this.isShown&&this.$backdrop){this.$backdrop.removeClass("in");e.support.transition&&this.$element.hasClass("fade")?this.$backdrop.one(e.support.transition.end,b).emulateTransitionEnd(150):b()}else{if(b){b()}}}};var d=e.fn.modal;e.fn.modal=function(b,a){return this.each(function(){var c=e(this);var i=c.data("bs.modal");var j=e.extend({},f.DEFAULTS,c.data(),typeof b=="object"&&b);if(!i){c.data("bs.modal",(i=new f(this,j)))}if(typeof b=="string"){i[b](a)}else{if(j.show){i.show(a)}}})};e.fn.modal.Constructor=f;e.fn.modal.noConflict=function(){e.fn.modal=d;return this};e(document).on("click.bs.modal.data-api",'[data-toggle="modal"]',function(i){var j=e(this);var b=j.attr("href");var c=e(j.attr("data-target")||(b&&b.replace(/.*(?=#[^\s]+$)/,"")));var a=c.data("bs.modal")?"toggle":e.extend({remote:!/#/.test(b)&&b},c.data(),j.data());if(j.is("a")){i.preventDefault()}c.modal(a,this).one("hide",function(){j.is(":visible")&&j.focus()})});e(document).on("show.bs.modal",".modal",function(){e(document.body).addClass("modal-open")}).on("hidden.bs.modal",".modal",function(){e(document.body).removeClass("modal-open")})}(jQuery);+function(e){var f=function(a,b){this.type=this.options=this.enabled=this.timeout=this.hoverState=this.$element=null;this.init("tooltip",a,b)};f.DEFAULTS={animation:true,placement:"top",selector:false,template:'<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:false,container:false};f.prototype.init=function(o,m,a){this.enabled=true;this.type=o;this.$element=e(m);this.options=this.getOptions(a);var b=this.options.trigger.split(" ");for(var p=b.length;p--;){var c=b[p];if(c=="click"){this.$element.on("click."+this.type,this.options.selector,e.proxy(this.toggle,this))}else{if(c!="manual"){var n=c=="hover"?"mouseenter":"focusin";var i=c=="hover"?"mouseleave":"focusout";this.$element.on(n+"."+this.type,this.options.selector,e.proxy(this.enter,this));this.$element.on(i+"."+this.type,this.options.selector,e.proxy(this.leave,this))}}}this.options.selector?(this._options=e.extend({},this.options,{trigger:"manual",selector:""})):this.fixTitle()};f.prototype.getDefaults=function(){return f.DEFAULTS};f.prototype.getOptions=function(a){a=e.extend({},this.getDefaults(),this.$element.data(),a);if(a.delay&&typeof a.delay=="number"){a.delay={show:a.delay,hide:a.delay}}return a};f.prototype.getDelegateOptions=function(){var b={};var a=this.getDefaults();this._options&&e.each(this._options,function(h,c){if(a[h]!=c){b[h]=c}});return b};f.prototype.enter=function(a){var b=a instanceof this.constructor?a:e(a.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type);clearTimeout(b.timeout);b.hoverState="in";if(!b.options.delay||!b.options.delay.show){return b.show()}b.timeout=setTimeout(function(){if(b.hoverState=="in"){b.show()}},b.options.delay.show)};f.prototype.leave=function(a){var b=a instanceof this.constructor?a:e(a.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type);clearTimeout(b.timeout);b.hoverState="out";if(!b.options.delay||!b.options.delay.hide){return b.hide()}b.timeout=setTimeout(function(){if(b.hoverState=="out"){b.hide()}},b.options.delay.hide)};f.prototype.show=function(){var B=e.Event("show.bs."+this.type);if(this.hasContent()&&this.enabled){this.$element.trigger(B);if(B.isDefaultPrevented()){return}var b=this;var A=this.tip();this.setContent();if(this.options.animation){A.addClass("fade")}var C=typeof this.options.placement=="function"?this.options.placement.call(this,A[0],this.$element[0]):this.options.placement;var c=/\s?auto?\s?/i;var a=c.test(C);if(a){C=C.replace(c,"")||"top"}A.detach().css({top:0,left:0,display:"block"}).addClass(C);this.options.container?A.appendTo(this.options.container):A.insertAfter(this.$element);var y=this.getPosition();var H=A[0].offsetWidth;var w=A[0].offsetHeight;if(a){var D=this.$element.parent();var E=C;var x=document.documentElement.scrollTop||document.body.scrollTop;var u=this.options.container=="body"?window.innerWidth:D.outerWidth();var v=this.options.container=="body"?window.innerHeight:D.outerHeight();var z=this.options.container=="body"?0:D.offset().left;C=C=="bottom"&&y.top+y.height+w-x>v?"top":C=="top"&&y.top-x-w<0?"bottom":C=="right"&&y.right+H>u?"left":C=="left"&&y.left-H<z?"right":C;A.removeClass(E).addClass(C)}var F=this.getCalculatedOffset(C,y,H,w);this.applyPlacement(F,C);this.hoverState=null;var G=function(){b.$element.trigger("shown.bs."+b.type)};e.support.transition&&this.$tip.hasClass("fade")?A.one(e.support.transition.end,G).emulateTransitionEnd(150):G()}};f.prototype.applyPlacement=function(u,t){var a;var s=this.tip();var b=s[0].offsetWidth;var p=s[0].offsetHeight;var c=parseInt(s.css("margin-top"),10);var v=parseInt(s.css("margin-left"),10);if(isNaN(c)){c=0}if(isNaN(v)){v=0}u.top=u.top+c;u.left=u.left+v;e.offset.setOffset(s[0],e.extend({using:function(g){s.css({top:Math.round(g.top),left:Math.round(g.left)})}},u),0);s.addClass("in");var o=s[0].offsetWidth;var r=s[0].offsetHeight;if(t=="top"&&r!=p){a=true;u.top=u.top+p-r}if(/bottom|top/.test(t)){var q=0;if(u.left<0){q=u.left*-2;u.left=0;s.offset(u);o=s[0].offsetWidth;r=s[0].offsetHeight}this.replaceArrow(q-b+o,o,"left")}else{this.replaceArrow(r-p,r,"top")}if(a){s.offset(u)}};f.prototype.replaceArrow=function(b,c,a){this.arrow().css(a,b?(50*(1-b/c)+"%"):"")};f.prototype.setContent=function(){var a=this.tip();var b=this.getTitle();a.find(".tooltip-inner")[this.options.html?"html":"text"](b);a.removeClass("fade in top bottom left right")};f.prototype.hide=function(){var a=this;var c=this.tip();var h=e.Event("hide.bs."+this.type);function b(){if(a.hoverState!="in"){c.detach()}a.$element.trigger("hidden.bs."+a.type)}this.$element.trigger(h);if(h.isDefaultPrevented()){return}c.removeClass("in");e.support.transition&&this.$tip.hasClass("fade")?c.one(e.support.transition.end,b).emulateTransitionEnd(150):b();this.hoverState=null;return this};f.prototype.fixTitle=function(){var a=this.$element;if(a.attr("title")||typeof(a.attr("data-original-title"))!="string"){a.attr("data-original-title",a.attr("title")||"").attr("title","")}};f.prototype.hasContent=function(){return this.getTitle()};f.prototype.getPosition=function(){var a=this.$element[0];return e.extend({},(typeof a.getBoundingClientRect=="function")?a.getBoundingClientRect():{width:a.offsetWidth,height:a.offsetHeight},this.$element.offset())};f.prototype.getCalculatedOffset=function(b,c,a,h){return b=="bottom"?{top:c.top+c.height,left:c.left+c.width/2-a/2}:b=="top"?{top:c.top-h,left:c.left+c.width/2-a/2}:b=="left"?{top:c.top+c.height/2-h/2,left:c.left-a}:{top:c.top+c.height/2-h/2,left:c.left+c.width}};f.prototype.getTitle=function(){var b;var a=this.$element;var c=this.options;b=a.attr("data-original-title")||(typeof c.title=="function"?c.title.call(a[0]):c.title);return b};f.prototype.tip=function(){return this.$tip=this.$tip||e(this.options.template)};f.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".tooltip-arrow")};f.prototype.validate=function(){if(!this.$element[0].parentNode){this.hide();this.$element=null;this.options=null}};f.prototype.enable=function(){this.enabled=true};f.prototype.disable=function(){this.enabled=false};f.prototype.toggleEnabled=function(){this.enabled=!this.enabled};f.prototype.toggle=function(a){var b=a?e(a.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type):this;b.tip().hasClass("in")?b.leave(b):b.enter(b)};f.prototype.destroy=function(){clearTimeout(this.timeout);this.hide().$element.off("."+this.type).removeData("bs."+this.type)};var d=e.fn.tooltip;e.fn.tooltip=function(a){return this.each(function(){var h=e(this);var b=h.data("bs.tooltip");var c=typeof a=="object"&&a;if(!b&&a=="destroy"){return}if(!b){h.data("bs.tooltip",(b=new f(this,c)))}if(typeof a=="string"){b[a]()}})};e.fn.tooltip.Constructor=f;e.fn.tooltip.noConflict=function(){e.fn.tooltip=d;return this}}(jQuery);+function(e){var f=function(a,b){this.init("popover",a,b)};if(!e.fn.tooltip){throw new Error("Popover requires tooltip.js")}f.DEFAULTS=e.extend({},e.fn.tooltip.Constructor.DEFAULTS,{placement:"right",trigger:"click",content:"",template:'<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'});f.prototype=e.extend({},e.fn.tooltip.Constructor.prototype);f.prototype.constructor=f;f.prototype.getDefaults=function(){return f.DEFAULTS};f.prototype.setContent=function(){var b=this.tip();var c=this.getTitle();var a=this.getContent();b.find(".popover-title")[this.options.html?"html":"text"](c);b.find(".popover-content")[this.options.html?(typeof a=="string"?"html":"append"):"text"](a);b.removeClass("fade top bottom left right in");if(!b.find(".popover-title").html()){b.find(".popover-title").hide()}};f.prototype.hasContent=function(){return this.getTitle()||this.getContent()};f.prototype.getContent=function(){var b=this.$element;var a=this.options;return b.attr("data-content")||(typeof a.content=="function"?a.content.call(b[0]):a.content)};f.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".arrow")};f.prototype.tip=function(){if(!this.$tip){this.$tip=e(this.options.template)}return this.$tip};var d=e.fn.popover;e.fn.popover=function(a){return this.each(function(){var h=e(this);var b=h.data("bs.popover");var c=typeof a=="object"&&a;if(!b&&a=="destroy"){return}if(!b){h.data("bs.popover",(b=new f(this,c)))}if(typeof a=="string"){b[a]()}})};e.fn.popover.Constructor=f;e.fn.popover.noConflict=function(){e.fn.popover=d;return this}}(jQuery);+function(e){function f(h,a){var b;var c=e.proxy(this.process,this);this.$element=e(h).is("body")?e(window):e(h);this.$body=e("body");this.$scrollElement=this.$element.on("scroll.bs.scroll-spy.data-api",c);this.options=e.extend({},f.DEFAULTS,a);this.selector=(this.options.target||((b=e(h).attr("href"))&&b.replace(/.*(?=#[^\s]+$)/,""))||"")+" .nav li > a";this.offsets=e([]);this.targets=e([]);this.activeTarget=null;this.refresh();this.process()}f.DEFAULTS={offset:10};f.prototype.refresh=function(){var a=this.$element[0]==window?"offset":"position";this.offsets=e([]);this.targets=e([]);var c=this;var b=this.$body.find(this.selector).map(function(){var k=e(this);var l=k.data("target")||k.attr("href");var j=/^#./.test(l)&&e(l);return(j&&j.length&&j.is(":visible")&&[[j[a]().top+(!e.isWindow(c.$scrollElement.get(0))&&c.$scrollElement.scrollTop()),l]])||null}).sort(function(i,j){return i[0]-j[0]}).each(function(){c.offsets.push(this[0]);c.targets.push(this[1])})};f.prototype.process=function(){var m=this.$scrollElement.scrollTop()+this.options.offset;var i=this.$scrollElement[0].scrollHeight||this.$body[0].scrollHeight;var a=i-this.$scrollElement.height();var c=this.offsets;var b=this.targets;var l=this.activeTarget;var n;if(m>=a){return l!=(n=b.last()[0])&&this.activate(n)}if(l&&m<=c[0]){return l!=(n=b[0])&&this.activate(n)}for(n=c.length;n--;){l!=b[n]&&m>=c[n]&&(!c[n+1]||m<=c[n+1])&&this.activate(b[n])}};f.prototype.activate=function(b){this.activeTarget=b;e(this.selector).parentsUntil(this.options.target,".active").removeClass("active");var a=this.selector+'[data-target="'+b+'"],'+this.selector+'[href="'+b+'"]';var c=e(a).parents("li").addClass("active");if(c.parent(".dropdown-menu").length){c=c.closest("li.dropdown").addClass("active")}c.trigger("activate.bs.scrollspy")};var d=e.fn.scrollspy;e.fn.scrollspy=function(a){return this.each(function(){var h=e(this);var b=h.data("bs.scrollspy");var c=typeof a=="object"&&a;if(!b){h.data("bs.scrollspy",(b=new f(this,c)))}if(typeof a=="string"){b[a]()}})};e.fn.scrollspy.Constructor=f;e.fn.scrollspy.noConflict=function(){e.fn.scrollspy=d;return this};e(window).on("load",function(){e('[data-spy="scroll"]').each(function(){var a=e(this);a.scrollspy(a.data())})})}(jQuery);+function(e){var f=function(a){this.element=e(a)};f.prototype.show=function(){var c=this.element;var b=c.closest("ul:not(.dropdown-menu)");var j=c.data("target");if(!j){j=c.attr("href");j=j&&j.replace(/.*(?=#[^\s]*$)/,"")}if(c.parent("li").hasClass("active")){return}var a=b.find(".active:last a")[0];var k=e.Event("show.bs.tab",{relatedTarget:a});c.trigger(k);if(k.isDefaultPrevented()){return}var l=e(j);this.activate(c.parent("li"),b);this.activate(l,l.parent(),function(){c.trigger({type:"shown.bs.tab",relatedTarget:a})})};f.prototype.activate=function(b,c,j){var k=c.find("> .active");var l=j&&e.support.transition&&k.hasClass("fade");function a(){k.removeClass("active").find("> .dropdown-menu > .active").removeClass("active");b.addClass("active");if(l){b[0].offsetWidth;b.addClass("in")}else{b.removeClass("fade")}if(b.parent(".dropdown-menu")){b.closest("li.dropdown").addClass("active")}j&&j()}l?k.one(e.support.transition.end,a).emulateTransitionEnd(150):a();k.removeClass("in")};var d=e.fn.tab;e.fn.tab=function(a){return this.each(function(){var c=e(this);var b=c.data("bs.tab");if(!b){c.data("bs.tab",(b=new f(this)))}if(typeof a=="string"){b[a]()}})};e.fn.tab.Constructor=f;e.fn.tab.noConflict=function(){e.fn.tab=d;return this};e(document).on("click.bs.tab.data-api",'[data-toggle="tab"], [data-toggle="pill"]',function(a){a.preventDefault();e(this).tab("show")})}(jQuery);+function(e){var f=function(a,b){this.options=e.extend({},f.DEFAULTS,b);this.$window=e(window).on("scroll.bs.affix.data-api",e.proxy(this.checkPosition,this)).on("click.bs.affix.data-api",e.proxy(this.checkPositionWithEventLoop,this));this.$element=e(a);this.affixed=this.unpin=this.pinnedOffset=null;this.checkPosition()};f.RESET="affix affix-top affix-bottom";f.DEFAULTS={offset:0};f.prototype.getPinnedOffset=function(){if(this.pinnedOffset){return this.pinnedOffset}this.$element.removeClass(f.RESET).addClass("affix");var a=this.$window.scrollTop();var b=this.$element.offset();return(this.pinnedOffset=b.top-a)};f.prototype.checkPositionWithEventLoop=function(){setTimeout(e.proxy(this.checkPosition,this),1)};f.prototype.checkPosition=function(){if(!this.$element.is(":visible")){return}var b=e(document).height();var a=this.$window.scrollTop();var n=this.$element.offset();var p=this.options.offset;var r=p.top;var q=p.bottom;if(this.affixed=="top"){n.top+=a}if(typeof p!="object"){q=r=p}if(typeof r=="function"){r=p.top(this.$element)}if(typeof q=="function"){q=p.bottom(this.$element)}var o=this.unpin!=null&&(a+this.unpin<=n.top)?false:q!=null&&(n.top+this.$element.height()>=b-q)?"bottom":r!=null&&(a<=r)?"top":false;if(this.affixed===o){return}if(this.unpin){this.$element.css("top","")}var c="affix"+(o?"-"+o:"");var m=e.Event(c+".bs.affix");this.$element.trigger(m);if(m.isDefaultPrevented()){return}this.affixed=o;this.unpin=o=="bottom"?this.getPinnedOffset():null;this.$element.removeClass(f.RESET).addClass(c).trigger(e.Event(c.replace("affix","affixed")));if(o=="bottom"){this.$element.offset({top:b-q-this.$element.height()})}};var d=e.fn.affix;e.fn.affix=function(a){return this.each(function(){var h=e(this);var b=h.data("bs.affix");var c=typeof a=="object"&&a;if(!b){h.data("bs.affix",(b=new f(this,c)))}if(typeof a=="string"){b[a]()}})};e.fn.affix.Constructor=f;e.fn.affix.noConflict=function(){e.fn.affix=d;return this};e(window).on("load",function(){e('[data-spy="affix"]').each(function(){var a=e(this);var b=a.data();b.offset=b.offset||{};if(b.offsetBottom){b.offset.bottom=b.offsetBottom}if(b.offsetTop){b.offset.top=b.offsetTop}a.affix(b)})})}(jQuery);(function(b){b.flexslider=function(C,y){var a=b(C);a.vars=b.extend({},b.flexslider.defaults,y);var x=a.vars.namespace,D=window.navigator&&window.navigator.msPointerEnabled&&window.MSGesture,w=(("ontouchstart" in window)||D||window.DocumentTouch&&document instanceof DocumentTouch)&&a.vars.touch,E="click touchend MSPointerUp",s="",F,z=a.vars.direction==="vertical",v=a.vars.reverse,r=(a.vars.itemWidth>0),A=a.vars.animation==="fade",u=a.vars.asNavFor!=="",B={},t=true;b.data(C,"flexslider",a);B={init:function(){a.animating=false;a.currentSlide=parseInt((a.vars.startAt?a.vars.startAt:0),10);if(isNaN(a.currentSlide)){a.currentSlide=0}a.animatingTo=a.currentSlide;a.atEnd=(a.currentSlide===0||a.currentSlide===a.last);a.containerSelector=a.vars.selector.substr(0,a.vars.selector.search(" "));a.slides=b(a.vars.selector,a);a.container=b(a.containerSelector,a);a.count=a.slides.length;a.syncExists=b(a.vars.sync).length>0;if(a.vars.animation==="slide"){a.vars.animation="swing"}a.prop=(z)?"top":"marginLeft";a.args={};a.manualPause=false;a.stopped=false;a.started=false;a.startTimeout=null;a.transitions=!a.vars.video&&!A&&a.vars.useCSS&&(function(){var c=document.createElement("div"),d=["perspectiveProperty","WebkitPerspective","MozPerspective","OPerspective","msPerspective"];for(var e in d){if(c.style[d[e]]!==undefined){a.pfx=d[e].replace("Perspective","").toLowerCase();a.prop="-"+a.pfx+"-transform";return true}}return false}());a.ensureAnimationEnd="";if(a.vars.controlsContainer!==""){a.controlsContainer=b(a.vars.controlsContainer).length>0&&b(a.vars.controlsContainer)}if(a.vars.manualControls!==""){a.manualControls=b(a.vars.manualControls).length>0&&b(a.vars.manualControls)}if(a.vars.randomize){a.slides.sort(function(){return(Math.round(Math.random())-0.5)});a.container.empty().append(a.slides)}a.doMath();a.setup("init");if(a.vars.controlNav){B.controlNav.setup()}if(a.vars.directionNav){B.directionNav.setup()}if(a.vars.keyboard&&(b(a.containerSelector).length===1||a.vars.multipleKeyboard)){b(document).bind("keyup",function(d){var e=d.keyCode;if(!a.animating&&(e===39||e===37)){var c=(e===39)?a.getTarget("next"):(e===37)?a.getTarget("prev"):false;a.flexAnimate(c,a.vars.pauseOnAction)}})}if(a.vars.mousewheel){a.bind("mousewheel",function(e,c,f,g){e.preventDefault();var d=(c<0)?a.getTarget("next"):a.getTarget("prev");a.flexAnimate(d,a.vars.pauseOnAction)})}if(a.vars.pausePlay){B.pausePlay.setup()}if(a.vars.slideshow&&a.vars.pauseInvisible){B.pauseInvisible.init()}if(a.vars.slideshow){if(a.vars.pauseOnHover){a.hover(function(){if(!a.manualPlay&&!a.manualPause){a.pause()}},function(){if(!a.manualPause&&!a.manualPlay&&!a.stopped){a.play()}})}if(!a.vars.pauseInvisible||!B.pauseInvisible.isHidden()){(a.vars.initDelay>0)?a.startTimeout=setTimeout(a.play,a.vars.initDelay):a.play()}}if(u){B.asNav.setup()}if(w&&a.vars.touch){B.touch()}if(!A||(A&&a.vars.smoothHeight)){b(window).bind("resize orientationchange focus",B.resize)}a.find("img").attr("draggable","false");setTimeout(function(){a.vars.start(a)},200)},asNav:{setup:function(){a.asNav=true;a.animatingTo=Math.floor(a.currentSlide/a.move);a.currentItem=a.currentSlide;a.slides.removeClass(x+"active-slide").eq(a.currentItem).addClass(x+"active-slide");if(!D){a.slides.on(E,function(d){d.preventDefault();var e=b(this),f=e.index();var c=e.offset().left-b(a).scrollLeft();if(c<=0&&e.hasClass(x+"active-slide")){a.flexAnimate(a.getTarget("prev"),true)}else{if(!b(a.vars.asNavFor).data("flexslider").animating&&!e.hasClass(x+"active-slide")){a.direction=(a.currentItem<f)?"next":"prev";a.flexAnimate(f,a.vars.pauseOnAction,false,true,true)}}})}else{C._slider=a;a.slides.each(function(){var c=this;c._gesture=new MSGesture();c._gesture.target=c;c.addEventListener("MSPointerDown",function(d){d.preventDefault();if(d.currentTarget._gesture){d.currentTarget._gesture.addPointer(d.pointerId)}},false);c.addEventListener("MSGestureTap",function(d){d.preventDefault();var e=b(this),f=e.index();if(!b(a.vars.asNavFor).data("flexslider").animating&&!e.hasClass("active")){a.direction=(a.currentItem<f)?"next":"prev";a.flexAnimate(f,a.vars.pauseOnAction,false,true,true)}})})}}},controlNav:{setup:function(){if(!a.manualControls){B.controlNav.setupPaging()}else{B.controlNav.setupManual()}},setupPaging:function(){var e=(a.vars.controlNav==="thumbnails")?"control-thumbs":"control-paging",g=1,d,h;a.controlNavScaffold=b('<ol class="'+x+"control-nav "+x+e+'"></ol>');if(a.pagingCount>1){for(var f=0;f<a.pagingCount;f++){h=a.slides.eq(f);d=(a.vars.controlNav==="thumbnails")?'<img src="'+h.attr("data-thumb")+'"/>':"<a>"+g+"</a>";if("thumbnails"===a.vars.controlNav&&true===a.vars.thumbCaptions){var c=h.attr("data-thumbcaption");if(""!=c&&undefined!=c){d+='<span class="'+x+'caption">'+c+"</span>"}}a.controlNavScaffold.append("<li>"+d+"</li>");g++}}(a.controlsContainer)?b(a.controlsContainer).append(a.controlNavScaffold):a.append(a.controlNavScaffold);B.controlNav.set();B.controlNav.active();a.controlNavScaffold.delegate("a, img",E,function(j){j.preventDefault();if(s===""||s===j.type){var k=b(this),i=a.controlNav.index(k);if(!k.hasClass(x+"active")){a.direction=(i>a.currentSlide)?"next":"prev";a.flexAnimate(i,a.vars.pauseOnAction)}}if(s===""){s=j.type}B.setToClearWatchedEvent()})},setupManual:function(){a.controlNav=a.manualControls;B.controlNav.active();a.controlNav.bind(E,function(e){e.preventDefault();if(s===""||s===e.type){var c=b(this),d=a.controlNav.index(c);if(!c.hasClass(x+"active")){(d>a.currentSlide)?a.direction="next":a.direction="prev";a.flexAnimate(d,a.vars.pauseOnAction)}}if(s===""){s=e.type}B.setToClearWatchedEvent()})},set:function(){var c=(a.vars.controlNav==="thumbnails")?"img":"a";a.controlNav=b("."+x+"control-nav li "+c,(a.controlsContainer)?a.controlsContainer:a)},active:function(){a.controlNav.removeClass(x+"active").eq(a.animatingTo).addClass(x+"active")},update:function(d,c){if(a.pagingCount>1&&d==="add"){a.controlNavScaffold.append(b("<li><a>"+a.count+"</a></li>"))}else{if(a.pagingCount===1){a.controlNavScaffold.find("li").remove()}else{a.controlNav.eq(c).closest("li").remove()}}B.controlNav.set();(a.pagingCount>1&&a.pagingCount!==a.controlNav.length)?a.update(c,d):B.controlNav.active()}},directionNav:{setup:function(){var c=b('<ul class="'+x+'direction-nav"><li><a class="'+x+'prev" href="#">'+a.vars.prevText+'</a></li><li><a class="'+x+'next" href="#">'+a.vars.nextText+"</a></li></ul>");if(a.controlsContainer){b(a.controlsContainer).append(c);a.directionNav=b("."+x+"direction-nav li a",a.controlsContainer)}else{a.append(c);a.directionNav=b("."+x+"direction-nav li a",a)}B.directionNav.update();a.directionNav.bind(E,function(e){e.preventDefault();var d;if(s===""||s===e.type){d=(b(this).hasClass(x+"next"))?a.getTarget("next"):a.getTarget("prev");a.flexAnimate(d,a.vars.pauseOnAction)}if(s===""){s=e.type}B.setToClearWatchedEvent()})},update:function(){var c=x+"disabled";if(a.pagingCount===1){a.directionNav.addClass(c).attr("tabindex","-1")}else{if(!a.vars.animationLoop){if(a.animatingTo===0){a.directionNav.removeClass(c).filter("."+x+"prev").addClass(c).attr("tabindex","-1")}else{if(a.animatingTo===a.last){a.directionNav.removeClass(c).filter("."+x+"next").addClass(c).attr("tabindex","-1")}else{a.directionNav.removeClass(c).removeAttr("tabindex")}}}else{a.directionNav.removeClass(c).removeAttr("tabindex")}}}},pausePlay:{setup:function(){var c=b('<div class="'+x+'pauseplay"><a></a></div>');if(a.controlsContainer){a.controlsContainer.append(c);a.pausePlay=b("."+x+"pauseplay a",a.controlsContainer)}else{a.append(c);a.pausePlay=b("."+x+"pauseplay a",a)}B.pausePlay.update((a.vars.slideshow)?x+"pause":x+"play");a.pausePlay.bind(E,function(d){d.preventDefault();if(s===""||s===d.type){if(b(this).hasClass(x+"pause")){a.manualPause=true;a.manualPlay=false;a.pause()}else{a.manualPause=false;a.manualPlay=true;a.play()}}if(s===""){s=d.type}B.setToClearWatchedEvent()})},update:function(c){(c==="play")?a.pausePlay.removeClass(x+"pause").addClass(x+"play").html(a.vars.playText):a.pausePlay.removeClass(x+"play").addClass(x+"pause").html(a.vars.pauseText)}},touch:function(){var d,g,i,H,l,m,e=false,n=0,q=0,j=0;if(!D){C.addEventListener("touchstart",h,false);function h(G){if(a.animating){G.preventDefault()}else{if((window.navigator.msPointerEnabled)||G.touches.length===1){a.pause();H=(z)?a.h:a.w;m=Number(new Date());n=G.touches[0].pageX;q=G.touches[0].pageY;i=(r&&v&&a.animatingTo===a.last)?0:(r&&v)?a.limit-(((a.itemW+a.vars.itemMargin)*a.move)*a.animatingTo):(r&&a.currentSlide===a.last)?a.limit:(r)?((a.itemW+a.vars.itemMargin)*a.move)*a.currentSlide:(v)?(a.last-a.currentSlide+a.cloneOffset)*H:(a.currentSlide+a.cloneOffset)*H;d=(z)?q:n;g=(z)?n:q;C.addEventListener("touchmove",c,false);C.addEventListener("touchend",p,false)}}}function c(J){n=J.touches[0].pageX;q=J.touches[0].pageY;l=(z)?d-q:d-n;e=(z)?(Math.abs(l)<Math.abs(n-g)):(Math.abs(l)<Math.abs(q-g));var G=500;if(!e||Number(new Date())-m>G){J.preventDefault();if(!A&&a.transitions){if(!a.vars.animationLoop){l=l/((a.currentSlide===0&&l<0||a.currentSlide===a.last&&l>0)?(Math.abs(l)/H+2):1)}a.setProps(i+l,"setTouch")}}}function p(G){C.removeEventListener("touchmove",c,false);if(a.animatingTo===a.currentSlide&&!e&&!(l===null)){var K=(v)?-l:l,L=(K>0)?a.getTarget("next"):a.getTarget("prev");if(a.canAdvance(L)&&(Number(new Date())-m<550&&Math.abs(K)>50||Math.abs(K)>H/2)){a.flexAnimate(L,a.vars.pauseOnAction)}else{if(!A){a.flexAnimate(a.currentSlide,a.vars.pauseOnAction,true)}}}C.removeEventListener("touchend",p,false);d=null;g=null;l=null;i=null}}else{C.style.msTouchAction="none";C._gesture=new MSGesture();C._gesture.target=C;C.addEventListener("MSPointerDown",o,false);C._slider=a;C.addEventListener("MSGestureChange",f,false);C.addEventListener("MSGestureEnd",k,false);function o(G){G.stopPropagation();if(a.animating){G.preventDefault()}else{a.pause();C._gesture.addPointer(G.pointerId);j=0;H=(z)?a.h:a.w;m=Number(new Date());i=(r&&v&&a.animatingTo===a.last)?0:(r&&v)?a.limit-(((a.itemW+a.vars.itemMargin)*a.move)*a.animatingTo):(r&&a.currentSlide===a.last)?a.limit:(r)?((a.itemW+a.vars.itemMargin)*a.move)*a.currentSlide:(v)?(a.last-a.currentSlide+a.cloneOffset)*H:(a.currentSlide+a.cloneOffset)*H}}function f(M){M.stopPropagation();var N=M.target._slider;if(!N){return}var G=-M.translationX,L=-M.translationY;j=j+((z)?L:G);l=j;e=(z)?(Math.abs(j)<Math.abs(-G)):(Math.abs(j)<Math.abs(-L));if(M.detail===M.MSGESTURE_FLAG_INERTIA){setImmediate(function(){C._gesture.stop()});return}if(!e||Number(new Date())-m>500){M.preventDefault();if(!A&&N.transitions){if(!N.vars.animationLoop){l=j/((N.currentSlide===0&&j<0||N.currentSlide===N.last&&j>0)?(Math.abs(j)/H+2):1)}N.setProps(i+l,"setTouch")}}}function k(M){M.stopPropagation();var L=M.target._slider;if(!L){return}if(L.animatingTo===L.currentSlide&&!e&&!(l===null)){var N=(v)?-l:l,G=(N>0)?L.getTarget("next"):L.getTarget("prev");if(L.canAdvance(G)&&(Number(new Date())-m<550&&Math.abs(N)>50||Math.abs(N)>H/2)){L.flexAnimate(G,L.vars.pauseOnAction)}else{if(!A){L.flexAnimate(L.currentSlide,L.vars.pauseOnAction,true)}}}d=null;g=null;l=null;i=null;j=0}}},resize:function(){if(!a.animating&&a.is(":visible")){if(!r){a.doMath()}if(A){B.smoothHeight()}else{if(r){a.slides.width(a.computedW);a.update(a.pagingCount);a.setProps()}else{if(z){a.viewport.height(a.h);a.setProps(a.h,"setTotal")}else{if(a.vars.smoothHeight){B.smoothHeight()}a.newSlides.width(a.computedW);a.setProps(a.computedW,"setTotal")}}}}},smoothHeight:function(d){if(!z||A){var c=(A)?a:a.viewport;(d)?c.animate({height:a.slides.eq(a.animatingTo).height()},d):c.height(a.slides.eq(a.animatingTo).height())}},sync:function(e){var c=b(a.vars.sync).data("flexslider"),d=a.animatingTo;switch(e){case"animate":c.flexAnimate(d,a.vars.pauseOnAction,false,true);break;case"play":if(!c.playing&&!c.asNav){c.play()}break;case"pause":c.pause();break}},uniqueID:function(c){c.find("[id]").each(function(){var d=b(this);d.attr("id",d.attr("id")+"_clone")});return c},pauseInvisible:{visProp:null,init:function(){var c=["webkit","moz","ms","o"];if("hidden" in document){return"hidden"}for(var d=0;d<c.length;d++){if((c[d]+"Hidden") in document){B.pauseInvisible.visProp=c[d]+"Hidden"}}if(B.pauseInvisible.visProp){var e=B.pauseInvisible.visProp.replace(/[H|h]idden/,"")+"visibilitychange";document.addEventListener(e,function(){if(B.pauseInvisible.isHidden()){if(a.startTimeout){clearTimeout(a.startTimeout)}else{a.pause()}}else{if(a.started){a.play()}else{(a.vars.initDelay>0)?setTimeout(a.play,a.vars.initDelay):a.play()}}})}},isHidden:function(){return document[B.pauseInvisible.visProp]||false}},setToClearWatchedEvent:function(){clearTimeout(F);F=setTimeout(function(){s=""},3000)}};a.flexAnimate=function(f,e,l,j,i){if(!a.vars.animationLoop&&f!==a.currentSlide){a.direction=(f>a.currentSlide)?"next":"prev"}if(u&&a.pagingCount===1){a.direction=(a.currentItem<f)?"next":"prev"}if(!a.animating&&(a.canAdvance(f,i)||l)&&a.is(":visible")){if(u&&j){var c=b(a.vars.asNavFor).data("flexslider");a.atEnd=f===0||f===a.count-1;c.flexAnimate(f,true,false,true,i);a.direction=(a.currentItem<f)?"next":"prev";c.direction=a.direction;if(Math.ceil((f+1)/a.visible)-1!==a.currentSlide&&f!==0){a.currentItem=f;a.slides.removeClass(x+"active-slide").eq(f).addClass(x+"active-slide");f=Math.floor(f/a.visible)}else{a.currentItem=f;a.slides.removeClass(x+"active-slide").eq(f).addClass(x+"active-slide");return false}}a.animating=true;a.animatingTo=f;if(e){a.pause()}a.vars.before(a);if(a.syncExists&&!i){B.sync("animate")}if(a.vars.controlNav){B.controlNav.active()}if(!r){a.slides.removeClass(x+"active-slide").eq(f).addClass(x+"active-slide")}a.atEnd=f===0||f===a.last;if(a.vars.directionNav){B.directionNav.update()}if(f===a.last){a.vars.end(a);if(!a.vars.animationLoop){a.pause()}}if(!A){var g=(z)?a.slides.filter(":first").height():a.computedW,h,k,d;if(r){h=a.vars.itemMargin;d=((a.itemW+h)*a.move)*a.animatingTo;k=(d>a.limit&&a.visible!==1)?a.limit:d}else{if(a.currentSlide===0&&f===a.count-1&&a.vars.animationLoop&&a.direction!=="next"){k=(v)?(a.count+a.cloneOffset)*g:0}else{if(a.currentSlide===a.last&&f===0&&a.vars.animationLoop&&a.direction!=="prev"){k=(v)?0:(a.count+1)*g}else{k=(v)?((a.count-1)-f+a.cloneOffset)*g:(f+a.cloneOffset)*g}}}a.setProps(k,"",a.vars.animationSpeed);if(a.transitions){if(!a.vars.animationLoop||!a.atEnd){a.animating=false;a.currentSlide=a.animatingTo}a.container.unbind("webkitTransitionEnd transitionend");a.container.bind("webkitTransitionEnd transitionend",function(){clearTimeout(a.ensureAnimationEnd);a.wrapup(g)});clearTimeout(a.ensureAnimationEnd);a.ensureAnimationEnd=setTimeout(function(){a.wrapup(g)},a.vars.animationSpeed+100)}else{a.container.animate(a.args,a.vars.animationSpeed,a.vars.easing,function(){a.wrapup(g)})}}else{if(!w){a.slides.eq(a.currentSlide).css({zIndex:1}).animate({opacity:0},a.vars.animationSpeed,a.vars.easing);a.slides.eq(f).css({zIndex:2}).animate({opacity:1},a.vars.animationSpeed,a.vars.easing,a.wrapup)}else{a.slides.eq(a.currentSlide).css({opacity:0,zIndex:1});a.slides.eq(f).css({opacity:1,zIndex:2});a.wrapup(g)}}if(a.vars.smoothHeight){B.smoothHeight(a.vars.animationSpeed)}}};a.wrapup=function(c){if(!A&&!r){if(a.currentSlide===0&&a.animatingTo===a.last&&a.vars.animationLoop){a.setProps(c,"jumpEnd")}else{if(a.currentSlide===a.last&&a.animatingTo===0&&a.vars.animationLoop){a.setProps(c,"jumpStart")}}}a.animating=false;a.currentSlide=a.animatingTo;a.vars.after(a)};a.animateSlides=function(){if(!a.animating&&t){a.flexAnimate(a.getTarget("next"))}};a.pause=function(){clearInterval(a.animatedSlides);a.animatedSlides=null;a.playing=false;if(a.vars.pausePlay){B.pausePlay.update("play")}if(a.syncExists){B.sync("pause")}};a.play=function(){if(a.playing){clearInterval(a.animatedSlides)}a.animatedSlides=a.animatedSlides||setInterval(a.animateSlides,a.vars.slideshowSpeed);a.started=a.playing=true;if(a.vars.pausePlay){B.pausePlay.update("pause")}if(a.syncExists){B.sync("play")}};a.stop=function(){a.pause();a.stopped=true};a.canAdvance=function(c,e){var d=(u)?a.pagingCount-1:a.last;return(e)?true:(u&&a.currentItem===a.count-1&&c===0&&a.direction==="prev")?true:(u&&a.currentItem===0&&c===a.pagingCount-1&&a.direction!=="next")?false:(c===a.currentSlide&&!u)?false:(a.vars.animationLoop)?true:(a.atEnd&&a.currentSlide===0&&c===d&&a.direction!=="next")?false:(a.atEnd&&a.currentSlide===d&&c===0&&a.direction==="next")?false:true};a.getTarget=function(c){a.direction=c;if(c==="next"){return(a.currentSlide===a.last)?0:a.currentSlide+1}else{return(a.currentSlide===0)?a.last:a.currentSlide-1}};a.setProps=function(c,f,e){var d=(function(){var h=(c)?c:((a.itemW+a.vars.itemMargin)*a.move)*a.animatingTo,g=(function(){if(r){return(f==="setTouch")?c:(v&&a.animatingTo===a.last)?0:(v)?a.limit-(((a.itemW+a.vars.itemMargin)*a.move)*a.animatingTo):(a.animatingTo===a.last)?a.limit:h}else{switch(f){case"setTotal":return(v)?((a.count-1)-a.currentSlide+a.cloneOffset)*c:(a.currentSlide+a.cloneOffset)*c;case"setTouch":return(v)?c:c;case"jumpEnd":return(v)?c:a.count*c;case"jumpStart":return(v)?a.count*c:c;default:return c}}}());return(g*-1)+"px"}());if(a.transitions){d=(z)?"translate3d(0,"+d+",0)":"translate3d("+d+",0,0)";e=(e!==undefined)?(e/1000)+"s":"0s";a.container.css("-"+a.pfx+"-transition-duration",e);a.container.css("transition-duration",e)}a.args[a.prop]=d;if(a.transitions||e===undefined){a.container.css(a.args)}a.container.css("transform",d)};a.setup=function(d){if(!A){var c,e;if(d==="init"){a.viewport=b('<div class="'+x+'viewport"></div>').css({overflow:"hidden",position:"relative"}).appendTo(a).append(a.container);a.cloneCount=0;a.cloneOffset=0;if(v){e=b.makeArray(a.slides).reverse();a.slides=b(e);a.container.empty().append(a.slides)}}if(a.vars.animationLoop&&!r){a.cloneCount=2;a.cloneOffset=1;if(d!=="init"){a.container.find(".clone").remove()}B.uniqueID(a.slides.first().clone().addClass("clone").attr("aria-hidden","true")).appendTo(a.container);B.uniqueID(a.slides.last().clone().addClass("clone").attr("aria-hidden","true")).prependTo(a.container)}a.newSlides=b(a.vars.selector,a);c=(v)?a.count-1-a.currentSlide+a.cloneOffset:a.currentSlide+a.cloneOffset;if(z&&!r){a.container.height((a.count+a.cloneCount)*200+"%").css("position","absolute").width("100%");setTimeout(function(){a.newSlides.css({display:"block"});a.doMath();a.viewport.height(a.h);a.setProps(c*a.h,"init")},(d==="init")?100:0)}else{a.container.width((a.count+a.cloneCount)*200+"%");a.setProps(c*a.computedW,"init");setTimeout(function(){a.doMath();a.newSlides.css({width:a.computedW,"float":"left",display:"block"});if(a.vars.smoothHeight){B.smoothHeight()}},(d==="init")?100:0)}}else{a.slides.css({width:"100%","float":"left",marginRight:"-100%",position:"relative"});if(d==="init"){if(!w){a.slides.css({opacity:0,display:"block",zIndex:1}).eq(a.currentSlide).css({zIndex:2}).animate({opacity:1},a.vars.animationSpeed,a.vars.easing)}else{a.slides.css({opacity:0,display:"block",webkitTransition:"opacity "+a.vars.animationSpeed/1000+"s ease",zIndex:1}).eq(a.currentSlide).css({opacity:1,zIndex:2})}}if(a.vars.smoothHeight){B.smoothHeight()}}if(!r){a.slides.removeClass(x+"active-slide").eq(a.currentSlide).addClass(x+"active-slide")}a.vars.init(a)};a.doMath=function(){var f=a.slides.first(),c=a.vars.itemMargin,e=a.vars.minItems,d=a.vars.maxItems;a.w=(a.viewport===undefined)?a.width():a.viewport.width();a.h=f.height();a.boxPadding=f.outerWidth()-f.width();if(r){a.itemT=a.vars.itemWidth+c;a.minW=(e)?e*a.itemT:a.w;a.maxW=(d)?(d*a.itemT)-c:a.w;a.itemW=(a.minW>a.w)?(a.w-(c*(e-1)))/e:(a.maxW<a.w)?(a.w-(c*(d-1)))/d:(a.vars.itemWidth>a.w)?a.w:a.vars.itemWidth;a.visible=Math.floor(a.w/(a.itemW));a.move=(a.vars.move>0&&a.vars.move<a.visible)?a.vars.move:a.visible;a.pagingCount=Math.ceil(((a.count-a.visible)/a.move)+1);a.last=a.pagingCount-1;a.limit=(a.pagingCount===1)?0:(a.vars.itemWidth>a.w)?(a.itemW*(a.count-1))+(c*(a.count-1)):((a.itemW+c)*a.count)-a.w-c}else{a.itemW=a.w;a.pagingCount=a.count;a.last=a.count-1}a.computedW=a.itemW-a.boxPadding};a.update=function(c,d){a.doMath();if(!r){if(c<a.currentSlide){a.currentSlide+=1}else{if(c<=a.currentSlide&&c!==0){a.currentSlide-=1}}a.animatingTo=a.currentSlide}if(a.vars.controlNav&&!a.manualControls){if((d==="add"&&!r)||a.pagingCount>a.controlNav.length){B.controlNav.update("add")}else{if((d==="remove"&&!r)||a.pagingCount<a.controlNav.length){if(r&&a.currentSlide>a.last){a.currentSlide-=1;a.animatingTo-=1}B.controlNav.update("remove",a.last)}}}if(a.vars.directionNav){B.directionNav.update()}};a.addSlide=function(e,c){var d=b(e);a.count+=1;a.last=a.count-1;if(z&&v){(c!==undefined)?a.slides.eq(a.count-c).after(d):a.container.prepend(d)}else{(c!==undefined)?a.slides.eq(c).before(d):a.container.append(d)}a.update(c,"add");a.slides=b(a.vars.selector+":not(.clone)",a);a.setup();a.vars.added(a)};a.removeSlide=function(d){var c=(isNaN(d))?a.slides.index(b(d)):d;a.count-=1;a.last=a.count-1;if(isNaN(d)){b(d,a.slides).remove()}else{(z&&v)?a.slides.eq(a.last).remove():a.slides.eq(d).remove()}a.doMath();a.update(c,"remove");a.slides=b(a.vars.selector+":not(.clone)",a);a.setup();a.vars.removed(a)};B.init()};b(window).blur(function(a){focused=false}).focus(function(a){focused=true});b.flexslider.defaults={namespace:"flex-",selector:".slides > li",animation:"fade",easing:"swing",direction:"horizontal",reverse:false,animationLoop:true,smoothHeight:false,startAt:0,slideshow:true,slideshowSpeed:7000,animationSpeed:600,initDelay:0,randomize:false,thumbCaptions:false,pauseOnAction:true,pauseOnHover:false,pauseInvisible:true,useCSS:true,touch:true,video:false,controlNav:true,directionNav:true,prevText:"Previous",nextText:"Next",keyboard:true,multipleKeyboard:false,mousewheel:false,pausePlay:false,pauseText:"Pause",playText:"Play",controlsContainer:"",manualControls:"",sync:"",asNavFor:"",itemWidth:0,itemMargin:0,minItems:1,maxItems:0,move:0,allowOneSlide:true,start:function(){},before:function(){},after:function(){},end:function(){},added:function(){},removed:function(){},init:function(){}};b.fn.flexslider=function(a){if(a===undefined){a={}}if(typeof a==="object"){return this.each(function(){var c=b(this),h=(a.selector)?a.selector:".slides > li",g=c.find(h);if((g.length===1&&a.allowOneSlide===true)||g.length===0){g.fadeIn(400);if(a.start){a.start(c)}}else{if(c.data("flexslider")===undefined){new b.flexslider(this,a)}}})}else{var d=b(this).data("flexslider");switch(a){case"play":d.play();break;case"pause":d.pause();break;case"stop":d.stop();break;case"next":d.flexAnimate(d.getTarget("next"),true);break;case"prev":case"previous":d.flexAnimate(d.getTarget("prev"),true);break;default:if(typeof a==="number"){d.flexAnimate(a,true)}}}}})(jQuery);
/*!
 * Created by mario on 15/05/14.
 */
;$(window).load(function(){$(".flexslider-principal").flexslider({animation:"slide",slideshowSpeed:5000,startAt:0,slideshow:true});$(".flexslider-destaque").flexslider({animation:"slide",controlNav:"thumbnails",randomize:false,slideshow:false});$("#flexslider-detalhe-thumb").flexslider({animation:"slide",controlNav:false,animationLoop:false,slideshow:false,itemWidth:120,itemMargin:5,asNavFor:"#flexslider-detalhe"});$("#flexslider-detalhe").flexslider({animation:"slide",controlNav:false,animationLoop:false,slideshow:false,sync:"#flexslider-detalhe-thumb"})});
/*!
 * Bootstrap v3.1.1 (http://getbootstrap.com)
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */
;if(typeof jQuery==="undefined"){throw new Error("Bootstrap's JavaScript requires jQuery")}+function(b){function a(){var c=document.createElement("bootstrap");var e={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"};for(var d in e){if(c.style[d]!==undefined){return{end:e[d]}}}return false}b.fn.emulateTransitionEnd=function(e){var d=false,c=this;b(this).one(b.support.transition.end,function(){d=true});var f=function(){if(!d){b(c).trigger(b.support.transition.end)}};setTimeout(f,e);return this};b(function(){b.support.transition=a()})}(jQuery);+function(d){var c='[data-dismiss="alert"]';var b=function(e){d(e).on("click",c,this.close)};b.prototype.close=function(h){var g=d(this);var e=g.attr("data-target");if(!e){e=g.attr("href");e=e&&e.replace(/.*(?=#[^\s]*$)/,"")}var f=d(e);if(h){h.preventDefault()}if(!f.length){f=g.hasClass("alert")?g:g.parent()}f.trigger(h=d.Event("close.bs.alert"));if(h.isDefaultPrevented()){return}f.removeClass("in");function i(){f.trigger("closed.bs.alert").remove()}d.support.transition&&f.hasClass("fade")?f.one(d.support.transition.end,i).emulateTransitionEnd(150):i()};var a=d.fn.alert;d.fn.alert=function(e){return this.each(function(){var g=d(this);var f=g.data("bs.alert");if(!f){g.data("bs.alert",(f=new b(this)))}if(typeof e=="string"){f[e].call(g)}})};d.fn.alert.Constructor=b;d.fn.alert.noConflict=function(){d.fn.alert=a;return this};d(document).on("click.bs.alert.data-api",c,b.prototype.close)}(jQuery);+function(b){var a=function(e,d){this.$element=b(e);this.options=b.extend({},a.DEFAULTS,d);this.isLoading=false};a.DEFAULTS={loadingText:"loading..."};a.prototype.setState=function(e){var g="disabled";var h=this.$element;var f=h.is("input")?"val":"html";var d=h.data();e=e+"Text";if(!d.resetText){h.data("resetText",h[f]())}h[f](d[e]||this.options[e]);setTimeout(b.proxy(function(){if(e=="loadingText"){this.isLoading=true;h.addClass(g).attr(g,g)}else{if(this.isLoading){this.isLoading=false;h.removeClass(g).removeAttr(g)}}},this),0)};a.prototype.toggle=function(){var f=true;var e=this.$element.closest('[data-toggle="buttons"]');if(e.length){var d=this.$element.find("input");if(d.prop("type")=="radio"){if(d.prop("checked")&&this.$element.hasClass("active")){f=false}else{e.find(".active").removeClass("active")}}if(f){d.prop("checked",!this.$element.hasClass("active")).trigger("change")}}if(f){this.$element.toggleClass("active")}};var c=b.fn.button;b.fn.button=function(d){return this.each(function(){var f=b(this);var e=f.data("bs.button");var g=typeof d=="object"&&d;if(!e){f.data("bs.button",(e=new a(this,g)))}if(d=="toggle"){e.toggle()}else{if(d){e.setState(d)}}})};b.fn.button.Constructor=a;b.fn.button.noConflict=function(){b.fn.button=c;return this};b(document).on("click.bs.button.data-api","[data-toggle^=button]",function(e){var d=b(e.target);if(!d.hasClass("btn")){d=d.closest(".btn")}d.button("toggle");e.preventDefault()})}(jQuery);+function(a){var b=function(e,d){this.$element=a(e);this.$indicators=this.$element.find(".carousel-indicators");this.options=d;this.paused=this.sliding=this.interval=this.$active=this.$items=null;this.options.pause=="hover"&&this.$element.on("mouseenter",a.proxy(this.pause,this)).on("mouseleave",a.proxy(this.cycle,this))};b.DEFAULTS={interval:5000,pause:"hover",wrap:true};b.prototype.cycle=function(d){d||(this.paused=false);this.interval&&clearInterval(this.interval);this.options.interval&&!this.paused&&(this.interval=setInterval(a.proxy(this.next,this),this.options.interval));return this};b.prototype.getActiveIndex=function(){this.$active=this.$element.find(".item.active");this.$items=this.$active.parent().children();return this.$items.index(this.$active)};b.prototype.to=function(d){var f=this;var e=this.getActiveIndex();if(d>(this.$items.length-1)||d<0){return}if(this.sliding){return this.$element.one("slid.bs.carousel",function(){f.to(d)})}if(e==d){return this.pause().cycle()}return this.slide(d>e?"next":"prev",a(this.$items[d]))};b.prototype.pause=function(d){d||(this.paused=true);if(this.$element.find(".next, .prev").length&&a.support.transition){this.$element.trigger(a.support.transition.end);this.cycle(true)}this.interval=clearInterval(this.interval);return this};b.prototype.next=function(){if(this.sliding){return}return this.slide("next")};b.prototype.prev=function(){if(this.sliding){return}return this.slide("prev")};b.prototype.slide=function(i,d){var k=this.$element.find(".item.active");var l=d||k[i]();var h=this.interval;var j=i=="next"?"left":"right";var e=i=="next"?"first":"last";var f=this;if(!l.length){if(!this.options.wrap){return}l=this.$element.find(".item")[e]()}if(l.hasClass("active")){return this.sliding=false}var g=a.Event("slide.bs.carousel",{relatedTarget:l[0],direction:j});this.$element.trigger(g);if(g.isDefaultPrevented()){return}this.sliding=true;h&&this.pause();if(this.$indicators.length){this.$indicators.find(".active").removeClass("active");this.$element.one("slid.bs.carousel",function(){var m=a(f.$indicators.children()[f.getActiveIndex()]);m&&m.addClass("active")})}if(a.support.transition&&this.$element.hasClass("slide")){l.addClass(i);l[0].offsetWidth;k.addClass(j);l.addClass(j);k.one(a.support.transition.end,function(){l.removeClass([i,j].join(" ")).addClass("active");k.removeClass(["active",j].join(" "));f.sliding=false;setTimeout(function(){f.$element.trigger("slid.bs.carousel")},0)}).emulateTransitionEnd(k.css("transition-duration").slice(0,-1)*1000)}else{k.removeClass("active");l.addClass("active");this.sliding=false;this.$element.trigger("slid.bs.carousel")}h&&this.cycle();return this};var c=a.fn.carousel;a.fn.carousel=function(d){return this.each(function(){var f=a(this);var e=f.data("bs.carousel");var g=a.extend({},b.DEFAULTS,f.data(),typeof d=="object"&&d);var h=typeof d=="string"?d:g.slide;if(!e){f.data("bs.carousel",(e=new b(this,g)))}if(typeof d=="number"){e.to(d)}else{if(h){e[h]()}else{if(g.interval){e.pause().cycle()}}}})};a.fn.carousel.Constructor=b;a.fn.carousel.noConflict=function(){a.fn.carousel=c;return this};a(document).on("click.bs.carousel.data-api","[data-slide], [data-slide-to]",function(i){var g=a(this),h;var f=a(g.attr("data-target")||(h=g.attr("href"))&&h.replace(/.*(?=#[^\s]+$)/,""));var d=a.extend({},f.data(),g.data());var e=g.attr("data-slide-to");if(e){d.interval=false}f.carousel(d);if(e=g.attr("data-slide-to")){f.data("bs.carousel").to(e)}i.preventDefault()});a(window).on("load",function(){a('[data-ride="carousel"]').each(function(){var d=a(this);d.carousel(d.data())})})}(jQuery);+function(a){var b=function(e,d){this.$element=a(e);this.options=a.extend({},b.DEFAULTS,d);this.transitioning=null;if(this.options.parent){this.$parent=a(this.options.parent)}if(this.options.toggle){this.toggle()}};b.DEFAULTS={toggle:true};b.prototype.dimension=function(){var d=this.$element.hasClass("width");return d?"width":"height"};b.prototype.show=function(){if(this.transitioning||this.$element.hasClass("in")){return}var i=a.Event("show.bs.collapse");this.$element.trigger(i);if(i.isDefaultPrevented()){return}var f=this.$parent&&this.$parent.find("> .panel > .in");if(f&&f.length){var d=f.data("bs.collapse");if(d&&d.transitioning){return}f.collapse("hide");d||f.data("bs.collapse",null)}var h=this.dimension();this.$element.removeClass("collapse").addClass("collapsing")[h](0);this.transitioning=1;var g=function(){this.$element.removeClass("collapsing").addClass("collapse in")[h]("auto");this.transitioning=0;this.$element.trigger("shown.bs.collapse")};if(!a.support.transition){return g.call(this)}var e=a.camelCase(["scroll",h].join("-"));this.$element.one(a.support.transition.end,a.proxy(g,this)).emulateTransitionEnd(350)[h](this.$element[0][e])};b.prototype.hide=function(){if(this.transitioning||!this.$element.hasClass("in")){return}var f=a.Event("hide.bs.collapse");this.$element.trigger(f);if(f.isDefaultPrevented()){return}var d=this.dimension();this.$element[d](this.$element[d]())[0].offsetHeight;this.$element.addClass("collapsing").removeClass("collapse").removeClass("in");this.transitioning=1;var e=function(){this.transitioning=0;this.$element.trigger("hidden.bs.collapse").removeClass("collapsing").addClass("collapse")};if(!a.support.transition){return e.call(this)}this.$element[d](0).one(a.support.transition.end,a.proxy(e,this)).emulateTransitionEnd(350)};b.prototype.toggle=function(){this[this.$element.hasClass("in")?"hide":"show"]()};var c=a.fn.collapse;a.fn.collapse=function(d){return this.each(function(){var f=a(this);var e=f.data("bs.collapse");var g=a.extend({},b.DEFAULTS,f.data(),typeof d=="object"&&d);if(!e&&g.toggle&&d=="show"){d=!d}if(!e){f.data("bs.collapse",(e=new b(this,g)))}if(typeof d=="string"){e[d]()}})};a.fn.collapse.Constructor=b;a.fn.collapse.noConflict=function(){a.fn.collapse=c;return this};a(document).on("click.bs.collapse.data-api","[data-toggle=collapse]",function(h){var j=a(this),l;var i=j.attr("data-target")||h.preventDefault()||(l=j.attr("href"))&&l.replace(/.*(?=#[^\s]+$)/,"");var d=a(i);var f=d.data("bs.collapse");var g=f?"toggle":j.data();var k=j.attr("data-parent");var e=k&&a(k);if(!f||!f.transitioning){if(e){e.find('[data-toggle=collapse][data-parent="'+k+'"]').not(j).addClass("collapsed")}j[d.hasClass("in")?"addClass":"removeClass"]("collapsed")}d.collapse(g)})}(jQuery);+function(a){var f=".dropdown-backdrop";var c="[data-toggle=dropdown]";var b=function(h){a(h).on("click.bs.dropdown",this.toggle)};b.prototype.toggle=function(k){var j=a(this);if(j.is(".disabled, :disabled")){return}var i=g(j);var h=i.hasClass("open");e();if(!h){if("ontouchstart" in document.documentElement&&!i.closest(".navbar-nav").length){a('<div class="dropdown-backdrop"/>').insertAfter(a(this)).on("click",e)}var l={relatedTarget:this};i.trigger(k=a.Event("show.bs.dropdown",l));if(k.isDefaultPrevented()){return}i.toggleClass("open").trigger("shown.bs.dropdown",l);j.focus()}return false};b.prototype.keydown=function(k){if(!/(38|40|27)/.test(k.keyCode)){return}var j=a(this);k.preventDefault();k.stopPropagation();if(j.is(".disabled, :disabled")){return}var i=g(j);var h=i.hasClass("open");if(!h||(h&&k.keyCode==27)){if(k.which==27){i.find(c).focus()}return j.click()}var l=" li:not(.divider):visible a";var m=i.find("[role=menu]"+l+", [role=listbox]"+l);if(!m.length){return}var n=m.index(m.filter(":focus"));if(k.keyCode==38&&n>0){n--}if(k.keyCode==40&&n<m.length-1){n++}if(!~n){n=0}m.eq(n).focus()};function e(h){a(f).remove();a(c).each(function(){var j=g(a(this));var i={relatedTarget:this};if(!j.hasClass("open")){return}j.trigger(h=a.Event("hide.bs.dropdown",i));if(h.isDefaultPrevented()){return}j.removeClass("open").trigger("hidden.bs.dropdown",i)})}function g(h){var i=h.attr("data-target");if(!i){i=h.attr("href");i=i&&/#[A-Za-z]/.test(i)&&i.replace(/.*(?=#[^\s]*$)/,"")}var j=i&&a(i);return j&&j.length?j:h.parent()}var d=a.fn.dropdown;a.fn.dropdown=function(h){return this.each(function(){var j=a(this);var i=j.data("bs.dropdown");if(!i){j.data("bs.dropdown",(i=new b(this)))}if(typeof h=="string"){i[h].call(j)}})};a.fn.dropdown.Constructor=b;a.fn.dropdown.noConflict=function(){a.fn.dropdown=d;return this};a(document).on("click.bs.dropdown.data-api",e).on("click.bs.dropdown.data-api",".dropdown form",function(h){h.stopPropagation()}).on("click.bs.dropdown.data-api",c,b.prototype.toggle).on("keydown.bs.dropdown.data-api",c+", [role=menu], [role=listbox]",b.prototype.keydown)}(jQuery);+function(b){var a=function(e,d){this.options=d;this.$element=b(e);this.$backdrop=this.isShown=null;if(this.options.remote){this.$element.find(".modal-content").load(this.options.remote,b.proxy(function(){this.$element.trigger("loaded.bs.modal")},this))}};a.DEFAULTS={backdrop:true,keyboard:true,show:true};a.prototype.toggle=function(d){return this[!this.isShown?"show":"hide"](d)};a.prototype.show=function(d){var e=this;var f=b.Event("show.bs.modal",{relatedTarget:d});this.$element.trigger(f);if(this.isShown||f.isDefaultPrevented()){return}this.isShown=true;this.escape();this.$element.on("click.dismiss.bs.modal",'[data-dismiss="modal"]',b.proxy(this.hide,this));this.backdrop(function(){var i=b.support.transition&&e.$element.hasClass("fade");if(!e.$element.parent().length){e.$element.appendTo(document.body)}e.$element.show().scrollTop(0);if(i){e.$element[0].offsetWidth}e.$element.addClass("in").attr("aria-hidden",false);e.enforceFocus();var h=b.Event("shown.bs.modal",{relatedTarget:d});i?e.$element.find(".modal-dialog").one(b.support.transition.end,function(){e.$element.focus().trigger(h)}).emulateTransitionEnd(300):e.$element.focus().trigger(h)})};a.prototype.hide=function(d){if(d){d.preventDefault()}d=b.Event("hide.bs.modal");this.$element.trigger(d);if(!this.isShown||d.isDefaultPrevented()){return}this.isShown=false;this.escape();b(document).off("focusin.bs.modal");this.$element.removeClass("in").attr("aria-hidden",true).off("click.dismiss.bs.modal");b.support.transition&&this.$element.hasClass("fade")?this.$element.one(b.support.transition.end,b.proxy(this.hideModal,this)).emulateTransitionEnd(300):this.hideModal()};a.prototype.enforceFocus=function(){b(document).off("focusin.bs.modal").on("focusin.bs.modal",b.proxy(function(d){if(this.$element[0]!==d.target&&!this.$element.has(d.target).length){this.$element.focus()}},this))};a.prototype.escape=function(){if(this.isShown&&this.options.keyboard){this.$element.on("keyup.dismiss.bs.modal",b.proxy(function(d){d.which==27&&this.hide()},this))}else{if(!this.isShown){this.$element.off("keyup.dismiss.bs.modal")}}};a.prototype.hideModal=function(){var d=this;this.$element.hide();this.backdrop(function(){d.removeBackdrop();d.$element.trigger("hidden.bs.modal")})};a.prototype.removeBackdrop=function(){this.$backdrop&&this.$backdrop.remove();this.$backdrop=null};a.prototype.backdrop=function(d){var f=this.$element.hasClass("fade")?"fade":"";if(this.isShown&&this.options.backdrop){var e=b.support.transition&&f;this.$backdrop=b('<div class="modal-backdrop '+f+'" />').appendTo(document.body);this.$element.on("click.dismiss.bs.modal",b.proxy(function(g){if(g.target!==g.currentTarget){return}this.options.backdrop=="static"?this.$element[0].focus.call(this.$element[0]):this.hide.call(this)},this));if(e){this.$backdrop[0].offsetWidth}this.$backdrop.addClass("in");if(!d){return}e?this.$backdrop.one(b.support.transition.end,d).emulateTransitionEnd(150):d()}else{if(!this.isShown&&this.$backdrop){this.$backdrop.removeClass("in");b.support.transition&&this.$element.hasClass("fade")?this.$backdrop.one(b.support.transition.end,d).emulateTransitionEnd(150):d()}else{if(d){d()}}}};var c=b.fn.modal;b.fn.modal=function(d,e){return this.each(function(){var h=b(this);var g=h.data("bs.modal");var f=b.extend({},a.DEFAULTS,h.data(),typeof d=="object"&&d);if(!g){h.data("bs.modal",(g=new a(this,f)))}if(typeof d=="string"){g[d](e)}else{if(f.show){g.show(e)}}})};b.fn.modal.Constructor=a;b.fn.modal.noConflict=function(){b.fn.modal=c;return this};b(document).on("click.bs.modal.data-api",'[data-toggle="modal"]',function(g){var f=b(this);var d=f.attr("href");var h=b(f.attr("data-target")||(d&&d.replace(/.*(?=#[^\s]+$)/,"")));var e=h.data("bs.modal")?"toggle":b.extend({remote:!/#/.test(d)&&d},h.data(),f.data());if(f.is("a")){g.preventDefault()}h.modal(e,this).one("hide",function(){f.is(":visible")&&f.focus()})});b(document).on("show.bs.modal",".modal",function(){b(document.body).addClass("modal-open")}).on("hidden.bs.modal",".modal",function(){b(document.body).removeClass("modal-open")})}(jQuery);+function(b){var a=function(e,d){this.type=this.options=this.enabled=this.timeout=this.hoverState=this.$element=null;this.init("tooltip",e,d)};a.DEFAULTS={animation:true,placement:"top",selector:false,template:'<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:false,container:false};a.prototype.init=function(j,e,f){this.enabled=true;this.type=j;this.$element=b(e);this.options=this.getOptions(f);var d=this.options.trigger.split(" ");for(var h=d.length;h--;){var l=d[h];if(l=="click"){this.$element.on("click."+this.type,this.options.selector,b.proxy(this.toggle,this))}else{if(l!="manual"){var k=l=="hover"?"mouseenter":"focusin";var g=l=="hover"?"mouseleave":"focusout";this.$element.on(k+"."+this.type,this.options.selector,b.proxy(this.enter,this));this.$element.on(g+"."+this.type,this.options.selector,b.proxy(this.leave,this))}}}this.options.selector?(this._options=b.extend({},this.options,{trigger:"manual",selector:""})):this.fixTitle()};a.prototype.getDefaults=function(){return a.DEFAULTS};a.prototype.getOptions=function(d){d=b.extend({},this.getDefaults(),this.$element.data(),d);if(d.delay&&typeof d.delay=="number"){d.delay={show:d.delay,hide:d.delay}}return d};a.prototype.getDelegateOptions=function(){var d={};var e=this.getDefaults();this._options&&b.each(this._options,function(f,g){if(e[f]!=g){d[f]=g}});return d};a.prototype.enter=function(e){var d=e instanceof this.constructor?e:b(e.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type);clearTimeout(d.timeout);d.hoverState="in";if(!d.options.delay||!d.options.delay.show){return d.show()}d.timeout=setTimeout(function(){if(d.hoverState=="in"){d.show()}},d.options.delay.show)};a.prototype.leave=function(e){var d=e instanceof this.constructor?e:b(e.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type);clearTimeout(d.timeout);d.hoverState="out";if(!d.options.delay||!d.options.delay.hide){return d.hide()}d.timeout=setTimeout(function(){if(d.hoverState=="out"){d.hide()}},d.options.delay.hide)};a.prototype.show=function(){var f=b.Event("show.bs."+this.type);if(this.hasContent()&&this.enabled){this.$element.trigger(f);if(f.isDefaultPrevented()){return}var k=this;var g=this.tip();this.setContent();if(this.options.animation){g.addClass("fade")}var e=typeof this.options.placement=="function"?this.options.placement.call(this,g[0],this.$element[0]):this.options.placement;var i=/\s?auto?\s?/i;var m=i.test(e);if(m){e=e.replace(i,"")||"top"}g.detach().css({top:0,left:0,display:"block"}).addClass(e);this.options.container?g.appendTo(this.options.container):g.insertAfter(this.$element);var j=this.getPosition();var p=g[0].offsetWidth;var n=g[0].offsetHeight;if(m){var d=this.$element.parent();var t=e;var l=document.documentElement.scrollTop||document.body.scrollTop;var r=this.options.container=="body"?window.innerWidth:d.outerWidth();var o=this.options.container=="body"?window.innerHeight:d.outerHeight();var h=this.options.container=="body"?0:d.offset().left;e=e=="bottom"&&j.top+j.height+n-l>o?"top":e=="top"&&j.top-l-n<0?"bottom":e=="right"&&j.right+p>r?"left":e=="left"&&j.left-p<h?"right":e;g.removeClass(t).addClass(e)}var s=this.getCalculatedOffset(e,j,p,n);this.applyPlacement(s,e);this.hoverState=null;var q=function(){k.$element.trigger("shown.bs."+k.type)};b.support.transition&&this.$tip.hasClass("fade")?g.one(b.support.transition.end,q).emulateTransitionEnd(150):q()}};a.prototype.applyPlacement=function(l,m){var j;var n=this.tip();var i=n[0].offsetWidth;var f=n[0].offsetHeight;var h=parseInt(n.css("margin-top"),10);var k=parseInt(n.css("margin-left"),10);if(isNaN(h)){h=0}if(isNaN(k)){k=0}l.top=l.top+h;l.left=l.left+k;b.offset.setOffset(n[0],b.extend({using:function(o){n.css({top:Math.round(o.top),left:Math.round(o.left)})}},l),0);n.addClass("in");var g=n[0].offsetWidth;var d=n[0].offsetHeight;if(m=="top"&&d!=f){j=true;l.top=l.top+f-d}if(/bottom|top/.test(m)){var e=0;if(l.left<0){e=l.left*-2;l.left=0;n.offset(l);g=n[0].offsetWidth;d=n[0].offsetHeight}this.replaceArrow(e-i+g,g,"left")}else{this.replaceArrow(d-f,d,"top")}if(j){n.offset(l)}};a.prototype.replaceArrow=function(d,f,e){this.arrow().css(e,d?(50*(1-d/f)+"%"):"")};a.prototype.setContent=function(){var e=this.tip();var d=this.getTitle();e.find(".tooltip-inner")[this.options.html?"html":"text"](d);e.removeClass("fade in top bottom left right")};a.prototype.hide=function(){var e=this;var g=this.tip();var f=b.Event("hide.bs."+this.type);function d(){if(e.hoverState!="in"){g.detach()}e.$element.trigger("hidden.bs."+e.type)}this.$element.trigger(f);if(f.isDefaultPrevented()){return}g.removeClass("in");b.support.transition&&this.$tip.hasClass("fade")?g.one(b.support.transition.end,d).emulateTransitionEnd(150):d();this.hoverState=null;return this};a.prototype.fixTitle=function(){var d=this.$element;if(d.attr("title")||typeof(d.attr("data-original-title"))!="string"){d.attr("data-original-title",d.attr("title")||"").attr("title","")}};a.prototype.hasContent=function(){return this.getTitle()};a.prototype.getPosition=function(){var d=this.$element[0];return b.extend({},(typeof d.getBoundingClientRect=="function")?d.getBoundingClientRect():{width:d.offsetWidth,height:d.offsetHeight},this.$element.offset())};a.prototype.getCalculatedOffset=function(d,g,e,f){return d=="bottom"?{top:g.top+g.height,left:g.left+g.width/2-e/2}:d=="top"?{top:g.top-f,left:g.left+g.width/2-e/2}:d=="left"?{top:g.top+g.height/2-f/2,left:g.left-e}:{top:g.top+g.height/2-f/2,left:g.left+g.width}};a.prototype.getTitle=function(){var d;var e=this.$element;var f=this.options;d=e.attr("data-original-title")||(typeof f.title=="function"?f.title.call(e[0]):f.title);return d};a.prototype.tip=function(){return this.$tip=this.$tip||b(this.options.template)};a.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".tooltip-arrow")};a.prototype.validate=function(){if(!this.$element[0].parentNode){this.hide();this.$element=null;this.options=null}};a.prototype.enable=function(){this.enabled=true};a.prototype.disable=function(){this.enabled=false};a.prototype.toggleEnabled=function(){this.enabled=!this.enabled};a.prototype.toggle=function(e){var d=e?b(e.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type):this;d.tip().hasClass("in")?d.leave(d):d.enter(d)};a.prototype.destroy=function(){clearTimeout(this.timeout);this.hide().$element.off("."+this.type).removeData("bs."+this.type)};var c=b.fn.tooltip;b.fn.tooltip=function(d){return this.each(function(){var f=b(this);var e=f.data("bs.tooltip");var g=typeof d=="object"&&d;if(!e&&d=="destroy"){return}if(!e){f.data("bs.tooltip",(e=new a(this,g)))}if(typeof d=="string"){e[d]()}})};b.fn.tooltip.Constructor=a;b.fn.tooltip.noConflict=function(){b.fn.tooltip=c;return this}}(jQuery);+function(b){var a=function(e,d){this.init("popover",e,d)};if(!b.fn.tooltip){throw new Error("Popover requires tooltip.js")}a.DEFAULTS=b.extend({},b.fn.tooltip.Constructor.DEFAULTS,{placement:"right",trigger:"click",content:"",template:'<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'});a.prototype=b.extend({},b.fn.tooltip.Constructor.prototype);a.prototype.constructor=a;a.prototype.getDefaults=function(){return a.DEFAULTS};a.prototype.setContent=function(){var d=this.tip();var f=this.getTitle();var e=this.getContent();d.find(".popover-title")[this.options.html?"html":"text"](f);d.find(".popover-content")[this.options.html?(typeof e=="string"?"html":"append"):"text"](e);d.removeClass("fade top bottom left right in");if(!d.find(".popover-title").html()){d.find(".popover-title").hide()}};a.prototype.hasContent=function(){return this.getTitle()||this.getContent()};a.prototype.getContent=function(){var d=this.$element;var e=this.options;return d.attr("data-content")||(typeof e.content=="function"?e.content.call(d[0]):e.content)};a.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".arrow")};a.prototype.tip=function(){if(!this.$tip){this.$tip=b(this.options.template)}return this.$tip};var c=b.fn.popover;b.fn.popover=function(d){return this.each(function(){var f=b(this);var e=f.data("bs.popover");var g=typeof d=="object"&&d;if(!e&&d=="destroy"){return}if(!e){f.data("bs.popover",(e=new a(this,g)))}if(typeof d=="string"){e[d]()}})};b.fn.popover.Constructor=a;b.fn.popover.noConflict=function(){b.fn.popover=c;return this}}(jQuery);+function(b){function a(f,e){var d;var g=b.proxy(this.process,this);this.$element=b(f).is("body")?b(window):b(f);this.$body=b("body");this.$scrollElement=this.$element.on("scroll.bs.scroll-spy.data-api",g);this.options=b.extend({},a.DEFAULTS,e);this.selector=(this.options.target||((d=b(f).attr("href"))&&d.replace(/.*(?=#[^\s]+$)/,""))||"")+" .nav li > a";this.offsets=b([]);this.targets=b([]);this.activeTarget=null;this.refresh();this.process()}a.DEFAULTS={offset:10};a.prototype.refresh=function(){var e=this.$element[0]==window?"offset":"position";this.offsets=b([]);this.targets=b([]);var f=this;var d=this.$body.find(this.selector).map(function(){var h=b(this);var g=h.data("target")||h.attr("href");var i=/^#./.test(g)&&b(g);return(i&&i.length&&i.is(":visible")&&[[i[e]().top+(!b.isWindow(f.$scrollElement.get(0))&&f.$scrollElement.scrollTop()),g]])||null}).sort(function(h,g){return h[0]-g[0]}).each(function(){f.offsets.push(this[0]);f.targets.push(this[1])})};a.prototype.process=function(){var e=this.$scrollElement.scrollTop()+this.options.offset;var h=this.$scrollElement[0].scrollHeight||this.$body[0].scrollHeight;var g=h-this.$scrollElement.height();var k=this.offsets;var d=this.targets;var f=this.activeTarget;var j;if(e>=g){return f!=(j=d.last()[0])&&this.activate(j)}if(f&&e<=k[0]){return f!=(j=d[0])&&this.activate(j)}for(j=k.length;j--;){f!=d[j]&&e>=k[j]&&(!k[j+1]||e<=k[j+1])&&this.activate(d[j])}};a.prototype.activate=function(d){this.activeTarget=d;b(this.selector).parentsUntil(this.options.target,".active").removeClass("active");var e=this.selector+'[data-target="'+d+'"],'+this.selector+'[href="'+d+'"]';var f=b(e).parents("li").addClass("active");if(f.parent(".dropdown-menu").length){f=f.closest("li.dropdown").addClass("active")}f.trigger("activate.bs.scrollspy")};var c=b.fn.scrollspy;b.fn.scrollspy=function(d){return this.each(function(){var f=b(this);var e=f.data("bs.scrollspy");var g=typeof d=="object"&&d;if(!e){f.data("bs.scrollspy",(e=new a(this,g)))}if(typeof d=="string"){e[d]()}})};b.fn.scrollspy.Constructor=a;b.fn.scrollspy.noConflict=function(){b.fn.scrollspy=c;return this};b(window).on("load",function(){b('[data-spy="scroll"]').each(function(){var d=b(this);d.scrollspy(d.data())})})}(jQuery);+function(b){var a=function(d){this.element=b(d)};a.prototype.show=function(){var i=this.element;var d=i.closest("ul:not(.dropdown-menu)");var h=i.data("target");if(!h){h=i.attr("href");h=h&&h.replace(/.*(?=#[^\s]*$)/,"")}if(i.parent("li").hasClass("active")){return}var f=d.find(".active:last a")[0];var g=b.Event("show.bs.tab",{relatedTarget:f});i.trigger(g);if(g.isDefaultPrevented()){return}var e=b(h);this.activate(i.parent("li"),d);this.activate(e,e.parent(),function(){i.trigger({type:"shown.bs.tab",relatedTarget:f})})};a.prototype.activate=function(d,i,h){var g=i.find("> .active");var f=h&&b.support.transition&&g.hasClass("fade");function e(){g.removeClass("active").find("> .dropdown-menu > .active").removeClass("active");d.addClass("active");if(f){d[0].offsetWidth;d.addClass("in")}else{d.removeClass("fade")}if(d.parent(".dropdown-menu")){d.closest("li.dropdown").addClass("active")}h&&h()}f?g.one(b.support.transition.end,e).emulateTransitionEnd(150):e();g.removeClass("in")};var c=b.fn.tab;b.fn.tab=function(d){return this.each(function(){var f=b(this);var e=f.data("bs.tab");if(!e){f.data("bs.tab",(e=new a(this)))}if(typeof d=="string"){e[d]()}})};b.fn.tab.Constructor=a;b.fn.tab.noConflict=function(){b.fn.tab=c;return this};b(document).on("click.bs.tab.data-api",'[data-toggle="tab"], [data-toggle="pill"]',function(d){d.preventDefault();b(this).tab("show")})}(jQuery);+function(b){var a=function(e,d){this.options=b.extend({},a.DEFAULTS,d);this.$window=b(window).on("scroll.bs.affix.data-api",b.proxy(this.checkPosition,this)).on("click.bs.affix.data-api",b.proxy(this.checkPositionWithEventLoop,this));this.$element=b(e);this.affixed=this.unpin=this.pinnedOffset=null;this.checkPosition()};a.RESET="affix affix-top affix-bottom";a.DEFAULTS={offset:0};a.prototype.getPinnedOffset=function(){if(this.pinnedOffset){return this.pinnedOffset}this.$element.removeClass(a.RESET).addClass("affix");var e=this.$window.scrollTop();var d=this.$element.offset();return(this.pinnedOffset=d.top-e)};a.prototype.checkPositionWithEventLoop=function(){setTimeout(b.proxy(this.checkPosition,this),1)};a.prototype.checkPosition=function(){if(!this.$element.is(":visible")){return}var k=b(document).height();var l=this.$window.scrollTop();var h=this.$element.offset();var f=this.options.offset;var d=f.top;var e=f.bottom;if(this.affixed=="top"){h.top+=l}if(typeof f!="object"){e=d=f}if(typeof d=="function"){d=f.top(this.$element)}if(typeof e=="function"){e=f.bottom(this.$element)}var g=this.unpin!=null&&(l+this.unpin<=h.top)?false:e!=null&&(h.top+this.$element.height()>=k-e)?"bottom":d!=null&&(l<=d)?"top":false;if(this.affixed===g){return}if(this.unpin){this.$element.css("top","")}var j="affix"+(g?"-"+g:"");var i=b.Event(j+".bs.affix");this.$element.trigger(i);if(i.isDefaultPrevented()){return}this.affixed=g;this.unpin=g=="bottom"?this.getPinnedOffset():null;this.$element.removeClass(a.RESET).addClass(j).trigger(b.Event(j.replace("affix","affixed")));if(g=="bottom"){this.$element.offset({top:k-e-this.$element.height()})}};var c=b.fn.affix;b.fn.affix=function(d){return this.each(function(){var f=b(this);var e=f.data("bs.affix");var g=typeof d=="object"&&d;if(!e){f.data("bs.affix",(e=new a(this,g)))}if(typeof d=="string"){e[d]()}})};b.fn.affix.Constructor=a;b.fn.affix.noConflict=function(){b.fn.affix=c;return this};b(window).on("load",function(){b('[data-spy="affix"]').each(function(){var e=b(this);var d=e.data();d.offset=d.offset||{};if(d.offsetBottom){d.offset.bottom=d.offsetBottom}if(d.offsetTop){d.offset.top=d.offsetTop}e.affix(d)})})}(jQuery);(function(a){a.flexslider=function(d,h){var i=a(d);i.vars=a.extend({},a.flexslider.defaults,h);var j=i.vars.namespace,c=window.navigator&&window.navigator.msPointerEnabled&&window.MSGesture,k=(("ontouchstart" in window)||c||window.DocumentTouch&&document instanceof DocumentTouch)&&i.vars.touch,p="click touchend MSPointerUp",q="",o,g=i.vars.direction==="vertical",l=i.vars.reverse,b=(i.vars.itemWidth>0),f=i.vars.animation==="fade",m=i.vars.asNavFor!=="",e={},n=true;a.data(d,"flexslider",i);e={init:function(){i.animating=false;i.currentSlide=parseInt((i.vars.startAt?i.vars.startAt:0),10);if(isNaN(i.currentSlide)){i.currentSlide=0}i.animatingTo=i.currentSlide;i.atEnd=(i.currentSlide===0||i.currentSlide===i.last);i.containerSelector=i.vars.selector.substr(0,i.vars.selector.search(" "));i.slides=a(i.vars.selector,i);i.container=a(i.containerSelector,i);i.count=i.slides.length;i.syncExists=a(i.vars.sync).length>0;if(i.vars.animation==="slide"){i.vars.animation="swing"}i.prop=(g)?"top":"marginLeft";i.args={};i.manualPause=false;i.stopped=false;i.started=false;i.startTimeout=null;i.transitions=!i.vars.video&&!f&&i.vars.useCSS&&(function(){var t=document.createElement("div"),s=["perspectiveProperty","WebkitPerspective","MozPerspective","OPerspective","msPerspective"];for(var r in s){if(t.style[s[r]]!==undefined){i.pfx=s[r].replace("Perspective","").toLowerCase();i.prop="-"+i.pfx+"-transform";return true}}return false}());i.ensureAnimationEnd="";if(i.vars.controlsContainer!==""){i.controlsContainer=a(i.vars.controlsContainer).length>0&&a(i.vars.controlsContainer)}if(i.vars.manualControls!==""){i.manualControls=a(i.vars.manualControls).length>0&&a(i.vars.manualControls)}if(i.vars.randomize){i.slides.sort(function(){return(Math.round(Math.random())-0.5)});i.container.empty().append(i.slides)}i.doMath();i.setup("init");if(i.vars.controlNav){e.controlNav.setup()}if(i.vars.directionNav){e.directionNav.setup()}if(i.vars.keyboard&&(a(i.containerSelector).length===1||i.vars.multipleKeyboard)){a(document).bind("keyup",function(s){var r=s.keyCode;if(!i.animating&&(r===39||r===37)){var t=(r===39)?i.getTarget("next"):(r===37)?i.getTarget("prev"):false;i.flexAnimate(t,i.vars.pauseOnAction)}})}if(i.vars.mousewheel){i.bind("mousewheel",function(t,v,s,r){t.preventDefault();var u=(v<0)?i.getTarget("next"):i.getTarget("prev");i.flexAnimate(u,i.vars.pauseOnAction)})}if(i.vars.pausePlay){e.pausePlay.setup()}if(i.vars.slideshow&&i.vars.pauseInvisible){e.pauseInvisible.init()}if(i.vars.slideshow){if(i.vars.pauseOnHover){i.hover(function(){if(!i.manualPlay&&!i.manualPause){i.pause()}},function(){if(!i.manualPause&&!i.manualPlay&&!i.stopped){i.play()}})}if(!i.vars.pauseInvisible||!e.pauseInvisible.isHidden()){(i.vars.initDelay>0)?i.startTimeout=setTimeout(i.play,i.vars.initDelay):i.play()}}if(m){e.asNav.setup()}if(k&&i.vars.touch){e.touch()}if(!f||(f&&i.vars.smoothHeight)){a(window).bind("resize orientationchange focus",e.resize)}i.find("img").attr("draggable","false");setTimeout(function(){i.vars.start(i)},200)},asNav:{setup:function(){i.asNav=true;i.animatingTo=Math.floor(i.currentSlide/i.move);i.currentItem=i.currentSlide;i.slides.removeClass(j+"active-slide").eq(i.currentItem).addClass(j+"active-slide");if(!c){i.slides.on(p,function(t){t.preventDefault();var s=a(this),r=s.index();var u=s.offset().left-a(i).scrollLeft();if(u<=0&&s.hasClass(j+"active-slide")){i.flexAnimate(i.getTarget("prev"),true)}else{if(!a(i.vars.asNavFor).data("flexslider").animating&&!s.hasClass(j+"active-slide")){i.direction=(i.currentItem<r)?"next":"prev";i.flexAnimate(r,i.vars.pauseOnAction,false,true,true)}}})}else{d._slider=i;i.slides.each(function(){var r=this;r._gesture=new MSGesture();r._gesture.target=r;r.addEventListener("MSPointerDown",function(s){s.preventDefault();if(s.currentTarget._gesture){s.currentTarget._gesture.addPointer(s.pointerId)}},false);r.addEventListener("MSGestureTap",function(u){u.preventDefault();var t=a(this),s=t.index();if(!a(i.vars.asNavFor).data("flexslider").animating&&!t.hasClass("active")){i.direction=(i.currentItem<s)?"next":"prev";i.flexAnimate(s,i.vars.pauseOnAction,false,true,true)}})})}}},controlNav:{setup:function(){if(!i.manualControls){e.controlNav.setupPaging()}else{e.controlNav.setupManual()}},setupPaging:function(){var u=(i.vars.controlNav==="thumbnails")?"control-thumbs":"control-paging",s=1,v,r;i.controlNavScaffold=a('<ol class="'+j+"control-nav "+j+u+'"></ol>');if(i.pagingCount>1){for(var t=0;t<i.pagingCount;t++){r=i.slides.eq(t);v=(i.vars.controlNav==="thumbnails")?'<img src="'+r.attr("data-thumb")+'"/>':"<a>"+s+"</a>";if("thumbnails"===i.vars.controlNav&&true===i.vars.thumbCaptions){var w=r.attr("data-thumbcaption");if(""!=w&&undefined!=w){v+='<span class="'+j+'caption">'+w+"</span>"}}i.controlNavScaffold.append("<li>"+v+"</li>");s++}}(i.controlsContainer)?a(i.controlsContainer).append(i.controlNavScaffold):i.append(i.controlNavScaffold);e.controlNav.set();e.controlNav.active();i.controlNavScaffold.delegate("a, img",p,function(y){y.preventDefault();if(q===""||q===y.type){var x=a(this),z=i.controlNav.index(x);if(!x.hasClass(j+"active")){i.direction=(z>i.currentSlide)?"next":"prev";i.flexAnimate(z,i.vars.pauseOnAction)}}if(q===""){q=y.type}e.setToClearWatchedEvent()})},setupManual:function(){i.controlNav=i.manualControls;e.controlNav.active();i.controlNav.bind(p,function(r){r.preventDefault();if(q===""||q===r.type){var t=a(this),s=i.controlNav.index(t);if(!t.hasClass(j+"active")){(s>i.currentSlide)?i.direction="next":i.direction="prev";i.flexAnimate(s,i.vars.pauseOnAction)}}if(q===""){q=r.type}e.setToClearWatchedEvent()})},set:function(){var r=(i.vars.controlNav==="thumbnails")?"img":"a";i.controlNav=a("."+j+"control-nav li "+r,(i.controlsContainer)?i.controlsContainer:i)},active:function(){i.controlNav.removeClass(j+"active").eq(i.animatingTo).addClass(j+"active")},update:function(r,s){if(i.pagingCount>1&&r==="add"){i.controlNavScaffold.append(a("<li><a>"+i.count+"</a></li>"))}else{if(i.pagingCount===1){i.controlNavScaffold.find("li").remove()}else{i.controlNav.eq(s).closest("li").remove()}}e.controlNav.set();(i.pagingCount>1&&i.pagingCount!==i.controlNav.length)?i.update(s,r):e.controlNav.active()}},directionNav:{setup:function(){var r=a('<ul class="'+j+'direction-nav"><li><a class="'+j+'prev" href="#">'+i.vars.prevText+'</a></li><li><a class="'+j+'next" href="#">'+i.vars.nextText+"</a></li></ul>");if(i.controlsContainer){a(i.controlsContainer).append(r);i.directionNav=a("."+j+"direction-nav li a",i.controlsContainer)}else{i.append(r);i.directionNav=a("."+j+"direction-nav li a",i)}e.directionNav.update();i.directionNav.bind(p,function(s){s.preventDefault();var t;if(q===""||q===s.type){t=(a(this).hasClass(j+"next"))?i.getTarget("next"):i.getTarget("prev");i.flexAnimate(t,i.vars.pauseOnAction)}if(q===""){q=s.type}e.setToClearWatchedEvent()})},update:function(){var r=j+"disabled";if(i.pagingCount===1){i.directionNav.addClass(r).attr("tabindex","-1")}else{if(!i.vars.animationLoop){if(i.animatingTo===0){i.directionNav.removeClass(r).filter("."+j+"prev").addClass(r).attr("tabindex","-1")}else{if(i.animatingTo===i.last){i.directionNav.removeClass(r).filter("."+j+"next").addClass(r).attr("tabindex","-1")}else{i.directionNav.removeClass(r).removeAttr("tabindex")}}}else{i.directionNav.removeClass(r).removeAttr("tabindex")}}}},pausePlay:{setup:function(){var r=a('<div class="'+j+'pauseplay"><a></a></div>');if(i.controlsContainer){i.controlsContainer.append(r);i.pausePlay=a("."+j+"pauseplay a",i.controlsContainer)}else{i.append(r);i.pausePlay=a("."+j+"pauseplay a",i)}e.pausePlay.update((i.vars.slideshow)?j+"pause":j+"play");i.pausePlay.bind(p,function(s){s.preventDefault();if(q===""||q===s.type){if(a(this).hasClass(j+"pause")){i.manualPause=true;i.manualPlay=false;i.pause()}else{i.manualPause=false;i.manualPlay=true;i.play()}}if(q===""){q=s.type}e.setToClearWatchedEvent()})},update:function(r){(r==="play")?i.pausePlay.removeClass(j+"pause").addClass(j+"play").html(i.vars.playText):i.pausePlay.removeClass(j+"play").addClass(j+"pause").html(i.vars.pauseText)}},touch:function(){var E,B,z,G,w,v,D=false,u=0,r=0,y=0;if(!c){d.addEventListener("touchstart",A,false);function A(H){if(i.animating){H.preventDefault()}else{if((window.navigator.msPointerEnabled)||H.touches.length===1){i.pause();G=(g)?i.h:i.w;v=Number(new Date());u=H.touches[0].pageX;r=H.touches[0].pageY;z=(b&&l&&i.animatingTo===i.last)?0:(b&&l)?i.limit-(((i.itemW+i.vars.itemMargin)*i.move)*i.animatingTo):(b&&i.currentSlide===i.last)?i.limit:(b)?((i.itemW+i.vars.itemMargin)*i.move)*i.currentSlide:(l)?(i.last-i.currentSlide+i.cloneOffset)*G:(i.currentSlide+i.cloneOffset)*G;E=(g)?r:u;B=(g)?u:r;d.addEventListener("touchmove",F,false);d.addEventListener("touchend",s,false)}}}function F(H){u=H.touches[0].pageX;r=H.touches[0].pageY;w=(g)?E-r:E-u;D=(g)?(Math.abs(w)<Math.abs(u-B)):(Math.abs(w)<Math.abs(r-B));var I=500;if(!D||Number(new Date())-v>I){H.preventDefault();if(!f&&i.transitions){if(!i.vars.animationLoop){w=w/((i.currentSlide===0&&w<0||i.currentSlide===i.last&&w>0)?(Math.abs(w)/G+2):1)}i.setProps(z+w,"setTouch")}}}function s(J){d.removeEventListener("touchmove",F,false);if(i.animatingTo===i.currentSlide&&!D&&!(w===null)){var I=(l)?-w:w,H=(I>0)?i.getTarget("next"):i.getTarget("prev");if(i.canAdvance(H)&&(Number(new Date())-v<550&&Math.abs(I)>50||Math.abs(I)>G/2)){i.flexAnimate(H,i.vars.pauseOnAction)}else{if(!f){i.flexAnimate(i.currentSlide,i.vars.pauseOnAction,true)}}}d.removeEventListener("touchend",s,false);E=null;B=null;w=null;z=null}}else{d.style.msTouchAction="none";d._gesture=new MSGesture();d._gesture.target=d;d.addEventListener("MSPointerDown",t,false);d._slider=i;d.addEventListener("MSGestureChange",C,false);d.addEventListener("MSGestureEnd",x,false);function t(H){H.stopPropagation();if(i.animating){H.preventDefault()}else{i.pause();d._gesture.addPointer(H.pointerId);y=0;G=(g)?i.h:i.w;v=Number(new Date());z=(b&&l&&i.animatingTo===i.last)?0:(b&&l)?i.limit-(((i.itemW+i.vars.itemMargin)*i.move)*i.animatingTo):(b&&i.currentSlide===i.last)?i.limit:(b)?((i.itemW+i.vars.itemMargin)*i.move)*i.currentSlide:(l)?(i.last-i.currentSlide+i.cloneOffset)*G:(i.currentSlide+i.cloneOffset)*G}}function C(K){K.stopPropagation();var J=K.target._slider;if(!J){return}var I=-K.translationX,H=-K.translationY;y=y+((g)?H:I);w=y;D=(g)?(Math.abs(y)<Math.abs(-I)):(Math.abs(y)<Math.abs(-H));if(K.detail===K.MSGESTURE_FLAG_INERTIA){setImmediate(function(){d._gesture.stop()});return}if(!D||Number(new Date())-v>500){K.preventDefault();if(!f&&J.transitions){if(!J.vars.animationLoop){w=y/((J.currentSlide===0&&y<0||J.currentSlide===J.last&&y>0)?(Math.abs(y)/G+2):1)}J.setProps(z+w,"setTouch")}}}function x(K){K.stopPropagation();var H=K.target._slider;if(!H){return}if(H.animatingTo===H.currentSlide&&!D&&!(w===null)){var J=(l)?-w:w,I=(J>0)?H.getTarget("next"):H.getTarget("prev");if(H.canAdvance(I)&&(Number(new Date())-v<550&&Math.abs(J)>50||Math.abs(J)>G/2)){H.flexAnimate(I,H.vars.pauseOnAction)}else{if(!f){H.flexAnimate(H.currentSlide,H.vars.pauseOnAction,true)}}}E=null;B=null;w=null;z=null;y=0}}},resize:function(){if(!i.animating&&i.is(":visible")){if(!b){i.doMath()}if(f){e.smoothHeight()}else{if(b){i.slides.width(i.computedW);i.update(i.pagingCount);i.setProps()}else{if(g){i.viewport.height(i.h);i.setProps(i.h,"setTotal")}else{if(i.vars.smoothHeight){e.smoothHeight()}i.newSlides.width(i.computedW);i.setProps(i.computedW,"setTotal")}}}}},smoothHeight:function(r){if(!g||f){var s=(f)?i:i.viewport;(r)?s.animate({height:i.slides.eq(i.animatingTo).height()},r):s.height(i.slides.eq(i.animatingTo).height())}},sync:function(r){var t=a(i.vars.sync).data("flexslider"),s=i.animatingTo;switch(r){case"animate":t.flexAnimate(s,i.vars.pauseOnAction,false,true);break;case"play":if(!t.playing&&!t.asNav){t.play()}break;case"pause":t.pause();break}},uniqueID:function(r){r.find("[id]").each(function(){var s=a(this);s.attr("id",s.attr("id")+"_clone")});return r},pauseInvisible:{visProp:null,init:function(){var t=["webkit","moz","ms","o"];if("hidden" in document){return"hidden"}for(var s=0;s<t.length;s++){if((t[s]+"Hidden") in document){e.pauseInvisible.visProp=t[s]+"Hidden"}}if(e.pauseInvisible.visProp){var r=e.pauseInvisible.visProp.replace(/[H|h]idden/,"")+"visibilitychange";document.addEventListener(r,function(){if(e.pauseInvisible.isHidden()){if(i.startTimeout){clearTimeout(i.startTimeout)}else{i.pause()}}else{if(i.started){i.play()}else{(i.vars.initDelay>0)?setTimeout(i.play,i.vars.initDelay):i.play()}}})}},isHidden:function(){return document[e.pauseInvisible.visProp]||false}},setToClearWatchedEvent:function(){clearTimeout(o);o=setTimeout(function(){q=""},3000)}};i.flexAnimate=function(x,y,r,t,u){if(!i.vars.animationLoop&&x!==i.currentSlide){i.direction=(x>i.currentSlide)?"next":"prev"}if(m&&i.pagingCount===1){i.direction=(i.currentItem<x)?"next":"prev"}if(!i.animating&&(i.canAdvance(x,u)||r)&&i.is(":visible")){if(m&&t){var A=a(i.vars.asNavFor).data("flexslider");i.atEnd=x===0||x===i.count-1;A.flexAnimate(x,true,false,true,u);i.direction=(i.currentItem<x)?"next":"prev";A.direction=i.direction;if(Math.ceil((x+1)/i.visible)-1!==i.currentSlide&&x!==0){i.currentItem=x;i.slides.removeClass(j+"active-slide").eq(x).addClass(j+"active-slide");x=Math.floor(x/i.visible)}else{i.currentItem=x;i.slides.removeClass(j+"active-slide").eq(x).addClass(j+"active-slide");return false}}i.animating=true;i.animatingTo=x;if(y){i.pause()}i.vars.before(i);if(i.syncExists&&!u){e.sync("animate")}if(i.vars.controlNav){e.controlNav.active()}if(!b){i.slides.removeClass(j+"active-slide").eq(x).addClass(j+"active-slide")}i.atEnd=x===0||x===i.last;if(i.vars.directionNav){e.directionNav.update()}if(x===i.last){i.vars.end(i);if(!i.vars.animationLoop){i.pause()}}if(!f){var w=(g)?i.slides.filter(":first").height():i.computedW,v,s,z;if(b){v=i.vars.itemMargin;z=((i.itemW+v)*i.move)*i.animatingTo;s=(z>i.limit&&i.visible!==1)?i.limit:z}else{if(i.currentSlide===0&&x===i.count-1&&i.vars.animationLoop&&i.direction!=="next"){s=(l)?(i.count+i.cloneOffset)*w:0}else{if(i.currentSlide===i.last&&x===0&&i.vars.animationLoop&&i.direction!=="prev"){s=(l)?0:(i.count+1)*w}else{s=(l)?((i.count-1)-x+i.cloneOffset)*w:(x+i.cloneOffset)*w}}}i.setProps(s,"",i.vars.animationSpeed);if(i.transitions){if(!i.vars.animationLoop||!i.atEnd){i.animating=false;i.currentSlide=i.animatingTo}i.container.unbind("webkitTransitionEnd transitionend");i.container.bind("webkitTransitionEnd transitionend",function(){clearTimeout(i.ensureAnimationEnd);i.wrapup(w)});clearTimeout(i.ensureAnimationEnd);i.ensureAnimationEnd=setTimeout(function(){i.wrapup(w)},i.vars.animationSpeed+100)}else{i.container.animate(i.args,i.vars.animationSpeed,i.vars.easing,function(){i.wrapup(w)})}}else{if(!k){i.slides.eq(i.currentSlide).css({zIndex:1}).animate({opacity:0},i.vars.animationSpeed,i.vars.easing);i.slides.eq(x).css({zIndex:2}).animate({opacity:1},i.vars.animationSpeed,i.vars.easing,i.wrapup)}else{i.slides.eq(i.currentSlide).css({opacity:0,zIndex:1});i.slides.eq(x).css({opacity:1,zIndex:2});i.wrapup(w)}}if(i.vars.smoothHeight){e.smoothHeight(i.vars.animationSpeed)}}};i.wrapup=function(r){if(!f&&!b){if(i.currentSlide===0&&i.animatingTo===i.last&&i.vars.animationLoop){i.setProps(r,"jumpEnd")}else{if(i.currentSlide===i.last&&i.animatingTo===0&&i.vars.animationLoop){i.setProps(r,"jumpStart")}}}i.animating=false;i.currentSlide=i.animatingTo;i.vars.after(i)};i.animateSlides=function(){if(!i.animating&&n){i.flexAnimate(i.getTarget("next"))}};i.pause=function(){clearInterval(i.animatedSlides);i.animatedSlides=null;i.playing=false;if(i.vars.pausePlay){e.pausePlay.update("play")}if(i.syncExists){e.sync("pause")}};i.play=function(){if(i.playing){clearInterval(i.animatedSlides)}i.animatedSlides=i.animatedSlides||setInterval(i.animateSlides,i.vars.slideshowSpeed);i.started=i.playing=true;if(i.vars.pausePlay){e.pausePlay.update("pause")}if(i.syncExists){e.sync("play")}};i.stop=function(){i.pause();i.stopped=true};i.canAdvance=function(t,r){var s=(m)?i.pagingCount-1:i.last;return(r)?true:(m&&i.currentItem===i.count-1&&t===0&&i.direction==="prev")?true:(m&&i.currentItem===0&&t===i.pagingCount-1&&i.direction!=="next")?false:(t===i.currentSlide&&!m)?false:(i.vars.animationLoop)?true:(i.atEnd&&i.currentSlide===0&&t===s&&i.direction!=="next")?false:(i.atEnd&&i.currentSlide===s&&t===0&&i.direction==="next")?false:true};i.getTarget=function(r){i.direction=r;if(r==="next"){return(i.currentSlide===i.last)?0:i.currentSlide+1}else{return(i.currentSlide===0)?i.last:i.currentSlide-1}};i.setProps=function(u,r,s){var t=(function(){var v=(u)?u:((i.itemW+i.vars.itemMargin)*i.move)*i.animatingTo,w=(function(){if(b){return(r==="setTouch")?u:(l&&i.animatingTo===i.last)?0:(l)?i.limit-(((i.itemW+i.vars.itemMargin)*i.move)*i.animatingTo):(i.animatingTo===i.last)?i.limit:v}else{switch(r){case"setTotal":return(l)?((i.count-1)-i.currentSlide+i.cloneOffset)*u:(i.currentSlide+i.cloneOffset)*u;case"setTouch":return(l)?u:u;case"jumpEnd":return(l)?u:i.count*u;case"jumpStart":return(l)?i.count*u:u;default:return u}}}());return(w*-1)+"px"}());if(i.transitions){t=(g)?"translate3d(0,"+t+",0)":"translate3d("+t+",0,0)";s=(s!==undefined)?(s/1000)+"s":"0s";i.container.css("-"+i.pfx+"-transition-duration",s);i.container.css("transition-duration",s)}i.args[i.prop]=t;if(i.transitions||s===undefined){i.container.css(i.args)}i.container.css("transform",t)};i.setup=function(s){if(!f){var t,r;if(s==="init"){i.viewport=a('<div class="'+j+'viewport"></div>').css({overflow:"hidden",position:"relative"}).appendTo(i).append(i.container);i.cloneCount=0;i.cloneOffset=0;if(l){r=a.makeArray(i.slides).reverse();i.slides=a(r);i.container.empty().append(i.slides)}}if(i.vars.animationLoop&&!b){i.cloneCount=2;i.cloneOffset=1;if(s!=="init"){i.container.find(".clone").remove()}e.uniqueID(i.slides.first().clone().addClass("clone").attr("aria-hidden","true")).appendTo(i.container);e.uniqueID(i.slides.last().clone().addClass("clone").attr("aria-hidden","true")).prependTo(i.container)}i.newSlides=a(i.vars.selector,i);t=(l)?i.count-1-i.currentSlide+i.cloneOffset:i.currentSlide+i.cloneOffset;if(g&&!b){i.container.height((i.count+i.cloneCount)*200+"%").css("position","absolute").width("100%");setTimeout(function(){i.newSlides.css({display:"block"});i.doMath();i.viewport.height(i.h);i.setProps(t*i.h,"init")},(s==="init")?100:0)}else{i.container.width((i.count+i.cloneCount)*200+"%");i.setProps(t*i.computedW,"init");setTimeout(function(){i.doMath();i.newSlides.css({width:i.computedW,"float":"left",display:"block"});if(i.vars.smoothHeight){e.smoothHeight()}},(s==="init")?100:0)}}else{i.slides.css({width:"100%","float":"left",marginRight:"-100%",position:"relative"});if(s==="init"){if(!k){i.slides.css({opacity:0,display:"block",zIndex:1}).eq(i.currentSlide).css({zIndex:2}).animate({opacity:1},i.vars.animationSpeed,i.vars.easing)}else{i.slides.css({opacity:0,display:"block",webkitTransition:"opacity "+i.vars.animationSpeed/1000+"s ease",zIndex:1}).eq(i.currentSlide).css({opacity:1,zIndex:2})}}if(i.vars.smoothHeight){e.smoothHeight()}}if(!b){i.slides.removeClass(j+"active-slide").eq(i.currentSlide).addClass(j+"active-slide")}i.vars.init(i)};i.doMath=function(){var r=i.slides.first(),u=i.vars.itemMargin,s=i.vars.minItems,t=i.vars.maxItems;i.w=(i.viewport===undefined)?i.width():i.viewport.width();i.h=r.height();i.boxPadding=r.outerWidth()-r.width();if(b){i.itemT=i.vars.itemWidth+u;i.minW=(s)?s*i.itemT:i.w;i.maxW=(t)?(t*i.itemT)-u:i.w;i.itemW=(i.minW>i.w)?(i.w-(u*(s-1)))/s:(i.maxW<i.w)?(i.w-(u*(t-1)))/t:(i.vars.itemWidth>i.w)?i.w:i.vars.itemWidth;i.visible=Math.floor(i.w/(i.itemW));i.move=(i.vars.move>0&&i.vars.move<i.visible)?i.vars.move:i.visible;i.pagingCount=Math.ceil(((i.count-i.visible)/i.move)+1);i.last=i.pagingCount-1;i.limit=(i.pagingCount===1)?0:(i.vars.itemWidth>i.w)?(i.itemW*(i.count-1))+(u*(i.count-1)):((i.itemW+u)*i.count)-i.w-u}else{i.itemW=i.w;i.pagingCount=i.count;i.last=i.count-1}i.computedW=i.itemW-i.boxPadding};i.update=function(s,r){i.doMath();if(!b){if(s<i.currentSlide){i.currentSlide+=1}else{if(s<=i.currentSlide&&s!==0){i.currentSlide-=1}}i.animatingTo=i.currentSlide}if(i.vars.controlNav&&!i.manualControls){if((r==="add"&&!b)||i.pagingCount>i.controlNav.length){e.controlNav.update("add")}else{if((r==="remove"&&!b)||i.pagingCount<i.controlNav.length){if(b&&i.currentSlide>i.last){i.currentSlide-=1;i.animatingTo-=1}e.controlNav.update("remove",i.last)}}}if(i.vars.directionNav){e.directionNav.update()}};i.addSlide=function(r,t){var s=a(r);i.count+=1;i.last=i.count-1;if(g&&l){(t!==undefined)?i.slides.eq(i.count-t).after(s):i.container.prepend(s)}else{(t!==undefined)?i.slides.eq(t).before(s):i.container.append(s)}i.update(t,"add");i.slides=a(i.vars.selector+":not(.clone)",i);i.setup();i.vars.added(i)};i.removeSlide=function(r){var s=(isNaN(r))?i.slides.index(a(r)):r;i.count-=1;i.last=i.count-1;if(isNaN(r)){a(r,i.slides).remove()}else{(g&&l)?i.slides.eq(i.last).remove():i.slides.eq(r).remove()}i.doMath();i.update(s,"remove");i.slides=a(i.vars.selector+":not(.clone)",i);i.setup();i.vars.removed(i)};e.init()};a(window).blur(function(b){focused=false}).focus(function(b){focused=true});a.flexslider.defaults={namespace:"flex-",selector:".slides > li",animation:"fade",easing:"swing",direction:"horizontal",reverse:false,animationLoop:true,smoothHeight:false,startAt:0,slideshow:true,slideshowSpeed:7000,animationSpeed:600,initDelay:0,randomize:false,thumbCaptions:false,pauseOnAction:true,pauseOnHover:false,pauseInvisible:true,useCSS:true,touch:true,video:false,controlNav:true,directionNav:true,prevText:"Previous",nextText:"Next",keyboard:true,multipleKeyboard:false,mousewheel:false,pausePlay:false,pauseText:"Pause",playText:"Play",controlsContainer:"",manualControls:"",sync:"",asNavFor:"",itemWidth:0,itemMargin:0,minItems:1,maxItems:0,move:0,allowOneSlide:true,start:function(){},before:function(){},after:function(){},end:function(){},added:function(){},removed:function(){},init:function(){}};a.fn.flexslider=function(b){if(b===undefined){b={}}if(typeof b==="object"){return this.each(function(){var f=a(this),d=(b.selector)?b.selector:".slides > li",e=f.find(d);if((e.length===1&&b.allowOneSlide===true)||e.length===0){e.fadeIn(400);if(b.start){b.start(f)}}else{if(f.data("flexslider")===undefined){new a.flexslider(this,b)}}})}else{var c=a(this).data("flexslider");switch(b){case"play":c.play();break;case"pause":c.pause();break;case"stop":c.stop();break;case"next":c.flexAnimate(c.getTarget("next"),true);break;case"prev":case"previous":c.flexAnimate(c.getTarget("prev"),true);break;default:if(typeof b==="number"){c.flexAnimate(b,true)}}}}})(jQuery);
/*!
 * Created by mario on 15/05/14.
 */
;$(window).load(function(){$(".flexslider-principal").flexslider({animation:"slide",slideshowSpeed:5000,startAt:0,slideshow:true});$(".flexslider-destaque").flexslider({animation:"slide",controlNav:"thumbnails",randomize:false,slideshow:false});$("#flexslider-detalhe-thumb").flexslider({animation:"slide",controlNav:false,animationLoop:false,slideshow:false,itemWidth:120,itemMargin:5,asNavFor:"#flexslider-detalhe"});$("#flexslider-detalhe").flexslider({animation:"slide",controlNav:false,animationLoop:false,slideshow:false,sync:"#flexslider-detalhe-thumb"})});
/*!
 * Bootstrap v3.1.1 (http://getbootstrap.com)
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */
;if(typeof jQuery==="undefined"){throw new Error("Bootstrap's JavaScript requires jQuery")}+function(c){function d(){var f=document.createElement("bootstrap");var a={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"};for(var b in a){if(f.style[b]!==undefined){return{end:a[b]}}}return false}c.fn.emulateTransitionEnd=function(b){var g=false,h=this;c(this).one(c.support.transition.end,function(){g=true});var a=function(){if(!g){c(h).trigger(c.support.transition.end)}};setTimeout(a,b);return this};c(function(){c.support.transition=d()})}(jQuery);+function(g){var h='[data-dismiss="alert"]';var e=function(a){g(a).on("click",h,this.close)};e.prototype.close=function(b){var c=g(this);var j=c.attr("data-target");if(!j){j=c.attr("href");j=j&&j.replace(/.*(?=#[^\s]*$)/,"")}var d=g(j);if(b){b.preventDefault()}if(!d.length){d=c.hasClass("alert")?c:c.parent()}d.trigger(b=g.Event("close.bs.alert"));if(b.isDefaultPrevented()){return}d.removeClass("in");function a(){d.trigger("closed.bs.alert").remove()}g.support.transition&&d.hasClass("fade")?d.one(g.support.transition.end,a).emulateTransitionEnd(150):a()};var f=g.fn.alert;g.fn.alert=function(a){return this.each(function(){var b=g(this);var c=b.data("bs.alert");if(!c){b.data("bs.alert",(c=new e(this)))}if(typeof a=="string"){c[a].call(b)}})};g.fn.alert.Constructor=e;g.fn.alert.noConflict=function(){g.fn.alert=f;return this};g(document).on("click.bs.alert.data-api",h,e.prototype.close)}(jQuery);+function(d){var e=function(a,b){this.$element=d(a);this.options=d.extend({},e.DEFAULTS,b);this.isLoading=false};e.DEFAULTS={loadingText:"loading..."};e.prototype.setState=function(i){var b="disabled";var a=this.$element;var c=a.is("input")?"val":"html";var j=a.data();i=i+"Text";if(!j.resetText){a.data("resetText",a[c]())}a[c](j[i]||this.options[i]);setTimeout(d.proxy(function(){if(i=="loadingText"){this.isLoading=true;a.addClass(b).attr(b,b)}else{if(this.isLoading){this.isLoading=false;a.removeClass(b).removeAttr(b)}}},this),0)};e.prototype.toggle=function(){var a=true;var b=this.$element.closest('[data-toggle="buttons"]');if(b.length){var c=this.$element.find("input");if(c.prop("type")=="radio"){if(c.prop("checked")&&this.$element.hasClass("active")){a=false}else{b.find(".active").removeClass("active")}}if(a){c.prop("checked",!this.$element.hasClass("active")).trigger("change")}}if(a){this.$element.toggleClass("active")}};var f=d.fn.button;d.fn.button=function(a){return this.each(function(){var c=d(this);var h=c.data("bs.button");var b=typeof a=="object"&&a;if(!h){c.data("bs.button",(h=new e(this,b)))}if(a=="toggle"){h.toggle()}else{if(a){h.setState(a)}}})};d.fn.button.Constructor=e;d.fn.button.noConflict=function(){d.fn.button=f;return this};d(document).on("click.bs.button.data-api","[data-toggle^=button]",function(a){var b=d(a.target);if(!b.hasClass("btn")){b=b.closest(".btn")}b.button("toggle");a.preventDefault()})}(jQuery);+function(e){var d=function(a,b){this.$element=e(a);this.$indicators=this.$element.find(".carousel-indicators");this.options=b;this.paused=this.sliding=this.interval=this.$active=this.$items=null;this.options.pause=="hover"&&this.$element.on("mouseenter",e.proxy(this.pause,this)).on("mouseleave",e.proxy(this.cycle,this))};d.DEFAULTS={interval:5000,pause:"hover",wrap:true};d.prototype.cycle=function(a){a||(this.paused=false);this.interval&&clearInterval(this.interval);this.options.interval&&!this.paused&&(this.interval=setInterval(e.proxy(this.next,this),this.options.interval));return this};d.prototype.getActiveIndex=function(){this.$active=this.$element.find(".item.active");this.$items=this.$active.parent().children();return this.$items.index(this.$active)};d.prototype.to=function(c){var a=this;var b=this.getActiveIndex();if(c>(this.$items.length-1)||c<0){return}if(this.sliding){return this.$element.one("slid.bs.carousel",function(){a.to(c)})}if(b==c){return this.pause().cycle()}return this.slide(c>b?"next":"prev",e(this.$items[c]))};d.prototype.pause=function(a){a||(this.paused=true);if(this.$element.find(".next, .prev").length&&e.support.transition){this.$element.trigger(e.support.transition.end);this.cycle(true)}this.interval=clearInterval(this.interval);return this};d.prototype.next=function(){if(this.sliding){return}return this.slide("next")};d.prototype.prev=function(){if(this.sliding){return}return this.slide("prev")};d.prototype.slide=function(m,r){var b=this.$element.find(".item.active");var a=r||b[m]();var n=this.interval;var c=m=="next"?"left":"right";var q=m=="next"?"first":"last";var p=this;if(!a.length){if(!this.options.wrap){return}a=this.$element.find(".item")[q]()}if(a.hasClass("active")){return this.sliding=false}var o=e.Event("slide.bs.carousel",{relatedTarget:a[0],direction:c});this.$element.trigger(o);if(o.isDefaultPrevented()){return}this.sliding=true;n&&this.pause();if(this.$indicators.length){this.$indicators.find(".active").removeClass("active");this.$element.one("slid.bs.carousel",function(){var g=e(p.$indicators.children()[p.getActiveIndex()]);g&&g.addClass("active")})}if(e.support.transition&&this.$element.hasClass("slide")){a.addClass(m);a[0].offsetWidth;b.addClass(c);a.addClass(c);b.one(e.support.transition.end,function(){a.removeClass([m,c].join(" ")).addClass("active");b.removeClass(["active",c].join(" "));p.sliding=false;setTimeout(function(){p.$element.trigger("slid.bs.carousel")},0)}).emulateTransitionEnd(b.css("transition-duration").slice(0,-1)*1000)}else{b.removeClass("active");a.addClass("active");this.sliding=false;this.$element.trigger("slid.bs.carousel")}n&&this.cycle();return this};var f=e.fn.carousel;e.fn.carousel=function(a){return this.each(function(){var i=e(this);var j=i.data("bs.carousel");var c=e.extend({},d.DEFAULTS,i.data(),typeof a=="object"&&a);var b=typeof a=="string"?a:c.slide;if(!j){i.data("bs.carousel",(j=new d(this,c)))}if(typeof a=="number"){j.to(a)}else{if(b){j[b]()}else{if(c.interval){j.pause().cycle()}}}})};e.fn.carousel.Constructor=d;e.fn.carousel.noConflict=function(){e.fn.carousel=f;return this};e(document).on("click.bs.carousel.data-api","[data-slide], [data-slide-to]",function(a){var c=e(this),b;var j=e(c.attr("data-target")||(b=c.attr("href"))&&b.replace(/.*(?=#[^\s]+$)/,""));var l=e.extend({},j.data(),c.data());var k=c.attr("data-slide-to");if(k){l.interval=false}j.carousel(l);if(k=c.attr("data-slide-to")){j.data("bs.carousel").to(k)}a.preventDefault()});e(window).on("load",function(){e('[data-ride="carousel"]').each(function(){var a=e(this);a.carousel(a.data())})})}(jQuery);+function(e){var d=function(a,b){this.$element=e(a);this.options=e.extend({},d.DEFAULTS,b);this.transitioning=null;if(this.options.parent){this.$parent=e(this.options.parent)}if(this.options.toggle){this.toggle()}};d.DEFAULTS={toggle:true};d.prototype.dimension=function(){var a=this.$element.hasClass("width");return a?"width":"height"};d.prototype.show=function(){if(this.transitioning||this.$element.hasClass("in")){return}var a=e.Event("show.bs.collapse");this.$element.trigger(a);if(a.isDefaultPrevented()){return}var j=this.$parent&&this.$parent.find("> .panel > .in");if(j&&j.length){var l=j.data("bs.collapse");if(l&&l.transitioning){return}j.collapse("hide");l||j.data("bs.collapse",null)}var b=this.dimension();this.$element.removeClass("collapse").addClass("collapsing")[b](0);this.transitioning=1;var c=function(){this.$element.removeClass("collapsing").addClass("collapse in")[b]("auto");this.transitioning=0;this.$element.trigger("shown.bs.collapse")};if(!e.support.transition){return c.call(this)}var k=e.camelCase(["scroll",b].join("-"));this.$element.one(e.support.transition.end,e.proxy(c,this)).emulateTransitionEnd(350)[b](this.$element[0][k])};d.prototype.hide=function(){if(this.transitioning||!this.$element.hasClass("in")){return}var a=e.Event("hide.bs.collapse");this.$element.trigger(a);if(a.isDefaultPrevented()){return}var c=this.dimension();this.$element[c](this.$element[c]())[0].offsetHeight;this.$element.addClass("collapsing").removeClass("collapse").removeClass("in");this.transitioning=1;var b=function(){this.transitioning=0;this.$element.trigger("hidden.bs.collapse").removeClass("collapsing").addClass("collapse")};if(!e.support.transition){return b.call(this)}this.$element[c](0).one(e.support.transition.end,e.proxy(b,this)).emulateTransitionEnd(350)};d.prototype.toggle=function(){this[this.$element.hasClass("in")?"hide":"show"]()};var f=e.fn.collapse;e.fn.collapse=function(a){return this.each(function(){var c=e(this);var h=c.data("bs.collapse");var b=e.extend({},d.DEFAULTS,c.data(),typeof a=="object"&&a);if(!h&&b.toggle&&a=="show"){a=!a}if(!h){c.data("bs.collapse",(h=new d(this,b)))}if(typeof a=="string"){h[a]()}})};e.fn.collapse.Constructor=d;e.fn.collapse.noConflict=function(){e.fn.collapse=f;return this};e(document).on("click.bs.collapse.data-api","[data-toggle=collapse]",function(n){var c=e(this),a;var m=c.attr("data-target")||n.preventDefault()||(a=c.attr("href"))&&a.replace(/.*(?=#[^\s]+$)/,"");var r=e(m);var p=r.data("bs.collapse");var o=p?"toggle":c.data();var b=c.attr("data-parent");var q=b&&e(b);if(!p||!p.transitioning){if(q){q.find('[data-toggle=collapse][data-parent="'+b+'"]').not(c).addClass("collapsed")}c[r.hasClass("in")?"addClass":"removeClass"]("collapsed")}r.collapse(o)})}(jQuery);+function(i){var k=".dropdown-backdrop";var n="[data-toggle=dropdown]";var h=function(a){i(a).on("click.bs.dropdown",this.toggle)};h.prototype.toggle=function(b){var c=i(this);if(c.is(".disabled, :disabled")){return}var d=j(c);var e=d.hasClass("open");l();if(!e){if("ontouchstart" in document.documentElement&&!d.closest(".navbar-nav").length){i('<div class="dropdown-backdrop"/>').insertAfter(i(this)).on("click",l)}var a={relatedTarget:this};d.trigger(b=i.Event("show.bs.dropdown",a));if(b.isDefaultPrevented()){return}d.toggleClass("open").trigger("shown.bs.dropdown",a);c.focus()}return false};h.prototype.keydown=function(c){if(!/(38|40|27)/.test(c.keyCode)){return}var d=i(this);c.preventDefault();c.stopPropagation();if(d.is(".disabled, :disabled")){return}var e=j(d);var f=e.hasClass("open");if(!f||(f&&c.keyCode==27)){if(c.which==27){e.find(n).focus()}return d.click()}var b=" li:not(.divider):visible a";var a=e.find("[role=menu]"+b+", [role=listbox]"+b);if(!a.length){return}var g=a.index(a.filter(":focus"));if(c.keyCode==38&&g>0){g--}if(c.keyCode==40&&g<a.length-1){g++}if(!~g){g=0}a.eq(g).focus()};function l(a){i(k).remove();i(n).each(function(){var b=j(i(this));var c={relatedTarget:this};if(!b.hasClass("open")){return}b.trigger(a=i.Event("hide.bs.dropdown",c));if(a.isDefaultPrevented()){return}b.removeClass("open").trigger("hidden.bs.dropdown",c)})}function j(c){var b=c.attr("data-target");if(!b){b=c.attr("href");b=b&&/#[A-Za-z]/.test(b)&&b.replace(/.*(?=#[^\s]*$)/,"")}var a=b&&i(b);return a&&a.length?a:c.parent()}var m=i.fn.dropdown;i.fn.dropdown=function(a){return this.each(function(){var b=i(this);var c=b.data("bs.dropdown");if(!c){b.data("bs.dropdown",(c=new h(this)))}if(typeof a=="string"){c[a].call(b)}})};i.fn.dropdown.Constructor=h;i.fn.dropdown.noConflict=function(){i.fn.dropdown=m;return this};i(document).on("click.bs.dropdown.data-api",l).on("click.bs.dropdown.data-api",".dropdown form",function(a){a.stopPropagation()}).on("click.bs.dropdown.data-api",n,h.prototype.toggle).on("keydown.bs.dropdown.data-api",n+", [role=menu], [role=listbox]",h.prototype.keydown)}(jQuery);+function(d){var e=function(a,b){this.options=b;this.$element=d(a);this.$backdrop=this.isShown=null;if(this.options.remote){this.$element.find(".modal-content").load(this.options.remote,d.proxy(function(){this.$element.trigger("loaded.bs.modal")},this))}};e.DEFAULTS={backdrop:true,keyboard:true,show:true};e.prototype.toggle=function(a){return this[!this.isShown?"show":"hide"](a)};e.prototype.show=function(c){var b=this;var a=d.Event("show.bs.modal",{relatedTarget:c});this.$element.trigger(a);if(this.isShown||a.isDefaultPrevented()){return}this.isShown=true;this.escape();this.$element.on("click.dismiss.bs.modal",'[data-dismiss="modal"]',d.proxy(this.hide,this));this.backdrop(function(){var g=d.support.transition&&b.$element.hasClass("fade");if(!b.$element.parent().length){b.$element.appendTo(document.body)}b.$element.show().scrollTop(0);if(g){b.$element[0].offsetWidth}b.$element.addClass("in").attr("aria-hidden",false);b.enforceFocus();var j=d.Event("shown.bs.modal",{relatedTarget:c});g?b.$element.find(".modal-dialog").one(d.support.transition.end,function(){b.$element.focus().trigger(j)}).emulateTransitionEnd(300):b.$element.focus().trigger(j)})};e.prototype.hide=function(a){if(a){a.preventDefault()}a=d.Event("hide.bs.modal");this.$element.trigger(a);if(!this.isShown||a.isDefaultPrevented()){return}this.isShown=false;this.escape();d(document).off("focusin.bs.modal");this.$element.removeClass("in").attr("aria-hidden",true).off("click.dismiss.bs.modal");d.support.transition&&this.$element.hasClass("fade")?this.$element.one(d.support.transition.end,d.proxy(this.hideModal,this)).emulateTransitionEnd(300):this.hideModal()};e.prototype.enforceFocus=function(){d(document).off("focusin.bs.modal").on("focusin.bs.modal",d.proxy(function(a){if(this.$element[0]!==a.target&&!this.$element.has(a.target).length){this.$element.focus()}},this))};e.prototype.escape=function(){if(this.isShown&&this.options.keyboard){this.$element.on("keyup.dismiss.bs.modal",d.proxy(function(a){a.which==27&&this.hide()},this))}else{if(!this.isShown){this.$element.off("keyup.dismiss.bs.modal")}}};e.prototype.hideModal=function(){var a=this;this.$element.hide();this.backdrop(function(){a.removeBackdrop();a.$element.trigger("hidden.bs.modal")})};e.prototype.removeBackdrop=function(){this.$backdrop&&this.$backdrop.remove();this.$backdrop=null};e.prototype.backdrop=function(c){var a=this.$element.hasClass("fade")?"fade":"";if(this.isShown&&this.options.backdrop){var b=d.support.transition&&a;this.$backdrop=d('<div class="modal-backdrop '+a+'" />').appendTo(document.body);this.$element.on("click.dismiss.bs.modal",d.proxy(function(h){if(h.target!==h.currentTarget){return}this.options.backdrop=="static"?this.$element[0].focus.call(this.$element[0]):this.hide.call(this)},this));if(b){this.$backdrop[0].offsetWidth}this.$backdrop.addClass("in");if(!c){return}b?this.$backdrop.one(d.support.transition.end,c).emulateTransitionEnd(150):c()}else{if(!this.isShown&&this.$backdrop){this.$backdrop.removeClass("in");d.support.transition&&this.$element.hasClass("fade")?this.$backdrop.one(d.support.transition.end,c).emulateTransitionEnd(150):c()}else{if(c){c()}}}};var f=d.fn.modal;d.fn.modal=function(b,a){return this.each(function(){var c=d(this);var i=c.data("bs.modal");var j=d.extend({},e.DEFAULTS,c.data(),typeof b=="object"&&b);if(!i){c.data("bs.modal",(i=new e(this,j)))}if(typeof b=="string"){i[b](a)}else{if(j.show){i.show(a)}}})};d.fn.modal.Constructor=e;d.fn.modal.noConflict=function(){d.fn.modal=f;return this};d(document).on("click.bs.modal.data-api",'[data-toggle="modal"]',function(b){var c=d(this);var j=c.attr("href");var a=d(c.attr("data-target")||(j&&j.replace(/.*(?=#[^\s]+$)/,"")));var i=a.data("bs.modal")?"toggle":d.extend({remote:!/#/.test(j)&&j},a.data(),c.data());if(c.is("a")){b.preventDefault()}a.modal(i,this).one("hide",function(){c.is(":visible")&&c.focus()})});d(document).on("show.bs.modal",".modal",function(){d(document.body).addClass("modal-open")}).on("hidden.bs.modal",".modal",function(){d(document.body).removeClass("modal-open")})}(jQuery);+function(d){var e=function(a,b){this.type=this.options=this.enabled=this.timeout=this.hoverState=this.$element=null;this.init("tooltip",a,b)};e.DEFAULTS={animation:true,placement:"top",selector:false,template:'<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:false,container:false};e.prototype.init=function(c,o,n){this.enabled=true;this.type=c;this.$element=d(o);this.options=this.getOptions(n);var p=this.options.trigger.split(" ");for(var i=p.length;i--;){var a=p[i];if(a=="click"){this.$element.on("click."+this.type,this.options.selector,d.proxy(this.toggle,this))}else{if(a!="manual"){var b=a=="hover"?"mouseenter":"focusin";var m=a=="hover"?"mouseleave":"focusout";this.$element.on(b+"."+this.type,this.options.selector,d.proxy(this.enter,this));this.$element.on(m+"."+this.type,this.options.selector,d.proxy(this.leave,this))}}}this.options.selector?(this._options=d.extend({},this.options,{trigger:"manual",selector:""})):this.fixTitle()};e.prototype.getDefaults=function(){return e.DEFAULTS};e.prototype.getOptions=function(a){a=d.extend({},this.getDefaults(),this.$element.data(),a);if(a.delay&&typeof a.delay=="number"){a.delay={show:a.delay,hide:a.delay}}return a};e.prototype.getDelegateOptions=function(){var b={};var a=this.getDefaults();this._options&&d.each(this._options,function(h,c){if(a[h]!=c){b[h]=c}});return b};e.prototype.enter=function(a){var b=a instanceof this.constructor?a:d(a.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type);clearTimeout(b.timeout);b.hoverState="in";if(!b.options.delay||!b.options.delay.show){return b.show()}b.timeout=setTimeout(function(){if(b.hoverState=="in"){b.show()}},b.options.delay.show)};e.prototype.leave=function(a){var b=a instanceof this.constructor?a:d(a.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type);clearTimeout(b.timeout);b.hoverState="out";if(!b.options.delay||!b.options.delay.hide){return b.hide()}b.timeout=setTimeout(function(){if(b.hoverState=="out"){b.hide()}},b.options.delay.hide)};e.prototype.show=function(){var D=d.Event("show.bs."+this.type);if(this.hasContent()&&this.enabled){this.$element.trigger(D);if(D.isDefaultPrevented()){return}var y=this;var C=this.tip();this.setContent();if(this.options.animation){C.addClass("fade")}var E=typeof this.options.placement=="function"?this.options.placement.call(this,C[0],this.$element[0]):this.options.placement;var A=/\s?auto?\s?/i;var w=A.test(E);if(w){E=E.replace(A,"")||"top"}C.detach().css({top:0,left:0,display:"block"}).addClass(E);this.options.container?C.appendTo(this.options.container):C.insertAfter(this.$element);var z=this.getPosition();var c=C[0].offsetWidth;var v=C[0].offsetHeight;if(w){var F=this.$element.parent();var G=E;var x=document.documentElement.scrollTop||document.body.scrollTop;var a=this.options.container=="body"?window.innerWidth:F.outerWidth();var u=this.options.container=="body"?window.innerHeight:F.outerHeight();var B=this.options.container=="body"?0:F.offset().left;E=E=="bottom"&&z.top+z.height+v-x>u?"top":E=="top"&&z.top-x-v<0?"bottom":E=="right"&&z.right+c>a?"left":E=="left"&&z.left-c<B?"right":E;C.removeClass(G).addClass(E)}var H=this.getCalculatedOffset(E,z,c,v);this.applyPlacement(H,E);this.hoverState=null;var b=function(){y.$element.trigger("shown.bs."+y.type)};d.support.transition&&this.$tip.hasClass("fade")?C.one(d.support.transition.end,b).emulateTransitionEnd(150):b()}};e.prototype.applyPlacement=function(c,b){var p;var a=this.tip();var q=a[0].offsetWidth;var t=a[0].offsetHeight;var r=parseInt(a.css("margin-top"),10);var o=parseInt(a.css("margin-left"),10);if(isNaN(r)){r=0}if(isNaN(o)){o=0}c.top=c.top+r;c.left=c.left+o;d.offset.setOffset(a[0],d.extend({using:function(g){a.css({top:Math.round(g.top),left:Math.round(g.left)})}},c),0);a.addClass("in");var s=a[0].offsetWidth;var v=a[0].offsetHeight;if(b=="top"&&v!=t){p=true;c.top=c.top+t-v}if(/bottom|top/.test(b)){var u=0;if(c.left<0){u=c.left*-2;c.left=0;a.offset(c);s=a[0].offsetWidth;v=a[0].offsetHeight}this.replaceArrow(u-q+s,s,"left")}else{this.replaceArrow(v-t,v,"top")}if(p){a.offset(c)}};e.prototype.replaceArrow=function(c,a,b){this.arrow().css(b,c?(50*(1-c/a)+"%"):"")};e.prototype.setContent=function(){var a=this.tip();var b=this.getTitle();a.find(".tooltip-inner")[this.options.html?"html":"text"](b);a.removeClass("fade in top bottom left right")};e.prototype.hide=function(){var c=this;var a=this.tip();var b=d.Event("hide.bs."+this.type);function h(){if(c.hoverState!="in"){a.detach()}c.$element.trigger("hidden.bs."+c.type)}this.$element.trigger(b);if(b.isDefaultPrevented()){return}a.removeClass("in");d.support.transition&&this.$tip.hasClass("fade")?a.one(d.support.transition.end,h).emulateTransitionEnd(150):h();this.hoverState=null;return this};e.prototype.fixTitle=function(){var a=this.$element;if(a.attr("title")||typeof(a.attr("data-original-title"))!="string"){a.attr("data-original-title",a.attr("title")||"").attr("title","")}};e.prototype.hasContent=function(){return this.getTitle()};e.prototype.getPosition=function(){var a=this.$element[0];return d.extend({},(typeof a.getBoundingClientRect=="function")?a.getBoundingClientRect():{width:a.offsetWidth,height:a.offsetHeight},this.$element.offset())};e.prototype.getCalculatedOffset=function(h,a,c,b){return h=="bottom"?{top:a.top+a.height,left:a.left+a.width/2-c/2}:h=="top"?{top:a.top-b,left:a.left+a.width/2-c/2}:h=="left"?{top:a.top+a.height/2-b/2,left:a.left-c}:{top:a.top+a.height/2-b/2,left:a.left+a.width}};e.prototype.getTitle=function(){var c;var b=this.$element;var a=this.options;c=b.attr("data-original-title")||(typeof a.title=="function"?a.title.call(b[0]):a.title);return c};e.prototype.tip=function(){return this.$tip=this.$tip||d(this.options.template)};e.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".tooltip-arrow")};e.prototype.validate=function(){if(!this.$element[0].parentNode){this.hide();this.$element=null;this.options=null}};e.prototype.enable=function(){this.enabled=true};e.prototype.disable=function(){this.enabled=false};e.prototype.toggleEnabled=function(){this.enabled=!this.enabled};e.prototype.toggle=function(a){var b=a?d(a.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type):this;b.tip().hasClass("in")?b.leave(b):b.enter(b)};e.prototype.destroy=function(){clearTimeout(this.timeout);this.hide().$element.off("."+this.type).removeData("bs."+this.type)};var f=d.fn.tooltip;d.fn.tooltip=function(a){return this.each(function(){var c=d(this);var h=c.data("bs.tooltip");var b=typeof a=="object"&&a;if(!h&&a=="destroy"){return}if(!h){c.data("bs.tooltip",(h=new e(this,b)))}if(typeof a=="string"){h[a]()}})};d.fn.tooltip.Constructor=e;d.fn.tooltip.noConflict=function(){d.fn.tooltip=f;return this}}(jQuery);+function(d){var e=function(a,b){this.init("popover",a,b)};if(!d.fn.tooltip){throw new Error("Popover requires tooltip.js")}e.DEFAULTS=d.extend({},d.fn.tooltip.Constructor.DEFAULTS,{placement:"right",trigger:"click",content:"",template:'<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'});e.prototype=d.extend({},d.fn.tooltip.Constructor.prototype);e.prototype.constructor=e;e.prototype.getDefaults=function(){return e.DEFAULTS};e.prototype.setContent=function(){var c=this.tip();var a=this.getTitle();var b=this.getContent();c.find(".popover-title")[this.options.html?"html":"text"](a);c.find(".popover-content")[this.options.html?(typeof b=="string"?"html":"append"):"text"](b);c.removeClass("fade top bottom left right in");if(!c.find(".popover-title").html()){c.find(".popover-title").hide()}};e.prototype.hasContent=function(){return this.getTitle()||this.getContent()};e.prototype.getContent=function(){var b=this.$element;var a=this.options;return b.attr("data-content")||(typeof a.content=="function"?a.content.call(b[0]):a.content)};e.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".arrow")};e.prototype.tip=function(){if(!this.$tip){this.$tip=d(this.options.template)}return this.$tip};var f=d.fn.popover;d.fn.popover=function(a){return this.each(function(){var c=d(this);var h=c.data("bs.popover");var b=typeof a=="object"&&a;if(!h&&a=="destroy"){return}if(!h){c.data("bs.popover",(h=new e(this,b)))}if(typeof a=="string"){h[a]()}})};d.fn.popover.Constructor=e;d.fn.popover.noConflict=function(){d.fn.popover=f;return this}}(jQuery);+function(d){function e(b,c){var h;var a=d.proxy(this.process,this);this.$element=d(b).is("body")?d(window):d(b);this.$body=d("body");this.$scrollElement=this.$element.on("scroll.bs.scroll-spy.data-api",a);this.options=d.extend({},e.DEFAULTS,c);this.selector=(this.options.target||((h=d(b).attr("href"))&&h.replace(/.*(?=#[^\s]+$)/,""))||"")+" .nav li > a";this.offsets=d([]);this.targets=d([]);this.activeTarget=null;this.refresh();this.process()}e.DEFAULTS={offset:10};e.prototype.refresh=function(){var b=this.$element[0]==window?"offset":"position";this.offsets=d([]);this.targets=d([]);var a=this;var c=this.$body.find(this.selector).map(function(){var k=d(this);var l=k.data("target")||k.attr("href");var j=/^#./.test(l)&&d(l);return(j&&j.length&&j.is(":visible")&&[[j[b]().top+(!d.isWindow(a.$scrollElement.get(0))&&a.$scrollElement.scrollTop()),l]])||null}).sort(function(i,j){return i[0]-j[0]}).each(function(){a.offsets.push(this[0]);a.targets.push(this[1])})};e.prototype.process=function(){var m=this.$scrollElement.scrollTop()+this.options.offset;var c=this.$scrollElement[0].scrollHeight||this.$body[0].scrollHeight;var i=c-this.$scrollElement.height();var a=this.offsets;var n=this.targets;var l=this.activeTarget;var b;if(m>=i){return l!=(b=n.last()[0])&&this.activate(b)}if(l&&m<=a[0]){return l!=(b=n[0])&&this.activate(b)}for(b=a.length;b--;){l!=n[b]&&m>=a[b]&&(!a[b+1]||m<=a[b+1])&&this.activate(n[b])}};e.prototype.activate=function(c){this.activeTarget=c;d(this.selector).parentsUntil(this.options.target,".active").removeClass("active");var b=this.selector+'[data-target="'+c+'"],'+this.selector+'[href="'+c+'"]';var a=d(b).parents("li").addClass("active");if(a.parent(".dropdown-menu").length){a=a.closest("li.dropdown").addClass("active")}a.trigger("activate.bs.scrollspy")};var f=d.fn.scrollspy;d.fn.scrollspy=function(a){return this.each(function(){var c=d(this);var h=c.data("bs.scrollspy");var b=typeof a=="object"&&a;if(!h){c.data("bs.scrollspy",(h=new e(this,b)))}if(typeof a=="string"){h[a]()}})};d.fn.scrollspy.Constructor=e;d.fn.scrollspy.noConflict=function(){d.fn.scrollspy=f;return this};d(window).on("load",function(){d('[data-spy="scroll"]').each(function(){var a=d(this);a.scrollspy(a.data())})})}(jQuery);+function(d){var e=function(a){this.element=d(a)};e.prototype.show=function(){var a=this.element;var l=a.closest("ul:not(.dropdown-menu)");var b=a.data("target");if(!b){b=a.attr("href");b=b&&b.replace(/.*(?=#[^\s]*$)/,"")}if(a.parent("li").hasClass("active")){return}var j=l.find(".active:last a")[0];var c=d.Event("show.bs.tab",{relatedTarget:j});a.trigger(c);if(c.isDefaultPrevented()){return}var k=d(b);this.activate(a.parent("li"),l);this.activate(k,k.parent(),function(){a.trigger({type:"shown.bs.tab",relatedTarget:j})})};e.prototype.activate=function(l,a,b){var c=a.find("> .active");var j=b&&d.support.transition&&c.hasClass("fade");function k(){c.removeClass("active").find("> .dropdown-menu > .active").removeClass("active");l.addClass("active");if(j){l[0].offsetWidth;l.addClass("in")}else{l.removeClass("fade")}if(l.parent(".dropdown-menu")){l.closest("li.dropdown").addClass("active")}b&&b()}j?c.one(d.support.transition.end,k).emulateTransitionEnd(150):k();c.removeClass("in")};var f=d.fn.tab;d.fn.tab=function(a){return this.each(function(){var b=d(this);var c=b.data("bs.tab");if(!c){b.data("bs.tab",(c=new e(this)))}if(typeof a=="string"){c[a]()}})};d.fn.tab.Constructor=e;d.fn.tab.noConflict=function(){d.fn.tab=f;return this};d(document).on("click.bs.tab.data-api",'[data-toggle="tab"], [data-toggle="pill"]',function(a){a.preventDefault();d(this).tab("show")})}(jQuery);+function(d){var e=function(a,b){this.options=d.extend({},e.DEFAULTS,b);this.$window=d(window).on("scroll.bs.affix.data-api",d.proxy(this.checkPosition,this)).on("click.bs.affix.data-api",d.proxy(this.checkPositionWithEventLoop,this));this.$element=d(a);this.affixed=this.unpin=this.pinnedOffset=null;this.checkPosition()};e.RESET="affix affix-top affix-bottom";e.DEFAULTS={offset:0};e.prototype.getPinnedOffset=function(){if(this.pinnedOffset){return this.pinnedOffset}this.$element.removeClass(e.RESET).addClass("affix");var a=this.$window.scrollTop();var b=this.$element.offset();return(this.pinnedOffset=b.top-a)};e.prototype.checkPositionWithEventLoop=function(){setTimeout(d.proxy(this.checkPosition,this),1)};e.prototype.checkPosition=function(){if(!this.$element.is(":visible")){return}var b=d(document).height();var a=this.$window.scrollTop();var n=this.$element.offset();var p=this.options.offset;var r=p.top;var q=p.bottom;if(this.affixed=="top"){n.top+=a}if(typeof p!="object"){q=r=p}if(typeof r=="function"){r=p.top(this.$element)}if(typeof q=="function"){q=p.bottom(this.$element)}var o=this.unpin!=null&&(a+this.unpin<=n.top)?false:q!=null&&(n.top+this.$element.height()>=b-q)?"bottom":r!=null&&(a<=r)?"top":false;if(this.affixed===o){return}if(this.unpin){this.$element.css("top","")}var c="affix"+(o?"-"+o:"");var m=d.Event(c+".bs.affix");this.$element.trigger(m);if(m.isDefaultPrevented()){return}this.affixed=o;this.unpin=o=="bottom"?this.getPinnedOffset():null;this.$element.removeClass(e.RESET).addClass(c).trigger(d.Event(c.replace("affix","affixed")));if(o=="bottom"){this.$element.offset({top:b-q-this.$element.height()})}};var f=d.fn.affix;d.fn.affix=function(a){return this.each(function(){var c=d(this);var h=c.data("bs.affix");var b=typeof a=="object"&&a;if(!h){c.data("bs.affix",(h=new e(this,b)))}if(typeof a=="string"){h[a]()}})};d.fn.affix.Constructor=e;d.fn.affix.noConflict=function(){d.fn.affix=f;return this};d(window).on("load",function(){d('[data-spy="affix"]').each(function(){var a=d(this);var b=a.data();b.offset=b.offset||{};if(b.offsetBottom){b.offset.bottom=b.offsetBottom}if(b.offsetTop){b.offset.top=b.offsetTop}a.affix(b)})})}(jQuery);(function(b){b.flexslider=function(D,z){var y=b(D);y.vars=b.extend({},b.flexslider.defaults,z);var x=y.vars.namespace,E=window.navigator&&window.navigator.msPointerEnabled&&window.MSGesture,w=(("ontouchstart" in window)||E||window.DocumentTouch&&document instanceof DocumentTouch)&&y.vars.touch,r="click touchend MSPointerUp",a="",s,A=y.vars.direction==="vertical",v=y.vars.reverse,F=(y.vars.itemWidth>0),B=y.vars.animation==="fade",u=y.vars.asNavFor!=="",C={},t=true;b.data(D,"flexslider",y);C={init:function(){y.animating=false;y.currentSlide=parseInt((y.vars.startAt?y.vars.startAt:0),10);if(isNaN(y.currentSlide)){y.currentSlide=0}y.animatingTo=y.currentSlide;y.atEnd=(y.currentSlide===0||y.currentSlide===y.last);y.containerSelector=y.vars.selector.substr(0,y.vars.selector.search(" "));y.slides=b(y.vars.selector,y);y.container=b(y.containerSelector,y);y.count=y.slides.length;y.syncExists=b(y.vars.sync).length>0;if(y.vars.animation==="slide"){y.vars.animation="swing"}y.prop=(A)?"top":"marginLeft";y.args={};y.manualPause=false;y.stopped=false;y.started=false;y.startTimeout=null;y.transitions=!y.vars.video&&!B&&y.vars.useCSS&&(function(){var c=document.createElement("div"),d=["perspectiveProperty","WebkitPerspective","MozPerspective","OPerspective","msPerspective"];for(var e in d){if(c.style[d[e]]!==undefined){y.pfx=d[e].replace("Perspective","").toLowerCase();y.prop="-"+y.pfx+"-transform";return true}}return false}());y.ensureAnimationEnd="";if(y.vars.controlsContainer!==""){y.controlsContainer=b(y.vars.controlsContainer).length>0&&b(y.vars.controlsContainer)}if(y.vars.manualControls!==""){y.manualControls=b(y.vars.manualControls).length>0&&b(y.vars.manualControls)}if(y.vars.randomize){y.slides.sort(function(){return(Math.round(Math.random())-0.5)});y.container.empty().append(y.slides)}y.doMath();y.setup("init");if(y.vars.controlNav){C.controlNav.setup()}if(y.vars.directionNav){C.directionNav.setup()}if(y.vars.keyboard&&(b(y.containerSelector).length===1||y.vars.multipleKeyboard)){b(document).bind("keyup",function(d){var e=d.keyCode;if(!y.animating&&(e===39||e===37)){var c=(e===39)?y.getTarget("next"):(e===37)?y.getTarget("prev"):false;y.flexAnimate(c,y.vars.pauseOnAction)}})}if(y.vars.mousewheel){y.bind("mousewheel",function(e,c,f,g){e.preventDefault();var d=(c<0)?y.getTarget("next"):y.getTarget("prev");y.flexAnimate(d,y.vars.pauseOnAction)})}if(y.vars.pausePlay){C.pausePlay.setup()}if(y.vars.slideshow&&y.vars.pauseInvisible){C.pauseInvisible.init()}if(y.vars.slideshow){if(y.vars.pauseOnHover){y.hover(function(){if(!y.manualPlay&&!y.manualPause){y.pause()}},function(){if(!y.manualPause&&!y.manualPlay&&!y.stopped){y.play()}})}if(!y.vars.pauseInvisible||!C.pauseInvisible.isHidden()){(y.vars.initDelay>0)?y.startTimeout=setTimeout(y.play,y.vars.initDelay):y.play()}}if(u){C.asNav.setup()}if(w&&y.vars.touch){C.touch()}if(!B||(B&&y.vars.smoothHeight)){b(window).bind("resize orientationchange focus",C.resize)}y.find("img").attr("draggable","false");setTimeout(function(){y.vars.start(y)},200)},asNav:{setup:function(){y.asNav=true;y.animatingTo=Math.floor(y.currentSlide/y.move);y.currentItem=y.currentSlide;y.slides.removeClass(x+"active-slide").eq(y.currentItem).addClass(x+"active-slide");if(!E){y.slides.on(r,function(d){d.preventDefault();var e=b(this),f=e.index();var c=e.offset().left-b(y).scrollLeft();if(c<=0&&e.hasClass(x+"active-slide")){y.flexAnimate(y.getTarget("prev"),true)}else{if(!b(y.vars.asNavFor).data("flexslider").animating&&!e.hasClass(x+"active-slide")){y.direction=(y.currentItem<f)?"next":"prev";y.flexAnimate(f,y.vars.pauseOnAction,false,true,true)}}})}else{D._slider=y;y.slides.each(function(){var c=this;c._gesture=new MSGesture();c._gesture.target=c;c.addEventListener("MSPointerDown",function(d){d.preventDefault();if(d.currentTarget._gesture){d.currentTarget._gesture.addPointer(d.pointerId)}},false);c.addEventListener("MSGestureTap",function(d){d.preventDefault();var e=b(this),f=e.index();if(!b(y.vars.asNavFor).data("flexslider").animating&&!e.hasClass("active")){y.direction=(y.currentItem<f)?"next":"prev";y.flexAnimate(f,y.vars.pauseOnAction,false,true,true)}})})}}},controlNav:{setup:function(){if(!y.manualControls){C.controlNav.setupPaging()}else{C.controlNav.setupManual()}},setupPaging:function(){var e=(y.vars.controlNav==="thumbnails")?"control-thumbs":"control-paging",g=1,d,h;y.controlNavScaffold=b('<ol class="'+x+"control-nav "+x+e+'"></ol>');if(y.pagingCount>1){for(var f=0;f<y.pagingCount;f++){h=y.slides.eq(f);d=(y.vars.controlNav==="thumbnails")?'<img src="'+h.attr("data-thumb")+'"/>':"<a>"+g+"</a>";if("thumbnails"===y.vars.controlNav&&true===y.vars.thumbCaptions){var c=h.attr("data-thumbcaption");if(""!=c&&undefined!=c){d+='<span class="'+x+'caption">'+c+"</span>"}}y.controlNavScaffold.append("<li>"+d+"</li>");g++}}(y.controlsContainer)?b(y.controlsContainer).append(y.controlNavScaffold):y.append(y.controlNavScaffold);C.controlNav.set();C.controlNav.active();y.controlNavScaffold.delegate("a, img",r,function(k){k.preventDefault();if(a===""||a===k.type){var i=b(this),j=y.controlNav.index(i);if(!i.hasClass(x+"active")){y.direction=(j>y.currentSlide)?"next":"prev";y.flexAnimate(j,y.vars.pauseOnAction)}}if(a===""){a=k.type}C.setToClearWatchedEvent()})},setupManual:function(){y.controlNav=y.manualControls;C.controlNav.active();y.controlNav.bind(r,function(e){e.preventDefault();if(a===""||a===e.type){var c=b(this),d=y.controlNav.index(c);if(!c.hasClass(x+"active")){(d>y.currentSlide)?y.direction="next":y.direction="prev";y.flexAnimate(d,y.vars.pauseOnAction)}}if(a===""){a=e.type}C.setToClearWatchedEvent()})},set:function(){var c=(y.vars.controlNav==="thumbnails")?"img":"a";y.controlNav=b("."+x+"control-nav li "+c,(y.controlsContainer)?y.controlsContainer:y)},active:function(){y.controlNav.removeClass(x+"active").eq(y.animatingTo).addClass(x+"active")},update:function(d,c){if(y.pagingCount>1&&d==="add"){y.controlNavScaffold.append(b("<li><a>"+y.count+"</a></li>"))}else{if(y.pagingCount===1){y.controlNavScaffold.find("li").remove()}else{y.controlNav.eq(c).closest("li").remove()}}C.controlNav.set();(y.pagingCount>1&&y.pagingCount!==y.controlNav.length)?y.update(c,d):C.controlNav.active()}},directionNav:{setup:function(){var c=b('<ul class="'+x+'direction-nav"><li><a class="'+x+'prev" href="#">'+y.vars.prevText+'</a></li><li><a class="'+x+'next" href="#">'+y.vars.nextText+"</a></li></ul>");if(y.controlsContainer){b(y.controlsContainer).append(c);y.directionNav=b("."+x+"direction-nav li a",y.controlsContainer)}else{y.append(c);y.directionNav=b("."+x+"direction-nav li a",y)}C.directionNav.update();y.directionNav.bind(r,function(e){e.preventDefault();var d;if(a===""||a===e.type){d=(b(this).hasClass(x+"next"))?y.getTarget("next"):y.getTarget("prev");y.flexAnimate(d,y.vars.pauseOnAction)}if(a===""){a=e.type}C.setToClearWatchedEvent()})},update:function(){var c=x+"disabled";if(y.pagingCount===1){y.directionNav.addClass(c).attr("tabindex","-1")}else{if(!y.vars.animationLoop){if(y.animatingTo===0){y.directionNav.removeClass(c).filter("."+x+"prev").addClass(c).attr("tabindex","-1")}else{if(y.animatingTo===y.last){y.directionNav.removeClass(c).filter("."+x+"next").addClass(c).attr("tabindex","-1")}else{y.directionNav.removeClass(c).removeAttr("tabindex")}}}else{y.directionNav.removeClass(c).removeAttr("tabindex")}}}},pausePlay:{setup:function(){var c=b('<div class="'+x+'pauseplay"><a></a></div>');if(y.controlsContainer){y.controlsContainer.append(c);y.pausePlay=b("."+x+"pauseplay a",y.controlsContainer)}else{y.append(c);y.pausePlay=b("."+x+"pauseplay a",y)}C.pausePlay.update((y.vars.slideshow)?x+"pause":x+"play");y.pausePlay.bind(r,function(d){d.preventDefault();if(a===""||a===d.type){if(b(this).hasClass(x+"pause")){y.manualPause=true;y.manualPlay=false;y.pause()}else{y.manualPause=false;y.manualPlay=true;y.play()}}if(a===""){a=d.type}C.setToClearWatchedEvent()})},update:function(c){(c==="play")?y.pausePlay.removeClass(x+"pause").addClass(x+"play").html(y.vars.playText):y.pausePlay.removeClass(x+"play").addClass(x+"pause").html(y.vars.pauseText)}},touch:function(){var H,f,h,m,k,l,d=false,n=0,c=0,i=0;if(!E){D.addEventListener("touchstart",g,false);function g(G){if(y.animating){G.preventDefault()}else{if((window.navigator.msPointerEnabled)||G.touches.length===1){y.pause();m=(A)?y.h:y.w;l=Number(new Date());n=G.touches[0].pageX;c=G.touches[0].pageY;h=(F&&v&&y.animatingTo===y.last)?0:(F&&v)?y.limit-(((y.itemW+y.vars.itemMargin)*y.move)*y.animatingTo):(F&&y.currentSlide===y.last)?y.limit:(F)?((y.itemW+y.vars.itemMargin)*y.move)*y.currentSlide:(v)?(y.last-y.currentSlide+y.cloneOffset)*m:(y.currentSlide+y.cloneOffset)*m;H=(A)?c:n;f=(A)?n:c;D.addEventListener("touchmove",p,false);D.addEventListener("touchend",q,false)}}}function p(J){n=J.touches[0].pageX;c=J.touches[0].pageY;k=(A)?H-c:H-n;d=(A)?(Math.abs(k)<Math.abs(n-f)):(Math.abs(k)<Math.abs(c-f));var G=500;if(!d||Number(new Date())-l>G){J.preventDefault();if(!B&&y.transitions){if(!y.vars.animationLoop){k=k/((y.currentSlide===0&&k<0||y.currentSlide===y.last&&k>0)?(Math.abs(k)/m+2):1)}y.setProps(h+k,"setTouch")}}}function q(G){D.removeEventListener("touchmove",p,false);if(y.animatingTo===y.currentSlide&&!d&&!(k===null)){var K=(v)?-k:k,L=(K>0)?y.getTarget("next"):y.getTarget("prev");if(y.canAdvance(L)&&(Number(new Date())-l<550&&Math.abs(K)>50||Math.abs(K)>m/2)){y.flexAnimate(L,y.vars.pauseOnAction)}else{if(!B){y.flexAnimate(y.currentSlide,y.vars.pauseOnAction,true)}}}D.removeEventListener("touchend",q,false);H=null;f=null;k=null;h=null}}else{D.style.msTouchAction="none";D._gesture=new MSGesture();D._gesture.target=D;D.addEventListener("MSPointerDown",o,false);D._slider=y;D.addEventListener("MSGestureChange",e,false);D.addEventListener("MSGestureEnd",j,false);function o(G){G.stopPropagation();if(y.animating){G.preventDefault()}else{y.pause();D._gesture.addPointer(G.pointerId);i=0;m=(A)?y.h:y.w;l=Number(new Date());h=(F&&v&&y.animatingTo===y.last)?0:(F&&v)?y.limit-(((y.itemW+y.vars.itemMargin)*y.move)*y.animatingTo):(F&&y.currentSlide===y.last)?y.limit:(F)?((y.itemW+y.vars.itemMargin)*y.move)*y.currentSlide:(v)?(y.last-y.currentSlide+y.cloneOffset)*m:(y.currentSlide+y.cloneOffset)*m}}function e(G){G.stopPropagation();var L=G.target._slider;if(!L){return}var M=-G.translationX,N=-G.translationY;i=i+((A)?N:M);k=i;d=(A)?(Math.abs(i)<Math.abs(-M)):(Math.abs(i)<Math.abs(-N));if(G.detail===G.MSGESTURE_FLAG_INERTIA){setImmediate(function(){D._gesture.stop()});return}if(!d||Number(new Date())-l>500){G.preventDefault();if(!B&&L.transitions){if(!L.vars.animationLoop){k=i/((L.currentSlide===0&&i<0||L.currentSlide===L.last&&i>0)?(Math.abs(i)/m+2):1)}L.setProps(h+k,"setTouch")}}}function j(G){G.stopPropagation();var N=G.target._slider;if(!N){return}if(N.animatingTo===N.currentSlide&&!d&&!(k===null)){var L=(v)?-k:k,M=(L>0)?N.getTarget("next"):N.getTarget("prev");if(N.canAdvance(M)&&(Number(new Date())-l<550&&Math.abs(L)>50||Math.abs(L)>m/2)){N.flexAnimate(M,N.vars.pauseOnAction)}else{if(!B){N.flexAnimate(N.currentSlide,N.vars.pauseOnAction,true)}}}H=null;f=null;k=null;h=null;i=0}}},resize:function(){if(!y.animating&&y.is(":visible")){if(!F){y.doMath()}if(B){C.smoothHeight()}else{if(F){y.slides.width(y.computedW);y.update(y.pagingCount);y.setProps()}else{if(A){y.viewport.height(y.h);y.setProps(y.h,"setTotal")}else{if(y.vars.smoothHeight){C.smoothHeight()}y.newSlides.width(y.computedW);y.setProps(y.computedW,"setTotal")}}}}},smoothHeight:function(d){if(!A||B){var c=(B)?y:y.viewport;(d)?c.animate({height:y.slides.eq(y.animatingTo).height()},d):c.height(y.slides.eq(y.animatingTo).height())}},sync:function(e){var c=b(y.vars.sync).data("flexslider"),d=y.animatingTo;switch(e){case"animate":c.flexAnimate(d,y.vars.pauseOnAction,false,true);break;case"play":if(!c.playing&&!c.asNav){c.play()}break;case"pause":c.pause();break}},uniqueID:function(c){c.find("[id]").each(function(){var d=b(this);d.attr("id",d.attr("id")+"_clone")});return c},pauseInvisible:{visProp:null,init:function(){var c=["webkit","moz","ms","o"];if("hidden" in document){return"hidden"}for(var d=0;d<c.length;d++){if((c[d]+"Hidden") in document){C.pauseInvisible.visProp=c[d]+"Hidden"}}if(C.pauseInvisible.visProp){var e=C.pauseInvisible.visProp.replace(/[H|h]idden/,"")+"visibilitychange";document.addEventListener(e,function(){if(C.pauseInvisible.isHidden()){if(y.startTimeout){clearTimeout(y.startTimeout)}else{y.pause()}}else{if(y.started){y.play()}else{(y.vars.initDelay>0)?setTimeout(y.play,y.vars.initDelay):y.play()}}})}},isHidden:function(){return document[C.pauseInvisible.visProp]||false}},setToClearWatchedEvent:function(){clearTimeout(s);s=setTimeout(function(){a=""},3000)}};y.flexAnimate=function(g,f,c,k,j){if(!y.vars.animationLoop&&g!==y.currentSlide){y.direction=(g>y.currentSlide)?"next":"prev"}if(u&&y.pagingCount===1){y.direction=(y.currentItem<g)?"next":"prev"}if(!y.animating&&(y.canAdvance(g,j)||c)&&y.is(":visible")){if(u&&k){var d=b(y.vars.asNavFor).data("flexslider");y.atEnd=g===0||g===y.count-1;d.flexAnimate(g,true,false,true,j);y.direction=(y.currentItem<g)?"next":"prev";d.direction=y.direction;if(Math.ceil((g+1)/y.visible)-1!==y.currentSlide&&g!==0){y.currentItem=g;y.slides.removeClass(x+"active-slide").eq(g).addClass(x+"active-slide");g=Math.floor(g/y.visible)}else{y.currentItem=g;y.slides.removeClass(x+"active-slide").eq(g).addClass(x+"active-slide");return false}}y.animating=true;y.animatingTo=g;if(f){y.pause()}y.vars.before(y);if(y.syncExists&&!j){C.sync("animate")}if(y.vars.controlNav){C.controlNav.active()}if(!F){y.slides.removeClass(x+"active-slide").eq(g).addClass(x+"active-slide")}y.atEnd=g===0||g===y.last;if(y.vars.directionNav){C.directionNav.update()}if(g===y.last){y.vars.end(y);if(!y.vars.animationLoop){y.pause()}}if(!B){var h=(A)?y.slides.filter(":first").height():y.computedW,i,l,e;if(F){i=y.vars.itemMargin;e=((y.itemW+i)*y.move)*y.animatingTo;l=(e>y.limit&&y.visible!==1)?y.limit:e}else{if(y.currentSlide===0&&g===y.count-1&&y.vars.animationLoop&&y.direction!=="next"){l=(v)?(y.count+y.cloneOffset)*h:0}else{if(y.currentSlide===y.last&&g===0&&y.vars.animationLoop&&y.direction!=="prev"){l=(v)?0:(y.count+1)*h}else{l=(v)?((y.count-1)-g+y.cloneOffset)*h:(g+y.cloneOffset)*h}}}y.setProps(l,"",y.vars.animationSpeed);if(y.transitions){if(!y.vars.animationLoop||!y.atEnd){y.animating=false;y.currentSlide=y.animatingTo}y.container.unbind("webkitTransitionEnd transitionend");y.container.bind("webkitTransitionEnd transitionend",function(){clearTimeout(y.ensureAnimationEnd);y.wrapup(h)});clearTimeout(y.ensureAnimationEnd);y.ensureAnimationEnd=setTimeout(function(){y.wrapup(h)},y.vars.animationSpeed+100)}else{y.container.animate(y.args,y.vars.animationSpeed,y.vars.easing,function(){y.wrapup(h)})}}else{if(!w){y.slides.eq(y.currentSlide).css({zIndex:1}).animate({opacity:0},y.vars.animationSpeed,y.vars.easing);y.slides.eq(g).css({zIndex:2}).animate({opacity:1},y.vars.animationSpeed,y.vars.easing,y.wrapup)}else{y.slides.eq(y.currentSlide).css({opacity:0,zIndex:1});y.slides.eq(g).css({opacity:1,zIndex:2});y.wrapup(h)}}if(y.vars.smoothHeight){C.smoothHeight(y.vars.animationSpeed)}}};y.wrapup=function(c){if(!B&&!F){if(y.currentSlide===0&&y.animatingTo===y.last&&y.vars.animationLoop){y.setProps(c,"jumpEnd")}else{if(y.currentSlide===y.last&&y.animatingTo===0&&y.vars.animationLoop){y.setProps(c,"jumpStart")}}}y.animating=false;y.currentSlide=y.animatingTo;y.vars.after(y)};y.animateSlides=function(){if(!y.animating&&t){y.flexAnimate(y.getTarget("next"))}};y.pause=function(){clearInterval(y.animatedSlides);y.animatedSlides=null;y.playing=false;if(y.vars.pausePlay){C.pausePlay.update("play")}if(y.syncExists){C.sync("pause")}};y.play=function(){if(y.playing){clearInterval(y.animatedSlides)}y.animatedSlides=y.animatedSlides||setInterval(y.animateSlides,y.vars.slideshowSpeed);y.started=y.playing=true;if(y.vars.pausePlay){C.pausePlay.update("pause")}if(y.syncExists){C.sync("play")}};y.stop=function(){y.pause();y.stopped=true};y.canAdvance=function(c,e){var d=(u)?y.pagingCount-1:y.last;return(e)?true:(u&&y.currentItem===y.count-1&&c===0&&y.direction==="prev")?true:(u&&y.currentItem===0&&c===y.pagingCount-1&&y.direction!=="next")?false:(c===y.currentSlide&&!u)?false:(y.vars.animationLoop)?true:(y.atEnd&&y.currentSlide===0&&c===d&&y.direction!=="next")?false:(y.atEnd&&y.currentSlide===d&&c===0&&y.direction==="next")?false:true};y.getTarget=function(c){y.direction=c;if(c==="next"){return(y.currentSlide===y.last)?0:y.currentSlide+1}else{return(y.currentSlide===0)?y.last:y.currentSlide-1}};y.setProps=function(c,f,e){var d=(function(){var h=(c)?c:((y.itemW+y.vars.itemMargin)*y.move)*y.animatingTo,g=(function(){if(F){return(f==="setTouch")?c:(v&&y.animatingTo===y.last)?0:(v)?y.limit-(((y.itemW+y.vars.itemMargin)*y.move)*y.animatingTo):(y.animatingTo===y.last)?y.limit:h}else{switch(f){case"setTotal":return(v)?((y.count-1)-y.currentSlide+y.cloneOffset)*c:(y.currentSlide+y.cloneOffset)*c;case"setTouch":return(v)?c:c;case"jumpEnd":return(v)?c:y.count*c;case"jumpStart":return(v)?y.count*c:c;default:return c}}}());return(g*-1)+"px"}());if(y.transitions){d=(A)?"translate3d(0,"+d+",0)":"translate3d("+d+",0,0)";e=(e!==undefined)?(e/1000)+"s":"0s";y.container.css("-"+y.pfx+"-transition-duration",e);y.container.css("transition-duration",e)}y.args[y.prop]=d;if(y.transitions||e===undefined){y.container.css(y.args)}y.container.css("transform",d)};y.setup=function(d){if(!B){var c,e;if(d==="init"){y.viewport=b('<div class="'+x+'viewport"></div>').css({overflow:"hidden",position:"relative"}).appendTo(y).append(y.container);y.cloneCount=0;y.cloneOffset=0;if(v){e=b.makeArray(y.slides).reverse();y.slides=b(e);y.container.empty().append(y.slides)}}if(y.vars.animationLoop&&!F){y.cloneCount=2;y.cloneOffset=1;if(d!=="init"){y.container.find(".clone").remove()}C.uniqueID(y.slides.first().clone().addClass("clone").attr("aria-hidden","true")).appendTo(y.container);C.uniqueID(y.slides.last().clone().addClass("clone").attr("aria-hidden","true")).prependTo(y.container)}y.newSlides=b(y.vars.selector,y);c=(v)?y.count-1-y.currentSlide+y.cloneOffset:y.currentSlide+y.cloneOffset;if(A&&!F){y.container.height((y.count+y.cloneCount)*200+"%").css("position","absolute").width("100%");setTimeout(function(){y.newSlides.css({display:"block"});y.doMath();y.viewport.height(y.h);y.setProps(c*y.h,"init")},(d==="init")?100:0)}else{y.container.width((y.count+y.cloneCount)*200+"%");y.setProps(c*y.computedW,"init");setTimeout(function(){y.doMath();y.newSlides.css({width:y.computedW,"float":"left",display:"block"});if(y.vars.smoothHeight){C.smoothHeight()}},(d==="init")?100:0)}}else{y.slides.css({width:"100%","float":"left",marginRight:"-100%",position:"relative"});if(d==="init"){if(!w){y.slides.css({opacity:0,display:"block",zIndex:1}).eq(y.currentSlide).css({zIndex:2}).animate({opacity:1},y.vars.animationSpeed,y.vars.easing)}else{y.slides.css({opacity:0,display:"block",webkitTransition:"opacity "+y.vars.animationSpeed/1000+"s ease",zIndex:1}).eq(y.currentSlide).css({opacity:1,zIndex:2})}}if(y.vars.smoothHeight){C.smoothHeight()}}if(!F){y.slides.removeClass(x+"active-slide").eq(y.currentSlide).addClass(x+"active-slide")}y.vars.init(y)};y.doMath=function(){var f=y.slides.first(),c=y.vars.itemMargin,e=y.vars.minItems,d=y.vars.maxItems;y.w=(y.viewport===undefined)?y.width():y.viewport.width();y.h=f.height();y.boxPadding=f.outerWidth()-f.width();if(F){y.itemT=y.vars.itemWidth+c;y.minW=(e)?e*y.itemT:y.w;y.maxW=(d)?(d*y.itemT)-c:y.w;y.itemW=(y.minW>y.w)?(y.w-(c*(e-1)))/e:(y.maxW<y.w)?(y.w-(c*(d-1)))/d:(y.vars.itemWidth>y.w)?y.w:y.vars.itemWidth;y.visible=Math.floor(y.w/(y.itemW));y.move=(y.vars.move>0&&y.vars.move<y.visible)?y.vars.move:y.visible;y.pagingCount=Math.ceil(((y.count-y.visible)/y.move)+1);y.last=y.pagingCount-1;y.limit=(y.pagingCount===1)?0:(y.vars.itemWidth>y.w)?(y.itemW*(y.count-1))+(c*(y.count-1)):((y.itemW+c)*y.count)-y.w-c}else{y.itemW=y.w;y.pagingCount=y.count;y.last=y.count-1}y.computedW=y.itemW-y.boxPadding};y.update=function(c,d){y.doMath();if(!F){if(c<y.currentSlide){y.currentSlide+=1}else{if(c<=y.currentSlide&&c!==0){y.currentSlide-=1}}y.animatingTo=y.currentSlide}if(y.vars.controlNav&&!y.manualControls){if((d==="add"&&!F)||y.pagingCount>y.controlNav.length){C.controlNav.update("add")}else{if((d==="remove"&&!F)||y.pagingCount<y.controlNav.length){if(F&&y.currentSlide>y.last){y.currentSlide-=1;y.animatingTo-=1}C.controlNav.update("remove",y.last)}}}if(y.vars.directionNav){C.directionNav.update()}};y.addSlide=function(e,c){var d=b(e);y.count+=1;y.last=y.count-1;if(A&&v){(c!==undefined)?y.slides.eq(y.count-c).after(d):y.container.prepend(d)}else{(c!==undefined)?y.slides.eq(c).before(d):y.container.append(d)}y.update(c,"add");y.slides=b(y.vars.selector+":not(.clone)",y);y.setup();y.vars.added(y)};y.removeSlide=function(d){var c=(isNaN(d))?y.slides.index(b(d)):d;y.count-=1;y.last=y.count-1;if(isNaN(d)){b(d,y.slides).remove()}else{(A&&v)?y.slides.eq(y.last).remove():y.slides.eq(d).remove()}y.doMath();y.update(c,"remove");y.slides=b(y.vars.selector+":not(.clone)",y);y.setup();y.vars.removed(y)};C.init()};b(window).blur(function(a){focused=false}).focus(function(a){focused=true});b.flexslider.defaults={namespace:"flex-",selector:".slides > li",animation:"fade",easing:"swing",direction:"horizontal",reverse:false,animationLoop:true,smoothHeight:false,startAt:0,slideshow:true,slideshowSpeed:7000,animationSpeed:600,initDelay:0,randomize:false,thumbCaptions:false,pauseOnAction:true,pauseOnHover:false,pauseInvisible:true,useCSS:true,touch:true,video:false,controlNav:true,directionNav:true,prevText:"Previous",nextText:"Next",keyboard:true,multipleKeyboard:false,mousewheel:false,pausePlay:false,pauseText:"Pause",playText:"Play",controlsContainer:"",manualControls:"",sync:"",asNavFor:"",itemWidth:0,itemMargin:0,minItems:1,maxItems:0,move:0,allowOneSlide:true,start:function(){},before:function(){},after:function(){},end:function(){},added:function(){},removed:function(){},init:function(){}};b.fn.flexslider=function(a){if(a===undefined){a={}}if(typeof a==="object"){return this.each(function(){var c=b(this),h=(a.selector)?a.selector:".slides > li",g=c.find(h);if((g.length===1&&a.allowOneSlide===true)||g.length===0){g.fadeIn(400);if(a.start){a.start(c)}}else{if(c.data("flexslider")===undefined){new b.flexslider(this,a)}}})}else{var d=b(this).data("flexslider");switch(a){case"play":d.play();break;case"pause":d.pause();break;case"stop":d.stop();break;case"next":d.flexAnimate(d.getTarget("next"),true);break;case"prev":case"previous":d.flexAnimate(d.getTarget("prev"),true);break;default:if(typeof a==="number"){d.flexAnimate(a,true)}}}}})(jQuery);
/*!
 * Created by mario on 15/05/14.
 */
;$(window).load(function(){$(".flexslider-principal").flexslider({animation:"slide",slideshowSpeed:5000,startAt:0,slideshow:true});$(".flexslider-destaque").flexslider({animation:"slide",controlNav:"thumbnails",randomize:false,slideshow:false});$("#flexslider-detalhe-thumb").flexslider({animation:"slide",controlNav:false,animationLoop:false,slideshow:false,itemWidth:120,itemMargin:5,asNavFor:"#flexslider-detalhe"});$("#flexslider-detalhe").flexslider({animation:"slide",controlNav:false,animationLoop:false,slideshow:false,sync:"#flexslider-detalhe-thumb"})});