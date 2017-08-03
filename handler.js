'use strict';

const assert = require('assert')
const mqtt = require('mqtt')
const constants = require('./secret')


const response = (title, message) => {
  return {
    "version": "1.0",
    "response": {
      "outputSpeech": {
        "type": "PlainText",
        "text": message
      },
      "card": {
        "content": message,
        "title": title,
        "type": "Simple"
      },
      "shouldEndSession": true
    },
    "sessionAttributes": {}
  }
}

module.exports.homeAssistant = (event, context, callback) => {
    
//    Initialize
    var payload = {}
    var intentVal = ""
    var deviceType = ""
    var deviceState = ""
    
//    Validate sessions data.
    try {
        assert(event.session)
        assert(event.session.application)

        assert(event.request)
        assert(event.request.intent)
        
//        Validate intent value, 
        intentVal = event.request.intent.name;
        assert(intentVal)
        
    } catch (e) {
        callback(null, response(
            "Failed assertion: "+e,
            "Sorry, but I cannot handle your request."
        ))
        return;
    }

//    Identify the intent type
    try{
        switch(intentVal){
            case "DeviceControlIntent":
                
                deviceState = event.request.intent.slots.deviceState.value
                deviceType = event.request.intent.slots.deviceType.value
                
                switch(deviceType){
                    case "main light": // Main Light
                        payload.topic = "home/light/main/state/cmnd/Power";
                        break;
                    case "my desk light": // MJ Desk Light
                    case "my light":
                        payload.topic = "home/light/mj-desk/state/cmnd/Power";
                        break;
                    case "Wei Wei desk light": // Wei wei Light
                    case "Wei Wei light":
                        payload.topic = "home/light/wei-wei-desk/state/cmnd/Power";
                        break;
                    default:
                        throw "Unknown device type: "+JSON.stringify(deviceType);
                }
                payload.message = deviceState;
                payload.response = deviceType + " is now " + deviceState;
                payload.card = "Device control: Device: " +deviceType + " State: " + deviceState;
                break;
            case "LeaveHomeIntent":
                payload.topic = "home/scene/leaving-home/state";
                payload.message = "true";
                payload.response = "Have a safe trip!";
                payload.card = "Scene - Leaving Home: "+intentVal;
                break;
            case "ReachHomeIntent":
                payload.topic = "home/scene/reaching-home/state";
                payload.message = "true";
                payload.response = "Welcome back!";
                payload.card = "Scene - Reaching Home: "+intentVal;
                break;
            case "SleepIntent":
                payload.topic = "home/scene/sleep/state";
                payload.message = "true";
                payload.response = "Good night!";
                payload.card = "Scene - Sleeping: "+intentVal;
                break;
            default:
                throw "Unknown intent:"+intentVal;
        }
        
//    MQTT client - Connect
        var mqttpromise = new Promise( function(resolve,reject){ 
            var client = mqtt.connect({port:constants.MQTT_BROKER_PORT,
                                       host:constants.MQTT_BROKER_URL,
                                       username:constants.MQTT_USERNAME,
                                       password:constants.MQTT_PASSWORD});

            client.on('connect', function() { 
                client.publish(payload.topic, payload.message, function() { 
                    client.end();  
                    resolve('Done Sending'); 
                }); 
            });  	
        });

//    MQTT Client - Callback
        mqttpromise.then(function(data) { 

            callback(null, response(
              payload.card,payload.response
            ))


        }, function(err) { 
            console.log('An error occurred:', err); 
        });
        
    } catch (e) {
        callback(null, response(
            "Failed identifying intent: "+e,
            "Sorry, but I cannot handle your request."
        ))
        return;
    }
}