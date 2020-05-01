
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
  app = express().use(body_parser.json()); // creates express http server

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
      }
      if (webhook_event.postback) {
        
        handlePostback(sender_psid, webhook_event.postback.payload);
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

function handleMessage(sender_psid, text) {
  let response;

  if (text.attachments) {
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
  }else if(text.text){
    text = text.text
  }
  
  // Checks if the message contains text
  if (text == "Hi") {    
    // Create the payload for a basic text message, which
    // will be added to the body of our request to the Send API
      let response = {
        "text":"Welcome to Htun Star jewellery shop!\n\n If you have any questions or concerns, please send them a photo and you will be asked to answer in the near future. Thank you!",
      };
       
  }
   
   if (text == "1") {
      response = {
        "text":'How much gold you measure?' 
      }
  } 
  if (text == "2") {
      response = {
        "text":'Your order will get 15.2.2020 and the price will cost 300000ks.',
      "quick_replies":[
        {
          "content_type":"text",
          "title":"Order",
          "payload":"Order"
        },{
          "content_type":"text",
          "title":"Cancel",
          "payload":"Cancel"
        }
      ]   
      }
  }  
   if (text == "Order") {
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
          "payload":"<POSTBACK_PAYLOAD>"
        }
      ]    
      }
  }
   if (text == "Cancel") {
      response = {
        "text":'Thanks!' 
      }
  }
   if (text == "Yes") {
      response = {
        "text":'Ok See You!No.(234), Middle Pann Soe Dann Street, Kyuak Tan Dar Township, Yangon' 
      }
  }
   if (text == "Delivery") {
      response = {
        "text":'Please sent your address!' 
      }
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
    response = { "text": "Give your size!" }
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
            "image_url":"https://scontent.fnyt1-1.fna.fbcdn.net/v/t1.0-9/86350381_119257269635826_4213327011449405440_n.png?_nc_cat=111&_nc_eui2=AeGTmYBLeum-__glDbrklUsWtFU5txg2mwFZKMA1eE32EJp04xTN0L0q9HI9TEtMfcZ957o4RqNW1SOL57ugB5XUn6TvJSxRjw7ANBgB9pkkmw&_nc_ohc=quptesf-QVsAX-ub9ZR&_nc_ht=scontent.fnyt1-1.fna&oh=485f5820937a7a8fa22795bf04a4a778&oe=5ED28508",
            "default_action": {
              "type": "web_url",
              "url": "https://scontent.fnyt1-1.fna.fbcdn.net/v/t1.0-9/86350381_119257269635826_4213327011449405440_n.png?_nc_cat=111&_nc_eui2=AeGTmYBLeum-__glDbrklUsWtFU5txg2mwFZKMA1eE32EJp04xTN0L0q9HI9TEtMfcZ957o4RqNW1SOL57ugB5XUn6TvJSxRjw7ANBgB9pkkmw&_nc_ohc=quptesf-QVsAX-ub9ZR&_nc_ht=scontent.fnyt1-1.fna&oh=485f5820937a7a8fa22795bf04a4a778&oe=5ED28508",
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
            "image_url":"https://scontent.fnyt1-1.fna.fbcdn.net/v/t1.0-9/p720x720/84472628_119254266302793_8607552109761527808_o.jpg?_nc_cat=107&_nc_eui2=AeGNNyQ1eBqZI3TZJfPMZngvOrGngJG_mWtZ46YTlbmYWR6fusN3tZmdZ7-RD5D-z0-vRW9sNZLIyw0qHN3qS081CJMaYtNOhg3mvdcGgJgirg&_nc_ohc=YGp69Sv1SmoAX9DwVA4&_nc_ht=scontent.fnyt1-1.fna&_nc_tp=6&oh=e3baca77785967716375fb11da4cd86e&oe=5F011C62",
            "subtitle":"We have the right hat for everyone.",
            "default_action": {
              "type": "web_url",
              "url": "https://scontent.fnyt1-1.fna.fbcdn.net/v/t1.0-9/p720x720/84472628_119254266302793_8607552109761527808_o.jpg?_nc_cat=107&_nc_eui2=AeGNNyQ1eBqZI3TZJfPMZngvOrGngJG_mWtZ46YTlbmYWR6fusN3tZmdZ7-RD5D-z0-vRW9sNZLIyw0qHN3qS081CJMaYtNOhg3mvdcGgJgirg&_nc_ohc=YGp69Sv1SmoAX9DwVA4&_nc_ht=scontent.fnyt1-1.fna&_nc_tp=6&oh=e3baca77785967716375fb11da4cd86e&oe=5F011C62",
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
            "image_url":"https://scontent.fnyt1-1.fna.fbcdn.net/v/t1.0-9/p720x720/86501883_119254482969438_4281528399165390848_o.jpg?_nc_cat=102&_nc_ohc=bl3MTrs5lgcAX902NJF&_nc_ht=scontent.fnyt1-1.fna&_nc_tp=6&oh=a8586f01996d33688958be88e68f10bc&oe=5EC9F2E4",
            "subtitle":"We have the right hat for everyone.",
            "default_action": {
              "type": "web_url",
              "url": "https://scontent.fnyt1-1.fna.fbcdn.net/v/t1.0-9/p720x720/86501883_119254482969438_4281528399165390848_o.jpg?_nc_cat=102&_nc_ohc=bl3MTrs5lgcAX902NJF&_nc_ht=scontent.fnyt1-1.fna&_nc_tp=6&oh=a8586f01996d33688958be88e68f10bc&oe=5EC9F2E4",
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
            "image_url":"https://scontent.fnyt1-1.fna.fbcdn.net/v/t1.0-9/84314241_119261492968737_1425301089204305920_n.jpg?_nc_cat=109&_nc_ohc=cA03G2pwyKwAX80we1d&_nc_ht=scontent.fnyt1-1.fna&oh=af66f83444a1fb6763f95534d1464767&oe=5F0047E8",
            "default_action": {
              "type": "web_url",
              "url": "https://scontent.fnyt1-1.fna.fbcdn.net/v/t1.0-9/84314241_119261492968737_1425301089204305920_n.jpg?_nc_cat=109&_nc_ohc=cA03G2pwyKwAX80we1d&_nc_ht=scontent.fnyt1-1.fna&oh=af66f83444a1fb6763f95534d1464767&oe=5F0047E8",
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
            "image_url":"https://scontent.fnyt1-1.fna.fbcdn.net/v/t1.0-9/84207792_119261499635403_3712958511102033920_n.jpg?_nc_cat=106&_nc_ohc=e2OLbkOiU6AAX8Ugela&_nc_ht=scontent.fnyt1-1.fna&oh=b6a930268d82a18a0c8a6704d6c4f6db&oe=5ED282F4",
            "subtitle":"We have the right hat for everyone.",
            "default_action": {
              "type": "web_url",
              "url": "https://scontent.fnyt1-1.fna.fbcdn.net/v/t1.0-9/84207792_119261499635403_3712958511102033920_n.jpg?_nc_cat=106&_nc_ohc=e2OLbkOiU6AAX8Ugela&_nc_ht=scontent.fnyt1-1.fna&oh=b6a930268d82a18a0c8a6704d6c4f6db&oe=5ED282F4",
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
            "image_url":"https://scontent.fnyt1-1.fna.fbcdn.net/v/t1.0-9/86193254_119261549635398_2350947368481849344_n.jpg?_nc_cat=103&_nc_ohc=EZecxGJQhf8AX-qVqvU&_nc_ht=scontent.fnyt1-1.fna&oh=4d8b9dc926776a36ca44dc1ab440b8bb&oe=5ED1D4C9",
            "subtitle":"We have the right hat for everyone.",
            "default_action": {
              "type": "web_url",
              "url": "https://scontent.fnyt1-1.fna.fbcdn.net/v/t1.0-9/86193254_119261549635398_2350947368481849344_n.jpg?_nc_cat=103&_nc_ohc=EZecxGJQhf8AX-qVqvU&_nc_ht=scontent.fnyt1-1.fna&oh=4d8b9dc926776a36ca44dc1ab440b8bb&oe=5ED1D4C9",
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
            "image_url":"https://scontent.fnyt1-1.fna.fbcdn.net/v/t1.0-9/86312829_119260479635505_8077944605934354432_n.jpg?_nc_cat=100&_nc_eui2=AeE90XuSve9_8kYs4KMSyWeI_mcTe-esX9M-r8fmHebXczhM0ac_XDu-hrB2A7R01pNDX_T0pMjJ_v8Xbnqf5YLhi0AY7MIJxdSne5pgOoozPA&_nc_ohc=z-PlSC2rx0gAX8RxWHp&_nc_ht=scontent.fnyt1-1.fna&oh=ed9791e209c785ead5cd3658848b7b3d&oe=5EC0AEA2",
            "default_action": {
              "type": "web_url",
              "url": "https://scontent.fnyt1-1.fna.fbcdn.net/v/t1.0-9/86206324_119260522968834_2111653175390896128_n.jpg?_nc_cat=102&_nc_eui2=AeHrYiAcQiDV126gUfNdKhKuw9OnqHlYVCfJIFlKgKDYBS9mPQ8Hv3Ggs9nAJi3NfYAK2l3tNwhpz6Vcusw2cH2MbJCFqoWkzF-pxVWAJv7_kA&_nc_ohc=SrwG1RSl6lEAX8tle5f&_nc_ht=scontent.fnyt1-1.fna&oh=36b20f92255e2693767ffd81f080b33c&oe=5EB8DB84",
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
            "image_url":"https://scontent.fnyt1-1.fna.fbcdn.net/v/t1.0-9/86206324_119260522968834_2111653175390896128_n.jpg?_nc_cat=102&_nc_eui2=AeHrYiAcQiDV126gUfNdKhKuw9OnqHlYVCfJIFlKgKDYBS9mPQ8Hv3Ggs9nAJi3NfYAK2l3tNwhpz6Vcusw2cH2MbJCFqoWkzF-pxVWAJv7_kA&_nc_ohc=SrwG1RSl6lEAX8tle5f&_nc_ht=scontent.fnyt1-1.fna&oh=36b20f92255e2693767ffd81f080b33c&oe=5EB8DB84",
            "subtitle":"We have the right hat for everyone.",
            "default_action": {
              "type": "web_url",
              "url": "https://scontent.fnyt1-1.fna.fbcdn.net/v/t1.0-9/86206324_119260522968834_2111653175390896128_n.jpg?_nc_cat=102&_nc_eui2=AeHrYiAcQiDV126gUfNdKhKuw9OnqHlYVCfJIFlKgKDYBS9mPQ8Hv3Ggs9nAJi3NfYAK2l3tNwhpz6Vcusw2cH2MbJCFqoWkzF-pxVWAJv7_kA&_nc_ohc=SrwG1RSl6lEAX8tle5f&_nc_ht=scontent.fnyt1-1.fna&oh=36b20f92255e2693767ffd81f080b33c&oe=5EB8DB84",
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
            "image_url":"https://scontent.fnyt1-1.fna.fbcdn.net/v/t1.0-9/84625150_119260309635522_1009135426989981696_n.jpg?_nc_cat=107&_nc_ohc=Q44nbZZZMC0AX8TkKdQ&_nc_ht=scontent.fnyt1-1.fna&oh=4495a8a343249afa9c590c5fc48285f3&oe=5ECC4DAE",
            "subtitle":"We have the right hat for everyone.",
            "default_action": {
              "type": "web_url",
              "url": "https://scontent.fnyt1-1.fna.fbcdn.net/v/t1.0-9/84625150_119260309635522_1009135426989981696_n.jpg?_nc_cat=107&_nc_ohc=Q44nbZZZMC0AX8TkKdQ&_nc_ht=scontent.fnyt1-1.fna&oh=4495a8a343249afa9c590c5fc48285f3&oe=5ECC4DAE",
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
    response = { "text": "Give your size!" }
  }
  // Send the message to acknowledge the postback
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

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v6.0/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log(body);
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
