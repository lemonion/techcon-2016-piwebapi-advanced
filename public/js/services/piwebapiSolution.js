// define angular service to perform HTTP requests to PI Web API
app.factory('piWebApiREST', ['$http', function($http) {
  var piWebApiRESTService = {};

  var baseUrl = 'https://pisrv01.pischool.int/piwebapi';
  var baseWSUrl = 'wss://pisrv01.pischool.int/piwebapi';
  var afServer = 'pisrv01';
  var afDatabase = 'WebTraffic';
  var rootElement = 'USStates';
  var webSocket = null;

  $http.defaults.withCredentials = true;

  // ---------------------- Batch ------------------------------------------
  // formatting single batch request item
  var batchSingle = function(method, resource, parentIds, parameters) {
    var single = {};
    single.Method = method;
    single.Resource = resource;
    if (parentIds != undefined) single.ParentIds = parentIds;
    if (parameters != undefined) single.Parameters = parameters;

    return single;
  }

  // batch content contructor to get attribute current values, summary values and plot values
  piWebApiRESTService.batchConstructor = function(stateName, startTime, width) {
    var batchContent = {};

    // TODO: Exercise 3a Step 2 (construct the batch content)
    batchContent[1] = batchSingle(
      'GET',
      urlHelper(baseUrl, 'elements', ['path=\\\\{0}\\{1}\\{2}\\{3}'.format(afServer, afDatabase, rootElement, stateName)])
    );

    batchContent[2] = batchSingle(
      'GET',
      '$.1.Content.Links.Value',
      ['1']
    );

    batchContent[3] = batchSingle(
      'GET',
      urlHelper(baseUrl, 'streams/{0}/summary', ['SummaryType=Minimum', 'SummaryType=Maximum', 'SummaryType=Average', 'startTime=' + startTime]),
      ['2'],
      ['$.2.Content.Items[?(@.Name==\'VisitDuration\')].WebId']
    );

    batchContent[4] = batchSingle(
      'GET',
      urlHelper(baseUrl, 'streams/{0}/plot', [ 'intervals=' + width, 'startTime=' + startTime ]),
      ['2'],
      ['$.2.Content.Items[?(@.Name==\'VisitDuration\')].WebId']
    );
    // TODO: Exercise 3a Step 2 (end)

    return batchContent;
  }

  // send batch request
  piWebApiRESTService.sendBatchRequest = function(data) {
    var url = urlHelper(
      baseUrl,
      'batch'
    );
    return $http.post(url, data).then(function (response) {
      return response.data;
    })
  };
  // ---------------------- Batch (end) --------------------------------------

  // ---------------------- Channels -----------------------------------------
  // open channel for a specific stream
  piWebApiRESTService.openStreamChannel = function(webId, messageCallBack) {
    // TODO: Exercise 3b Step 1 (initializes webSocket and add callback on message)
    var url = urlHelper(
      baseWSUrl,
      'streams/{0}/channel'.format(webId)
    );
    webSocket = new WebSocket(url);
    webSocket.onmessage = messageCallBack;
    // TODO: Exercise 3b Step 1 (end)

    // uncommemnt following for additional logging
    /*
    webSocket.onopen = function() { console.log("channel opened!") };
    webSocket.onerror = function() { console.log("channel error!") };
    webSocket.onclose = function() { console.log("channel closed!") };
    */
  }

  // close channel
  piWebApiRESTService.closeStreamChannel = function() {
    if (webSocket != null) {
      // TODO: Exercise 3b Step 1 (closes webSocket)
      webSocket.close();
      // TODO: Exercise 3b Step 1 (end)
    }
  }
  // ---------------------- Channels (end) -----------------------------------

  // TODO: Exercise 3 Bonus
  piWebApiRESTService.batchContructorToolTip = function(stateName, time) {
    var batchContent = {};
    batchContent[1] = batchSingle(
      'GET',
      urlHelper(baseUrl, 'attributes', ['path=\\\\{0}\\{1}\\{2}\\{3}|VisitDuration'.format(afServer, afDatabase, rootElement, stateName)])
    );

    batchContent[2] = batchSingle(
      'GET',
      urlHelper(baseUrl, 'streams/{0}/recordedattime', ['time=' + time]),
      ['1'],
      ['$.1.Content.WebId']
    );

    return batchContent;
  }
  // TODO: Exercise 3 Bonus (end)

  // get summary data from specified start time till current time
  piWebApiRESTService.getSummary = function(webId, startTime) {
    var url = urlHelper(
      baseUrl,
      'streams/{0}/summary'.format(webId),
      [ 'SummaryType=Minimum', 'SummaryType=Maximum', 'SummaryType=Average', 'startTime=' + startTime]
    );
    return $http.get(url).then(function (response) {
      return response.data;
    });
  };

  // use search index for query
  piWebApiRESTService.search = function(query) {
    var url = urlHelper(
      baseUrl,
      'search/query',
      [ 'q=' + query, 'scope=af:\\\\{0}\\{1}'.format(afServer, afDatabase), 'fields:name; attributes; webid' ]
    );
    return $http.get(url).then(function (response) {
      return response.data;
    })
  }

  return piWebApiRESTService;
}]);
