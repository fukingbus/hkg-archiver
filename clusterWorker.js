/**
 * Created by xeonyan on 3/11/2016.
 */
var request = require('request');
var crypto = require('crypto');
var fs = require('fs');
if (!fs.existsSync('./archive/'))
    fs.mkdirSync('./archive/');
//
init();

process.on('message', function (msg) {
    switch (msg.action) {
        case 'doWork':
            doJob(msg.params.postID);
            break;
    }
});

function doJob(postID) {
    request.post({
            url: 'http://android-1-2.hkgolden.com/newView.aspx', form: {
                s: getMD5(postID),
                filtermode:'N',
                user_id:'0',
                message : postID,
                sensormode :'N',
                returntype :'json',
                start : '0',
                limit : '10001'
            }
        }
        , function (err, httpResponse, body) {
            if(!err) {
                fs.writeFile('./archive/' + postID + '.json', body, function (err) {
                    if (err) {
                        writeLog(err);
                        setTimeout(function(){
                            doJob(postID);
                        },1000);
                    }
                    else {
                        reportJob(postID);
                    }
                });
            }
            else {
                writeLog(err);
                doJob(postID);
            }
        });
}
function writeLog(err){
    var data = new Date() +' worker #'+process.pid+'\n\n'+err.message+'\n\n';
    fs.appendFile('./log.txt', data, function(err) {
        if (err) console.log(err);
    });
}
function reportJob(postID) {
    process.send({
        action: 'doneJob',
        pid: process.pid,
        postID : postID
    });
}
function init() {
    process.send({
        action: 'init',
        pid: process.pid
    });
}
function getDate() {
    var tempDate = new Date();

    return '' + tempDate.getFullYear() +
        ((tempDate.getMonth() + 1) < 10 ?
        '0' + (tempDate.getMonth() + 1) :
            (tempDate.getMonth() + 1)) +
        ((tempDate.getDate()) < 10 ?
        '0' + (tempDate.getDate()) :
            (tempDate.getDate()));
}
function getMD5(postID){
    var data = getDate()+'_HKGOLDEN_%GUEST%_$API#Android_1_2^'+postID+'_0_N_N';
    return crypto.createHash('md5').update(data).digest('hex');
}