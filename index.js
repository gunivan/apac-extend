var amazonWrapper = require("apac").OperationHelper;
var flatten = require("flat");

if (typeof Promise === 'undefined') {
  Promise = require('es6-promise').Promise;
}

var runSearchQuery = function (amazonAPI, name) {
  return function (opts, cb) {
    return new Promise(function (resolve, reject) {
      var success = function (res) {
        if (typeof cb === 'function') {
          cb.apply(null, [null].concat(Array.prototype.slice.call(arguments)));
        } else {
          resolve(res);
        }
      };
      var failure = function (err) {
        if (typeof cb === 'function') {
          cb.call(null, err);
        } else {
          reject(err);
        }
      };

      amazonAPI.execute(name, opts, function (err, res) {
        parseSearchRes(name, res, success, failure);
      });
    });
  }
}

var createCart = function (amazonAPI) {
  return function (opts) {
    return new Promise(function (resolve, reject) {
      amazonAPI.execute('CartCreate', {
        'AssociateTag': amazonAPI.assocId,
        'Item.1.ASIN': opts.ASIN,
        'Item.1.Quantity': opts.qty
      }, function (err, res) {
        if (err) {
          reject(err);
        }
        resolve(res);
      });
    });
  }
}

var getCart = function (amzonAPI) {
  return function (opts) {
    return new Promise(function (resolve, reject) {
      amazonAPI.execute('CartGet', {
        'AssociateTag': amzonAPI.assocId,
        'CartId': opts.cartId,
        'HMAC': opts.HMAC
      }, function (err, res) {
        if (err) {
          reject(err);
        }
        resolve(res);
      });
    });
  }
}

var addToCart = function (amazonAPI) {
  return function (opts) {
    return new Promise(function (resolve, reject) {
      var requestParams = {
        'CartId': opts.cartId,
        'HMAC': opts.HMAC,
        'Item': {}
      }
      opts.itemsToAdd.forEach(function (item, i) {
        i = i + 1;
        requestParams.Item[i] = {};
        requestParams.Item[i].OfferListingId = item.offerListingId;
        requestParams.Item[i].Quantity = item.qty;
      });

      requestParams = flatten(requestParams);
      requestParams.AssociateTag = amazonAPI.assocId

      amazonAPI.execute('CartAdd', requestParams, function (err, res) {
        if (err) {
          reject(err);
        }
        resolve(res);
      });
    });
  }
}

var modifyCart = function (amazonAPI) {
  return function (opts) {
    return new Promise(function (resolve, reject) {

      var requestParams = {
        'CartId': opts.cartId,
        'HMAC': opts.HMAC,
        'Item': {}
      }

      opts.itemsToModify.forEach(function (item, i) {
        i = i + 1;
        requestParams.Item[i] = {};
        requestParams.Item[i].CartItemId = item.cartItemId;
        requestParams.Item[i].Quantity = item.qty;
      });

      requestParams = flatten(requestParams);
      requestParams.AssociateTag = amazonAPI.assocId;

      amazonAPI.execute('CartModify', requestParams, function (err, res) {
        if (err) {
          reject(err);
        }
        resolve(res);
      });
    });
  }
}

var clearCart = function (amazonAPI) {
  return function (opts) {
    return new Promise(function (resolve, reject) {
      amazonAPI.execute('CartClear', {
        'AssociateTag': amazonAPI.assocId,
        'CartId': opts.cartId,
        'HMAC': opts.HMAC
      }, function (err, res) {
        if (err) {
          reject(err);
        }
        resolve(res);
      });
    });
  }
}

function determineLocale(locale) {
  if (locale) {
    return `webservices.amazon.com.${locale.toLowerCase()}`;
  }
  return 'webservices.amazon.com';
}

function parseSearchRes(name, res, success, failure) {
  var data = res[`${name}Response`];
  if (data.Items) {
    if (data.Items.Request.Errors) {
      failure(data.Items.Request.Errors);
    } else {
      success({
        totalResults: data.Items.TotalResults,
        totalPage: data.Items.TotalPages,
        moreSearchResultsUrl: data.Items.MoreSearchResultsUrl,
        items: data.Items.Item
      });
    }
  } else if (data.BrowseNodes) {
    if (data.BrowseNodes.Request.Errors) {
      failure(data.BrowseNodes.Request.Errors);
    } else {
      success({
        totalResults: data.BrowseNodes.TotalResults,
        totalPage: data.BrowseNodes.TotalPages,
        moreSearchResultsUrl: data.BrowseNodes.MoreSearchResultsUrl,
        items: data.BrowseNodes.BrowseNode
      });
    }
  }
}

var createClient = function (credentials) {
  var amazonAPI = new amazonWrapper({
    awsId: credentials.accessKeyId,
    awsSecret: credentials.secretAccessKey,
    assocId: credentials.associateId,
    endPoint: determineLocale(credentials.locale),
    xml2jsOptions: {
      explicitArray: false,
      ignoreAttrs: true
    }
  });

  return {
    itemSearch: runSearchQuery(amazonAPI, 'ItemSearch'),
    itemLookup: runSearchQuery(amazonAPI, 'ItemLookup'),
    browseNodeLookup: runSearchQuery(amazonAPI, 'BrowseNodeLookup'),
    similarityLookup: runSearchQuery(amazonAPI, 'SimilarityLookup'),
    createCart: createCart(amazonAPI),
    getCart: getCart(amazonAPI),
    addToCart: addToCart(amazonAPI),
    modifyCart: modifyCart(amazonAPI),
    clearCart: clearCart(amazonAPI)
  };
};

exports.createClient = createClient;