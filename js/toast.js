 //jscs:disable 

 /**
 * noty.js
 * https://github.com/usablica/intro.js
 * MIT licensed
 *
 * Copyright (C) 2013 usabli.ca - A weekend project by Afshin Mehrabani (@afshinme

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
  var template = '<div class="label noty_message"><h5 class="noty_text msg-con"></h5><s class="msg-icon"></s></div>';

  var Noty = function (options) {
  	var $noty = null;
    if(typeof options === typeof 'a'){
      this.options = $.extend({}, this.defaults);
      this.options.text = options;
      this.options.position= arguments[2];
      this.options.type = arguments[1];
    }else{
      this.options = $.extend({}, this.defaults, options);
    }
    return this.render();
  }

  Noty.prototype = {
    Constructor : Noty,
     render: function(){
      var options = this.options;
      var message = ".noty_message";
      var text = ".noty_text";
      var cssPrefix = "label-";
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
      if(options.closeOnSelfClick){
        this.el.click($.proxy(this.hide,this));
      }
    },
    hide : function(callback){  // hide : function(duration, callback);
      this.el.removeClass('noty-in');
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
        this.el.css("magin-top",mtheight);
      }
      var addclass = function(){
        this.el.addClass('noty-in')
      }
      setTimeout($.proxy(addclass,this));
      setTimeout($.proxy(this.hide,this),this.options.timeout);
    }
  } 

  var old = $.noty
  
  $.noty = function(arg1,arg2,arg3){
    return new Noty(arg1,arg2, arg3);
  }

  Noty.prototype.defaults = {
    position: 'top',
    type: 'danger',
    // speed: 500,
    timeout: 255000,
    // closeButton: false,
    closeOnSelfClick: true,
    text:''
  };

  $.noty.Constructor = Noty;

 /* BUTTON NO CONFLICT
  * ================== */

  $.noty.noConflict = function () {
    $.noty = old;
    return this
  }

 /* BUTTON DATA-API
  * =============== */ 
}(window.jQuery);
