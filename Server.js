//Server.js
//For Project 2 for CS F372
//Jason Kim and Travis Winterton
//Server for Video Hosting/Streaming Website.
//Recent Changes:
	//03/07/22: Started Server.js
	//03/10/22: Created app.get() for home page, login, and video player
	//03/13/22: Started app.get() for video player
	//03/13/22: app.get("/video) can now play videos and output to html page
//To do List:
	// Add MongoDB Databse
	// Add in Login - From Project 1 (Add in hashing if possible)
	// Work on Search video function



//var MongoClient = require('mongodb').MongoClient;
//var url = "mongodb://localhost:27017/";

const port = 8080;

const bodyParser = require('body-parser');
const express = require("express");

const app = express();

const fs = require("fs");

app.get("/", function(req, res) {
	res.sendFile(__dirname + "/index.html");
});

// more code will go here

//Function for Login Page 
app.get("/login", (req, res) => {
	//TO DO!!!
});

//Function for Register
app.get("/register", (req, res) => {
	//TO DO!!!
});

app.post("/register", (req, res) => {
	//TO DO!!!
});
	
	

//Funciton for Home page where users can search videos
app.get("/home", (req, res) => {
	//TO DO!!!
});

//Function for search results
app.get("/search_results", (req, res) => {
	//TO DO!!!
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

app.listen(port, () => {
	console.log("Listening on port 8080!");
});

