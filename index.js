var amazonWrapper = require("apac").OperationHelper;
var flatten = require("flat");

module.exports = function (credentials) {

  this.amazonAPI = new amazonWrapper({
    awsId: credentials.accessKeyId,
    awsSecret: credentials.secretAccessKey,
    assocId: credentials.associateId,
    endPoint: determineLocale(credentials.locale),
    xml2jsOptions: {
      explicitArray: false,
      ignoreAttrs: true
    }
  });

  this.lookupBrowseNode = function (opts, callback) {
    var name = 'BrowseNodeLookup';
    this.amazonAPI.execute(name, opts, function (err, res) {
      callback(parseSearchRes(name, res), err);
    });
  }

  this.getItemsInBrowseNode = function (opts, callback) {
    var name = 'ItemSearch';
    this.amazonAPI.execute(name, opts, function (err, res) {
      callback(parseSearchRes(name, res), err);
    });
  }

  this.getItemDetail = function (opts, callback) {
    var name = 'ItemLookup';
    this.amazonAPI.execute(name, opts, function (err, res) {
      callback(parseSearchRes(name, res), err);
    });
  }

  this.getSimilarItems = function (opts, callback) {
    var name = 'SimilarityLookup';
    this.amazonAPI.execute(name, {
      'ItemId': opts.items.join()
    }, function (err, res) {
      callback(parseSearchRes(name, res), err);
    });
  }

  this.createCart = function (opts, callback) {
    this.amazonAPI.execute('CartCreate', {
      'AssociateTag': credentials.associateId,
      'Item.1.ASIN': opts.ASIN,
      'Item.1.Quantity': opts.qty
    }, function (err, res) {
      callback(res, err);
    });
  }

  this.getCart = function (opts, callback) {
    this.amazonAPI.execute('CartGet', {
      'AssociateTag': credentials.associateId,
      'CartId': opts.cartId,
      'HMAC': opts.HMAC
    }, function (err, res) {
      callback(res, err);
    });
  }

  this.addToCart = function (opts, callback) {

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
    requestParams.AssociateTag = credentials.associateId

    this.amazonAPI.execute('CartAdd', requestParams, function (err, res) {
      callback(res, err);
    });
  }

  this.modifyCart = function (opts, callback) {

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
    requestParams.AssociateTag = credentials.associateId;

    this.amazonAPI.execute('CartModify', requestParams, function (err, res) {
      callback(res, err);
    });
  }

  this.clearCart = function (opts, callback) {
    this.amazonAPI.execute('CartClear', {
      'AssociateTag': credentials.associateId,
      'CartId': opts.cartId,
      'HMAC': opts.HMAC
    }, function (err, res) {
      callback(err, res);
    });
  }
}

function determineLocale(locale) {
  if (locale) {
    return `webservices.amazon.com.${locale.toLowerCase()}`;
  }
  return 'webservices.amazon.com';
}

function parseSearchRes(name, res) {
  var data = res[`${name}Response`];
  if (data.Items) {
    if (data.Items.Request.Errors) {
      return data.Items.Request.Errors;
    } else {
      return {
        totalResults: data.Items.TotalResults,
        totalPage: data.Items.TotalPages,
        moreSearchResultsUrl: data.Items.MoreSearchResultsUrl,
        items: data.Items.Item
      };
    }
  } else if (data.BrowseNodes) {
    if (data.BrowseNodes.Request.Errors) {
      return (data.BrowseNodes.Request.Errors);
    } else {
      return {
        totalResults: data.BrowseNodes.TotalResults,
        totalPage: data.BrowseNodes.TotalPages,
        moreSearchResultsUrl: data.BrowseNodes.MoreSearchResultsUrl,
        items: data.BrowseNodes.BrowseNode
      };
    }
  }
}