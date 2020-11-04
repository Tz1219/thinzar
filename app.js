
/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Messenger Platform Quick Start Tutorial
 *
 * This is the completed code for the Messenger Platform quick start tutorial
 *
 * https://developers.facebook.com/docs/messenger-platform/getting-started/quick-start/
 *
 * To run this code, you must do the following:
 *
 * 1. Deploy this code to a server running Node.js
 * 2. Run `npm install`
 * 3. Update the VERIFY_TOKEN
 * 4. Add your PAGE_ACCESS_TOKEN to your environment vars
 *
 */

'use strict';
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
// Imports dependencies and set up http server
const 
  request = require('request'),
  express = require('express'),
  body_parser = require('body-parser'),
  app = express().use(body_parser.json()),
  admin = require('firebase-admin'),
  ServiceAccount=require("./ServiceAccount.json");

  admin.initializeApp({
    credential: admin.credential.cert(ServiceAccount),
    databaseURL: "https://htun-star-goldsmithing.firebaseio.com"
  })

var db = admin.firestore();

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

// Accepts POST requests at /webhook endpoint
app.post('/webhook', (req, res) => {  

  // Parse the request body from the POST
  let body = req.body;

  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {

    body.entry.forEach(function(entry) {

      // Gets the body of the webhook event
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log('Sender ID: ' + sender_psid);   

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);        
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }
      
    });
    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');

  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});

app.get('/setgsbutton',function(req,res){
    setupGetStartedButton(res);    
});

app.get('/setpersistentmenu',function(req,res){
    setupPersistentMenu(res);    
});

app.get('/clear',function(req,res){    
    removePersistentMenu(res);
});


// Accepts GET requests at the /webhook endpoint
app.get('/webhook', (req, res) => {
  
  /** UPDATE YOUR VERIFY TOKEN **/
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  
  // Parse params from the webhook verification request
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  
    
  // Check if a token and mode were sent
  if (mode && token) {
    
  
    // Check the mode and token sent are correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Respond with 200 OK and challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  }
});

let reqQuestion = {
  size : false,
  weight : false,
  address : false,
};
let customerAns = {};


function handleMessage(sender_psid, received_message) {
  let response;
  
  // Checks if the message contains text
  if (received_message.text == "Hi" || received_message.text == "Hello" || received_message.text == "hi") {    
    // Create the payload for a basic text message, which
    // will be added to the body of our request to the Send API
    let response1 = {
      "text":"Welcome to Htun Star jewellery shop!",
   };
      let response2 = {
      "text":"Hi. if you have any questions or concerns, please send them a photo and you will be asked to answer in the near future. Thanks you!",
   };

   callSendAPI(sender_psid, response1);
   callSendAPI(sender_psid, response2);
   handlePostback(sender_psid, { "payload": 'getstarted' });
  }
  else if (received_message.attachments) {
    // Get the URL of the message attachment
    let attachment_url = received_message.attachments[0].payload.url;
    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "Is this the right jewellery design?",
            "subtitle": "Tap a button to answer.",
            "image_url": attachment_url,
            "buttons": [
              {
                "type": "postback",
                "title": "Yes!",
                "payload": "yes",
              },
              {
                "type": "postback",
                "title": "No!",
                "payload": "no",
              }
            ],
          }]
        }
      }
    }
  } 
 /* else if (received_message.text == "4 cm" || received_message.text == "6 cm" || received_message.text == "8 cm") {
      response = {
        "text":'How much gold you weight?' 
      }
  } else if (received_message.text == "15 K") {
      response = {
        "text":'Your order will get 15.2.2020 and the price will cost 300000ks.',
      "quick_replies":[
        {
          "content_type":"text",
          "title":"Order",
          "payload":"<POSTBACK_PAYLOAD>"
        },{
          "content_type":"text",
          "title":"Cancle",
          "payload":"<POSTBACK_PAYLOAD>"
        }
      ]   
      }
  }  */
  else if (received_message.text && reqQuestion.size == true){
    customerAns.size = received_message.text;
    response = {"text": "Gold price is 150000 gold at 16K. How much gold your weight?"  }
    reqQuestion.size = false;
    reqQuestion.weight =true;
    console.log(222222)
    console.log(received_message.text)
  }
  else if (received_message.text && reqQuestion.weight == true){
    customerAns.weight = received_message.text;
    var weight = parseInt (customerAns.weight);
    var size = parseInt (customerAns.size);
    var price = 150000 * size * weight;
    console.log(333333)
    console.log(customerAns)
    response ={ "text": 'You will receice your order within a week and price will cost .' + price,
      "quick_replies":[
      {
        "content_type": "text",
        "title":"Order",
        "payload":"<POSTBACK_PAYLOAD>"
      },
      {
        "content_type": "text",
        "title":"Cancel",
        "payload":"<POSTBACK_PAYLOAD>"
      }
      ]
    }
    reqQuestion.weight = false;
  }
  else if (received_message.text == "Order") {
      response = {
        "text":'Thanks you! Will you come to shop!',
       "quick_replies":[
        {
          "content_type":"text",
          "title":"Yes",
          "payload":"<POSTBACK_PAYLOAD>"
        },{
          "content_type":"text",
          "title":"Delivery",
          "payload":"<POSTBACK_PAYLOAD>",
        }
      ]    
      }
      console.log(444444)
      console.log(received_message.text)
  }
   else if (received_message.text == "Cancel") {
      response = {
        "text":'Thanks!' 
      }
  }
   else if (received_message.text == "Yes") {
    let gold ={
      size:customerAns.size,
      weight:customerAns.weight,
      address:reqQuestion.address
    }
    db.collection('thin').doc().set(gold);
    customerAns.address = reqQuestion.address;
    response = {
      "text":'Ok See You!No.(234), Middle Pann Soe Dann Street, Kyuak Tan Dar Township, Yangon' 
    }
  }
  else if (received_message.text && reqQuestion.address == true){
    let gold ={
      size:customerAns.size,
      weight:customerAns.weight,
      address:received_message.text
    }
    console.log(77777, gold, customerAns)
    db.collection('thin').doc().set(gold);
    customerAns.address = received_message.text;
    response = {"text": "Thanks!"  }
    reqQuestion.address = false;
  } else if (received_message.text === 'Delivery') {
    response = {"text":'Please sent your address!',}
    reqQuestion.address = true;
  }
   
  // Send the response message
  callSendAPI(sender_psid, response);    
}

function handlePostback(sender_psid, received_postback) {
  console.log('handlePostback')
   let response;
  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  if (payload === 'yes') {
    response = { "text": "Give your size!"}
    reqQuestion.size = true;
  } else if (payload === 'no') {
    response = { "text": "Oops, try sending another image." }
  }else if (payload === 'getstarted') {
    response = { "attachment": {
                  "type": "template",
                  "payload": {
                    "template_type": "generic",
                    "elements": [{
                      "title": "Welcome!",
                      "subtitle": "Which type of jewellery design?",
                      "buttons": [
                        {
                          "type": "postback",
                          "title": "In shop!",
                          "payload": "is",
                        },
                        {
                          "type": "postback",
                          "title": "Uploade design.",
                          "payload": "ud",
                        }
                      ],
                    }]
                  }
                }
              }
  }else if (payload === 'ud') {
    response = { "text": "Send the jewellery design please." }
  }else if (payload === 'is') {
    response = { "attachment": {
                  "type": "template",
                  "payload": {
                    "template_type": "generic",
                    "elements": [{
                      "title": "In shop",
                      "subtitle": "jewellery",
                      "buttons": [
                        {
                          "type": "postback",
                          "title": "Ring",
                          "payload": "r",
                        },
                        {
                          "type": "postback",
                          "title": "Earring",
                          "payload": "e",
                        },
                        {
                          "type": "postback",
                          "title": "Necklace",
                          "payload": "n",
                        }
                      ],
                    }]
                  }
                }
              }
  }else if (payload === 'r') {
    response = {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
           {
            "title":"Welcome!",
            "image_url":"https://scontent.fnyt2-1.fna.fbcdn.net/v/t1.0-0/p526x296/84578406_119254639636089_7445805886175444992_o.jpg?_nc_cat=106&ccb=2&_nc_sid=8bfeb9&_nc_ohc=A850mrTWb28AX8BeLHZ&_nc_ht=scontent.fnyt2-1.fna&tp=6&oh=9cc3b8808f804985ecccbb8d993b2fdb&oe=5FC6D099",
            "default_action": {
              "type": "web_url",
              "url": "https://scontent.fnyt2-1.fna.fbcdn.net/v/t1.0-0/p526x296/84578406_119254639636089_7445805886175444992_o.jpg?_nc_cat=106&ccb=2&_nc_sid=8bfeb9&_nc_ohc=A850mrTWb28AX8BeLHZ&_nc_ht=scontent.fnyt2-1.fna&tp=6&oh=9cc3b8808f804985ecccbb8d993b2fdb&oe=5FC6D099",
              "webview_height_ratio": "tall",
            },
            "buttons":[
              {
                "type":"postback",
                "title":"Order",
                "payload":"o"
              }              
            ]      
          },
          {
            "title":"Welcome!",
            "image_url":"https://scontent.fnyt2-1.fna.fbcdn.net/v/t1.0-0/p180x540/86501883_119254482969438_4281528399165390848_o.jpg?_nc_cat=102&ccb=2&_nc_sid=8bfeb9&_nc_ohc=58dFsylBzEQAX_T-G25&_nc_ht=scontent.fnyt2-1.fna&tp=6&oh=609de981975769f9e4c9b8becdc6f9fa&oe=5FC817B7",
            "subtitle":"We have the right hat for everyone.",
            "default_action": {
              "type": "web_url",
              "url": "https://scontent.fnyt2-1.fna.fbcdn.net/v/t1.0-0/p180x540/86501883_119254482969438_4281528399165390848_o.jpg?_nc_cat=102&ccb=2&_nc_sid=8bfeb9&_nc_ohc=58dFsylBzEQAX_T-G25&_nc_ht=scontent.fnyt2-1.fna&tp=6&oh=609de981975769f9e4c9b8becdc6f9fa&oe=5FC817B7",
              "webview_height_ratio": "tall",
            },
            "buttons":[
              {
                "type":"postback",
                "title":"Order",
                "payload":"o"
              }              
            ]      
          },
          {
            "title":"Welcome!",
            "image_url":"https://scontent.fnyt2-1.fna.fbcdn.net/v/t1.0-0/p180x540/84472628_119254266302793_8607552109761527808_o.jpg?_nc_cat=107&ccb=2&_nc_sid=8bfeb9&_nc_ohc=cn09yMLyGU8AX8F955B&_nc_ht=scontent.fnyt2-1.fna&tp=6&oh=f6d4296c22755deffc4a7194fa0c8257&oe=5FC636B1",
            "subtitle":"We have the right hat for everyone.",
            "default_action": {
              "type": "web_url",
              "url": "https://scontent.fnyt2-1.fna.fbcdn.net/v/t1.0-0/p180x540/84472628_119254266302793_8607552109761527808_o.jpg?_nc_cat=107&ccb=2&_nc_sid=8bfeb9&_nc_ohc=cn09yMLyGU8AX8F955B&_nc_ht=scontent.fnyt2-1.fna&tp=6&oh=f6d4296c22755deffc4a7194fa0c8257&oe=5FC636B1",
              "webview_height_ratio": "tall",
            },
            "buttons":[
              {
                "type":"postback",
                "title":"Order",
                "payload":"o"
              }              
            ]      
          }

        ]
      }
    }
  }
  }else if (payload === 'e') {
    response = {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
           {
            "title":"Welcome!",
            "image_url":"https://scontent.fnyt2-1.fna.fbcdn.net/v/t1.0-9/84314241_119261492968737_1425301089204305920_n.jpg?_nc_cat=109&ccb=2&_nc_sid=730e14&_nc_ohc=hTd2XhH2ZZAAX-MvYQz&_nc_ht=scontent.fnyt2-1.fna&oh=8effe6a227c4437294da43a29388875f&oe=5FC8FA98",
            "default_action": {
              "type": "web_url",
              "url": "https://scontent.fnyt2-1.fna.fbcdn.net/v/t1.0-9/84314241_119261492968737_1425301089204305920_n.jpg?_nc_cat=109&ccb=2&_nc_sid=730e14&_nc_ohc=hTd2XhH2ZZAAX-MvYQz&_nc_ht=scontent.fnyt2-1.fna&oh=8effe6a227c4437294da43a29388875f&oe=5FC8FA98",
              "webview_height_ratio": "tall",
            },
            "buttons":[
              {
                "type":"postback",
                "title":"Order",
                "payload":"o"
              }              
            ]      
          },
          {
            "title":"Welcome!",
            "image_url":"https://scontent.fnyt2-1.fna.fbcdn.net/v/t1.0-0/s600x600/86193254_119261549635398_2350947368481849344_n.jpg?_nc_cat=103&ccb=2&_nc_sid=730e14&_nc_ohc=8srqGdtNmwAAX8saD1y&_nc_ht=scontent.fnyt2-1.fna&tp=7&oh=3f2fdc5408b2c976fc1b65686e8fd0f7&oe=5FC9357F",
            "subtitle":"We have the right hat for everyone.",
            "default_action": {
              "type": "web_url",
              "url": "https://scontent.fnyt2-1.fna.fbcdn.net/v/t1.0-0/s600x600/86193254_119261549635398_2350947368481849344_n.jpg?_nc_cat=103&ccb=2&_nc_sid=730e14&_nc_ohc=8srqGdtNmwAAX8saD1y&_nc_ht=scontent.fnyt2-1.fna&tp=7&oh=3f2fdc5408b2c976fc1b65686e8fd0f7&oe=5FC9357F",
              "webview_height_ratio": "tall",
            },
            "buttons":[
              {
                "type":"postback",
                "title":"Order",
                "payload":"o"
              }              
            ]      
          },
          {
            "title":"Welcome!",
            "image_url":"https://scontent.fnyt2-1.fna.fbcdn.net/v/t1.0-9/84677204_119261509635402_1200701430931914752_n.jpg?_nc_cat=101&ccb=2&_nc_sid=730e14&_nc_ohc=YgWDC3bPeuQAX8pAaKT&_nc_ht=scontent.fnyt2-1.fna&oh=506bd3b729d43b9899fd0b7c93630ff1&oe=5FC8A036",
            "subtitle":"We have the right hat for everyone.",
            "default_action": {
              "type": "web_url",
              "url": "https://scontent.fnyt2-1.fna.fbcdn.net/v/t1.0-9/84677204_119261509635402_1200701430931914752_n.jpg?_nc_cat=101&ccb=2&_nc_sid=730e14&_nc_ohc=YgWDC3bPeuQAX8pAaKT&_nc_ht=scontent.fnyt2-1.fna&oh=506bd3b729d43b9899fd0b7c93630ff1&oe=5FC8A036",
              "webview_height_ratio": "tall",
            },
            "buttons":[
              {
                "type":"postback",
                "title":"Order",
                "payload":"o"
              }              
            ]      
          }
        ]
      }
    }
  }
  }else if (payload === 'n') {
    response = {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
           {
            "title":"Welcome!",
            "image_url":"https://scontent.fnyt2-1.fna.fbcdn.net/v/t1.0-0/p480x480/86266502_119260442968842_6722572409011961856_n.jpg?_nc_cat=111&ccb=2&_nc_sid=730e14&_nc_ohc=kLPmJeJ6dmwAX-Q88GH&_nc_ht=scontent.fnyt2-1.fna&tp=6&oh=f8bec9d731e69f99aa648e2708f6bb0d&oe=5FC7BE03",
            "default_action": {
              "type": "web_url",
              "url": "https://scontent.fnyt2-1.fna.fbcdn.net/v/t1.0-0/p480x480/86266502_119260442968842_6722572409011961856_n.jpg?_nc_cat=111&ccb=2&_nc_sid=730e14&_nc_ohc=kLPmJeJ6dmwAX-Q88GH&_nc_ht=scontent.fnyt2-1.fna&tp=6&oh=f8bec9d731e69f99aa648e2708f6bb0d&oe=5FC7BE03",
              "webview_height_ratio": "tall",
            },
            "buttons":[
              {
                "type":"postback",
                "title":"Order",
                "payload":"o"
              }              
            ]      
          },
          {
            "title":"Welcome!",
            "image_url":"https://scontent.fnyt2-1.fna.fbcdn.net/v/t1.0-0/p600x600/86312829_119260479635505_8077944605934354432_n.jpg?_nc_cat=100&ccb=2&_nc_sid=730e14&_nc_ohc=_4pBSQBjTMwAX8Z7zze&_nc_ht=scontent.fnyt2-1.fna&tp=6&oh=416e0d27ad7afa132e5a093ed554cf48&oe=5FC9F087",
            "subtitle":"We have the right hat for everyone.",
            "default_action": {
              "type": "web_url",
              "url": "https://scontent.fnyt2-1.fna.fbcdn.net/v/t1.0-0/p600x600/86312829_119260479635505_8077944605934354432_n.jpg?_nc_cat=100&ccb=2&_nc_sid=730e14&_nc_ohc=_4pBSQBjTMwAX8Z7zze&_nc_ht=scontent.fnyt2-1.fna&tp=6&oh=416e0d27ad7afa132e5a093ed554cf48&oe=5FC9F087",
              "webview_height_ratio": "tall",
            },
            "buttons":[
              {
                "type":"postback",
                "title":"Order",
                "payload":"o"
              }              
            ]      
          },
          {
            "title":"Welcome!",
            "image_url":"https://scontent.fnyt2-1.fna.fbcdn.net/v/t1.0-0/p600x600/86206324_119260522968834_2111653175390896128_n.jpg?_nc_cat=102&ccb=2&_nc_sid=730e14&_nc_ohc=hVLSIjrOvC0AX9sWhy_&_nc_ht=scontent.fnyt2-1.fna&tp=6&oh=af56f05579e835817a1c1cbd2d9fc6b0&oe=5FC64EA1",
            "subtitle":"We have the right hat for everyone.",
            "default_action": {
              "type": "web_url",
              "url": "https://scontent.fnyt2-1.fna.fbcdn.net/v/t1.0-0/p600x600/86206324_119260522968834_2111653175390896128_n.jpg?_nc_cat=102&ccb=2&_nc_sid=730e14&_nc_ohc=hVLSIjrOvC0AX9sWhy_&_nc_ht=scontent.fnyt2-1.fna&tp=6&oh=af56f05579e835817a1c1cbd2d9fc6b0&oe=5FC64EA1",
              "webview_height_ratio": "tall",
            },
            "buttons":[
              {
                "type":"postback",
                "title":"Order",
                "payload":"o"
              }              
            ]      
          }
        ]
      }
    }
  }
  } else if (payload === 'o') {
    response = { "text": "Give your size!(e.g - Show cm as you want.)", }
    reqQuestion.size = true;
  }
      callSendAPI(sender_psid, response);
}


  
function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }
  console.log(888888, response, sender_psid)

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  }); 
}

function setupGetStartedButton(res){
        var messageData = {
                "get_started":{"payload":"getstarted"}                
        };
        // Start the request
        request({
            url: 'https://graph.facebook.com/v2.6/me/messenger_profile?access_token='+ PAGE_ACCESS_TOKEN,
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            form: messageData
        },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Print out the response body
                res.send(body);

            } else { 
                // TODO: Handle errors
                res.send(body);
            }
        });
    } 



function setupPersistentMenu(res){
        var messageData = { 
            "persistent_menu":[
                {
                  "locale":"default",
                  "composer_input_disabled":false,
                  "call_to_actions":[
                      {
                        "title":"Info",
                        "type":"nested",
                        "call_to_actions":[
                            {
                              "title":"Help",
                              "type":"postback",
                              "payload":"HELP_PAYLOAD"
                            },
                            {
                              "title":"Contact Me",
                              "type":"postback",
                              "payload":"CONTACT_INFO_PAYLOAD"
                            }
                        ]
                      },
                      {
                        "type":"web_url",
                        "title":"Visit website ",
                        "url":"http://www.google.com",
                        "webview_height_ratio":"full"
                    }
                ]
            },
            {
              "locale":"zh_CN",
              "composer_input_disabled":false
            }
          ]          
        };
        // Start the request
        request({
            url: 'https://graph.facebook.com/v2.6/me/messenger_profile?access_token='+ PAGE_ACCESS_TOKEN,
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            form: messageData
        },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Print out the response body
                res.send(body);

            } else { 
                // TODO: Handle errors
                res.send(body);
            }
        });
    } 



function removePersistentMenu(res){
        var messageData = {
                "fields": [
                   "persistent_menu" ,
                   "get_started"                 
                ]               
        };
        // Start the request
        request({
            url: 'https://graph.facebook.com/v2.6/me/messenger_profile?access_token='+ PAGE_ACCESS_TOKEN,
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            form: messageData
        },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Print out the response body
                res.send(body);

            } else { 
                // TODO: Handle errors
                res.send(body);
            }
        });
    }