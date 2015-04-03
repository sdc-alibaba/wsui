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
