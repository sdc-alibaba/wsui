/* jshint laxcomma: true */
!function ($) {

  'use strict';
  // document ready init
  $(document).on('input propertychange', '[data-max]', function () {
    var that = this,
        len = $(that).data('max'),
        count = $(that).val().length,
        numHtml = '<span class="' + (count < len ? '' : 'text-danger') + '">' + count + '/' + len + '</span>',
        $container;
    if ($(that).is('input')) {
      $container = $(that).siblings('.input-group-addon-count');
    }
    if ($(that).is('textarea')) {
      $container = $(that).siblings('.textarea-addon').find('.textarea-group-addon-count');
    }
    $container.html(numHtml);
  });
}(jQuery);
