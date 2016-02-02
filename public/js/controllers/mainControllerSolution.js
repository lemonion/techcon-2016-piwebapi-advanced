// define angular main controller
app.controller('MainController',['$scope', 'piWebApiREST', function($scope, piWebApiREST) {
  //----------- helper functions to change scope variables -----------------
  var changeStateName = function(stateName) {
    $scope.stateName = stateName;
  };

  var changeStateAbbreviation = function(stateAbbreviation) {
    // highlight newly selected state
    var dataObj = {};
    if ($scope.stateAbbreviation !== undefined) {
      var oldState = $scope.stateAbbreviation;
      dataObj[oldState] = { fillKey: 'defaultFill' };
    }
    dataObj[stateAbbreviation] = { fillKey: 'selected' }
    $scope.mapObject.data = dataObj;

    // update state abbreviation
    $scope.stateAbbreviation = stateAbbreviation;
  };

  var changeStatePopulation = function(statePopulation) {
    $scope.statePopulation = statePopulation;
  };

  var changeCurrentDuration = function(currentDuration, updateTime) {
    $scope.currentDuration = currentDuration;
    $scope.updateTime = updateTime;
  };

  var changeMinDuration = function(minDuration) {
    $scope.minDuration = minDuration;
  };

  var changeMaxDuration = function(maxDuration) {
    $scope.maxDuration = maxDuration;
  };

  var changeAvgDuration = function(avgDuration) {
    $scope.avgDuration = avgDuration;
  };

  var addPlotData = function(plotDataTimestamp, plotDataValue) {
    $scope.myData[0].push([new Date(plotDataTimestamp).getTime(), plotDataValue]);
  };

  var sortPlotData = function() {
    $scope.myData[0].sort(function (a, b) {
      if (a[0] === b[0]) {
        return 0;
      }
      else {
        return (a[0] < b[0]) ? -1 : 1;
      }
    });
  };

  // TODO: Exercise 3b Step 3 (read)
  var addNewValueOnMessage = function(newTimestamp, newVal) {
    var removeCount = 0;
    while ($scope.myData[0][removeCount][0] < getStartTime()) {
      removeCount++;
    }
    $scope.myData[0].splice(0, removeCount);

    if (newTimestamp >= $scope.updateTime) {
      changeCurrentDuration(newVal, newTimestamp);
    }

    if (new Date(newTimestamp).getTime() >= getStartTime()) {
      addPlotData(newTimestamp, newVal);
    }

    sortPlotData();
  };
  // TODO: Exercise 3b Step 3 (end)
  //----------- helper functions to change scope variables (end) -------------

  //----------- intializating map and trend ----------------------------------
  // initialize state map
  $scope.mapObject = {
    scope: 'usa',
    responsive: true,
    geographyConfig: {
      highlightBorderColor: 'white',
      popupTemplate: function(geo) {
        return ['<div class="hoverinfo"><strong>', geo.properties.name,
          ' ', getMidnightValue(geo.properties.name), '</strong></div>'].join('');
      }
    },
    fills: {
      'selected': '#330000',
      'defaultFill': '#8BC3FB'
    }
  };

  // set trend plot options
  $scope.myData = [[]];
  $scope.myChartOptions = {
    xaxis: {
        mode: 'time',
        timeformat: '%m/%d<br>%H:%M:%S',
        timezone: 'browser',
    }
  };
  //----------- intializating map and trend (end)-----------------------------

  // user clicks on a state on map
  $scope.clickState = function(geography) {
    changeStateData(geography.properties.name)
  };

  // user types in state query in search box
  $scope.searchState = function() {
    if ($scope.searchQuery !== '' && $scope.searchQuery !== undefined) {
      piWebApiREST.search($scope.searchQuery).then(function(data) {
        if (data.Items.length > 0) {
          changeStateData(data.Items[0].Name);
        }
      });
    }
  }

  // update "Site visit duration statistics"
  var updateSummaryValues = function(webId) {
    piWebApiREST.getSummary(webId, startTimePI).then(function (data) {
      for (var i = 0; i < data.Items.length; i++) {
        if (data.Items[i].Type == 'Minimum') {
          changeMinDuration(data.Items[i].Value.Value);
        } else if (data.Items[i].Type == 'Maximum') {
          changeMaxDuration(data.Items[i].Value.Value);
        } else if (data.Items[i].Type == 'Average') {
          changeAvgDuration(data.Items[i].Value.Value);
        }
      }
    });
  };

  //----------- student TODO area --------------------------------------------
  // update state data on page
  var changeStateData = function(stateName) {
    $scope.myData = [[]]

    // update state name
    changeStateName(stateName);

    // send Batch request
    var batchContent = piWebApiREST.batchConstructor(stateName, startTimePI, plotWidth);
    piWebApiREST.sendBatchRequest(batchContent).then(function(data) {

      // TODO: Exercise 3a Step 3
      // 1) update state abbreviation, state population, and current duration
      var attributes = data[2].Content.Items;
      for (var i = 0; i < attributes.length; i++) {
        if (attributes[i].Name == 'Abbreviation') {
          changeStateAbbreviation(attributes[i].Value.Value);
        } else if (attributes[i].Name == 'Population') {
          changeStatePopulation(attributes[i].Value.Value);
        } else if (attributes[i].Name == 'VisitDuration') {
          changeCurrentDuration(attributes[i].Value.Value, attributes[i].Value.Timestamp);

          // update attribute webId
          attributeWebId = attributes[i].WebId;
        }
      }

      // 2) update summary values (min, max, and average duration)
      var summaries = data[3].Content.Items;
      for (var i = 0; i < summaries.length; i++) {
        if (summaries[i].Type == 'Minimum') {
          changeMinDuration(summaries[i].Value.Value);
        } else if (summaries[i].Type == 'Maximum') {
          changeMaxDuration(summaries[i].Value.Value);
        } else if (summaries[i].Type == 'Average') {
          changeAvgDuration(summaries[i].Value.Value);
        }
      }

      // 3) update plot
      var plotValues = data[4].Content.Items;
      for (var i = 0; i < plotValues.length; i++) {
        if (plotValues[i].Good) {
          addPlotData(plotValues[i].Timestamp, plotValues[i].Value);
        }
      }
      // TODO: Exercise 3a Step 3 (end)

      sortPlotData();

      // close existing channel and open new channel
      piWebApiREST.closeStreamChannel();
      piWebApiREST.openStreamChannel(attributeWebId, onMessageCallBack);
    });
  };

  // callback when new message is received from channel
  var onMessageCallBack = function(event) {
    // TODO: Exercise 3b Step 2
    var parsedData = JSON.parse(event.data);
    var values = parsedData.Items[0].Items;
    for (var i = 0; i < values.length; i++) {
      addNewValueOnMessage(values[0].Timestamp, values[0].Value);
    }
    // TODO: Exercise 3b Step 2 (end)

    // update summary data
    updateSummaryValues(attributeWebId);
  }
  //----------- student TODO area (end)----------------------------------------

  //----------- bonus student TODO --------------------------------------------
  // get duration value at midnight
  var stateMidnightValue = {};
  var getMidnightValue = function(stateName) {
    if (stateMidnightValue[stateName] !== undefined) {
      return stateMidnightValue[stateName];
    } else {
      // TODO: Exercise 3 Bonus
      var batchContent = piWebApiREST.batchContructorToolTip(stateName, 't');
      piWebApiREST.sendBatchRequest(batchContent).then(function(data) {
        stateMidnightValue[stateName] = Math.round(data[2].Content.Value * 100) / 100;
        return stateMidnightValue[stateName];
      });
      // TODO: Exercise 3 Bonus (end)
    }
  };
  //----------- bonus student TODO (end) --------------------------------------
}]);
