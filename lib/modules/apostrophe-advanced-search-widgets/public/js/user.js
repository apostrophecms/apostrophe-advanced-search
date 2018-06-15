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
        $count = $widget.find('[data-apos-as-search-count]'),
        $next = $widget.find('[data-apos-as-next]'),
        $prev = $widget.find('[data-apos-as-prev]'),
        $suggestions = $widget.find('[data-apos-as-suggestion]');

      var inputActiveClass = 'apos-as__input-inner-wrapper--active';
      var searchMinimum = 3;
      var filters = self.options.filters
      var searchCriteria = {};
      
      _.each(filters, function(filter) {
        searchCriteria[filter.name] = 1
      });

      var searchModule = apos.modules['apostrophe-advanced-search-search'];
      var state  = { active: true };
      var keys = {
        'return': 13,
        'esc': 27
      };


      var _match = _.template($('[data-template="match"]').html());
      var _count = _.template($('[data-template="count"]').html());

      // Initialize
      inputListener();
      closeListener();
      openListener();
      keyListener();
      suggestionsListener();

      // Listeners
      function inputListener() {
        $input.on({
          'keyup': function(e) {
            updateIndicator($(this).val());
            applyTextToSearch($(this).val(), e.keyCode);
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

      function keyListener() {
        $(window).on('keydown', function(e) {
          if (e.keyCode === keys.esc && state.active === true) {
            state.active = false;
            close();
          }
        })
      };

      function suggestionsListener() {
        $body.on('click', '[data-apos-as-suggestion]', function() {
          applySuggestion($(this));
        })
      }

      // Actions
      function close() {
        console.log('time to close');
      }

      function open() {
        state.active = true;
      }

      function applyTextToSearch(text, key) {
        if (text.length > searchMinimum) {
          search({ search: text }, key)
        }
      }

      function applyFilterToSearch() {}
      function updateBrowserState() {}

      function search(newSearchCriteria, key) {
        searchCriteria = _.merge(searchCriteria, newSearchCriteria);
        $.ajax({
            url: "/modules/apostrophe-advanced-search-search/search",
            data: searchCriteria,
            type: "GET",
            dataType: "json",
          })
          .done(function (data) {
            console.log(data);
            if (data.totalDocs !== 0 || key === keys.return) {
              updateResults(data);
              updateCount(data);
            }
          })
          .fail(function (xhr, status, errorThrown) {
            console.log("Status: " + status);
          })
      }

      function updateIndicator(text) {
        $indicator.text(text);
      }

      function updateResults(data) {
        $matches.html(_match({ docs: data.docs }));
      }

      function updateCount(data) {
        $count.html(_count(
          {
            first: data.count.first,
            last: data.count.last,
            total: data.totalDocs,
            query: data.query
          }
        ));
      }

      function applySuggestion($suggestion) {
        var query = $suggestion.text().toLowerCase()
        $input.val(query);
        applyTextToSearch(query, keys.return);
        updateIndicator(query);
      }

    }
  }
});
