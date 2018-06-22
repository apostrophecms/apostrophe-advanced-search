apos.define('apostrophe-advanced-search-widgets', {
  extend: 'apostrophe-widgets',
  construct: function(self, options) {
    self.play = function($widget, data, options) {

      var $body = $('body'),
        $input = $widget.find('[data-apos-as-search-input]'),
        $indicator = $widget.find('[data-apos-as-search-indicator]'),
        $close = $widget.find('[data-apos-as-close]'),
        $open = $widget.find('[data-apos-as-open]'),
        $filters = $widget.find('[data-apos-as-filter]'),
        $matches = $widget.find('[data-apos-as-matches]'),
        $static = $widget.find('[data-apos-as-static]'),
        $count = $widget.find('[data-apos-as-search-count]'),
        $next = $widget.find('[data-apos-as-next]'),
        $prev = $widget.find('[data-apos-as-prev]'),
        $suggestions = $widget.find('[data-apos-as-suggestion]');
        $resultsContainer = $widget.find('[data-apos-as-results]');
        $widgetContainer = $widget.find('[data-apos-as]');
        $pager = $widget.find('[data-apos-as-pager]');
        $searchBar = $widget.find('[data-apos-as-search-bar]');

      var inputActiveClass = 'apos-as__input-inner-wrapper--active',
        searchMinimum = 3,
        filters = self.options.filters,
        originalSearchCriteria = {},
        searchCriteria = {},
        filterActiveClass = 'apos-as--c-filter__item--active',
        resultsActiveClass = 'apos-as--u-has-results',
        pagerDisabledClass = 'apos-as__pager__button--disabled',
        openClass = 'apos-as--open';

      _.each(filters, function(filter) {
        originalSearchCriteria[filter.name] = 1
      });
      var searchCriteria = _.clone(originalSearchCriteria);

      // var searchModule = apos.modules['apostrophe-advanced-search-search'];

      var originalState = {
        active: false,
        filtered: false,
        searched: false
      };

      var state = _.clone(originalState);

      var keys = {
        'return': 13,
        'esc': 27
      };

      // Templates
      var _match = _.template($('[data-template="match"]').html()),
        _count = _.template($('[data-template="count"]').html()),
        _currentFilter = _.template($('[data-template="current-filter"]').html());

      // Initialize
      DOMAdjusting();
      inputListener();
      closeListener();
      openListener();
      keyListener();
      suggestionsListener();
      filterListener();
      currentFilterListener();
      pagerListener();

      // Setup
      function DOMAdjusting() {
        var searchHeight = $searchBar.outerHeight();
        $resultsContainer.css('height', 'calc(100vh - ' + searchHeight + 'px)');
      };

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

      function openListener() {
        $body.on('click', '[data-apos-as-open]', function() {
          open();
        });
      };

      function keyListener() {
        $(window).on('keydown', function(e) {
          if (e.keyCode === keys.esc && state.active === true) {
            close();
          }
        })
      };

      function suggestionsListener() {
        $body.on('click', '[data-apos-as-suggestion]', function() {
          applySuggestion($(this));
        })
      };

      function filterListener() {
        $body.on('click', '[data-apos-as-filter]', function () {
          var $this = $(this);
          if (state.filtered) {
            toggleFilter($this);
          } else {
            setFilters($this);
          }
        })
      };

      function currentFilterListener() {
        $body.on('click', '[data-apos-as-current-filter]', function() {
          toggleFilter($(this));
        });
      };

      function pagerListener() {
        $body.on('click', '[data-apos-as-page]', function() {
          var $this = $(this);
          if (parseInt($this.attr('data-apos-as-page')) > 0) {
            searchCriteria.page = parseInt($this.attr('data-apos-as-page'));
            search(searchCriteria, keys.return);
          }
        })
      };

      // Actions
      function close() {
        state.active = false;
        $widgetContainer.removeClass(openClass);
        clear();
      };

      function open() {
        $widgetContainer.addClass(openClass);
        state.active = true;
        $input.focus();
      };

      function applyTextToSearch(text, key) {
        if (text.length > searchMinimum) {
          search({ search: text }, key)
        }
      };

      function clear() {
        $input.val('');
        updateIndicator('');
        $widgetContainer.removeClass(resultsActiveClass);
        state = _.clone(originalState);
        searchCriteria = _.clone(originalSearchCriteria);
        removeAllFiltersFromCurrent();
      };

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
            if (data.totalDocs !== 0 || key === keys.return) {
              updateResults(data);
              updateCount(data);
              updateFilterCounts(data.filterCounts);
              updatePager(data);
              if (state.searched === false) {
                state.searched = true;
                $widgetContainer.addClass(resultsActiveClass);
              }
            }
          })
          .fail(function (xhr, status, errorThrown) {
            console.log("Status: " + status);
          })
      };

      function updateIndicator(text) {
        $indicator.text(text);
      };

      function updateResults(data) {
        $matches.html(_match({ docs: data.docs }));
      };

      function updateCount(data) {
        $count.html(_count(
          {
            first: data.count.first,
            last: data.count.last,
            total: data.totalDocs,
            query: data.query
          }
        ));
      };

      function updateFilterCounts(counts) {
        for (var filter in counts) {
          var $filter = $widget.find('[data-apos-as-filter-type="' + filter + '"]');
          $filter.find('[data-apos-as-filter-count]').text(counts[filter]);
        }
      };

      function updatePager(data) {
        if (data.totalPages > data.currentPage) {
          $next.attr('data-apos-as-page', data.currentPage + 1);
          $next.removeClass(pagerDisabledClass);
        } else {
          $next.attr('data-apos-as-page', '');
          $next.addClass(pagerDisabledClass);
        }

        if (data.currentPage === 1) {
          $prev.attr('data-apos-as-page', '');
          $prev.addClass(pagerDisabledClass);
        } else {
          $prev.removeClass(pagerDisabledClass);
          $prev.attr('data-apos-as-page', data.currentPage - 1);
        }
      };

      function applySuggestion($suggestion) {
        var query = $suggestion.text().toLowerCase()
        $input.val(query);
        applyTextToSearch(query, keys.return);
        updateIndicator(query);
      };

      function setFilters($filter) {
        // use this to unset other filters and set the current one
        var newFilter = $filter.attr('data-apos-as-filter');
        _.each(filters, function(item) {
          delete searchCriteria[item.name];
        });
        searchCriteria[newFilter] = 1;
        state.filtered = true
        $filter.parent().addClass(filterActiveClass);
        addFilterToCurrent($filter);
        search(searchCriteria, keys.return);
      };

      function toggleFilter($filter) {
        // use this for all filters after first, progressively builds/reduces queries
        var newFilter = $filter.attr('data-apos-as-filter') || $filter.attr('data-apos-as-current-filter');
        if (searchCriteria[newFilter] === 1) {
          delete searchCriteria[newFilter];
          $filter.parent().removeClass(filterActiveClass);
          removeFilterFromCurrent(newFilter);
        } else {
          searchCriteria[newFilter] = 1;
          $filter.parent().addClass(filterActiveClass);
          addFilterToCurrent($filter);
        }
        search(searchCriteria, keys.return);
      };

      function addFilterToCurrent($filter) {
        $widget.find('[data-apos-as-current-filters]').append(
          _currentFilter({
            name: $filter.attr('data-apos-as-filter'),
            label: $filter.text()
          }))
      };

      function removeFilterFromCurrent(filterName) {
        $widget.find('[data-apos-as-current-filter="' + filterName + '"]').remove();
        $widget.find('[data-apos-as-filter-type="' + filterName + '"]').removeClass(filterActiveClass);
      };

      function removeAllFiltersFromCurrent() {
        $widget.find('[data-apos-as-current-filter]').remove();
        $widget.find('[data-apos-as-filter-type]').removeClass(filterActiveClass);
      };
    }
  }
});
