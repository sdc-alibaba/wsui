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
var protocol = (location.protocol === 'https:' ? 'https:' : 'http:');
var picPluginUrl = location.hostname.indexOf('daily.taobao.net') > -1 ?
                   '//g-assets.daily.taobao.net/sj/pic/1.3.9/static/seller-v2/js/api.js' :
                   protocol + '//g.alicdn.com/sj/pic/1.3.9/static/seller-v2/js/api.js'

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
        pic && pic.close()
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
