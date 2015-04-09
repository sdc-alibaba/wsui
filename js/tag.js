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
