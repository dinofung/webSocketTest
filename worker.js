"use strict";


var fs = require('fs');
var express = require('express');
var serveStatic = require('serve-static');
var path = require('path');
var morgan = require('morgan');
var healthChecker = require('sc-framework-health-check');
var fetch = require('isomorphic-fetch');


const baseHost = process.env.baseHost || "http://192.168.99.100:3000";//"http://localhost:3000";
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

        // data schema:
        // {action:"functionName",data:{object:function parameter}}};
        socket.on('dosomething', function (data) {
            console.log('main:', data);
            if (data && data.action && typeof eval(data.action) === 'function') {
                eval(data.action)(data.data)
                    .then(resolveData => {
                        // resolveData schema:
                        // {emit:[{chanelName,data}],publish:[{chanelName,data}]}
                        console.log(data.action + ' resolve', resolveData);

                        if (resolveData.emit) {
                            resolveData.emit.forEach(function (element) {

                                socket.emit(element.chanelName, element.data);
                                console.log('emit to ', element.chanelName, element.data)
                            }, this);
                        }
                        if (resolveData.publish) {
                            resolveData.publish.forEach(function (element) {

                                scServer.global.publish(element.chanelName, element.data);
                                console.log('publish to ', element.chanelName, element.data)
                            }, this);
                        }
                    })
                    .catch(error => {
                        console.error(error);
                    });
            }
        });


        socket.on('chat', function (data) {

            console.log('Chat:', data);

            // //data schema:
            // //{action:"",data:{address,dataSource}}};
            // if (data && data.action && typeof eval(data.action) === 'function') {
            //     eval(data.action)(data.data)
            //         .then(resolveData => {
            //             console.log(data.action, resolveData);
            //             scServer.global.publish('yell', resolveData);
            //         })
            //         .catch(error => {
            //             console.error(error);
            //         });
            // }
            // else {
                scServer.global.publish('yell', data);
            // }

            // socket.emit('rand',"this is a specsal message emit from "+ socket.id);
            // scServer.exchange.publish('rand',"this is a specsal message publish from "+ socket.id);
        });
/*
        let c = 0;
        var interval = setInterval(function () {
            let v = Math.floor(Math.random() * 5);
            let t = (new Date()).toLocaleTimeString();
            c++;
            socket.emit('rand', {
                time: t,
                rand: v,
                count: c,
                pid: socket.id
            });
        }, 5000);
*/
        socket.on('disconnect', function () {
            console.log('User disconnected');
            // clearInterval(interval);
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


const fileJoin = (data) => {
    console.log("fileJoin:", data);

    let chanelName = data.fileId;
//bussies logic
    return new Promise(function (resolve, reject) {
        resolve({
            publish: [{ chanelName: chanelName, data: { action: 'loadFile', result: { msg: 'this is publish result data', data: [{ a: 1, b: 2 }] } } }],
        //    emit: [{ chanelName: chanelName, data: { action: 'loadFile', result: { msg: 'this is emit result data', data: [{ a: 1, b: 2 }] } } }]
        });
    });

};

const save = (data) => {
    //

    console.log("save data:", data);

    return fetch(baseHost + '/' + 'api/collaboration/folder/recentfile/10')
        .then(response => {
            if (response.status != 200) {
                console.error(JSON.stringify(response, null, 2));
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

};

//http://www.linuxidc.com/Linux/2014-07/103906.htm
//https://www.oschina.net/translate/dockerlinks?cmp
//http://blog.csdn.net/ronggangzhao/article/details/43983031    //container之间建立连接

//http://www.tuicool.com/articles/RfQRny    //Docker学习总结之跨主机进行link
//http://socketcluster.io/#!/
//https://github.com/SocketCluster/socketcluster-client/blob/master/lib/auth.js