# apac client

A wrapper for apac client

### Installation

`npm install apac-extend`

### Usage

Each method takes an `options` hash as the first argument, and a callback as the second, which takes `error` and `response` arguments.

~~~javascript

var amazon = require('apac-extend');

var client = amazon.creatClient({
  accessKeyId     : //your access key,
  secretAccessKey : //your secret access key,
  associateId     : //your associate ID
});


client.itemSearch({
  SearchIndex: 'DVD',
  Director: 'Quentin Tarantino',
  Actor: 'Samuel L. Jackson',
  AudienceRating: 'R',
  ResponseGroup: 'ItemAttributes,Offers,Images'
}).then(function (res) {
  console.log(res);
}).catch(function(err){
  console.error(err);
});

~~~

### Methods

Amazon API Method   |   Our Method
--------------------|------------------
`BrowseNodeLookup`  | `browseNodeLookup`
`ItemSearch`        | `itemSearch`
`ItemLookup`        | `itemLookup`
`SimilarityLookup`  | `similarityLookup`
`CartAdd`           | `addToCart`
`CartClear`         | `clearCart`
`CartCreate`        | `createCart`
`CartGet`           | `getCart`
`CartModify`        | `modifyCart`

- With `browseNodeLookup`, `itemSearch`, `itemLookup` and `similarityLookup` response will be:
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

var amazon = require('apac-extend');

var client = amazon.createClient({
  accessKeyId: //your access key
  secretAccessKey: //your secret access key
  associateId: //your associate ID
  locale: 'uk'
});

~~~