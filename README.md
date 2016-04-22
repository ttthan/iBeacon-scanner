# iBeacon scanner

iBeacon scanner is a project that finds and displays ibeacons.
To run this project, you first must install Cordova. Installation instructions can be found in the [Cordova document](https://cordova.apache.org/docs/en/latest/guide/cli/index.html)

##Project setup
HTML and JavaScript code files are found in the *www* folder in the project. The file *www/index.html* contains the UI elements of the app. File *www/app.js* contains all the JavaScript code for the application.

##Before run the project
Open file *www/app.js* and edit the variables *regions* to contain the UUIDs and major/minor values of your beacons :
```javascript
var regions =
	[{
		uuid : '699EBC80-E1F3-11E3-9A0F-0CF3EE3BC012'
	},
];
```
##Used plugins
* [cordova-ibeacon-plugin](https://github.com/evothings/cordova-plugin-ibeacon) : ranging and monitoring ibeacons
* [cordova-plugin-file](https://github.com/apache/cordova-plugin-file) : allowing read/write access to files
* [cordova-email-plugin](https://github.com/katzer/cordova-plugin-email-composer) : editing and sending an email
* [cordova-plugin-geolocation](https://github.com/apache/cordova-plugin-geolocation) : providing information about the device's location

:)
