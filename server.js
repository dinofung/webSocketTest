// Server code
// var SocketCluster = require('socketcluster').SocketCluster;

// var socketCluster = new SocketCluster({
//   workers: 1,
//   brokers: 1,
//   port: 4000,
//   appName: 'app',
//   // Switch wsEngine to 'uws' for a MAJOR performance boost (beta)
//   wsEngine: 'ws',
//   workerController: __dirname + '/worker.js',
//   brokerController: __dirname + '/broker.js',
//   socketChannelLimit: 1000,
//   rebootWorkerOnCrash: true
// });
"use strict";

// import fs from 'fs';

var fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));
var scHotReboot = require('sc-hot-reboot');

var SocketCluster = require('socketcluster').SocketCluster;


var workerControllerPath = argv.wc || process.env.SOCKETCLUSTER_WORKER_CONTROLLER;
var brokerControllerPath = argv.bc || process.env.SOCKETCLUSTER_BROKER_CONTROLLER;
var initControllerPath = argv.ic || process.env.SOCKETCLUSTER_INIT_CONTROLLER;
var environment = process.env.ENV || 'dev';

var options = {
  workers: Number(argv.w) || Number(process.env.SOCKETCLUSTER_WORKERS) || 1,
  brokers: Number(argv.b) || Number(process.env.SOCKETCLUSTER_BROKERS) || 1,
  port: Number(argv.p) || Number(process.env.SOCKETCLUSTER_PORT) || 4000,
  // If your system doesn't support 'uws', you can switch to 'ws' (which is slower but works on older systems).
  wsEngine: process.env.SOCKETCLUSTER_WS_ENGINE || 'uws',
  appName: argv.n || process.env.SOCKETCLUSTER_APP_NAME || null,
  workerController: workerControllerPath || __dirname + '/worker.js',
  brokerController: brokerControllerPath || __dirname + '/broker.js',
  initController: initControllerPath || null,
  socketChannelLimit: Number(process.env.SOCKETCLUSTER_SOCKET_CHANNEL_LIMIT) || 1000,
  clusterStateServerHost: argv.cssh || process.env.SCC_STATE_SERVER_HOST || null,
  clusterStateServerPort: process.env.SCC_STATE_SERVER_PORT || null,
  clusterAuthKey: process.env.SCC_AUTH_KEY || null,
  clusterInstanceIp: process.env.SCC_INSTANCE_IP || null,
  clusterInstanceIpFamily: process.env.SCC_INSTANCE_IP_FAMILY || null,
  clusterStateServerConnectTimeout: Number(process.env.SCC_STATE_SERVER_CONNECT_TIMEOUT) || null,
  clusterStateServerAckTimeout: Number(process.env.SCC_STATE_SERVER_ACK_TIMEOUT) || null,
  clusterStateServerReconnectRandomness: Number(process.env.SCC_STATE_SERVER_RECONNECT_RANDOMNESS) || null,
  crashWorkerOnError: argv['auto-reboot'] != false,
  // If using nodemon, set this to true, and make sure that environment is 'dev'.
  killMasterOnSignal: false,
  environment: environment
};

var SOCKETCLUSTER_OPTIONS;

if (process.env.SOCKETCLUSTER_OPTIONS) {
  SOCKETCLUSTER_OPTIONS = JSON.parse(process.env.SOCKETCLUSTER_OPTIONS);
}

for (var i in SOCKETCLUSTER_OPTIONS) {
  if (SOCKETCLUSTER_OPTIONS.hasOwnProperty(i)) {
    options[i] = SOCKETCLUSTER_OPTIONS[i];
  }
}

var masterControllerPath = argv.mc || process.env.SOCKETCLUSTER_MASTER_CONTROLLER;

var start = function () {
  var socketCluster = new SocketCluster(options);

  if (masterControllerPath) {
    var masterController = require(masterControllerPath);
    masterController.run(socketCluster);
  }

  if (environment == 'dev') {
    // This will cause SC workers to reboot when code changes anywhere in the app directory.
    // The second options argument here is passed directly to chokidar.
    // See https://github.com/paulmillr/chokidar#api for details.
    console.log(`   !! The sc-hot-reboot plugin is watching for code changes in the ${__dirname} directory`);
    scHotReboot.attach(socketCluster, {
      cwd: __dirname,
      ignored: ['public', 'node_modules', 'README.md', 'Dockerfile', 'server.js', 'broker.js', /[\/\\]\./, '*.log']
    });
  }
};

var bootCheckInterval = Number(process.env.SOCKETCLUSTER_BOOT_CHECK_INTERVAL) || 200;

if (workerControllerPath) {
  // Detect when Docker volumes are ready.
  var startWhenFileIsReady = (filePath) => {
    return new Promise((resolve) => {
      if (!filePath) {
        resolve();
        return;
      }
      var checkIsReady = () => {
        fs.exists(filePath, (exists) => {
          if (exists) {
            resolve();
          } else {
            setTimeout(checkIsReady, bootCheckInterval);
          }
        });
      };
      checkIsReady();
    });
  };
  var filesReadyPromises = [
    startWhenFileIsReady(masterControllerPath),
    startWhenFileIsReady(workerControllerPath),
    startWhenFileIsReady(brokerControllerPath),
    startWhenFileIsReady(initControllerPath)
  ];
  Promise.all(filesReadyPromises).then(() => {
    start();
  });
} else {
  start();
}

// http://nelsonzheng.com/building-a-chat-application-with-socketcluster/
// https://medium.com/@sachinshinde7676/building-a-chat-app-for-android-using-socketcluster-in-node-js-90a4ae6c3577
// http://www.ctolib.com/socketcluster.html
// https://yq.aliyun.com/articles/2983