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
            + '<button type="button" class="' + CLASSMAP.close + '" data-dismiss="modal" aria-hidden="true">&times;</button>'
            + '<h5 class="modal-title"><%=title%></h5>'
          + '</div>'
          + '<div class="modal-body"><%=body%></div>'
          + '<div class="modal-footer">'
            // 增加data-ok="modal"参数
            + '<button type="button" class="' + CLASSMAP.btn + ' btn-primary btn-lg" data-ok="modal"><%=okbtn%></button>'
            + '<button type="button" class="' + CLASSMAP.btn + ' btn-default btn-lg" data-dismiss="modal"><%=cancelbtn%></button>'
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
    !options.cancelbtn && $dialog.find('.modal-footer .btn-default').remove()
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
    alert: function (customCfg) {
      var dialogCfg = {
        type: 'alert',
        title: '注意',
        cancelbtn: false
      }
      return $._modal(dialogCfg, customCfg)
    },
    confirm: function (customCfg) {
      var dialogCfg = {
        type: 'confirm',
        title: '提示',
        cancelbtn: '取消'
      }
      return $._modal(dialogCfg, customCfg)
    }
  })

}(jQuery);
