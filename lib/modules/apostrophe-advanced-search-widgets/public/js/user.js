apos.define('apostrophe-advanced-search-widgets', {
  extend: 'apostrophe-widgets',
  construct: function(self, options) {
    self.play = function($widget, data, options) {
      var $body = $('body');
      var $input = $widget.find('[data-apos-as-search-input]'),
          $indicator = $widget.find('[data-apos-as-search-indicator]'),
          $close = $widget.find('[data-apos-as-close]'),
          $filters = $widget.find('[data-apos-as-filters]'),
          $matches = $widget.find('[data-apos-as-matches]'),
          $static = $widget.find('[data-apos-as-static]'),
          $next = $widget.find('[data-apos-as-next]'),
          $prev = $widget.find('[data-apos-as-prev]');

      var inputActiveClass = 'apos-as__input-inner-wrapper--active'

      // Initialize
      inputListener();
      closeListener();
      openListener();

      // Listeners
      function inputListener() {
        $input.on({
          'keyup': function() {
            updateIndicator($(this).val());
          },
          'focus': function() {
            $(this).parent().addClass(inputActiveClass);
          },
          'blur': function() {
            $(this).parent().removeClass(inputActiveClass);
          }
        });
      };
      function closeListener() {
        $body.on('click', '[data-apos-as-close]', function () {
          close();
        })
      };
      function openListener() { };
      function keyListener() { };

      // Actions
      function close() {
        console.log('time to close');
      }
      function open() {}
      function updateIndicator(text) {
        $indicator.text(text);
      }

    }
  }
});
