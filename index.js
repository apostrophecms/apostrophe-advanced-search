var match = [{
  slug: 'the-michlin-tire-product',
  title: 'The Michelin tire product range',
  excerpt: 'A joyless operas vase comes with it the thought that the hackneyed enemy is a decrease.They were lost without the zippy oyster that composed their close.Their clef was, in this moment, a thirstless hose.Those sides are nothing more than grills',
  url: 'https://www.michelin.com/eng/michelin-group/products-services/michelin-tires',
  groups: [{
      type: 'product',
      typeLabel: 'Product Page'
    },
    {
      type: 'apostrophe-page',
      typeLabel: 'Page'
    },
  ]
}];

module.exports = {
  extend: 'apostrophe-module',
  moogBundle: {
    modules: [
      'apostrophe-advanced-search-global',
      'apostrophe-advanced-search-widgets'
    ],
    directory: 'lib/modules'
  },
  construct: function(self, options) {
    self.addHelpers({
      matches: match.concat(match).concat(match),
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
