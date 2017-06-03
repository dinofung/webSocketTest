"use strict";


// var fs = require('fs');
// var express = require('express');
// var serveStatic = require('serve-static');
// var path = require('path');
// var morgan = require('morgan');
// var healthChecker = require('sc-framework-health-check');

import express from 'express';
import serveStatic from 'serve-static';
import path from 'path';
import morgan from 'morgan';            //Morgan是一个node.js关于http请求的日志中间件。
import healthChecker from 'sc-framework-health-check';


module.exports.run = (worker) => {
    console.log('   >> Worker PID:', process.pid);
    let environment = worker.options.environment;

    let app = express();

    let httpServer = worker.httpServer;
    let scServer = worker.scServer;

    if (environment == 'dev') {
        // Log every HTTP request. See https://github.com/expressjs/morgan for other
        // available formats.
        app.use(morgan('dev'));
    }
    app.use(serveStatic(path.resolve(__dirname, 'public')));

    // Add GET /health-check express route
    healthChecker.attach(worker, app);

    httpServer.on('request', app);

    let count = 0;

    /*
      In here we handle our incoming realtime connections and listen for events.
    */
    scServer.on('connection', (socket) => {
        console.log('User connected');
        socket.on('chat', function (data) {
            scServer.global.publish('yell', data);
            console.log('Chat:', data);
        });
        socket.on('disconnect', function () {
            console.log('User disconnected');
        });
    });
    // scServer.on('connection', function (socket) {

    //   // Some sample logic to show how to handle client events,
    //   // replace this with your own logic

    //   socket.on('sampleClientEvent', function (data) {
    //     count++;
    //     console.log('Handled sampleClientEvent', data);
    //     scServer.exchange.publish('sample', count);
    //   });

    //   var interval = setInterval(function () {
    //     socket.emit('rand', {
    //       rand: Math.floor(Math.random() * 5)
    //     });
    //   }, 1000);

    //   socket.on('disconnect', function () {
    //     clearInterval(interval);
    //   });
    // });
};
