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

      init();

      // Listeners
      function inputListener() {
        $input.on('keyup', function(e) {
          var $this = $(this);
          updateIndicator($this.val());
        });
      };
      function closeListener() { };
      function openListener() { };
      function keyListener() { };

      // Actions
      function close() {}
      function open() {}
      function updateIndicator(text) {
        $indicator.text(text);
      }

      function init() {
        inputListener();
        closeListener();
        openListener();
      };
    }
  }
});
