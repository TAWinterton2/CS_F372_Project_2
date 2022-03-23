//Server.js
//For Project 2 for CS F372
//Jason Kim and Travis Winterton
//Server for Video Hosting/Streaming Website.
//Recent Changes:
	//03/07/22: Started Server.js
	//03/10/22: Created app.get() for home page, login, and video player
	//03/13/22: Started app.get() for video player
	//03/13/22: app.get("/video) can now play videos and output to html page
	//03/15/22: added Login html, and register html form previous project 
	//03/18/22: changed to ejs format, npm installed bcrypt, mongoose, alert
//		    polished login and register POSTs, 
//		    added functionality to prevent duplicate username registers
//		    failed login or register shows alert message
//		    suceessful login redirects to the single video page for now

//Start Server: sudo systemctl start mongod
//Stop Server:  sudo systemctl stop mongod
//Check server status: sudo systemctl status mongod


var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";


const port = 8080;
const bodyParser = require('body-parser');
const express = require('express');
const cookieParser = require('cookie-parser');
const sessions = require('express-session');
const fs = require('fs');
const alert = require('alert');
var app = express();
app.set("view engine", "ejs");

//express-session
//maxAge for cookie 24 hours
const cookieTimeOut = 1000 * 24 * 60 * 60;
app.use(sessions({
	secret: "uniquestringkeythatshouldreallyberandomlygenerated",
	saveUninitialized: true,
	cookie: {maxAge: cookieTimeOut},
	resave: false
}));
var session;


//Database libraries
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 5;

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

var userSchema = new mongoose.Schema({
	username: {type: String, unique: true},
	password: String,
	//userType: viewer, editor, manager
	userType: String,
	videoLimit: {type: Number, default: 3}
});

const User = mongoose.model("user", userSchema);

app.listen(port, () => {
	console.log("Listening on port 8080!");
});

app.get("/", (req, res) => {
	session=req.session;
	if(session.userid){
		res.render('home');
	}
	else {res.render('index');}
});

//Function for Login Page 
app.get('/login', (req, res) => {
	res.render('login');
});

app.post('/login', async (req,res) => {
	try { 
		var uid = req.body.uid;
		const user = await User.findOne({ username: uid});
		if(user) {
			const cmp = await bcrypt.compare(req.body.pwd, user.password);
			if (cmp) {
				session=req.session;
				session.userid = uid;
				session.usertype = user.userType;
				res.render('home');
			}
			else {
				alert("Wrong username or password");
				res.render('login');
			}
		}
		else {
			alert("Wrong username or password");
			res.render('login');
		}
	}
	catch (error) {
		//console.log(error);
		res.status(500).send("Internal server error");
	}
});

app.get('/logout', (req,res) => {
	req.session.destroy();
	res.redirect('/');
});

//Function for Register
app.get('/register', (req, res) => {
	res.render('register');
});


app.post('/register', async (req,res)=>{
	
	try{
	const hashpwd = await bcrypt.hash(req.body.pwd, saltRounds);
		const insert = await User.create({
		username: req.body.uid,
		password: hashpwd,
		userType: req.body.usertype,
	});
	alert('Register successful!');
	res.render('login');
	}
	catch (error) {
		//console.log(error);
		if(error.code === 11000) 
		{
			alert('Username already exists!');
			res.render('register');
		}
		else res.status(500).send("Internal server error");
	}
});
	
	
//.post for search bar
app.post("/search", (req, res) =>{
	//
});
 

//Function for Video Player of given video

app.get("/video", (req, res) => {
	const range = req.headers.range;
	if(!range) 
	{
		res.status(400).send("Requires Range header");
	}
	// Video Stats
	const videoPath = "DingDing.mp4";
	const videoSize = fs.statSync("DingDing.mp4").size;
	
	const CHUNK_SIZE = 10 ** 250; // set chunk size. Can vary depening on video
	const start = Number(range.replace(/\D/g, ""));
	const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
	//Response Headers
	const contentLength = end - start + 1;
	const headers = {
		"Content-Range": 'bytes ${start}-${end}/$videoSize}',
		"Accept-Ranges": "bytes",
		"Content-Length": contentLength,
		"Content-Type":  "video/mp4",
	};
	//HTTP Status 206 for Partial Content
	res.writeHead(206, headers);
	
	// Create video read stream for this video 
	const videoStream = fs.createReadStream(videoPath, { start, end });
	
	//Stream the video chunk to client
	videoStream.pipe(res);
	 
});


