/* eslint-disable  func-names */
/* eslint-disable  no-console */
const Alexa = require('ask-sdk'); 
const express = require('express');
const bodyParser = require('body-parser');
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server);
let port = process.env.PORT || 3000;
app.use(bodyParser.json());
let skill;
let username;
let dashboardname={username:"",name:"Retail Analytics",lasttime:"September 2016",title1:"Location View",title2:"Sales Group view"};

// Creates the website server on the port #
server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Express Routing
app.use(express.static(__dirname + '/public'));
io.on('connection', function(socket){

  socket.on('userdashboardinfo', function(data){
    var info=data.split(';')
    dashboardname.username=info[0],
    dashboardname.name=info[1],
    dashboardname.lasttime="September 2016";
    dashboardname.title1=info[3];
    dashboardname.title2=info[4];
  });

});

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Welcome, What would you like to do?';
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Name Alexa', speechText)
      .getResponse();
  },
};
const OpenIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'open';
  },
  handle(handlerInput) {
    const speechText = "Welcome "+dashboardname.username+",you are looking at the "+dashboardname.name+" from "+dashboardname.lasttime;
	io.emit('open', speechText);
    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('VBX Alexa', speechText)
      .getResponse();
  },
};

 
const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can ask details about the dashboard!'; 
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Name Alexa', speechText)
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can ask details about the dashboard!'; 
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('VBX Alexa', speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Thank you for visiting us!! Dont forget to look onto our VBX extensions!';
	io.emit('stop','Stopped');
    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Name Alexa', speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
	io.emit('stop','Stopped');
    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};
 
		
const WhoAmIHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'WhoAmI';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
 
    const speechText = "You are " + username + ", of course!";
	io.emit('kpi', itemSlot);
	return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Name Alexa', speechText)
      .getResponse();
  }
};

	
const MyNameIsHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'MyNameIs';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    const name = handlerInput.requestEnvelope.request.intent.slots.name.value; 
    const speechText = "Okay, I won't forget you "+ name; 
	username = name;
	return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Name Alexa', speechText)
      .getResponse();
  }
};
  


app.post('/', function(req, res) {

    if (!skill) {

      skill = Alexa.SkillBuilders.custom()
        .addRequestHandlers(   
			LaunchRequestHandler, 
			OpenIntentHandler, 
			HelpIntentHandler,
			CancelAndStopIntentHandler,
			SessionEndedRequestHandler,
			MyNameIsHandler,
			WhoAmIHandler
        )
		.addErrorHandlers(ErrorHandler)
        .create();

    }

    skill.invoke(req.body)
      .then(function(responseBody) {
        res.json(responseBody);
      })
      .catch(function(error) {
        console.log(error);
        res.status(500).send('Error during the request');
      });

});

 