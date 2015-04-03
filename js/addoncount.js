/* jshint laxcomma: true */
!function ($) {

  'use strict';
  // document ready init
  $(function () {
    $(document).on('input propertychange', '[data-max]', function () {
      var that = this,
          len = $(that).data('max'),
          count = $(that).val().length;
      if (count < len) {
        $(that).siblings('.input-group-addon-count').text(count + '/' + len);
      } else {
        $(that).siblings('.input-group-addon-count').html('<span style="color:#f23f40">' + count + '/' + len + '</span>');
      }
    });
  })

}(jQuery);
