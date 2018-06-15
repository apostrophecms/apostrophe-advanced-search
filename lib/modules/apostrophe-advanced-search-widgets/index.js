// var async = require('async');
// var _ = require('lodash');

module.exports = {
  extend: 'apostrophe-widgets',
  skipInitialModal: true,
  label: 'Advanced Search',
  addFields: [

  ],
  beforeConstruct: function (self, options) {},
  afterConstruct: function (self) {
    self.pushAsset('stylesheet', 'index', { when: 'always' });
  },

  construct: function (self, options) {
    // Patch options from the configuration to the browser
    var superGetCreateSingletonOptions = self.getCreateSingletonOptions;
    self.getCreateSingletonOptions = function (req) {

      var browserOptions = superGetCreateSingletonOptions(req);
      var asModule = self.apos.modules['apostrophe-advanced-search-search'];

      browserOptions.filters = asModule.filters

      return browserOptions;
    };
  }
};
