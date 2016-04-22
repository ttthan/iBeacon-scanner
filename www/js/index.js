

$(document).ready(function () {

	$(document).on('pageshow', '#first', function (data) {});
});

var regions =
	[{
		uuid : '699EBC80-E1F3-11E3-9A0F-0CF3EE3BC012'
	},
];
var beacons = {};

var scan = false;
var uuidS = null;
var minorS = null;
var majorS = null;
var startTime = null;
var time = 0;
var updateTimer = null;

var data = {
	"time" : [],
	"rssi" : []
};
var ctx;
var myLineChart;
var dataChart = {
	labels : [],
	datasets : [{
			label : "My dataset",
			fillColor : "rgba(220,220,220,0.2)",
			strokeColor : "rgba(220,220,220,1)",
			pointColor : "rgba(220,220,220,1)",
			pointStrokeColor : "#fff",
			pointHighlightFill : "#fff",
			pointHighlightStroke : "rgba(220,220,220,1)",
			data : []
		}
	]
};

var logOb;

var options = {
	animation : false,
	scaleShowGridLines : true,
	scaleShowVerticalLines : true,
	showTooltips : false,
	onAnimationComplete : function () {
		console.log(this.toBase64Image())
	}
};

var app = {

	initialize : function () {
		this.bindEvents();
	},

	bindEvents : function () {
		document.getElementById("scanButton").addEventListener("click", scanDevice);
		document.getElementById("shareFile").addEventListener("click", shareFile);
		// document.getElementById("readFile").addEventListener("click", readLog);
		document.getElementById("saveGraph").addEventListener("click", saveGraph);
		document.addEventListener("stop", stopScan, false);
		document.getElementById("scanButton").innerHTML = "Scan";
		console.log("page show");
		console.log(dataChart.datasets[0].data);
	},

};

app.initialize();

function scanDevice() {

	if (scan) {
		// Set button text
		document.getElementById("scanButton").innerHTML = "Scan";
		scan = false;
		stopScan();
	} else {
		console.log('scan');
		document.getElementById("scanButton").innerHTML = "Stop";
		scan = true;
		window.locationManager = cordova.plugins.locationManager;
		startScan();
		saveFile();
		// Set display interval
		updateTimer = setInterval(display, 500);
	}

}

function display() {

	displayBeaconList();
	displayBeacon();

}

function startScan() {

	var delegate = new locationManager.Delegate();
	delegate.didRangeBeaconsInRegion = function (pluginResult) {
		for (var i in pluginResult.beacons) {
			var beacon = pluginResult.beacons[i];
			beacon.timeStamp = Date.now();
			var key = beacon.uuid + ':' + beacon.major + ':' + beacon.minor;
			beacons[key] = beacon;
		}
	};
	delegate.didStartMonitoringForRegion = function (pluginResult) {
		console.log('didStartMonitoringForRegion:' + JSON.stringify(pluginResult))
	};
	locationManager.setDelegate(delegate);
	locationManager.requestAlwaysAuthorization();
	for (var i in regions) {
		var beaconRegion = new locationManager.BeaconRegion(
				i + 1,
				regions[i].uuid);
		// Start ranging beaconRegion
		locationManager.startRangingBeaconsInRegion(beaconRegion)
		.fail(console.error)
		.done();
		// Start monitoring beaconRegion
		locationManager.startMonitoringForRegion(beaconRegion)
		.fail(console.error)
		.done();
	}

}

function stopScan() {

	console.log("stop");
	// clear interval
	clearInterval(updateTimer);
	for (var i in regions) {
		var beaconRegion = new locationManager.BeaconRegion(
				i + 1,
				regions[i].uuid);
		// Stop ranging beaconRegion
		locationManager.stopRangingBeaconsInRegion(beaconRegion)
		.fail(console.error)
		.done();
		// Stop monitoring beaconRegion
		locationManager.stopMonitoringForRegion(beaconRegion)
		.fail(console.error)
		.done();
	}

}

function displayBeaconList() {

	$("#deviceList").empty();
	$('#found-beacons').empty();
	var html = '';
	var timeNow = Date.now();
	$.each(beacons, function (key, beacon) {
		if (beacon.timeStamp + 6000 > timeNow) {
			var rssiWidth = 1;
			if (beacon.rssi < -100) {
				rssiWidth = 100;
			} else if (beacon.rssi < 0) {
				rssiWidth = 100 + beacon.rssi;
			}
			var res =
				'<ul>'
				 + '<li>UUID : ' + beacon.uuid + '</li>'
				 + '<li>Major : ' + beacon.major + '</li>'
				 + '<li>Minor : ' + beacon.minor + '</li>'
				 + '<li>RSSI : ' + beacon.rssi + '</li>'
				 + '<li>Distance : ' + beacon.accuracy + '</li>'
				 + '</ul>';
			var p = document.getElementById('deviceList');
			var li = document.createElement('li');
			var $a = $("<a href=\"#connected\">" + res + "</a>");
			$(li).append($a);
			$a.bind("click", {
				uuid : beacon.uuid,
				minor : beacon.minor,
				major : beacon.major
			}, eventBeaconClicked);
			p.appendChild(li);
			$("#deviceList").listview("refresh");
		}
	});

}

function eventBeaconClicked(event) {

	// Set selected beacon
	uuidS = event.data.uuid;
	majorS = event.data.major;
	minorS = event.data.minor;
	startTime = Date.now();
	time = 0;
	// clear data log
	data.time = [];
	data.rssi = [];
	dataChart.labels = [];
	dataChart.datasets[0].data = [];
	// Truncate log file
	logOb.createWriter(truncateFile, fail);
	// Clear chart
	document.getElementById('chart').innerHTML = '';

}

function displayBeacon() {

	navigator.geolocation.getCurrentPosition(function (position) {
		// 	console.log('Latitude: '          + position.coords.latitude          + '\n' +
		// 'Longitude: '         + position.coords.longitude         + '\n' +
		// 'Altitude: '          + position.coords.altitude          + '\n' +
		// 'Accuracy: '          + position.coords.accuracy          + '\n' +
		// 'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
		// 'Heading: '           + position.coords.heading           + '\n' +
		// 'Speed: '             + position.coords.speed             + '\n' +
		// 'Timestamp: '         + position.timestamp                + '\n');

		var html = ''
			var res = 'Signal perdu';
		var timeNow = Date.now();

		$.each(beacons, function (key, beacon) {
			if (beacon.timeStamp + 6000 > timeNow) {
				var rssiWidth = 1; // Used when RSSI is zero or greater.
				if (beacon.rssi < -100) {
					rssiWidth = 100;
				} else if (beacon.rssi < 0) {
					rssiWidth = 100 + beacon.rssi;
				}

				if ((beacon.uuid == uuidS) && (beacon.minor == minorS) && (beacon.major == majorS)) {
					var date2 = new Date();
					var e = date2 - startTime;
					if ((e / 500) >= 1) {

						if (beacon.rssi) {
							data.rssi.push( - (beacon.rssi));
							// Delete first data when data length > 8
							if (dataChart.datasets[0].data.length > 8) {
								dataChart.datasets[0].data.splice(0, 1);
								dataChart.labels.splice(0, 1);
							}
							dataChart.datasets[0].data.push( - (beacon.rssi));
						} else {
							data.rssi.push(0);
							if (dataChart.datasets[0].data.length > 8) {
								dataChart.datasets[0].data.splice(0, 1);
								dataChart.labels.splice(0, 1);
							}
							dataChart.datasets[0].data.push(0);
						}
						data.time.push(time);
						dataChart.labels.push(time);
						var str = time + "\t" + beacon.rssi + "\t" + position.coords.latitude + "\n";
						writeLog(str);
						startTime = new Date();
						time++;
						if (document.getElementById('chart').innerHTML == '') {
							console.log("draw chart");
							var html = '<canvas id="myChart" ></canvas>';
							document.getElementById('chart').innerHTML = html;
							ctx = document.getElementById("myChart").getContext("2d");
							myLineChart = new Chart(ctx).Line(dataChart, options);
						} else {
							myLineChart.destroy();
							ctx = document.getElementById("myChart").getContext("2d");
							myLineChart = new Chart(ctx).Line(dataChart, options);
						}
					}

					res =
						'<ul>'
						 + '<li>UUID : ' + beacon.uuid + '</li>'
						 + '<li>Major :' + beacon.major + '</li>'
						 + '<li>Minor : ' + beacon.minor + '</li>'
						 + '<li>RSSI : ' + beacon.rssi + '</li>'
						 + '<li>Distance : ' + beacon.accuracy + '</li>'
						 + '</ul>'
						 + '<ul>'
						 + '<li>Latitude : ' + position.coords.latitude + '</li>'
						 + '<li>Longitude : ' + position.coords.longitude + '</li>'
						 + '</ul>';
				}
			}
		});

		html += res;
		document.getElementById('deviceName').innerHTML = html;

		console.log("Time: " + data.time);
		console.log("Time: " + dataChart.labels);
		console.log("RSSI: " + data.rssi);
		console.log("RSSI: " + dataChart.datasets[0].data);
	}, function (error) {
		console.log('code: ' + error.code + '\n' +
			'message: ' + error.message + '\n');
	});

}

function fail(e) {

	console.log("FileSystem Error");
	console.dir(e);

}

function saveFile() {

	window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function (dir) {
		dir.getFile("data.csv", {
			create : true
		}, function (file) {
			logOb = file;
			logOb.createWriter(truncateFile, fail);
		});
	});

}

function truncateFile(writer) {

	console.log("truncate file");
	writer.truncate(0);

};

function writeLog(str) {

	if (!logOb)
		return;
	// var log = str + " \n";
	console.log("going to log " + str);
	logOb.createWriter(function (fileWriter) {
		fileWriter.seek(fileWriter.length);
		var blob = new Blob([str], {
				type : 'text/plain'
			});
		fileWriter.write(blob);
	}, fail);

}

function readLog() {

	logOb.file(function (file) {
		var reader = new FileReader();
		reader.onloadend = function (e) {
			console.log(this.result);
		};
		reader.readAsText(file);
	}, fail);

}

function shareFile() {

	// var saisie = prompt("File name :", "");
	// alert(saisie);
	window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function (dir) {
		// console.log("got main dir", dir);
		// logOb.copyTo(dir, saisie + ".txt", function (entry) {
		console.log(logOb.nativeURL);
		// window.cordova.plugins.FileOpener.openFile(entry.nativeURL, success, error);
		cordova.plugins.email.addAlias('gmail', 'com.google.android.gm');
		cordova.plugins.email.open({
			app : 'gmail',
			attachments : [
				logOb.nativeURL
			]
		});
	});

}

function success(data) {

	console.log(data.message);

}

function error(code) {

	console.log(code.message);

}

function saveGraph() {

	var img = myLineChart.toBase64Image();
	var dataGraph = img.replace(/^data:image\/\w+;base64,/, "");
	window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function (dir) {
		dir.getFile("graph.png", {
			create : true
		}, function (file) {
			file.createWriter(function (writer) {
				console.log(file);
				writer.seek(0);
				var binary = fixBinary(atob(dataGraph));
				var blob = new Blob([binary], {
						type : 'image/png'
					});
				writer.write(blob);
				console.log("End creating image file. File created");
			}, fail);
			cordova.plugins.email.addAlias('gmail', 'com.google.android.gm');
			cordova.plugins.email.open({
				app : 'gmail',
				attachments : [
					file.nativeURL
				]
			});
		});
	});

}

function fixBinary(bin) {

	var length = bin.length;
	var buf = new ArrayBuffer(length);
	var arr = new Uint8Array(buf);
	for (var i = 0; i < length; i++) {
		arr[i] = bin.charCodeAt(i);
	}
	return buf;

}
