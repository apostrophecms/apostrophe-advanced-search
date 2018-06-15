module.exports = {
  extend: 'apostrophe-module',
  moogBundle: {
    modules: [
      'apostrophe-advanced-search-global',
      'apostrophe-advanced-search-widgets',
      'apostrophe-advanced-search-search'
    ],
    directory: 'lib/modules'
  },
  construct: function(self, options) {
    self.addHelpers({
      filters: [{
          name: 'content',
          label: 'By Content',
          items: [{
              name: 'page',
              label: 'Pages',
              url: '??',
              count: 10
            },
            {
              name: 'products',
              label: 'Products',
              url: '??',
              count: 5
            },
            {
              name: 'profiles',
              label: 'Profiles',
              url: '??',
              count: 3
            },
            {
              name: 'articles',
              label: 'Articles',
              url: '??',
              count: 1
            }
          ]
        },
        {
          name: 'another',
          label: 'By Another One',
          items: [{
              name: 'page',
              label: 'Hello',
              url: '??',
              count: 3
            },
            {
              name: 'products',
              label: 'Goobye',
              url: '??',
              count: 3
            },
            {
              name: 'profiles',
              label: 'Nice to See You',
              url: '??',
              count: 99
            },
            {
              name: 'articles',
              label: 'Hell this is an item',
              url: '??',
              count: 59
            }
          ]
        }
      ]

    });
  }
};
