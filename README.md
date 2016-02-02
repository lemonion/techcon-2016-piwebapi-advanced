# techcon-2016-piwebapi-advanced
This is the lab for 'Advanced PI Web API' in OSIsoft TechCon 2016.

## Introduction
This is a single-page web application that shows statewide web traffic data retrieved from the PI System. When user clicks on a state, PI Web API will issue a batch call to get following information to populate on the right side:

* State abbreviation (static, configuration AF attribute - Abbreviation)
* Population (static AF attribute - Population)
* Visit Duration (PI Point AF attribute – VisitDuration)
  * Current value
  * Summary values (minimum, maximum and average) over the last 10 minutes
  * Plot values over the last 10 minutes

In addition, we will use PI Web API Indexed Search to allow user to search and select for a state name by typing into the text box. We will also be opening a channel to the stream so that there are live value updates on the client.

The application is built using HTML/CSS/Javascript using AngularJS 1 as the frontend JavaScript framework, and hosted using Node.js. 

## Getting started
Feel free to take a look at the code as is. You can also download the files or fork and clone the repository. To install all necessary dependent components, open the techcon-2016-piwebapi-advanced root folder and run `npm install`. This will install the dependent component Express which is used to host the site.

To get started, open a command prompt, go to the project folder, and run `node server.js`. You can then use a browser to see the web application on http://localhost:8080.

## To reproduce the lab environment
You will need running instances of PI Data Archive, PI Asset Framework and PI Web API with the PI Web API Indexed Search component installed. Set up Kerberos as the authentication method to allow the PI Web API Crawler to properly index the AF Database.

1. Create a new AF Database and import the [WebTrafficElementTemplates.xml](./resources/WebTrafficElementTemplates.xml) and [WebTraffic.xml](./resources/WebTraffic.xml) files under the [resources folder](./resources). For more information on how to import xml files in AF, refer to this [link] (https://livelibrary.osisoft.com/LiveLibrary/content/en/server-v6/GUID-D733CC22-168A-4439-828C-4DFA9679B376). By default, the AF database will reference PI Points created on your default PI Data Archive. If this is undesirable, modify the ConfigString for the attribute and attribute template in the XML file to the name of your desired PI Data Archive before performing the import operation. 

2. We will be using the PI Random Simulator Interface to simulate web traffic data. Add 3 scan classes to the PI Random Simulator Interface. For information on how to add scan classes using the Interface Configuration Utility, refer to this [documentation](https://livelibrary.osisoft.com/LiveLibrary/content/en/int-icu-v3/GUID-3FAD4074-87BA-48B5-8E57-235687B202DB).
  * Scan class 3: 00:00:05
  * Scan class 4: 00:00:04,00:00:01
  * Scan class 5: 00:00:06,00:00:02

3. Create the PI tags. Open up (resources/WebTrafficPIPoints.xlsx)[./resources/WebTrafficPIPoints.xlsx] in Microsoft Excel with PI Builder installed. You will notice there are two sets of PI Points for each state (100 PI points in total). This is because tag values generated from the current version of the Random Interface can contain negative values. We will therefore used the PI Performance Equation Scheduler to output positive values for us to use in this web page. Use the PI Builder to create and edit the PI Points. For more information about PI Builder, refer to this [guide](https://livelibrary.osisoft.com/LiveLibrary/content/en/server-v3/GUID-146F64E4-FBDA-48A4-977C-16178581316D).

4. Check that the AF attributes are referencing the correct PI tags, and that the PI tags are populated with real-time values.

5. Set up the PI Web API Indexed Search to crawl the AF database at https://YourPIWebAPIServer/piwebapi/admin/search/database.html. 

6. Modify the baseUrl, afServer and afDatabase string in [public/js/services/piwebapiSolution.js](./public/js/services/piwebapiSolution.js) for your environment.

##Licensing
Please see the file named [LICENSE.md] (LICENSE.md).
