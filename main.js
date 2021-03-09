const express = require("express");
const next = require("next");
const Keyv = require('keyv');
//const port = 8080;
const port = process.env.PORT || 8081;
const { Client } = require("pg");
const keyv = new Keyv("sqlite://auth.db");
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const db = require("./models");
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const lti = require("ims-lti");
const cors = require('cors');

const jsonParser = bodyParser.json();
const consumer_key = "my_consumer_key"
const consumer_secret = "this_is_a_bad_secret123"
const AUTH_HOURS = 16;

// // LTI server stuff
// const lti = require("ltijs").Provider;
// const Database = require("ltijs-sequelize");


app
  .prepare()
  .then(() => {
    // EXPRESS SERVER
    const server = express();
    server.use(bodyParser.urlencoded({ extended: false }))
    server.use(bodyParser.json());
    server.use(cookieParser());
    server.use(cors());
    
    //connecting to database, connect function defined in /models/index.js
    (async () => {
      await db.connect();
    })();

    server.post("*", async function(req, res, next) {

      //If the user is authenticated, immediately handle the request
      var userData = {};
      if (req.cookies && req.cookies.authToken){
        var nonce = req.cookies.authToken;
        userData = await keyv.get(nonce);
        console.log(userData)
        if (userData){
          req.userData = userData;
          return handle(req, res);
        }
      } 
      
      //Otherwise, check if the request has valid LTI credentials and authenticate the user if that's the case
      var provider = new lti.Provider(consumer_key, consumer_secret)
      provider.valid_request(req, (err, is_valid) => {
        if (is_valid) {
          console.log(provider);
          //copying all the useful data from the provider to what will be stored for the user
          userData.user_id = provider.body.custom_canvas_user_id;
          userData.context_id = provider.body.custom_canvas_course_id;
          userData.instructor = provider.instructor;
          userData.ta = provider.ta;
          userData.student = provider.student;
          userData.admin = provider.admin;
          userData.assignment = provider.body.ext_lti_assignment_id;
          console.log('user data', userData);
          //The nonce is used as the auth token to identify the user to their data
          var nonce = Object.keys(provider.nonceStore.used)[0];
          res.cookie('authToken', nonce, AUTH_HOURS * 1000 * 60 * 60);
          keyv.set(nonce, userData, AUTH_HOURS * 1000 * 60 * 60);
          req.userData = userData;
        }
      });
      //only add the userData if it was modified. That way, future handlers just have to check if userData exists to check authentication status
      if (Object.keys(userData).length > 0) {
        req.userData = userData;
      }
      console.log("DOING NEXT");
      return handle(req, res);
      
      
    });
    server.get("*", async (req, res) => {
      var userData = {};
      if (req.cookies && req.cookies.authToken){
        var nonce = req.cookies.authToken;
        userData = await keyv.get(nonce);
        if (userData){
          req.userData = userData;
        } 
      } 
      var data  = await req.userData;
      return handle(req, res);

    });
   
    server.listen(port, (err) => {
      if (err) throw err;
      console.log(`> App running on ${port}`);
    });

  })
  .catch((ex) => {
    console.log("caught error");
    console.error(ex.stack);
    process.exit(1);
  });
