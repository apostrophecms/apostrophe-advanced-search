var async = require('async');
var _ = require('@sailshq/lodash');

module.exports = {
  extend: 'apostrophe-search',
  name: 'advanced-search',
  alias: 'advancedSearch',
  construct: function (self, options) {
    self.route('get', 'search', function (req, res) {

      // Finesse so we can use queryToFilters but we still support q, which is
      // a common expectation/preference
      req.query.search = req.query.search || req.query.q;

      // Cope with filters
      var allowedTypes;

      var defaultingToAll = false;

      var cursor = self.apos.docs.find(req, {})
        .queryToFilters(req.query, 'public')
        .perPage(self.perPage);
      if (self.filters) {
        var filterTypes = _.filter(
          _.pluck(self.filters, 'name'),
          function (name) {
            return name !== '__else';
          }
        );
        allowedTypes = _.filter(self.types, function (name) {
          return _.has(req.query, name);
        });
        if (req.query.__else) {
          allowedTypes = allowedTypes.concat(_.difference(self.types, filterTypes));
        }
        if (!allowedTypes.length) {
          // Default is everything
          defaultingToAll = true;
          allowedTypes = self.types;
        }
      } else {
        allowedTypes = self.types;
      }
      cursor.and({
        type: {
          $in: allowedTypes
        }
      });

      var docs = [];

      if (self.filters) {
        req.data.filters = _.cloneDeep(self.filters);

        _.each(req.data.filters, function (filter) {
          if (defaultingToAll || req.query[filter.name]) {
            filter.value = true;
          }
        });
      }

      return async.series([totalDocs, filterCounts, findDocs], function (err) {

        if (err) {
          return callback(err);
        }

        if (self.apos.utils.isAjaxRequest(req)) {
          req.template = self.renderer('indexAjax');
        } else {
          req.template = self.renderer('index');
        }
        req.data.currentPage = cursor.get('page');
        req.data.docs = docs;

        var count = {};

        if (req.data.currentPage === 1) {
          count.first = 1;
          count.last = docs.length;
        } else {
          count.first = (docs.length * req.data.currentPage) + 1;
          count.last = count.first + docs.length
        }


        return res.json({
          totalDocs: req.data.totalDocs,
          totalPages: req.data.totalPages,
          docs: req.data.docs,
          currentPage: req.data.currentPage,
          status: 'ok',
          count: count,
          query: req.query.search,
          filterCounts: req.data.filterCounts
        })
        // return self.beforeIndex(req, callback);
      });

      function filterCounts(callback) {
        req.data.filterCounts = {};
        return async.each(self.options.filters, function(filter, callback) {
          var tempCursor = self.apos.docs.find(req, {})
            .queryToFilters(req.query, 'public')
          tempCursor.and({
            type: filter.name
          });
          return tempCursor.toCount(function (err, count) {
            if (err) {
              return callback(err);
            }
            req.data.filterCounts[filter.name] = count;
            return callback(null);
          });
        }, function (err) {
          if (err) {
            return callback(err);
          }
          return callback();
        });
      }

      function totalDocs(callback) {
        return cursor.toCount(function (err, count) {
          if (err) {
            return callback(err);
          }
          if (cursor.get('page') > cursor.get('totalPages')) {
            req.notFound = true;
            return callback(null);
          }
          req.data.totalDocs = count;
          req.data.totalPages = cursor.get('totalPages');
          return callback();
        });
      }

      function findDocs(callback) {
        // Polymorphic find: fetch just the ids at first, then go back
        // and fetch them via their own type managers so that we get the
        // expected joins and urls and suchlike.

        var idsAndTypes;
        var byType;

        return async.series([
          getIdsAndTypes,
          getDocs
        ], callback);

        function getIdsAndTypes(callback) {
          return cursor.projection({
            _id: 1,
            type: 1
          }).toArray(function (err, _idsAndTypes) {
            if (err) {
              return callback(err);
            }
            idsAndTypes = _idsAndTypes;
            return callback(null);
          });
        }

        function getDocs(callback) {
          byType = _.groupBy(idsAndTypes, 'type');
          return async.eachSeries(_.keys(byType), getDocsOfType, function (err) {
            if (err) {
              return callback(err);
            }
            // Restore the intended order ($in doesn't respect it and neither does
            // fetching them all by type). ACHTUNG: without this search quality goes
            // right out the window. -Tom
            docs = self.apos.utils.orderById(_.pluck(idsAndTypes, '_id'), docs);
            return callback(null);
          });
        }

        function getDocsOfType(type, callback) {
          var manager = self.apos.docs.getManager(type);
          if (!manager) {
            return setImmediate(callback);
          }
          return manager.find(req, {
            type: type,
            _id: {
              $in: _.pluck(byType[type], '_id')
            }
          }).toArray(function (err, docsOfType) {
            if (err) {
              return callback(err);
            }
            docs = docs.concat(docsOfType);
            return callback(null);
          });
        }
      }

    });
  }
};
