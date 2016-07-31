var Milight = require('node-milight-promise').MilightController;
var commands = require('node-milight-promise').commands2;
var q = require('q');
var m = require('moment');

var controllers = [];
var i, zone = 1;
// for(i = 0; i < 30; i += 1){
    // var host = '192.168.2.' + i;
    // console.log(host);
    controllers.push(new Milight({
        ip: "192.168.2.10",
        delayBetweenCommands: 1,
        commandRepeat: 3
    }));
// }
var doOnAll = function(callback){
    var masterDeferred = q.defer();
    var promises = [];
    controllers.forEach(function(controller){
        var deferred = q.defer();
        callback(controller, deferred);
        promises.push(deferred.promise);
    });
    q.all(promises).then(function(){
        masterDeferred.resolve();
    });
    return masterDeferred.promise;
};


doOnAll(function(controller, deferred){
    controller.sendCommands(commands.rgbw.on(1), commands.rgbw.whiteMode(zone), commands.rgbw.brightness(100));
    controller.sendCommands(commands.rgbw.on(2), commands.rgbw.whiteMode(zone), commands.rgbw.brightness(100));
    controller.pause(1000);

    controller.sendCommands(commands.rgbw.off(1));
    controller.sendCommands(commands.rgbw.off(2));
    // controller.pause(1000);
    deferred.resolve();
});

setInterval(function(){
    var forDay = (m().day() !== 0) &&(m().day() !== 6);
    var forFive = (m().hour() === 5) && (m().minute() >= 58);
    var forSix = (m().hour() === 6) && (m().minute() <= 45);
    console.log('Day: ' + m().day());
    console.log('Time: ' + m().hour() + ':' + m().minute());
    if(forDay && (forFive || forSix)){
        console.log('Turning on...');
        doOnAll(function(controller, deferred){
            controller.sendCommands(commands.rgbw.on(1), commands.rgbw.whiteMode(zone), commands.rgbw.brightness(100));
            controller.sendCommands(commands.rgbw.on(2), commands.rgbw.whiteMode(zone), commands.rgbw.brightness(100));
            // controller.pause(1000);
            deferred.resolve();
        });
    }else{
        console.log('Turning off...');
        doOnAll(function(controller, deferred){
            controller.sendCommands(commands.rgbw.off(1));
            controller.sendCommands(commands.rgbw.off(2));
            // controller.pause(1000);
            deferred.resolve();
        });
    }
    console.log('------------------------');
}, 10000);