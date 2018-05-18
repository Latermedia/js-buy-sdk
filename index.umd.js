/*
The MIT License (MIT)

Copyright (c) 2016 Shopify Inc.

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('graphql-js-client')) :
	typeof define === 'function' && define.amd ? define(['graphql-js-client'], factory) :
	(global.ShopifyBuy = factory(global.GraphQLJSClient));
}(this, (function (GraphQLJSClient) { 'use strict';

GraphQLJSClient = GraphQLJSClient && GraphQLJSClient.hasOwnProperty('default') ? GraphQLJSClient['default'] : GraphQLJSClient;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();









var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

/**
 * The class used to configure the JS Buy SDK Client.
 * @class
 */
var Config = function () {
  createClass(Config, [{
    key: 'requiredProperties',


    /**
     * Properties that must be set on initializations
     * @attribute requiredProperties
     * @default ['storefrontAccessToken', 'domain']
     * @type Array
     * @private
     */
    get: function get$$1() {
      return ['storefrontAccessToken', 'domain'];
    }

    /**
     * Deprecated properties that map directly to required properties
     * @attribute deprecatedProperties
     * @default {'accessToken': 'storefrontAccessToken', 'apiKey': 'storefrontAccessToken'}
     * @type Object
     * @private
     */

  }, {
    key: 'deprecatedProperties',
    get: function get$$1() {
      return {
        accessToken: 'storefrontAccessToken',
        apiKey: 'storefrontAccessToken'
      };
    }

    /**
     * @constructs Config
     * @param {Object} attrs An object specifying the configuration. Requires the following properties:
     *   @param {String} attrs.storefrontAccessToken The {@link https://help.shopify.com/api/reference/storefront_access_token|Storefront access token} for the shop.
     *   @param {String} attrs.domain The `myshopify` domain for the shop (e.g. `graphql.myshopify.com`).
     */

  }]);

  function Config(attrs) {
    var _this = this;

    classCallCheck(this, Config);

    Object.keys(this.deprecatedProperties).forEach(function (key) {
      if (!attrs.hasOwnProperty(key)) {
        return;
      }
      // eslint-disable-next-line no-console
      console.warn('[ShopifyBuy] Config property ' + key + ' is deprecated as of v1.0, please use ' + _this.deprecatedProperties[key] + ' instead.');
      attrs[_this.deprecatedProperties[key]] = attrs[key];
    });

    this.requiredProperties.forEach(function (key) {
      if (attrs.hasOwnProperty(key)) {
        _this[key] = attrs[key];
      } else {
        throw new Error('new Config() requires the option \'' + key + '\'');
      }
    });
  }

  return Config;
}();

var Resource = function Resource(client) {
  classCallCheck(this, Resource);

  this.graphQLClient = client;
};

var defaultErrors = [{ message: 'an unknown error has occured.' }];

function defaultResolver(path) {
  var keys = path.split('.');

  return function (response) {
    var model = response.model,
        errors = response.errors;


    return new Promise(function (resolve, reject) {
      try {
        var result = keys.reduce(function (ref, key) {
          return ref[key];
        }, model);

        resolve(result);
      } catch (_) {
        if (errors) {
          reject(response);
        } else {
          reject(defaultErrors);
        }
      }
    });
  };
}

function fetchResourcesForProducts(productOrProduct, client) {
  var products = [].concat(productOrProduct);

  return Promise.all(products.reduce(function (promiseAcc, product) {
    // Fetch the rest of the images and variants for this product
    promiseAcc.push(client.fetchAllPages(product.images, { pageSize: 250 }).then(function (images) {
      product.attrs.images = images;
    }));

    promiseAcc.push(client.fetchAllPages(product.variants, { pageSize: 250 }).then(function (variants) {
      product.attrs.variants = variants;
    }));

    return promiseAcc;
  }, []));
}

function paginateProductConnectionsAndResolve(client) {
  return function (products) {
    return fetchResourcesForProducts(products, client).then(function () {
      return products;
    });
  };
}

function paginateCollectionsProductConnectionsAndResolve(client) {
  return function (collectionOrCollections) {
    var collections = [].concat(collectionOrCollections);

    return Promise.all(collections.reduce(function (promiseAcc, collection) {
      return promiseAcc.concat(fetchResourcesForProducts(collection.products, client));
    }, [])).then(function () {
      return collectionOrCollections;
    });
  };
}

/**
 * @namespace ProductHelpers
 */
var productHelpers = {

  /**
   * Returns the variant of a product corresponding to the options given.
   *
   * @example
   * const selectedVariant = client.product.variantForOptions(product, {
   *   size: "Small",
   *   color: "Red"
   * });
   *
   * @memberof ProductHelpers
   * @method variantForOptions
   * @param {GraphModel} product The product to find the variant on. Must include `variants`.
   * @param {Object} options An object containing the options for the variant.
   * @return {GraphModel} The variant corresponding to the options given.
   */
  variantForOptions: function variantForOptions(product, options) {
    return product.variants.find(function (variant) {
      return variant.selectedOptions.every(function (selectedOption) {
        return options[selectedOption.name] === selectedOption.value.valueOf();
      });
    });
  }
};

function query(client) {
  var document = client.document();
  var spreads = {};
  var variables = {};
  variables.__defaultOperation__ = {};
  variables.__defaultOperation__.id = client.variable("id", "ID!");
  spreads.VariantFragment = document.defineFragment("VariantFragment", "ProductVariant", function (root) {
    root.add("id");
    root.add("title");
    root.add("price");
    root.add("weight");
    root.add("available");
    root.add("sku");
    root.add("compareAtPrice");
    root.add("image", function (image) {
      image.add("id");
      image.add("src");
      image.add("altText");
    });
    root.add("selectedOptions", function (selectedOptions) {
      selectedOptions.add("name");
      selectedOptions.add("value");
    });
  });
  spreads.ProductFragment = document.defineFragment("ProductFragment", "Product", function (root) {
    root.add("id");
    root.add("createdAt");
    root.add("updatedAt");
    root.add("descriptionHtml");
    root.add("description");
    root.add("handle");
    root.add("productType");
    root.add("title");
    root.add("vendor");
    root.add("tags");
    root.add("publishedAt");
    root.add("onlineStoreUrl");
    root.add("options", function (options) {
      options.add("name");
      options.add("values");
    });
    root.add("images", {
      args: {
        first: 250
      }
    }, function (images) {
      images.add("pageInfo", function (pageInfo) {
        pageInfo.add("hasNextPage");
        pageInfo.add("hasPreviousPage");
      });
      images.add("edges", function (edges) {
        edges.add("cursor");
        edges.add("node", function (node) {
          node.add("id");
          node.add("src");
          node.add("altText");
        });
      });
    });
    root.add("variants", {
      args: {
        first: 250
      }
    }, function (variants) {
      variants.add("pageInfo", function (pageInfo) {
        pageInfo.add("hasNextPage");
        pageInfo.add("hasPreviousPage");
      });
      variants.add("edges", function (edges) {
        edges.add("cursor");
        edges.add("node", function (node) {
          node.addFragment(spreads.VariantFragment);
        });
      });
    });
  });
  document.addQuery([variables.__defaultOperation__.id], function (root) {
    root.add("node", {
      args: {
        id: variables.__defaultOperation__.id
      }
    }, function (node) {
      node.addFragment(spreads.ProductFragment);
    });
  });
  return document;
}

function query$1(client) {
  var document = client.document();
  var spreads = {};
  var variables = {};
  variables.__defaultOperation__ = {};
  variables.__defaultOperation__.ids = client.variable("ids", "[ID!]!");
  spreads.VariantFragment = document.defineFragment("VariantFragment", "ProductVariant", function (root) {
    root.add("id");
    root.add("title");
    root.add("price");
    root.add("weight");
    root.add("available");
    root.add("sku");
    root.add("compareAtPrice");
    root.add("image", function (image) {
      image.add("id");
      image.add("src");
      image.add("altText");
    });
    root.add("selectedOptions", function (selectedOptions) {
      selectedOptions.add("name");
      selectedOptions.add("value");
    });
  });
  spreads.ProductFragment = document.defineFragment("ProductFragment", "Product", function (root) {
    root.add("id");
    root.add("createdAt");
    root.add("updatedAt");
    root.add("descriptionHtml");
    root.add("description");
    root.add("handle");
    root.add("productType");
    root.add("title");
    root.add("vendor");
    root.add("tags");
    root.add("publishedAt");
    root.add("onlineStoreUrl");
    root.add("options", function (options) {
      options.add("name");
      options.add("values");
    });
    root.add("images", {
      args: {
        first: 250
      }
    }, function (images) {
      images.add("pageInfo", function (pageInfo) {
        pageInfo.add("hasNextPage");
        pageInfo.add("hasPreviousPage");
      });
      images.add("edges", function (edges) {
        edges.add("cursor");
        edges.add("node", function (node) {
          node.add("id");
          node.add("src");
          node.add("altText");
        });
      });
    });
    root.add("variants", {
      args: {
        first: 250
      }
    }, function (variants) {
      variants.add("pageInfo", function (pageInfo) {
        pageInfo.add("hasNextPage");
        pageInfo.add("hasPreviousPage");
      });
      variants.add("edges", function (edges) {
        edges.add("cursor");
        edges.add("node", function (node) {
          node.addFragment(spreads.VariantFragment);
        });
      });
    });
  });
  document.addQuery([variables.__defaultOperation__.ids], function (root) {
    root.add("nodes", {
      args: {
        ids: variables.__defaultOperation__.ids
      }
    }, function (nodes) {
      nodes.addFragment(spreads.ProductFragment);
    });
  });
  return document;
}

function query$2(client) {
  var document = client.document();
  var spreads = {};
  var variables = {};
  variables.__defaultOperation__ = {};
  variables.__defaultOperation__.first = client.variable("first", "Int!");
  variables.__defaultOperation__.query = client.variable("query", "String");
  variables.__defaultOperation__.sortKey = client.variable("sortKey", "ProductSortKeys");
  variables.__defaultOperation__.reverse = client.variable("reverse", "Boolean");
  spreads.VariantFragment = document.defineFragment("VariantFragment", "ProductVariant", function (root) {
    root.add("id");
    root.add("title");
    root.add("price");
    root.add("weight");
    root.add("available");
    root.add("sku");
    root.add("compareAtPrice");
    root.add("image", function (image) {
      image.add("id");
      image.add("src");
      image.add("altText");
    });
    root.add("selectedOptions", function (selectedOptions) {
      selectedOptions.add("name");
      selectedOptions.add("value");
    });
  });
  spreads.ProductFragment = document.defineFragment("ProductFragment", "Product", function (root) {
    root.add("id");
    root.add("createdAt");
    root.add("updatedAt");
    root.add("descriptionHtml");
    root.add("description");
    root.add("handle");
    root.add("productType");
    root.add("title");
    root.add("vendor");
    root.add("tags");
    root.add("publishedAt");
    root.add("onlineStoreUrl");
    root.add("options", function (options) {
      options.add("name");
      options.add("values");
    });
    root.add("images", {
      args: {
        first: 250
      }
    }, function (images) {
      images.add("pageInfo", function (pageInfo) {
        pageInfo.add("hasNextPage");
        pageInfo.add("hasPreviousPage");
      });
      images.add("edges", function (edges) {
        edges.add("cursor");
        edges.add("node", function (node) {
          node.add("id");
          node.add("src");
          node.add("altText");
        });
      });
    });
    root.add("variants", {
      args: {
        first: 250
      }
    }, function (variants) {
      variants.add("pageInfo", function (pageInfo) {
        pageInfo.add("hasNextPage");
        pageInfo.add("hasPreviousPage");
      });
      variants.add("edges", function (edges) {
        edges.add("cursor");
        edges.add("node", function (node) {
          node.addFragment(spreads.VariantFragment);
        });
      });
    });
  });
  document.addQuery([variables.__defaultOperation__.first, variables.__defaultOperation__.query, variables.__defaultOperation__.sortKey, variables.__defaultOperation__.reverse], function (root) {
    root.add("shop", function (shop) {
      shop.add("products", {
        args: {
          first: variables.__defaultOperation__.first,
          query: variables.__defaultOperation__.query,
          sortKey: variables.__defaultOperation__.sortKey,
          reverse: variables.__defaultOperation__.reverse
        }
      }, function (products) {
        products.add("pageInfo", function (pageInfo) {
          pageInfo.add("hasNextPage");
          pageInfo.add("hasPreviousPage");
        });
        products.add("edges", function (edges) {
          edges.add("cursor");
          edges.add("node", function (node) {
            node.addFragment(spreads.ProductFragment);
          });
        });
      });
    });
  });
  return document;
}

function query$3(client) {
  var document = client.document();
  var spreads = {};
  var variables = {};
  variables.__defaultOperation__ = {};
  variables.__defaultOperation__.handle = client.variable("handle", "String!");
  spreads.VariantFragment = document.defineFragment("VariantFragment", "ProductVariant", function (root) {
    root.add("id");
    root.add("title");
    root.add("price");
    root.add("weight");
    root.add("available");
    root.add("sku");
    root.add("compareAtPrice");
    root.add("image", function (image) {
      image.add("id");
      image.add("src");
      image.add("altText");
    });
    root.add("selectedOptions", function (selectedOptions) {
      selectedOptions.add("name");
      selectedOptions.add("value");
    });
  });
  spreads.ProductFragment = document.defineFragment("ProductFragment", "Product", function (root) {
    root.add("id");
    root.add("createdAt");
    root.add("updatedAt");
    root.add("descriptionHtml");
    root.add("description");
    root.add("handle");
    root.add("productType");
    root.add("title");
    root.add("vendor");
    root.add("tags");
    root.add("publishedAt");
    root.add("onlineStoreUrl");
    root.add("options", function (options) {
      options.add("name");
      options.add("values");
    });
    root.add("images", {
      args: {
        first: 250
      }
    }, function (images) {
      images.add("pageInfo", function (pageInfo) {
        pageInfo.add("hasNextPage");
        pageInfo.add("hasPreviousPage");
      });
      images.add("edges", function (edges) {
        edges.add("cursor");
        edges.add("node", function (node) {
          node.add("id");
          node.add("src");
          node.add("altText");
        });
      });
    });
    root.add("variants", {
      args: {
        first: 250
      }
    }, function (variants) {
      variants.add("pageInfo", function (pageInfo) {
        pageInfo.add("hasNextPage");
        pageInfo.add("hasPreviousPage");
      });
      variants.add("edges", function (edges) {
        edges.add("cursor");
        edges.add("node", function (node) {
          node.addFragment(spreads.VariantFragment);
        });
      });
    });
  });
  document.addQuery([variables.__defaultOperation__.handle], function (root) {
    root.add("shop", function (shop) {
      shop.add("productByHandle", {
        args: {
          handle: variables.__defaultOperation__.handle
        }
      }, function (productByHandle) {
        productByHandle.addFragment(spreads.ProductFragment);
      });
    });
  });
  return document;
}

// GraphQL
/**
 * The JS Buy SDK product resource
 * @class
 */

var ProductResource = function (_Resource) {
  inherits(ProductResource, _Resource);

  function ProductResource() {
    classCallCheck(this, ProductResource);
    return possibleConstructorReturn(this, (ProductResource.__proto__ || Object.getPrototypeOf(ProductResource)).apply(this, arguments));
  }

  createClass(ProductResource, [{
    key: 'fetchAll',


    /**
     * Fetches all products on the shop.
     *
     * @example
     * client.product.fetchAll().then((products) => {
     *   // Do something with the products
     * });
     *
     * @param {Int} [pageSize] The number of products to fetch per page
     * @return {Promise|GraphModel[]} A promise resolving with an array of `GraphModel`s of the products.
     */
    value: function fetchAll() {
      var first = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 20;

      return this.graphQLClient.send(query$2, { first: first }).then(defaultResolver('shop.products')).then(paginateProductConnectionsAndResolve(this.graphQLClient));
    }

    /**
     * Fetches a single product by ID on the shop.
     *
     * @example
     * client.product.fetch('Xk9lM2JkNzFmNzIQ4NTIY4ZDFi9DaGVja291dC9lM2JkN==').then((product) => {
     *   // Do something with the product
     * });
     *
     * @param {String} id The id of the product to fetch.
     * @return {Promise|GraphModel} A promise resolving with a `GraphModel` of the product.
     */

  }, {
    key: 'fetch',
    value: function fetch(id) {
      return this.graphQLClient.send(query, { id: id }).then(defaultResolver('node')).then(paginateProductConnectionsAndResolve(this.graphQLClient));
    }

    /**
     * Fetches multiple products by ID on the shop.
     *
     * @example
     * const ids = ['Xk9lM2JkNzFmNzIQ4NTIY4ZDFi9DaGVja291dC9lM2JkN==', 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0Lzc4NTc5ODkzODQ='];
     * client.product.fetchMultiple(ids).then((products) => {
     *   // Do something with the products
     * });
     *
     * @param {String[]} ids The ids of the products to fetch
     * @return {Promise|GraphModel[]} A promise resolving with a `GraphModel` of the product.
     */

  }, {
    key: 'fetchMultiple',
    value: function fetchMultiple(ids) {
      return this.graphQLClient.send(query$1, { ids: ids }).then(defaultResolver('nodes')).then(paginateProductConnectionsAndResolve(this.graphQLClient));
    }

    /**
     * Fetches a single product by handle on the shop.
     *
     * @example
     * client.product.fetchByHandle('my-product').then((product) => {
     *   // Do something with the product
     * });
     *
     * @param {String} handle The handle of the product to fetch.
     * @return {Promise|GraphModel} A promise resolving with a `GraphModel` of the product.
     */

  }, {
    key: 'fetchByHandle',
    value: function fetchByHandle(handle) {
      return this.graphQLClient.send(query$3, { handle: handle }).then(defaultResolver('shop.productByHandle')).then(paginateProductConnectionsAndResolve(this.graphQLClient));
    }

    /**
     * Fetches all products on the shop that match the query.
     *
     * @example
     * client.product.fetchQuery({first: 20, sortKey: 'CREATED_AT', reverse: true}).then((products) => {
     *   // Do something with the first 10 products sorted by title in ascending order
     * });
     *
     * @param {Object} [args] An object specifying the query data containing zero or more of:
     *   @param {Int} [args.first=20] The relay `first` param. This specifies page size.
     *   @param {String} [args.sortKey=ID] The key to sort results by. Available values are
     *   documented as {@link https://help.shopify.com/api/storefront-api/reference/enum/productsortkeys|Product Sort Keys}.
     *   @param {String} [args.query] A query string. See full documentation {@link https://help.shopify.com/api/storefront-api/reference/object/shop#products|here}
     *   @param {Boolean} [args.reverse] Whether or not to reverse the sort order of the results
     * @return {Promise|GraphModel[]} A promise resolving with an array of `GraphModel`s of the products.
     */

  }, {
    key: 'fetchQuery',
    value: function fetchQuery() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref$first = _ref.first,
          first = _ref$first === undefined ? 20 : _ref$first,
          _ref$sortKey = _ref.sortKey,
          sortKey = _ref$sortKey === undefined ? 'ID' : _ref$sortKey,
          query$$1 = _ref.query,
          reverse = _ref.reverse;

      return this.graphQLClient.send(query$2, {
        first: first,
        sortKey: sortKey,
        query: query$$1,
        reverse: reverse
      }).then(defaultResolver('shop.products')).then(paginateProductConnectionsAndResolve(this.graphQLClient));
    }
  }, {
    key: 'helpers',
    get: function get$$1() {
      return productHelpers;
    }
  }]);
  return ProductResource;
}(Resource);

function query$4(client) {
  var document = client.document();
  var spreads = {};
  var variables = {};
  variables.__defaultOperation__ = {};
  variables.__defaultOperation__.id = client.variable("id", "ID!");
  spreads.CollectionFragment = document.defineFragment("CollectionFragment", "Collection", function (root) {
    root.add("id");
    root.add("handle");
    root.add("description");
    root.add("descriptionHtml");
    root.add("updatedAt");
    root.add("title");
    root.add("image", function (image) {
      image.add("id");
      image.add("src");
      image.add("altText");
    });
  });
  document.addQuery([variables.__defaultOperation__.id], function (root) {
    root.add("node", {
      args: {
        id: variables.__defaultOperation__.id
      }
    }, function (node) {
      node.addFragment(spreads.CollectionFragment);
    });
  });
  return document;
}

function query$5(client) {
  var document = client.document();
  var spreads = {};
  var variables = {};
  variables.__defaultOperation__ = {};
  variables.__defaultOperation__.id = client.variable("id", "ID!");
  spreads.VariantFragment = document.defineFragment("VariantFragment", "ProductVariant", function (root) {
    root.add("id");
    root.add("title");
    root.add("price");
    root.add("weight");
    root.add("available");
    root.add("sku");
    root.add("compareAtPrice");
    root.add("image", function (image) {
      image.add("id");
      image.add("src");
      image.add("altText");
    });
    root.add("selectedOptions", function (selectedOptions) {
      selectedOptions.add("name");
      selectedOptions.add("value");
    });
  });
  spreads.ProductFragment = document.defineFragment("ProductFragment", "Product", function (root) {
    root.add("id");
    root.add("createdAt");
    root.add("updatedAt");
    root.add("descriptionHtml");
    root.add("description");
    root.add("handle");
    root.add("productType");
    root.add("title");
    root.add("vendor");
    root.add("tags");
    root.add("publishedAt");
    root.add("onlineStoreUrl");
    root.add("options", function (options) {
      options.add("name");
      options.add("values");
    });
    root.add("images", {
      args: {
        first: 250
      }
    }, function (images) {
      images.add("pageInfo", function (pageInfo) {
        pageInfo.add("hasNextPage");
        pageInfo.add("hasPreviousPage");
      });
      images.add("edges", function (edges) {
        edges.add("cursor");
        edges.add("node", function (node) {
          node.add("id");
          node.add("src");
          node.add("altText");
        });
      });
    });
    root.add("variants", {
      args: {
        first: 250
      }
    }, function (variants) {
      variants.add("pageInfo", function (pageInfo) {
        pageInfo.add("hasNextPage");
        pageInfo.add("hasPreviousPage");
      });
      variants.add("edges", function (edges) {
        edges.add("cursor");
        edges.add("node", function (node) {
          node.addFragment(spreads.VariantFragment);
        });
      });
    });
  });
  spreads.CollectionFragment = document.defineFragment("CollectionFragment", "Collection", function (root) {
    root.add("id");
    root.add("handle");
    root.add("description");
    root.add("descriptionHtml");
    root.add("updatedAt");
    root.add("title");
    root.add("image", function (image) {
      image.add("id");
      image.add("src");
      image.add("altText");
    });
  });
  spreads.CollectionsProductsFragment = document.defineFragment("CollectionsProductsFragment", "Collection", function (root) {
    root.add("products", {
      args: {
        first: 20
      }
    }, function (products) {
      products.add("pageInfo", function (pageInfo) {
        pageInfo.add("hasNextPage");
        pageInfo.add("hasPreviousPage");
      });
      products.add("edges", function (edges) {
        edges.add("cursor");
        edges.add("node", function (node) {
          node.addFragment(spreads.ProductFragment);
        });
      });
    });
  });
  document.addQuery([variables.__defaultOperation__.id], function (root) {
    root.add("node", {
      args: {
        id: variables.__defaultOperation__.id
      }
    }, function (node) {
      node.addFragment(spreads.CollectionFragment);
      node.addFragment(spreads.CollectionsProductsFragment);
    });
  });
  return document;
}

function query$6(client) {
  var document = client.document();
  var spreads = {};
  var variables = {};
  variables.__defaultOperation__ = {};
  variables.__defaultOperation__.first = client.variable("first", "Int!");
  variables.__defaultOperation__.query = client.variable("query", "String");
  variables.__defaultOperation__.sortKey = client.variable("sortKey", "CollectionSortKeys");
  variables.__defaultOperation__.reverse = client.variable("reverse", "Boolean");
  spreads.CollectionFragment = document.defineFragment("CollectionFragment", "Collection", function (root) {
    root.add("id");
    root.add("handle");
    root.add("description");
    root.add("descriptionHtml");
    root.add("updatedAt");
    root.add("title");
    root.add("image", function (image) {
      image.add("id");
      image.add("src");
      image.add("altText");
    });
  });
  document.addQuery([variables.__defaultOperation__.first, variables.__defaultOperation__.query, variables.__defaultOperation__.sortKey, variables.__defaultOperation__.reverse], function (root) {
    root.add("shop", function (shop) {
      shop.add("collections", {
        args: {
          first: variables.__defaultOperation__.first,
          query: variables.__defaultOperation__.query,
          sortKey: variables.__defaultOperation__.sortKey,
          reverse: variables.__defaultOperation__.reverse
        }
      }, function (collections) {
        collections.add("pageInfo", function (pageInfo) {
          pageInfo.add("hasNextPage");
          pageInfo.add("hasPreviousPage");
        });
        collections.add("edges", function (edges) {
          edges.add("cursor");
          edges.add("node", function (node) {
            node.addFragment(spreads.CollectionFragment);
          });
        });
      });
    });
  });
  return document;
}

function query$7(client) {
  var document = client.document();
  var spreads = {};
  var variables = {};
  variables.__defaultOperation__ = {};
  variables.__defaultOperation__.first = client.variable("first", "Int!");
  variables.__defaultOperation__.query = client.variable("query", "String");
  variables.__defaultOperation__.sortKey = client.variable("sortKey", "CollectionSortKeys");
  variables.__defaultOperation__.reverse = client.variable("reverse", "Boolean");
  variables.__defaultOperation__.productsFirst = client.variable("productsFirst", "Int!");
  spreads.VariantFragment = document.defineFragment("VariantFragment", "ProductVariant", function (root) {
    root.add("id");
    root.add("title");
    root.add("price");
    root.add("weight");
    root.add("available");
    root.add("sku");
    root.add("compareAtPrice");
    root.add("image", function (image) {
      image.add("id");
      image.add("src");
      image.add("altText");
    });
    root.add("selectedOptions", function (selectedOptions) {
      selectedOptions.add("name");
      selectedOptions.add("value");
    });
  });
  spreads.CollectionFragment = document.defineFragment("CollectionFragment", "Collection", function (root) {
    root.add("id");
    root.add("handle");
    root.add("description");
    root.add("descriptionHtml");
    root.add("updatedAt");
    root.add("title");
    root.add("image", function (image) {
      image.add("id");
      image.add("src");
      image.add("altText");
    });
  });
  spreads.ProductFragment = document.defineFragment("ProductFragment", "Product", function (root) {
    root.add("id");
    root.add("createdAt");
    root.add("updatedAt");
    root.add("descriptionHtml");
    root.add("description");
    root.add("handle");
    root.add("productType");
    root.add("title");
    root.add("vendor");
    root.add("tags");
    root.add("publishedAt");
    root.add("onlineStoreUrl");
    root.add("options", function (options) {
      options.add("name");
      options.add("values");
    });
    root.add("images", {
      args: {
        first: 250
      }
    }, function (images) {
      images.add("pageInfo", function (pageInfo) {
        pageInfo.add("hasNextPage");
        pageInfo.add("hasPreviousPage");
      });
      images.add("edges", function (edges) {
        edges.add("cursor");
        edges.add("node", function (node) {
          node.add("id");
          node.add("src");
          node.add("altText");
        });
      });
    });
    root.add("variants", {
      args: {
        first: 250
      }
    }, function (variants) {
      variants.add("pageInfo", function (pageInfo) {
        pageInfo.add("hasNextPage");
        pageInfo.add("hasPreviousPage");
      });
      variants.add("edges", function (edges) {
        edges.add("cursor");
        edges.add("node", function (node) {
          node.addFragment(spreads.VariantFragment);
        });
      });
    });
  });
  document.addQuery([variables.__defaultOperation__.first, variables.__defaultOperation__.query, variables.__defaultOperation__.sortKey, variables.__defaultOperation__.reverse, variables.__defaultOperation__.productsFirst], function (root) {
    root.add("shop", function (shop) {
      shop.add("collections", {
        args: {
          first: variables.__defaultOperation__.first,
          query: variables.__defaultOperation__.query,
          sortKey: variables.__defaultOperation__.sortKey,
          reverse: variables.__defaultOperation__.reverse
        }
      }, function (collections) {
        collections.add("pageInfo", function (pageInfo) {
          pageInfo.add("hasNextPage");
          pageInfo.add("hasPreviousPage");
        });
        collections.add("edges", function (edges) {
          edges.add("cursor");
          edges.add("node", function (node) {
            node.addFragment(spreads.CollectionFragment);
            node.add("products", {
              args: {
                first: variables.__defaultOperation__.productsFirst
              }
            }, function (products) {
              products.add("pageInfo", function (pageInfo) {
                pageInfo.add("hasNextPage");
                pageInfo.add("hasPreviousPage");
              });
              products.add("edges", function (edges) {
                edges.add("cursor");
                edges.add("node", function (node) {
                  node.addFragment(spreads.ProductFragment);
                });
              });
            });
          });
        });
      });
    });
  });
  return document;
}

function query$8(client) {
  var document = client.document();
  var spreads = {};
  var variables = {};
  variables.__defaultOperation__ = {};
  variables.__defaultOperation__.handle = client.variable("handle", "String!");
  spreads.VariantFragment = document.defineFragment("VariantFragment", "ProductVariant", function (root) {
    root.add("id");
    root.add("title");
    root.add("price");
    root.add("weight");
    root.add("available");
    root.add("sku");
    root.add("compareAtPrice");
    root.add("image", function (image) {
      image.add("id");
      image.add("src");
      image.add("altText");
    });
    root.add("selectedOptions", function (selectedOptions) {
      selectedOptions.add("name");
      selectedOptions.add("value");
    });
  });
  spreads.ProductFragment = document.defineFragment("ProductFragment", "Product", function (root) {
    root.add("id");
    root.add("createdAt");
    root.add("updatedAt");
    root.add("descriptionHtml");
    root.add("description");
    root.add("handle");
    root.add("productType");
    root.add("title");
    root.add("vendor");
    root.add("tags");
    root.add("publishedAt");
    root.add("onlineStoreUrl");
    root.add("options", function (options) {
      options.add("name");
      options.add("values");
    });
    root.add("images", {
      args: {
        first: 250
      }
    }, function (images) {
      images.add("pageInfo", function (pageInfo) {
        pageInfo.add("hasNextPage");
        pageInfo.add("hasPreviousPage");
      });
      images.add("edges", function (edges) {
        edges.add("cursor");
        edges.add("node", function (node) {
          node.add("id");
          node.add("src");
          node.add("altText");
        });
      });
    });
    root.add("variants", {
      args: {
        first: 250
      }
    }, function (variants) {
      variants.add("pageInfo", function (pageInfo) {
        pageInfo.add("hasNextPage");
        pageInfo.add("hasPreviousPage");
      });
      variants.add("edges", function (edges) {
        edges.add("cursor");
        edges.add("node", function (node) {
          node.addFragment(spreads.VariantFragment);
        });
      });
    });
  });
  spreads.CollectionFragment = document.defineFragment("CollectionFragment", "Collection", function (root) {
    root.add("id");
    root.add("handle");
    root.add("description");
    root.add("descriptionHtml");
    root.add("updatedAt");
    root.add("title");
    root.add("image", function (image) {
      image.add("id");
      image.add("src");
      image.add("altText");
    });
  });
  spreads.CollectionsProductsFragment = document.defineFragment("CollectionsProductsFragment", "Collection", function (root) {
    root.add("products", {
      args: {
        first: 20
      }
    }, function (products) {
      products.add("pageInfo", function (pageInfo) {
        pageInfo.add("hasNextPage");
        pageInfo.add("hasPreviousPage");
      });
      products.add("edges", function (edges) {
        edges.add("cursor");
        edges.add("node", function (node) {
          node.addFragment(spreads.ProductFragment);
        });
      });
    });
  });
  document.addQuery([variables.__defaultOperation__.handle], function (root) {
    root.add("shop", function (shop) {
      shop.add("collectionByHandle", {
        args: {
          handle: variables.__defaultOperation__.handle
        }
      }, function (collectionByHandle) {
        collectionByHandle.addFragment(spreads.CollectionFragment);
        collectionByHandle.addFragment(spreads.CollectionsProductsFragment);
      });
    });
  });
  return document;
}

// GraphQL
/**
 * The JS Buy SDK collection resource
 * @class
 */

var CollectionResource = function (_Resource) {
  inherits(CollectionResource, _Resource);

  function CollectionResource() {
    classCallCheck(this, CollectionResource);
    return possibleConstructorReturn(this, (CollectionResource.__proto__ || Object.getPrototypeOf(CollectionResource)).apply(this, arguments));
  }

  createClass(CollectionResource, [{
    key: 'fetchAll',


    /**
     * Fetches all collections on the shop, not including products.
     * To fetch collections with products use [fetchAllsWithProducts]{@link Client#fetchAllsWithProducts}.
     *
     * @example
     * client.collection.fetchAll().then((collections) => {
     *   // Do something with the collections
     * });
     *
     * @return {Promise|GraphModel[]} A promise resolving with an array of `GraphModel`s of the collections.
     */
    value: function fetchAll() {
      var first = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 20;

      return this.graphQLClient.send(query$6, { first: first }).then(defaultResolver('shop.collections'));
    }

    /**
     * Fetches all collections on the shop, including products.
     *
     * @example
     * client.collection.fetchAllWithProducts().then((collections) => {
     *   // Do something with the collections
     * });
     *
     * @return {Promise|GraphModel[]} A promise resolving with an array of `GraphModel`s of the collections.
     */

  }, {
    key: 'fetchAllWithProducts',
    value: function fetchAllWithProducts() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref$first = _ref.first,
          first = _ref$first === undefined ? 20 : _ref$first,
          _ref$productsFirst = _ref.productsFirst,
          productsFirst = _ref$productsFirst === undefined ? 20 : _ref$productsFirst;

      return this.graphQLClient.send(query$7, { first: first, productsFirst: productsFirst }).then(defaultResolver('shop.collections')).then(paginateCollectionsProductConnectionsAndResolve(this.graphQLClient));
    }

    /**
     * Fetches a single collection by ID on the shop, not including products.
     * To fetch the collection with products use [fetchWithProducts]{@link Client#fetchWithProducts}.
     *
     * @example
     * client.collection.fetch('Xk9lM2JkNzFmNzIQ4NTIY4ZDFiZTUyZTUwNTE2MDNhZjg==').then((collection) => {
     *   // Do something with the collection
     * });
     *
     * @param {String} id The id of the collection to fetch.
     * @return {Promise|GraphModel} A promise resolving with a `GraphModel` of the collection.
     */

  }, {
    key: 'fetch',
    value: function fetch(id) {
      return this.graphQLClient.send(query$4, { id: id }).then(defaultResolver('node'));
    }

    /**
     * Fetches a single collection by ID on the shop, including products.
     *
     * @example
     * client.collection.fetchWithProducts('Xk9lM2JkNzFmNzIQ4NTIY4ZDFiZTUyZTUwNTE2MDNhZjg==').then((collection) => {
     *   // Do something with the collection
     * });
     *
     * @param {String} id The id of the collection to fetch.
     * @return {Promise|GraphModel} A promise resolving with a `GraphModel` of the collection.
     */

  }, {
    key: 'fetchWithProducts',
    value: function fetchWithProducts(id) {
      return this.graphQLClient.send(query$5, { id: id }).then(defaultResolver('node')).then(paginateCollectionsProductConnectionsAndResolve(this.graphQLClient));
    }

    /**
     * Fetches a collection by handle on the shop.
     *
     * @example
     * client.collection.fetchByHandle('my-collection').then((collection) => {
     *   // Do something with the collection
     * });
     *
     * @param {String} handle The handle of the collection to fetch.
     * @return {Promise|GraphModel} A promise resolving with a `GraphModel` of the collection.
     */

  }, {
    key: 'fetchByHandle',
    value: function fetchByHandle(handle) {
      return this.graphQLClient.send(query$8, { handle: handle }).then(defaultResolver('shop.collectionByHandle'));
    }

    /**
     * Fetches all collections on the shop that match the query.
     *
     * @example
     * client.collection.fetchQuery({first: 20, sortKey: 'CREATED_AT', reverse: true}).then((collections) => {
     *   // Do something with the first 10 collections sorted by title in ascending order
     * });
     *
     * @param {Object} [args] An object specifying the query data containing zero or more of:
     *   @param {Int} [args.first=20] The relay `first` param. This specifies page size.
     *   @param {String} [args.sortKey=ID] The key to sort results by. Available values are
     *   documented as {@link https://help.shopify.com/api/storefront-api/reference/enum/collectionsortkeys|Collection Sort Keys}.
     *   @param {String} [args.query] A query string. See full documentation {@link https://help.shopify.com/api/storefront-api/reference/object/shop#collections|here}
     *   @param {Boolean} [args.reverse] Whether or not to reverse the sort order of the results
     * @return {Promise|GraphModel[]} A promise resolving with an array of `GraphModel`s of the collections.
     */

  }, {
    key: 'fetchQuery',
    value: function fetchQuery() {
      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref2$first = _ref2.first,
          first = _ref2$first === undefined ? 20 : _ref2$first,
          _ref2$sortKey = _ref2.sortKey,
          sortKey = _ref2$sortKey === undefined ? 'ID' : _ref2$sortKey,
          query = _ref2.query,
          reverse = _ref2.reverse;

      return this.graphQLClient.send(query$6, {
        first: first,
        sortKey: sortKey,
        query: query,
        reverse: reverse
      }).then(defaultResolver('shop.collections'));
    }
  }]);
  return CollectionResource;
}(Resource);

function query$9(client) {
  var document = client.document();
  document.addQuery(function (root) {
    root.add("shop", function (shop) {
      shop.add("currencyCode");
      shop.add("description");
      shop.add("moneyFormat");
      shop.add("name");
      shop.add("primaryDomain", function (primaryDomain) {
        primaryDomain.add("host");
        primaryDomain.add("sslEnabled");
        primaryDomain.add("url");
      });
    });
  });
  return document;
}

function query$10(client) {
  var document = client.document();
  var spreads = {};
  spreads.PolicyFragment = document.defineFragment("PolicyFragment", "ShopPolicy", function (root) {
    root.add("id");
    root.add("title");
    root.add("url");
    root.add("body");
  });
  document.addQuery(function (root) {
    root.add("shop", function (shop) {
      shop.add("privacyPolicy", function (privacyPolicy) {
        privacyPolicy.addFragment(spreads.PolicyFragment);
      });
      shop.add("termsOfService", function (termsOfService) {
        termsOfService.addFragment(spreads.PolicyFragment);
      });
      shop.add("refundPolicy", function (refundPolicy) {
        refundPolicy.addFragment(spreads.PolicyFragment);
      });
    });
  });
  return document;
}

// GraphQL
/**
 * The JS Buy SDK shop resource
 * @class
 */

var ShopResource = function (_Resource) {
  inherits(ShopResource, _Resource);

  function ShopResource() {
    classCallCheck(this, ShopResource);
    return possibleConstructorReturn(this, (ShopResource.__proto__ || Object.getPrototypeOf(ShopResource)).apply(this, arguments));
  }

  createClass(ShopResource, [{
    key: 'fetchInfo',


    /**
     * Fetches shop information (`currencyCode`, `description`, `moneyFormat`, `name`, and `primaryDomain`).
     * See the {@link https://help.shopify.com/api/storefront-api/reference/object/shop|Storefront API reference} for more information.
     *
     * @example
     * client.shop.fetchInfo().then((shop) => {
     *   // Do something with the shop
     * });
     *
     * @return {Promise|GraphModel} A promise resolving with a `GraphModel` of the shop.
     */
    value: function fetchInfo() {
      return this.graphQLClient.send(query$9).then(defaultResolver('shop'));
    }

    /**
     * Fetches shop policies (privacy policy, terms of service and refund policy).
     *
     * @example
     * client.shop.fetchPolicies().then((shop) => {
     *   // Do something with the shop
     * });
     *
     * @return {Promise|GraphModel} A promise resolving with a `GraphModel` of the shop.
     */

  }, {
    key: 'fetchPolicies',
    value: function fetchPolicies() {
      return this.graphQLClient.send(query$10).then(defaultResolver('shop'));
    }
  }]);
  return ShopResource;
}(Resource);

function handleCheckoutMutation(mutationRootKey, client) {
  return function (_ref) {
    var data = _ref.data,
        errors = _ref.errors,
        model = _ref.model;

    var rootData = data[mutationRootKey];
    var rootModel = model[mutationRootKey];

    if (rootData && rootData.checkout) {
      return client.fetchAllPages(rootModel.checkout.lineItems, { pageSize: 250 }).then(function (lineItems) {
        rootModel.checkout.attrs.lineItems = lineItems;
        rootModel.checkout.errors = errors;
        rootModel.checkout.userErrors = rootModel.userErrors;

        return rootModel.checkout;
      });
    }

    if (errors && errors.length) {
      return Promise.reject(new Error(JSON.stringify(errors)));
    }

    if (rootData && rootData.userErrors && rootData.userErrors.length) {
      return Promise.reject(new Error(JSON.stringify(rootData.userErrors)));
    }

    return Promise.reject(new Error("The " + mutationRootKey + " mutation failed due to an unknown error."));
  };
}

function query$11(client) {
  var document = client.document();
  var spreads = {};
  var variables = {};
  variables.__defaultOperation__ = {};
  variables.__defaultOperation__.id = client.variable("id", "ID!");
  spreads.VariantFragment = document.defineFragment("VariantFragment", "ProductVariant", function (root) {
    root.add("id");
    root.add("title");
    root.add("price");
    root.add("weight");
    root.add("available");
    root.add("sku");
    root.add("compareAtPrice");
    root.add("image", function (image) {
      image.add("id");
      image.add("src");
      image.add("altText");
    });
    root.add("selectedOptions", function (selectedOptions) {
      selectedOptions.add("name");
      selectedOptions.add("value");
    });
  });
  spreads.VariantWithProductFragment = document.defineFragment("VariantWithProductFragment", "ProductVariant", function (root) {
    root.addFragment(spreads.VariantFragment);
    root.add("product", function (product) {
      product.add("id");
    });
  });
  spreads.MailingAddressFragment = document.defineFragment("MailingAddressFragment", "MailingAddress", function (root) {
    root.add("id");
    root.add("address1");
    root.add("address2");
    root.add("city");
    root.add("company");
    root.add("country");
    root.add("firstName");
    root.add("formatted");
    root.add("lastName");
    root.add("latitude");
    root.add("longitude");
    root.add("phone");
    root.add("province");
    root.add("zip");
    root.add("name");
    root.add("countryCode");
    root.add("provinceCode");
  });
  spreads.CheckoutFragment = document.defineFragment("CheckoutFragment", "Checkout", function (root) {
    root.add("id");
    root.add("ready");
    root.add("requiresShipping");
    root.add("note");
    root.add("paymentDue");
    root.add("webUrl");
    root.add("orderStatusUrl");
    root.add("taxExempt");
    root.add("taxesIncluded");
    root.add("currencyCode");
    root.add("totalTax");
    root.add("subtotalPrice");
    root.add("totalPrice");
    root.add("completedAt");
    root.add("createdAt");
    root.add("updatedAt");
    root.add("shippingAddress", function (shippingAddress) {
      shippingAddress.addFragment(spreads.MailingAddressFragment);
    });
    root.add("shippingLine", function (shippingLine) {
      shippingLine.add("handle");
      shippingLine.add("price");
      shippingLine.add("title");
    });
    root.add("customAttributes", function (customAttributes) {
      customAttributes.add("key");
      customAttributes.add("value");
    });
    root.add("order", function (order) {
      order.add("id");
      order.add("processedAt");
      order.add("orderNumber");
      order.add("subtotalPrice");
      order.add("totalShippingPrice");
      order.add("totalTax");
      order.add("totalPrice");
      order.add("currencyCode");
      order.add("totalRefunded");
      order.add("customerUrl");
      order.add("shippingAddress", function (shippingAddress) {
        shippingAddress.addFragment(spreads.MailingAddressFragment);
      });
      order.add("lineItems", {
        args: {
          first: 250
        }
      }, function (lineItems) {
        lineItems.add("pageInfo", function (pageInfo) {
          pageInfo.add("hasNextPage");
          pageInfo.add("hasPreviousPage");
        });
        lineItems.add("edges", function (edges) {
          edges.add("cursor");
          edges.add("node", function (node) {
            node.add("title");
            node.add("variant", function (variant) {
              variant.addFragment(spreads.VariantWithProductFragment);
            });
            node.add("quantity");
            node.add("customAttributes", function (customAttributes) {
              customAttributes.add("key");
              customAttributes.add("value");
            });
          });
        });
      });
    });
    root.add("lineItems", {
      args: {
        first: 250
      }
    }, function (lineItems) {
      lineItems.add("pageInfo", function (pageInfo) {
        pageInfo.add("hasNextPage");
        pageInfo.add("hasPreviousPage");
      });
      lineItems.add("edges", function (edges) {
        edges.add("cursor");
        edges.add("node", function (node) {
          node.add("id");
          node.add("title");
          node.add("variant", function (variant) {
            variant.addFragment(spreads.VariantWithProductFragment);
          });
          node.add("quantity");
          node.add("customAttributes", function (customAttributes) {
            customAttributes.add("key");
            customAttributes.add("value");
          });
        });
      });
    });
  });
  document.addQuery([variables.__defaultOperation__.id], function (root) {
    root.add("node", {
      args: {
        id: variables.__defaultOperation__.id
      }
    }, function (node) {
      node.addFragment(spreads.CheckoutFragment);
    });
  });
  return document;
}

function query$12(client) {
  var document = client.document();
  var spreads = {};
  var variables = {};
  variables.__defaultOperation__ = {};
  variables.__defaultOperation__.input = client.variable("input", "CheckoutCreateInput!");
  spreads.VariantFragment = document.defineFragment("VariantFragment", "ProductVariant", function (root) {
    root.add("id");
    root.add("title");
    root.add("price");
    root.add("weight");
    root.add("available");
    root.add("sku");
    root.add("compareAtPrice");
    root.add("image", function (image) {
      image.add("id");
      image.add("src");
      image.add("altText");
    });
    root.add("selectedOptions", function (selectedOptions) {
      selectedOptions.add("name");
      selectedOptions.add("value");
    });
  });
  spreads.VariantWithProductFragment = document.defineFragment("VariantWithProductFragment", "ProductVariant", function (root) {
    root.addFragment(spreads.VariantFragment);
    root.add("product", function (product) {
      product.add("id");
    });
  });
  spreads.UserErrorFragment = document.defineFragment("UserErrorFragment", "UserError", function (root) {
    root.add("field");
    root.add("message");
  });
  spreads.MailingAddressFragment = document.defineFragment("MailingAddressFragment", "MailingAddress", function (root) {
    root.add("id");
    root.add("address1");
    root.add("address2");
    root.add("city");
    root.add("company");
    root.add("country");
    root.add("firstName");
    root.add("formatted");
    root.add("lastName");
    root.add("latitude");
    root.add("longitude");
    root.add("phone");
    root.add("province");
    root.add("zip");
    root.add("name");
    root.add("countryCode");
    root.add("provinceCode");
  });
  spreads.CheckoutFragment = document.defineFragment("CheckoutFragment", "Checkout", function (root) {
    root.add("id");
    root.add("ready");
    root.add("requiresShipping");
    root.add("note");
    root.add("paymentDue");
    root.add("webUrl");
    root.add("orderStatusUrl");
    root.add("taxExempt");
    root.add("taxesIncluded");
    root.add("currencyCode");
    root.add("totalTax");
    root.add("subtotalPrice");
    root.add("totalPrice");
    root.add("completedAt");
    root.add("createdAt");
    root.add("updatedAt");
    root.add("shippingAddress", function (shippingAddress) {
      shippingAddress.addFragment(spreads.MailingAddressFragment);
    });
    root.add("shippingLine", function (shippingLine) {
      shippingLine.add("handle");
      shippingLine.add("price");
      shippingLine.add("title");
    });
    root.add("customAttributes", function (customAttributes) {
      customAttributes.add("key");
      customAttributes.add("value");
    });
    root.add("order", function (order) {
      order.add("id");
      order.add("processedAt");
      order.add("orderNumber");
      order.add("subtotalPrice");
      order.add("totalShippingPrice");
      order.add("totalTax");
      order.add("totalPrice");
      order.add("currencyCode");
      order.add("totalRefunded");
      order.add("customerUrl");
      order.add("shippingAddress", function (shippingAddress) {
        shippingAddress.addFragment(spreads.MailingAddressFragment);
      });
      order.add("lineItems", {
        args: {
          first: 250
        }
      }, function (lineItems) {
        lineItems.add("pageInfo", function (pageInfo) {
          pageInfo.add("hasNextPage");
          pageInfo.add("hasPreviousPage");
        });
        lineItems.add("edges", function (edges) {
          edges.add("cursor");
          edges.add("node", function (node) {
            node.add("title");
            node.add("variant", function (variant) {
              variant.addFragment(spreads.VariantWithProductFragment);
            });
            node.add("quantity");
            node.add("customAttributes", function (customAttributes) {
              customAttributes.add("key");
              customAttributes.add("value");
            });
          });
        });
      });
    });
    root.add("lineItems", {
      args: {
        first: 250
      }
    }, function (lineItems) {
      lineItems.add("pageInfo", function (pageInfo) {
        pageInfo.add("hasNextPage");
        pageInfo.add("hasPreviousPage");
      });
      lineItems.add("edges", function (edges) {
        edges.add("cursor");
        edges.add("node", function (node) {
          node.add("id");
          node.add("title");
          node.add("variant", function (variant) {
            variant.addFragment(spreads.VariantWithProductFragment);
          });
          node.add("quantity");
          node.add("customAttributes", function (customAttributes) {
            customAttributes.add("key");
            customAttributes.add("value");
          });
        });
      });
    });
  });
  document.addMutation([variables.__defaultOperation__.input], function (root) {
    root.add("checkoutCreate", {
      args: {
        input: variables.__defaultOperation__.input
      }
    }, function (checkoutCreate) {
      checkoutCreate.add("userErrors", function (userErrors) {
        userErrors.addFragment(spreads.UserErrorFragment);
      });
      checkoutCreate.add("checkout", function (checkout) {
        checkout.addFragment(spreads.CheckoutFragment);
      });
    });
  });
  return document;
}

function query$13(client) {
  var document = client.document();
  var spreads = {};
  var variables = {};
  variables.__defaultOperation__ = {};
  variables.__defaultOperation__.checkoutId = client.variable("checkoutId", "ID!");
  variables.__defaultOperation__.lineItems = client.variable("lineItems", "[CheckoutLineItemInput!]!");
  spreads.VariantFragment = document.defineFragment("VariantFragment", "ProductVariant", function (root) {
    root.add("id");
    root.add("title");
    root.add("price");
    root.add("weight");
    root.add("available");
    root.add("sku");
    root.add("compareAtPrice");
    root.add("image", function (image) {
      image.add("id");
      image.add("src");
      image.add("altText");
    });
    root.add("selectedOptions", function (selectedOptions) {
      selectedOptions.add("name");
      selectedOptions.add("value");
    });
  });
  spreads.VariantWithProductFragment = document.defineFragment("VariantWithProductFragment", "ProductVariant", function (root) {
    root.addFragment(spreads.VariantFragment);
    root.add("product", function (product) {
      product.add("id");
    });
  });
  spreads.UserErrorFragment = document.defineFragment("UserErrorFragment", "UserError", function (root) {
    root.add("field");
    root.add("message");
  });
  spreads.MailingAddressFragment = document.defineFragment("MailingAddressFragment", "MailingAddress", function (root) {
    root.add("id");
    root.add("address1");
    root.add("address2");
    root.add("city");
    root.add("company");
    root.add("country");
    root.add("firstName");
    root.add("formatted");
    root.add("lastName");
    root.add("latitude");
    root.add("longitude");
    root.add("phone");
    root.add("province");
    root.add("zip");
    root.add("name");
    root.add("countryCode");
    root.add("provinceCode");
  });
  spreads.CheckoutFragment = document.defineFragment("CheckoutFragment", "Checkout", function (root) {
    root.add("id");
    root.add("ready");
    root.add("requiresShipping");
    root.add("note");
    root.add("paymentDue");
    root.add("webUrl");
    root.add("orderStatusUrl");
    root.add("taxExempt");
    root.add("taxesIncluded");
    root.add("currencyCode");
    root.add("totalTax");
    root.add("subtotalPrice");
    root.add("totalPrice");
    root.add("completedAt");
    root.add("createdAt");
    root.add("updatedAt");
    root.add("shippingAddress", function (shippingAddress) {
      shippingAddress.addFragment(spreads.MailingAddressFragment);
    });
    root.add("shippingLine", function (shippingLine) {
      shippingLine.add("handle");
      shippingLine.add("price");
      shippingLine.add("title");
    });
    root.add("customAttributes", function (customAttributes) {
      customAttributes.add("key");
      customAttributes.add("value");
    });
    root.add("order", function (order) {
      order.add("id");
      order.add("processedAt");
      order.add("orderNumber");
      order.add("subtotalPrice");
      order.add("totalShippingPrice");
      order.add("totalTax");
      order.add("totalPrice");
      order.add("currencyCode");
      order.add("totalRefunded");
      order.add("customerUrl");
      order.add("shippingAddress", function (shippingAddress) {
        shippingAddress.addFragment(spreads.MailingAddressFragment);
      });
      order.add("lineItems", {
        args: {
          first: 250
        }
      }, function (lineItems) {
        lineItems.add("pageInfo", function (pageInfo) {
          pageInfo.add("hasNextPage");
          pageInfo.add("hasPreviousPage");
        });
        lineItems.add("edges", function (edges) {
          edges.add("cursor");
          edges.add("node", function (node) {
            node.add("title");
            node.add("variant", function (variant) {
              variant.addFragment(spreads.VariantWithProductFragment);
            });
            node.add("quantity");
            node.add("customAttributes", function (customAttributes) {
              customAttributes.add("key");
              customAttributes.add("value");
            });
          });
        });
      });
    });
    root.add("lineItems", {
      args: {
        first: 250
      }
    }, function (lineItems) {
      lineItems.add("pageInfo", function (pageInfo) {
        pageInfo.add("hasNextPage");
        pageInfo.add("hasPreviousPage");
      });
      lineItems.add("edges", function (edges) {
        edges.add("cursor");
        edges.add("node", function (node) {
          node.add("id");
          node.add("title");
          node.add("variant", function (variant) {
            variant.addFragment(spreads.VariantWithProductFragment);
          });
          node.add("quantity");
          node.add("customAttributes", function (customAttributes) {
            customAttributes.add("key");
            customAttributes.add("value");
          });
        });
      });
    });
  });
  document.addMutation([variables.__defaultOperation__.checkoutId, variables.__defaultOperation__.lineItems], function (root) {
    root.add("checkoutLineItemsAdd", {
      args: {
        checkoutId: variables.__defaultOperation__.checkoutId,
        lineItems: variables.__defaultOperation__.lineItems
      }
    }, function (checkoutLineItemsAdd) {
      checkoutLineItemsAdd.add("userErrors", function (userErrors) {
        userErrors.addFragment(spreads.UserErrorFragment);
      });
      checkoutLineItemsAdd.add("checkout", function (checkout) {
        checkout.addFragment(spreads.CheckoutFragment);
      });
    });
  });
  return document;
}

function query$14(client) {
  var document = client.document();
  var spreads = {};
  var variables = {};
  variables.__defaultOperation__ = {};
  variables.__defaultOperation__.checkoutId = client.variable("checkoutId", "ID!");
  variables.__defaultOperation__.lineItemIds = client.variable("lineItemIds", "[ID!]!");
  spreads.VariantFragment = document.defineFragment("VariantFragment", "ProductVariant", function (root) {
    root.add("id");
    root.add("title");
    root.add("price");
    root.add("weight");
    root.add("available");
    root.add("sku");
    root.add("compareAtPrice");
    root.add("image", function (image) {
      image.add("id");
      image.add("src");
      image.add("altText");
    });
    root.add("selectedOptions", function (selectedOptions) {
      selectedOptions.add("name");
      selectedOptions.add("value");
    });
  });
  spreads.VariantWithProductFragment = document.defineFragment("VariantWithProductFragment", "ProductVariant", function (root) {
    root.addFragment(spreads.VariantFragment);
    root.add("product", function (product) {
      product.add("id");
    });
  });
  spreads.UserErrorFragment = document.defineFragment("UserErrorFragment", "UserError", function (root) {
    root.add("field");
    root.add("message");
  });
  spreads.MailingAddressFragment = document.defineFragment("MailingAddressFragment", "MailingAddress", function (root) {
    root.add("id");
    root.add("address1");
    root.add("address2");
    root.add("city");
    root.add("company");
    root.add("country");
    root.add("firstName");
    root.add("formatted");
    root.add("lastName");
    root.add("latitude");
    root.add("longitude");
    root.add("phone");
    root.add("province");
    root.add("zip");
    root.add("name");
    root.add("countryCode");
    root.add("provinceCode");
  });
  spreads.CheckoutFragment = document.defineFragment("CheckoutFragment", "Checkout", function (root) {
    root.add("id");
    root.add("ready");
    root.add("requiresShipping");
    root.add("note");
    root.add("paymentDue");
    root.add("webUrl");
    root.add("orderStatusUrl");
    root.add("taxExempt");
    root.add("taxesIncluded");
    root.add("currencyCode");
    root.add("totalTax");
    root.add("subtotalPrice");
    root.add("totalPrice");
    root.add("completedAt");
    root.add("createdAt");
    root.add("updatedAt");
    root.add("shippingAddress", function (shippingAddress) {
      shippingAddress.addFragment(spreads.MailingAddressFragment);
    });
    root.add("shippingLine", function (shippingLine) {
      shippingLine.add("handle");
      shippingLine.add("price");
      shippingLine.add("title");
    });
    root.add("customAttributes", function (customAttributes) {
      customAttributes.add("key");
      customAttributes.add("value");
    });
    root.add("order", function (order) {
      order.add("id");
      order.add("processedAt");
      order.add("orderNumber");
      order.add("subtotalPrice");
      order.add("totalShippingPrice");
      order.add("totalTax");
      order.add("totalPrice");
      order.add("currencyCode");
      order.add("totalRefunded");
      order.add("customerUrl");
      order.add("shippingAddress", function (shippingAddress) {
        shippingAddress.addFragment(spreads.MailingAddressFragment);
      });
      order.add("lineItems", {
        args: {
          first: 250
        }
      }, function (lineItems) {
        lineItems.add("pageInfo", function (pageInfo) {
          pageInfo.add("hasNextPage");
          pageInfo.add("hasPreviousPage");
        });
        lineItems.add("edges", function (edges) {
          edges.add("cursor");
          edges.add("node", function (node) {
            node.add("title");
            node.add("variant", function (variant) {
              variant.addFragment(spreads.VariantWithProductFragment);
            });
            node.add("quantity");
            node.add("customAttributes", function (customAttributes) {
              customAttributes.add("key");
              customAttributes.add("value");
            });
          });
        });
      });
    });
    root.add("lineItems", {
      args: {
        first: 250
      }
    }, function (lineItems) {
      lineItems.add("pageInfo", function (pageInfo) {
        pageInfo.add("hasNextPage");
        pageInfo.add("hasPreviousPage");
      });
      lineItems.add("edges", function (edges) {
        edges.add("cursor");
        edges.add("node", function (node) {
          node.add("id");
          node.add("title");
          node.add("variant", function (variant) {
            variant.addFragment(spreads.VariantWithProductFragment);
          });
          node.add("quantity");
          node.add("customAttributes", function (customAttributes) {
            customAttributes.add("key");
            customAttributes.add("value");
          });
        });
      });
    });
  });
  document.addMutation([variables.__defaultOperation__.checkoutId, variables.__defaultOperation__.lineItemIds], function (root) {
    root.add("checkoutLineItemsRemove", {
      args: {
        checkoutId: variables.__defaultOperation__.checkoutId,
        lineItemIds: variables.__defaultOperation__.lineItemIds
      }
    }, function (checkoutLineItemsRemove) {
      checkoutLineItemsRemove.add("userErrors", function (userErrors) {
        userErrors.addFragment(spreads.UserErrorFragment);
      });
      checkoutLineItemsRemove.add("checkout", function (checkout) {
        checkout.addFragment(spreads.CheckoutFragment);
      });
    });
  });
  return document;
}

function query$15(client) {
  var document = client.document();
  var spreads = {};
  var variables = {};
  variables.__defaultOperation__ = {};
  variables.__defaultOperation__.checkoutId = client.variable("checkoutId", "ID!");
  variables.__defaultOperation__.lineItems = client.variable("lineItems", "[CheckoutLineItemUpdateInput!]!");
  spreads.VariantFragment = document.defineFragment("VariantFragment", "ProductVariant", function (root) {
    root.add("id");
    root.add("title");
    root.add("price");
    root.add("weight");
    root.add("available");
    root.add("sku");
    root.add("compareAtPrice");
    root.add("image", function (image) {
      image.add("id");
      image.add("src");
      image.add("altText");
    });
    root.add("selectedOptions", function (selectedOptions) {
      selectedOptions.add("name");
      selectedOptions.add("value");
    });
  });
  spreads.VariantWithProductFragment = document.defineFragment("VariantWithProductFragment", "ProductVariant", function (root) {
    root.addFragment(spreads.VariantFragment);
    root.add("product", function (product) {
      product.add("id");
    });
  });
  spreads.UserErrorFragment = document.defineFragment("UserErrorFragment", "UserError", function (root) {
    root.add("field");
    root.add("message");
  });
  spreads.MailingAddressFragment = document.defineFragment("MailingAddressFragment", "MailingAddress", function (root) {
    root.add("id");
    root.add("address1");
    root.add("address2");
    root.add("city");
    root.add("company");
    root.add("country");
    root.add("firstName");
    root.add("formatted");
    root.add("lastName");
    root.add("latitude");
    root.add("longitude");
    root.add("phone");
    root.add("province");
    root.add("zip");
    root.add("name");
    root.add("countryCode");
    root.add("provinceCode");
  });
  spreads.CheckoutFragment = document.defineFragment("CheckoutFragment", "Checkout", function (root) {
    root.add("id");
    root.add("ready");
    root.add("requiresShipping");
    root.add("note");
    root.add("paymentDue");
    root.add("webUrl");
    root.add("orderStatusUrl");
    root.add("taxExempt");
    root.add("taxesIncluded");
    root.add("currencyCode");
    root.add("totalTax");
    root.add("subtotalPrice");
    root.add("totalPrice");
    root.add("completedAt");
    root.add("createdAt");
    root.add("updatedAt");
    root.add("shippingAddress", function (shippingAddress) {
      shippingAddress.addFragment(spreads.MailingAddressFragment);
    });
    root.add("shippingLine", function (shippingLine) {
      shippingLine.add("handle");
      shippingLine.add("price");
      shippingLine.add("title");
    });
    root.add("customAttributes", function (customAttributes) {
      customAttributes.add("key");
      customAttributes.add("value");
    });
    root.add("order", function (order) {
      order.add("id");
      order.add("processedAt");
      order.add("orderNumber");
      order.add("subtotalPrice");
      order.add("totalShippingPrice");
      order.add("totalTax");
      order.add("totalPrice");
      order.add("currencyCode");
      order.add("totalRefunded");
      order.add("customerUrl");
      order.add("shippingAddress", function (shippingAddress) {
        shippingAddress.addFragment(spreads.MailingAddressFragment);
      });
      order.add("lineItems", {
        args: {
          first: 250
        }
      }, function (lineItems) {
        lineItems.add("pageInfo", function (pageInfo) {
          pageInfo.add("hasNextPage");
          pageInfo.add("hasPreviousPage");
        });
        lineItems.add("edges", function (edges) {
          edges.add("cursor");
          edges.add("node", function (node) {
            node.add("title");
            node.add("variant", function (variant) {
              variant.addFragment(spreads.VariantWithProductFragment);
            });
            node.add("quantity");
            node.add("customAttributes", function (customAttributes) {
              customAttributes.add("key");
              customAttributes.add("value");
            });
          });
        });
      });
    });
    root.add("lineItems", {
      args: {
        first: 250
      }
    }, function (lineItems) {
      lineItems.add("pageInfo", function (pageInfo) {
        pageInfo.add("hasNextPage");
        pageInfo.add("hasPreviousPage");
      });
      lineItems.add("edges", function (edges) {
        edges.add("cursor");
        edges.add("node", function (node) {
          node.add("id");
          node.add("title");
          node.add("variant", function (variant) {
            variant.addFragment(spreads.VariantWithProductFragment);
          });
          node.add("quantity");
          node.add("customAttributes", function (customAttributes) {
            customAttributes.add("key");
            customAttributes.add("value");
          });
        });
      });
    });
  });
  document.addMutation([variables.__defaultOperation__.checkoutId, variables.__defaultOperation__.lineItems], function (root) {
    root.add("checkoutLineItemsUpdate", {
      args: {
        checkoutId: variables.__defaultOperation__.checkoutId,
        lineItems: variables.__defaultOperation__.lineItems
      }
    }, function (checkoutLineItemsUpdate) {
      checkoutLineItemsUpdate.add("userErrors", function (userErrors) {
        userErrors.addFragment(spreads.UserErrorFragment);
      });
      checkoutLineItemsUpdate.add("checkout", function (checkout) {
        checkout.addFragment(spreads.CheckoutFragment);
      });
    });
  });
  return document;
}

// GraphQL
/**
 * The JS Buy SDK checkout resource
 * @class
 */

var CheckoutResource = function (_Resource) {
  inherits(CheckoutResource, _Resource);

  function CheckoutResource() {
    classCallCheck(this, CheckoutResource);
    return possibleConstructorReturn(this, (CheckoutResource.__proto__ || Object.getPrototypeOf(CheckoutResource)).apply(this, arguments));
  }

  createClass(CheckoutResource, [{
    key: 'fetch',


    /**
     * Fetches a checkout by ID.
     *
     * @example
     * client.checkout.fetch('FlZj9rZXlN5MDY4ZDFiZTUyZTUwNTE2MDNhZjg=').then((checkout) => {
     *   // Do something with the checkout
     * });
     *
     * @param {String} id The id of the checkout to fetch.
     * @return {Promise|GraphModel} A promise resolving with a `GraphModel` of the checkout.
     */
    value: function fetch(id) {
      var _this2 = this;

      return this.graphQLClient.send(query$11, { id: id }).then(defaultResolver('node')).then(function (checkout) {
        return _this2.graphQLClient.fetchAllPages(checkout.lineItems, { pageSize: 250 }).then(function (lineItems) {
          checkout.attrs.lineItems = lineItems;

          return checkout;
        });
      });
    }

    /**
     * Creates a checkout.
     *
     * @example
     * const input = {
     *   lineItems: [
     *     {variantId: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8yOTEwNjAyMjc5Mg==', quantity: 5}
     *   ]
     * };
     *
     * client.checkout.create(input).then((checkout) => {
     *   // Do something with the newly created checkout
     * });
     *
     * @param {Object} [input] An input object containing zero or more of:
     *   @param {String} [input.email] An email connected to the checkout.
     *   @param {Object[]} [input.lineItems] A list of line items in the checkout. See the {@link https://help.shopify.com/api/storefront-api/reference/input_object/checkoutlineiteminput|Storefront API reference} for valid input fields for each line item.
     *   @param {Object} [input.shippingAddress] A shipping address. See the {@link https://help.shopify.com/api/storefront-api/reference/input_object/mailingaddressinput|Storefront API reference} for valid input fields.
     *   @param {String} [input.note] A note for the checkout.
     *   @param {Object[]} [input.customAttributes] A list of custom attributes for the checkout. See the {@link https://help.shopify.com/api/storefront-api/reference/input_object/attributeinput|Storefront API reference} for valid input fields.
     * @return {Promise|GraphModel} A promise resolving with the created checkout.
     */

  }, {
    key: 'create',
    value: function create() {
      var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      return this.graphQLClient.send(query$12, { input: input }).then(handleCheckoutMutation('checkoutCreate', this.graphQLClient));
    }

    /**
     * Adds line items to an existing checkout.
     *
     * @example
     * const checkoutId = 'Z2lkOi8vc2hvcGlmeS9DaGVja291dC9kMTZmM2EzMDM4Yjc4N=';
     * const lineItems = [{variantId: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8yOTEwNjAyMjc5Mg==', quantity: 5}];
     *
     * client.checkout.addLineItems(checkoutId, lineItems).then((checkout) => {
     *   // Do something with the updated checkout
     * });
     *
     * @param {String} checkoutId The ID of the checkout to add line items to.
     * @param {Object[]} lineItems A list of line items to add to the checkout. See the {@link https://help.shopify.com/api/storefront-api/reference/input_object/checkoutlineiteminput|Storefront API reference} for valid input fields for each line item.
     * @return {Promise|GraphModel} A promise resolving with the updated checkout.
     */

  }, {
    key: 'addLineItems',
    value: function addLineItems(checkoutId, lineItems) {
      return this.graphQLClient.send(query$13, { checkoutId: checkoutId, lineItems: lineItems }).then(handleCheckoutMutation('checkoutLineItemsAdd', this.graphQLClient));
    }

    /**
     * Removes line items from an existing checkout.
     *
     * @example
     * const checkoutId = 'Z2lkOi8vc2hvcGlmeS9DaGVja291dC9kMTZmM2EzMDM4Yjc4N=';
     * const lineItemIds = ['TViZGE5Y2U1ZDFhY2FiMmM2YT9rZXk9NTc2YjBhODcwNWIxYzg0YjE5ZjRmZGQ5NjczNGVkZGU='];
     *
     * client.checkout.removeLineItems(checkoutId, lineItemIds).then((checkout) => {
     *   // Do something with the updated checkout
     * });
     *
     * @param {String} checkoutId The ID of the checkout to remove line items from.
     * @param {String[]} lineItemIds A list of the ids of line items to remove from the checkout.
     * @return {Promise|GraphModel} A promise resolving with the updated checkout.
     */

  }, {
    key: 'removeLineItems',
    value: function removeLineItems(checkoutId, lineItemIds) {
      return this.graphQLClient.send(query$14, { checkoutId: checkoutId, lineItemIds: lineItemIds }).then(handleCheckoutMutation('checkoutLineItemsRemove', this.graphQLClient));
    }

    /**
     * Updates line items on an existing checkout.
     *
     * @example
     * const checkoutId = 'Z2lkOi8vc2hvcGlmeS9DaGVja291dC9kMTZmM2EzMDM4Yjc4N=';
     * const lineItems = [
     *   {
     *     id: 'TViZGE5Y2U1ZDFhY2FiMmM2YT9rZXk9NTc2YjBhODcwNWIxYzg0YjE5ZjRmZGQ5NjczNGVkZGU=',
     *     quantity: 5,
     *     variantId: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8yOTEwNjAyMjc5Mg=='
     *   }
     * ];
     *
     * client.checkout.updateLineItems(checkoutId, lineItems).then(checkout => {
     *   // Do something with the updated checkout
     * });
     *
     * @param {String} checkoutId The ID of the checkout to update a line item on.
     * @param {Object[]} lineItems A list of line item information to update. See the {@link https://help.shopify.com/api/storefront-api/reference/input_object/checkoutlineitemupdateinput|Storefront API reference} for valid input fields for each line item.
     * @return {Promise|GraphModel} A promise resolving with the updated checkout.
     */

  }, {
    key: 'updateLineItems',
    value: function updateLineItems(checkoutId, lineItems) {
      return this.graphQLClient.send(query$15, { checkoutId: checkoutId, lineItems: lineItems }).then(handleCheckoutMutation('checkoutLineItemsUpdate', this.graphQLClient));
    }
  }]);
  return CheckoutResource;
}(Resource);

/**
 * @namespace ImageHelpers
 */
var imageHelpers = {

  /**
   * Generates the image src for a resized image with maximum dimensions `maxWidth` and `maxHeight`.
   * Images do not scale up.
   *
   * @example
   * const url = client.image.helpers.imageForSize(product.variants[0].image, {maxWidth: 50, maxHeight: 50});
   *
   * @memberof ImageHelpers
   * @method imageForSize
   * @param {Object} image The original image model to generate the image src for.
   * @param {Object} options An options object containing:
   *  @param {Integer} options.maxWidth The maximum width for the image.
   *  @param {Integer} options.maxHeight The maximum height for the image.
   * @return {String} The image src for the resized image.
   */
  imageForSize: function imageForSize(image, _ref) {
    var maxWidth = _ref.maxWidth,
        maxHeight = _ref.maxHeight;

    var splitUrl = image.src.split('?');
    var notQuery = splitUrl[0];
    var query = splitUrl[1] ? '?' + splitUrl[1] : '';

    // Use the section before the query
    var imageTokens = notQuery.split('.');

    // Take the token before the file extension and append the dimensions
    var imagePathIndex = imageTokens.length - 2;

    imageTokens[imagePathIndex] = imageTokens[imagePathIndex] + '_' + maxWidth + 'x' + maxHeight;

    return '' + imageTokens.join('.') + query;
  }
};

/**
 * The JS Buy SDK image resource
 * @class
 */

var ImageResource = function (_Resource) {
  inherits(ImageResource, _Resource);

  function ImageResource() {
    classCallCheck(this, ImageResource);
    return possibleConstructorReturn(this, (ImageResource.__proto__ || Object.getPrototypeOf(ImageResource)).apply(this, arguments));
  }

  createClass(ImageResource, [{
    key: 'helpers',
    get: function get$$1() {
      return imageHelpers;
    }
  }]);
  return ImageResource;
}(Resource);

var version = "1.4.0";

var QueryRoot = {
  "name": "QueryRoot",
  "kind": "OBJECT",
  "fieldBaseTypes": {
    "node": "Node",
    "nodes": "Node",
    "shop": "Shop"
  },
  "implementsNode": false
};

var Node = {
  "name": "Node",
  "kind": "INTERFACE",
  "fieldBaseTypes": {},
  "possibleTypes": ["AppliedGiftCard", "Article", "Blog", "Checkout", "CheckoutLineItem", "Collection", "Comment", "MailingAddress", "Order", "Payment", "Product", "ProductOption", "ProductVariant", "ShopPolicy"]
};

var ID = {
  "name": "ID",
  "kind": "SCALAR"
};

var String = {
  "name": "String",
  "kind": "SCALAR"
};

var Boolean = {
  "name": "Boolean",
  "kind": "SCALAR"
};

var DateTime = {
  "name": "DateTime",
  "kind": "SCALAR"
};

var MailingAddress = {
  "name": "MailingAddress",
  "kind": "OBJECT",
  "fieldBaseTypes": {
    "address1": "String",
    "address2": "String",
    "city": "String",
    "company": "String",
    "country": "String",
    "countryCode": "String",
    "firstName": "String",
    "formatted": "String",
    "id": "ID",
    "lastName": "String",
    "latitude": "Float",
    "longitude": "Float",
    "name": "String",
    "phone": "String",
    "province": "String",
    "provinceCode": "String",
    "zip": "String"
  },
  "implementsNode": true
};

var Float = {
  "name": "Float",
  "kind": "SCALAR"
};

var PageInfo = {
  "name": "PageInfo",
  "kind": "OBJECT",
  "fieldBaseTypes": {
    "hasNextPage": "Boolean",
    "hasPreviousPage": "Boolean"
  },
  "implementsNode": false
};

var Int = {
  "name": "Int",
  "kind": "SCALAR"
};

var Order = {
  "name": "Order",
  "kind": "OBJECT",
  "fieldBaseTypes": {
    "currencyCode": "CurrencyCode",
    "customerUrl": "URL",
    "id": "ID",
    "lineItems": "OrderLineItemConnection",
    "orderNumber": "Int",
    "processedAt": "DateTime",
    "shippingAddress": "MailingAddress",
    "subtotalPrice": "Money",
    "totalPrice": "Money",
    "totalRefunded": "Money",
    "totalShippingPrice": "Money",
    "totalTax": "Money"
  },
  "implementsNode": true
};

var Money = {
  "name": "Money",
  "kind": "SCALAR"
};

var CurrencyCode = {
  "name": "CurrencyCode",
  "kind": "ENUM"
};

var URL = {
  "name": "URL",
  "kind": "SCALAR"
};

var OrderLineItemConnection = {
  "name": "OrderLineItemConnection",
  "kind": "OBJECT",
  "fieldBaseTypes": {
    "edges": "OrderLineItemEdge",
    "pageInfo": "PageInfo"
  },
  "implementsNode": false
};

var OrderLineItemEdge = {
  "name": "OrderLineItemEdge",
  "kind": "OBJECT",
  "fieldBaseTypes": {
    "cursor": "String",
    "node": "OrderLineItem"
  },
  "implementsNode": false
};

var OrderLineItem = {
  "name": "OrderLineItem",
  "kind": "OBJECT",
  "fieldBaseTypes": {
    "customAttributes": "Attribute",
    "quantity": "Int",
    "title": "String",
    "variant": "ProductVariant"
  },
  "implementsNode": false
};

var ProductVariant = {
  "name": "ProductVariant",
  "kind": "OBJECT",
  "fieldBaseTypes": {
    "available": "Boolean",
    "compareAtPrice": "Money",
    "id": "ID",
    "image": "Image",
    "price": "Money",
    "product": "Product",
    "selectedOptions": "SelectedOption",
    "sku": "String",
    "title": "String",
    "weight": "Float"
  },
  "implementsNode": true
};

var Image = {
  "name": "Image",
  "kind": "OBJECT",
  "fieldBaseTypes": {
    "altText": "String",
    "id": "ID",
    "src": "URL"
  },
  "implementsNode": false
};

var SelectedOption = {
  "name": "SelectedOption",
  "kind": "OBJECT",
  "fieldBaseTypes": {
    "name": "String",
    "value": "String"
  },
  "implementsNode": false
};

var Product = {
  "name": "Product",
  "kind": "OBJECT",
  "fieldBaseTypes": {
    "createdAt": "DateTime",
    "description": "String",
    "descriptionHtml": "HTML",
    "handle": "String",
    "id": "ID",
    "images": "ImageConnection",
    "onlineStoreUrl": "URL",
    "options": "ProductOption",
    "productType": "String",
    "publishedAt": "DateTime",
    "tags": "String",
    "title": "String",
    "updatedAt": "DateTime",
    "variants": "ProductVariantConnection",
    "vendor": "String"
  },
  "implementsNode": true
};

var CollectionConnection = {
  "name": "CollectionConnection",
  "kind": "OBJECT",
  "fieldBaseTypes": {
    "edges": "CollectionEdge",
    "pageInfo": "PageInfo"
  },
  "implementsNode": false
};

var CollectionEdge = {
  "name": "CollectionEdge",
  "kind": "OBJECT",
  "fieldBaseTypes": {
    "cursor": "String",
    "node": "Collection"
  },
  "implementsNode": false
};

var Collection = {
  "name": "Collection",
  "kind": "OBJECT",
  "fieldBaseTypes": {
    "description": "String",
    "descriptionHtml": "HTML",
    "handle": "String",
    "id": "ID",
    "image": "Image",
    "products": "ProductConnection",
    "title": "String",
    "updatedAt": "DateTime"
  },
  "implementsNode": true
};

var HTML = {
  "name": "HTML",
  "kind": "SCALAR"
};

var ProductConnection = {
  "name": "ProductConnection",
  "kind": "OBJECT",
  "fieldBaseTypes": {
    "edges": "ProductEdge",
    "pageInfo": "PageInfo"
  },
  "implementsNode": false
};

var ProductEdge = {
  "name": "ProductEdge",
  "kind": "OBJECT",
  "fieldBaseTypes": {
    "cursor": "String",
    "node": "Product"
  },
  "implementsNode": false
};

var ImageConnection = {
  "name": "ImageConnection",
  "kind": "OBJECT",
  "fieldBaseTypes": {
    "edges": "ImageEdge",
    "pageInfo": "PageInfo"
  },
  "implementsNode": false
};

var ImageEdge = {
  "name": "ImageEdge",
  "kind": "OBJECT",
  "fieldBaseTypes": {
    "cursor": "String",
    "node": "Image"
  },
  "implementsNode": false
};

var ProductOption = {
  "name": "ProductOption",
  "kind": "OBJECT",
  "fieldBaseTypes": {
    "name": "String",
    "values": "String"
  },
  "implementsNode": true
};

var ProductVariantConnection = {
  "name": "ProductVariantConnection",
  "kind": "OBJECT",
  "fieldBaseTypes": {
    "edges": "ProductVariantEdge",
    "pageInfo": "PageInfo"
  },
  "implementsNode": false
};

var ProductVariantEdge = {
  "name": "ProductVariantEdge",
  "kind": "OBJECT",
  "fieldBaseTypes": {
    "cursor": "String",
    "node": "ProductVariant"
  },
  "implementsNode": false
};

var Attribute = {
  "name": "Attribute",
  "kind": "OBJECT",
  "fieldBaseTypes": {
    "key": "String",
    "value": "String"
  },
  "implementsNode": false
};

var Shop = {
  "name": "Shop",
  "kind": "OBJECT",
  "fieldBaseTypes": {
    "collectionByHandle": "Collection",
    "collections": "CollectionConnection",
    "currencyCode": "CurrencyCode",
    "description": "String",
    "moneyFormat": "String",
    "name": "String",
    "primaryDomain": "Domain",
    "privacyPolicy": "ShopPolicy",
    "productByHandle": "Product",
    "products": "ProductConnection",
    "refundPolicy": "ShopPolicy",
    "termsOfService": "ShopPolicy"
  },
  "implementsNode": false
};

var Domain = {
  "name": "Domain",
  "kind": "OBJECT",
  "fieldBaseTypes": {
    "host": "String",
    "sslEnabled": "Boolean",
    "url": "URL"
  },
  "implementsNode": false
};

var ShopPolicy = {
  "name": "ShopPolicy",
  "kind": "OBJECT",
  "fieldBaseTypes": {
    "body": "String",
    "id": "ID",
    "title": "String",
    "url": "URL"
  },
  "implementsNode": true
};

var Mutation = {
  "name": "Mutation",
  "kind": "OBJECT",
  "fieldBaseTypes": {
    "checkoutCreate": "CheckoutCreatePayload",
    "checkoutLineItemsAdd": "CheckoutLineItemsAddPayload",
    "checkoutLineItemsRemove": "CheckoutLineItemsRemovePayload",
    "checkoutLineItemsUpdate": "CheckoutLineItemsUpdatePayload"
  },
  "implementsNode": false,
  "relayInputObjectBaseTypes": {
    "checkoutAttributesUpdate": "CheckoutAttributesUpdateInput",
    "checkoutCreate": "CheckoutCreateInput",
    "customerAccessTokenCreate": "CustomerAccessTokenCreateInput",
    "customerActivate": "CustomerActivateInput",
    "customerCreate": "CustomerCreateInput",
    "customerReset": "CustomerResetInput"
  }
};

var UserError = {
  "name": "UserError",
  "kind": "OBJECT",
  "fieldBaseTypes": {
    "field": "String",
    "message": "String"
  },
  "implementsNode": false
};

var Checkout = {
  "name": "Checkout",
  "kind": "OBJECT",
  "fieldBaseTypes": {
    "completedAt": "DateTime",
    "createdAt": "DateTime",
    "currencyCode": "CurrencyCode",
    "customAttributes": "Attribute",
    "id": "ID",
    "lineItems": "CheckoutLineItemConnection",
    "note": "String",
    "order": "Order",
    "orderStatusUrl": "URL",
    "paymentDue": "Money",
    "ready": "Boolean",
    "requiresShipping": "Boolean",
    "shippingAddress": "MailingAddress",
    "shippingLine": "ShippingRate",
    "subtotalPrice": "Money",
    "taxExempt": "Boolean",
    "taxesIncluded": "Boolean",
    "totalPrice": "Money",
    "totalTax": "Money",
    "updatedAt": "DateTime",
    "webUrl": "URL"
  },
  "implementsNode": true
};

var CheckoutLineItemConnection = {
  "name": "CheckoutLineItemConnection",
  "kind": "OBJECT",
  "fieldBaseTypes": {
    "edges": "CheckoutLineItemEdge",
    "pageInfo": "PageInfo"
  },
  "implementsNode": false
};

var CheckoutLineItemEdge = {
  "name": "CheckoutLineItemEdge",
  "kind": "OBJECT",
  "fieldBaseTypes": {
    "cursor": "String",
    "node": "CheckoutLineItem"
  },
  "implementsNode": false
};

var CheckoutLineItem = {
  "name": "CheckoutLineItem",
  "kind": "OBJECT",
  "fieldBaseTypes": {
    "customAttributes": "Attribute",
    "id": "ID",
    "quantity": "Int",
    "title": "String",
    "variant": "ProductVariant"
  },
  "implementsNode": true
};

var ShippingRate = {
  "name": "ShippingRate",
  "kind": "OBJECT",
  "fieldBaseTypes": {
    "handle": "String",
    "price": "Money",
    "title": "String"
  },
  "implementsNode": false
};

var CheckoutCreatePayload = {
  "name": "CheckoutCreatePayload",
  "kind": "OBJECT",
  "fieldBaseTypes": {
    "checkout": "Checkout",
    "userErrors": "UserError"
  },
  "implementsNode": false
};

var CheckoutLineItemsAddPayload = {
  "name": "CheckoutLineItemsAddPayload",
  "kind": "OBJECT",
  "fieldBaseTypes": {
    "checkout": "Checkout",
    "userErrors": "UserError"
  },
  "implementsNode": false
};

var CheckoutLineItemsRemovePayload = {
  "name": "CheckoutLineItemsRemovePayload",
  "kind": "OBJECT",
  "fieldBaseTypes": {
    "checkout": "Checkout",
    "userErrors": "UserError"
  },
  "implementsNode": false
};

var CheckoutLineItemsUpdatePayload = {
  "name": "CheckoutLineItemsUpdatePayload",
  "kind": "OBJECT",
  "fieldBaseTypes": {
    "checkout": "Checkout",
    "userErrors": "UserError"
  },
  "implementsNode": false
};

var Types = {
  types: {}
};
Types.types["QueryRoot"] = QueryRoot;
Types.types["Node"] = Node;
Types.types["ID"] = ID;
Types.types["String"] = String;
Types.types["Boolean"] = Boolean;
Types.types["DateTime"] = DateTime;
Types.types["MailingAddress"] = MailingAddress;
Types.types["Float"] = Float;
Types.types["PageInfo"] = PageInfo;
Types.types["Int"] = Int;
Types.types["Order"] = Order;
Types.types["Money"] = Money;
Types.types["CurrencyCode"] = CurrencyCode;
Types.types["URL"] = URL;
Types.types["OrderLineItemConnection"] = OrderLineItemConnection;
Types.types["OrderLineItemEdge"] = OrderLineItemEdge;
Types.types["OrderLineItem"] = OrderLineItem;
Types.types["ProductVariant"] = ProductVariant;
Types.types["Image"] = Image;
Types.types["SelectedOption"] = SelectedOption;
Types.types["Product"] = Product;
Types.types["CollectionConnection"] = CollectionConnection;
Types.types["CollectionEdge"] = CollectionEdge;
Types.types["Collection"] = Collection;
Types.types["HTML"] = HTML;
Types.types["ProductConnection"] = ProductConnection;
Types.types["ProductEdge"] = ProductEdge;
Types.types["ImageConnection"] = ImageConnection;
Types.types["ImageEdge"] = ImageEdge;
Types.types["ProductOption"] = ProductOption;
Types.types["ProductVariantConnection"] = ProductVariantConnection;
Types.types["ProductVariantEdge"] = ProductVariantEdge;
Types.types["Attribute"] = Attribute;
Types.types["Shop"] = Shop;
Types.types["Domain"] = Domain;
Types.types["ShopPolicy"] = ShopPolicy;
Types.types["Mutation"] = Mutation;
Types.types["UserError"] = UserError;
Types.types["Checkout"] = Checkout;
Types.types["CheckoutLineItemConnection"] = CheckoutLineItemConnection;
Types.types["CheckoutLineItemEdge"] = CheckoutLineItemEdge;
Types.types["CheckoutLineItem"] = CheckoutLineItem;
Types.types["ShippingRate"] = ShippingRate;
Types.types["CheckoutCreatePayload"] = CheckoutCreatePayload;
Types.types["CheckoutLineItemsAddPayload"] = CheckoutLineItemsAddPayload;
Types.types["CheckoutLineItemsRemovePayload"] = CheckoutLineItemsRemovePayload;
Types.types["CheckoutLineItemsUpdatePayload"] = CheckoutLineItemsUpdatePayload;
Types.queryType = "QueryRoot";
Types.mutationType = "Mutation";
Types.subscriptionType = null;

function recursivelyFreezeObject(structure) {
  Object.getOwnPropertyNames(structure).forEach(function (key) {
    var value = structure[key];
    if (value && (typeof value === "undefined" ? "undefined" : _typeof(value)) === 'object') {
      recursivelyFreezeObject(value);
    }
  });
  Object.freeze(structure);
  return structure;
}

var types = recursivelyFreezeObject(Types);

// GraphQL
/**
 * The JS Buy SDK Client.
 * @class
 *
 * @property {ProductResource} product The property under which product fetching methods live.
 * @property {CollectionResource} collection The property under which collection fetching methods live.
 * @property {ShopResource} shop The property under which shop fetching methods live.
 * @property {CheckoutResource} checkout The property under which shop fetching and mutating methods live.
 * @property {ImageResource} image The property under which image helper methods live.
 */

var Client = function () {
  createClass(Client, null, [{
    key: 'buildClient',


    /**
     * Primary entry point for building a new Client.
     */
    value: function buildClient(config, fetchFunction) {
      var newConfig = new Config(config);
      var client = new Client(newConfig, GraphQLJSClient, fetchFunction);

      client.config = newConfig;

      return client;
    }

    /**
     * @constructs Client
     * @param {Config} config An instance of {@link Config} used to configure the Client.
     */

  }]);

  function Client(config) {
    var GraphQLClientClass = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : GraphQLJSClient;
    var fetchFunction = arguments[2];
    classCallCheck(this, Client);

    var url = 'https://' + config.domain + '/api/graphql';

    var headers = {
      'X-SDK-Variant': 'javascript',
      'X-SDK-Version': version,
      'X-Shopify-Storefront-Access-Token': config.storefrontAccessToken
    };

    if (fetchFunction) {
      headers['Content-Type'] = 'application/json';
      headers.Accept = 'application/json';

      this.graphQLClient = new GraphQLClientClass(types, {
        fetcher: function fetcher(graphQLParams) {
          return fetchFunction(url, {
            body: JSON.stringify(graphQLParams),
            method: 'POST',
            mode: 'cors',
            headers: headers
          }).then(function (response) {
            return response.json();
          });
        }
      });
    } else {
      this.graphQLClient = new GraphQLClientClass(types, {
        url: url,
        fetcherOptions: { headers: headers }
      });
    }

    this.product = new ProductResource(this.graphQLClient);
    this.collection = new CollectionResource(this.graphQLClient);
    this.shop = new ShopResource(this.graphQLClient);
    this.checkout = new CheckoutResource(this.graphQLClient);
    this.image = new ImageResource(this.graphQLClient);
  }

  /**
   * Fetches the next page of models
   *
   * @example
   * client.fetchNextPage(products).then((nextProducts) => {
   *   // Do something with the products
   * });
   *
   * @param {models} [Array] The paginated set to fetch the next page of
   * @return {Promise|GraphModel[]} A promise resolving with an array of `GraphModel`s of the type provided.
   */


  createClass(Client, [{
    key: 'fetchNextPage',
    value: function fetchNextPage(models) {
      return this.graphQLClient.fetchNextPage(models);
    }
  }]);
  return Client;
}();

return Client;

})));
//# sourceMappingURL=index.umd.js.map
