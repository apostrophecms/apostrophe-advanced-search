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

  }
};
