/* jshint laxcomma: true */
!function ($) {

  'use strict';
  // document ready init
  $(document).on('input propertychange', '[data-max]', function () {
    var that = this,
        len = $(that).data('max'),
        count = $(that).val().length;
    if ($(that).is('input')) {
      $(that).siblings('.input-group-addon-count').html('<span class="' + (count < len ? '' : 'text-danger') + '">' + count + '/' + len + '</span>');
    }
    if ($(that).is('textarea')) {
      $(that).siblings('.textarea-addon').find('.textarea-group-addon-count').html('<span class="' + (count < len ? '' : 'text-danger') + '">' + count + '/' + len + '</span>');
    }
  });
}(jQuery);
