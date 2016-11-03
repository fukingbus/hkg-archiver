/**
 * Created by xeonyan on 3/11/2016.
 */
var cluster = require('cluster');
var config = require('./config');
//
var workers = {};
//
var currentProcess = config.startPost;
//
if (cluster.isMaster) {
    var clusterConfig = require('./config');
    for (var i = 0; i < clusterConfig.process; i++) {
        var worker = cluster.fork();
        workers[worker.process.pid] = worker;
    }

    cluster.on('message', function (msg) {
        switch (msg.action){
            case 'doneJob':
                    console.log('worker '+msg.pid+' successfully downloaded #'+msg.postID+' '+getProgress(msg.postID)+'%');
                    dispatchJob(msg.pid);
                break;
            case 'init':
                    dispatchJob(msg.pid);
                break;
        }
    });
}
else
    require('./clusterWorker');

function getProgress(postID){
    var total = config.limitPost  - config.startPost;
    return Math.floor(((total -config.limitPost  + postID)/total) *100);
}
function dispatchJob(pid){
    if(currentProcess<=config.limitPost) {
        workers[pid].send({
            action: 'doWork',
            params: {
                postID: currentProcess
            }
        });
        currentProcess++;
    }
    else
        console.log('Download finished');
}
module.exports = {
    isMasterCluster: cluster.isMaster
};