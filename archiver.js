/**
 * Created by xeonyan on 3/11/2016.
 */
var cluster = require('cluster');
var config = require('./config');
//
var workers = {};
//
var currentProcess = config.startPost;
var progressDone = false;
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
                    console.log('worker '+msg.pid+'- #'+msg.postID+' '+getProgress(msg.postID)+'%');
                    if(currentProcess<=config.limitPost)
                        dispatchJob(msg.pid);
                    else{
                        if(!progressDone)
                            console.log('Download finished');
                        progressDone = true;
                    }
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
        workers[pid].send({
            action: 'doWork',
            params: {
                postID: currentProcess
            }
        });
        currentProcess++;
}
module.exports = {
    isMasterCluster: cluster.isMaster
};