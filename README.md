# apac client

A wrapper for apac client

### Installation

`npm install apac-extend`

### Usage

Each method takes an `options` hash as the first argument, and a callback as the second, which takes `error` and `response` arguments.

~~~javascript

var AmazonAPI = require('apac-extend');

var amazon = new AmazonAPI({
  accessKeyId     : //your access key,
  secretAccessKey : //your secret access key,
  associateId     : //your associate ID
});


amazon.getItemsInBrowseNode({
  SearchIndex: 'DVD',
  Director: 'Quentin Tarantino',
  Actor: 'Samuel L. Jackson',
  AudienceRating: 'R',
  ResponseGroup: 'ItemAttributes,Offers,Images'
}, function (res, err) {
  console.log(res);
});

~~~

### Methods

Amazon API Method   |   Our Method
--------------------|------------------
`BrowseNodeLookup`  | `lookupBrowseNode`
`ItemSearch`        | `getItemsInBrowseNode`
`ItemLookup`        | `getItemDetail`
`SimilarityLookup`  | `getSimilarItems`
`CartAdd`           | `addToCart`
`CartClear`         | `clearCart`
`CartCreate`        | `createCart`
`CartGet`           | `getCart`
`CartModify`        | `modifyCart`

- With `getItemsInBrowseNode`, `getItemDetail`, `getSimilarItems` and `lookupBrowseNode` response will be:
~~~javascript
{
  totalResults: '',
  totalPage: '',
  moreSearchResultsUrl: '',
  items: []
}
~~~

### Locale Settings

~~~javascript

var AmazonAPI = require('apac-extend');

var amazon = new AmazonAPI({
  accessKeyId: //your access key
  secretAccessKey: //your secret access key
  associateId: //your associate ID
  locale: 'UK'
});

~~~