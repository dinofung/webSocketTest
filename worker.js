"use strict";


var fs = require('fs');
var express = require('express');
var serveStatic = require('serve-static');
var path = require('path');
var morgan = require('morgan');
var healthChecker = require('sc-framework-health-check');
var fetch = require('isomorphic-fetch');

const baseHost = process.env.baseHost || "http://localhost:3000";
// import express from 'express';
// import serveStatic from 'serve-static';
// import path from 'path';
// import morgan from 'morgan';            //Morgan是一个node.js关于http请求的日志中间件。
// import healthChecker from 'sc-framework-health-check';


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

            console.log('Chat:', data);

            //data schema:
            //{action:"",data:object};
            if (data && data.action) {
                eval(data.action)(data.data)
                    .then(resolveData => {
                        console.log(data.action, resolveData);
                        scServer.global.publish('yell', resolveData);
                    })
                    .catch(error => {
                        console.error(error);
                    });
            }
            else {
                scServer.global.publish('yell', data);
            }

            // socket.emit('rand',"this is a specsal message emit from "+ socket.id);
            // scServer.exchange.publish('rand',"this is a specsal message publish from "+ socket.id);
        });

        // let c = 0;
        // var interval = setInterval(function () {
        //     let v = Math.floor(Math.random() * 5);
        //     let t = (new Date()).toLocaleTimeString();
        //     c++;
        //     socket.emit('rand', {
        //         time: t,
        //         rand: v,
        //         count: c,
        //         pid:socket.id
        //     });
        // }, 5000);

        socket.on('disconnect', function () {
            console.log('User disconnected');
            clearInterval(interval);
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



    //   socket.on('disconnect', function () {
    //     clearInterval(interval);
    //   });
    // });
};

const save = (data) => {
    //

    console.log("save data:", data);

    return fetch(baseHost + '/' + 'api/collaboration/folder/recentfile/10')
        .then(response => {
            if (response.status != 200) {
                throw new Error("Bad response from server");
            }
            return response.json();
        })
        .then(data => {
            if (data.resultType === 'SUCCESS') {
                return data.results;
            }
            else {
                throw new Error(data.resultMsg);
            }
        });
    // .catch(error=>{})

}

//http://www.linuxidc.com/Linux/2014-07/103906.htm
//https://www.oschina.net/translate/dockerlinks?cmp
//http://blog.csdn.net/ronggangzhao/article/details/43983031