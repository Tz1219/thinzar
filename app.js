
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
    reqQuestion.size !== false;
    reqQuestion.weight =true;
  }
  else if (received_message.text && reqQuestion.weight == true){
    customerAns.weight = received_message.text;
    var weight = parseInt (customerAns.weight);
    var size = parseInt (customerAns.size);
    var price = 150000 * size * weight;

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
    reqQuestion.weight !== false;
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
  }
   else if (received_message.text == "Cancel") {
      response = {
        "text":'Thanks!' 
      }
  }
   else if (received_message.text == "Yes") {
      response = {
        "text":'Ok See You!No.(234), Middle Pann Soe Dann Street, Kyuak Tan Dar Township, Yangon' 
      }
  }
  else if (received_message.text && reqQuestion.address == true){
    let gold ={
      size:customerAns.size,
      weight:customerAns.weight,
      address:customerAns.address
    }
    db.collection('thin').doc().set(gold);
    customerAns.address = received_message.text;
    response = {"text": "Thanks!"  }
    reqQuestion.address !== false;
  } else if (received_message.text === 'Delivery') {
    response = {"text":'Please sent your address!',}
    reqQuestion.address = true;
  }
   
  // Send the response message
  callSendAPI(sender_psid, response);    
}

function handlePostback(sender_psid, received_postback) {
  console.log('ok')
   let response;
  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  if (payload === 'yes') {
    response = { "text": "Give your size!"}
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
            "image_url":"https://scontent.fnyt2-1.fna.fbcdn.net/v/t1.0-9/84479436_119257396302480_1632968328538488832_n.png?_nc_cat=104&ccb=2&_nc_sid=730e14&_nc_ohc=Q9P2NtABlGsAX-f3hL7&_nc_ht=scontent.fnyt2-1.fna&oh=678e3bd74bfc29c60a85433f659d102a&oe=5FC0863C",
            "default_action": {
              "type": "web_url",
              "url": "https://scontent.fnyt2-1.fna.fbcdn.net/v/t1.0-9/84479436_119257396302480_1632968328538488832_n.png?_nc_cat=104&ccb=2&_nc_sid=730e14&_nc_ohc=Q9P2NtABlGsAX-f3hL7&_nc_ht=scontent.fnyt2-1.fna&oh=678e3bd74bfc29c60a85433f659d102a&oe=5FC0863C",
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
            "image_url":"https://scontent.fnyt2-1.fna.fbcdn.net/v/t1.0-9/86350381_119257269635826_4213327011449405440_n.png?_nc_cat=111&ccb=2&_nc_sid=730e14&_nc_ohc=GmGgb9n82coAX9Ofagl&_nc_ht=scontent.fnyt2-1.fna&oh=7303998d76f89bb3dd1a8c2b3563902f&oe=5FBF5E78",
            "subtitle":"We have the right hat for everyone.",
            "default_action": {
              "type": "web_url",
              "url": "https://scontent.fnyt2-1.fna.fbcdn.net/v/t1.0-9/86350381_119257269635826_4213327011449405440_n.png?_nc_cat=111&ccb=2&_nc_sid=730e14&_nc_ohc=GmGgb9n82coAX9Ofagl&_nc_ht=scontent.fnyt2-1.fna&oh=7303998d76f89bb3dd1a8c2b3563902f&oe=5FBF5E78",
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
            "image_url":"https://scontent.fnyt2-1.fna.fbcdn.net/v/t1.0-0/p75x225/84670719_119245616303658_6630233987992256512_o.jpg?_nc_cat=104&ccb=2&_nc_sid=8bfeb9&_nc_ohc=rrOfeBo3xHYAX8_vo9f&_nc_ht=scontent.fnyt2-1.fna&tp=6&oh=bb335c8bdb6fbd33c87807b731f71277&oe=5FBE6CB3",
            "subtitle":"We have the right hat for everyone.",
            "default_action": {
              "type": "web_url",
              "url": "https://scontent.fnyt2-1.fna.fbcdn.net/v/t1.0-0/p75x225/84670719_119245616303658_6630233987992256512_o.jpg?_nc_cat=104&ccb=2&_nc_sid=8bfeb9&_nc_ohc=rrOfeBo3xHYAX8_vo9f&_nc_ht=scontent.fnyt2-1.fna&tp=6&oh=bb335c8bdb6fbd33c87807b731f71277&oe=5FBE6CB3",
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
            "image_url":"https://scontent.fnyt2-1.fna.fbcdn.net/v/t1.0-0/p350x350/84314241_119261492968737_1425301089204305920_n.jpg?_nc_cat=109&ccb=2&_nc_sid=730e14&_nc_ohc=crYz-xxsRMQAX__YmbN&_nc_ht=scontent.fnyt2-1.fna&tp=6&oh=1468f8ed6a3f93cfe8eec5535ca5d1dc&oe=5FBE9BCD",
            "default_action": {
              "type": "web_url",
              "url": "https://scontent.fnyt2-1.fna.fbcdn.net/v/t1.0-0/p350x350/84314241_119261492968737_1425301089204305920_n.jpg?_nc_cat=109&ccb=2&_nc_sid=730e14&_nc_ohc=crYz-xxsRMQAX__YmbN&_nc_ht=scontent.fnyt2-1.fna&tp=6&oh=1468f8ed6a3f93cfe8eec5535ca5d1dc&oe=5FBE9BCD",
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
            "image_url":"https://scontent.fnyt2-1.fna.fbcdn.net/v/t1.0-0/s600x600/84677204_119261509635402_1200701430931914752_n.jpg?_nc_cat=101&ccb=2&_nc_sid=730e14&_nc_ohc=FUPOyEnvkTsAX-6DkfP&_nc_ht=scontent.fnyt2-1.fna&tp=7&oh=97939cb9b524aadeb015daf6c83fb432&oe=5FC03E7E",
            "subtitle":"We have the right hat for everyone.",
            "default_action": {
              "type": "web_url",
              "url": "https://scontent.fnyt2-1.fna.fbcdn.net/v/t1.0-0/s600x600/84677204_119261509635402_1200701430931914752_n.jpg?_nc_cat=101&ccb=2&_nc_sid=730e14&_nc_ohc=FUPOyEnvkTsAX-6DkfP&_nc_ht=scontent.fnyt2-1.fna&tp=7&oh=97939cb9b524aadeb015daf6c83fb432&oe=5FC03E7E",
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
            "image_url":"https://scontent.fnyt2-1.fna.fbcdn.net/v/t1.0-0/s600x600/84207792_119261499635403_3712958511102033920_n.jpg?_nc_cat=106&ccb=2&_nc_sid=730e14&_nc_ohc=vlBcx3JaxZ0AX8Z1dkL&_nc_ht=scontent.fnyt2-1.fna&tp=7&oh=98bd1161f475ea3995a3742fb0cca509&oe=5FBD05C4",
            "subtitle":"We have the right hat for everyone.",
            "default_action": {
              "type": "web_url",
              "url": "https://scontent.fnyt2-1.fna.fbcdn.net/v/t1.0-0/s600x600/84207792_119261499635403_3712958511102033920_n.jpg?_nc_cat=106&ccb=2&_nc_sid=730e14&_nc_ohc=vlBcx3JaxZ0AX8Z1dkL&_nc_ht=scontent.fnyt2-1.fna&tp=7&oh=98bd1161f475ea3995a3742fb0cca509&oe=5FBD05C4",
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
            "image_url":"https://scontent.fnyt2-1.fna.fbcdn.net/v/t1.0-9/84625150_119260309635522_1009135426989981696_n.jpg?_nc_cat=107&ccb=2&_nc_sid=730e14&_nc_ohc=3jwhE_b_8S0AX97-cJ9&_nc_ht=scontent.fnyt2-1.fna&oh=4d6295f4623da9bb5457ced1a77f6a48&oe=5FBDACD2",
            "default_action": {
              "type": "web_url",
              "url": "https://scontent.fnyt2-1.fna.fbcdn.net/v/t1.0-9/84625150_119260309635522_1009135426989981696_n.jpg?_nc_cat=107&ccb=2&_nc_sid=730e14&_nc_ohc=3jwhE_b_8S0AX97-cJ9&_nc_ht=scontent.fnyt2-1.fna&oh=4d6295f4623da9bb5457ced1a77f6a48&oe=5FBDACD2",
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
            "image_url":"https://scontent.fnyt2-1.fna.fbcdn.net/v/t1.0-0/p480x480/86266502_119260442968842_6722572409011961856_n.jpg?_nc_cat=111&ccb=2&_nc_sid=730e14&_nc_ohc=4jtCaRF-mgIAX8Xyut_&_nc_ht=scontent.fnyt2-1.fna&tp=6&oh=24b135e792dbcb3b954bc7739bf24f63&oe=5FBFD503",
            "subtitle":"We have the right hat for everyone.",
            "default_action": {
              "type": "web_url",
              "url": "https://scontent.fnyt2-1.fna.fbcdn.net/v/t1.0-0/p480x480/86266502_119260442968842_6722572409011961856_n.jpg?_nc_cat=111&ccb=2&_nc_sid=730e14&_nc_ohc=4jtCaRF-mgIAX8Xyut_&_nc_ht=scontent.fnyt2-1.fna&tp=6&oh=24b135e792dbcb3b954bc7739bf24f63&oe=5FBFD503",
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
            "image_url":"https://scontent.fnyt2-1.fna.fbcdn.net/v/t1.0-0/p600x600/86206324_119260522968834_2111653175390896128_n.jpg?_nc_cat=102&ccb=2&_nc_sid=730e14&_nc_ohc=uyEJ9kDkFJoAX_Ni6IG&_nc_ht=scontent.fnyt2-1.fna&tp=6&oh=b34523902d6b469d6aafda09a2345cc3&oe=5FBE65A1",
            "subtitle":"We have the right hat for everyone.",
            "default_action": {
              "type": "web_url",
              "url": "https://scontent.fnyt2-1.fna.fbcdn.net/v/t1.0-0/p600x600/86206324_119260522968834_2111653175390896128_n.jpg?_nc_cat=102&ccb=2&_nc_sid=730e14&_nc_ohc=uyEJ9kDkFJoAX_Ni6IG&_nc_ht=scontent.fnyt2-1.fna&tp=6&oh=b34523902d6b469d6aafda09a2345cc3&oe=5FBE65A1",
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
      callSendAPI(sender_psid, response);}


  
function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

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