const express = require("express");
const EventEmitter = require("events");
const eventEmitter = new EventEmitter();
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const mongoose = require("mongoose");
const { spawn } = require("node:child_process");
const fileUpload = require("express-fileupload");
const { fstat } = require("fs");
const { exec } = require("child_process");
const { PythonShell } = require("python-shell");
const fs = require("fs");
var path = require("path");
let run = false;
const readLastLines = require("read-last-lines");
app.use(express.static("public"));

app.use(fileUpload());

app.get("/", (req, res) => {
  console.log("a user connected");

  res.sendFile("index.html");
});
app.get("/file", (req, res) => {
  console.log(path.join(__dirname));
  var options = {
    root: path.join(__dirname),
  };
  var fileName = "emails.txt";
  res.sendFile(fileName, options, function (err) {
    if (err) {
      console.log("Sent:", fileName);
    } else {
      console.log("Sent:", fileName);
    }
  });
});
app.get("/succes", (req, res) => {
  console.log(path.join(__dirname));
  var options = {
    root: path.join(__dirname),
  };
  var fileName = "succes.txt";
  res.sendFile(fileName, options, function (err) {
    if (err) {
      console.log("Sent:", fileName);
    } else {
      console.log("Sent:", fileName);
    }
  });
});
app.post("/upload", function (req, res) {
  console.log(req.files);
  let sampleFile;
  let uploadPath;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  sampleFile = req.files.sampleFile;
  uploadPath = __dirname + "/" + "emails.txt";

  // Use the mv() method to place the file somewhere on your server

  sampleFile.mv(uploadPath, function (err) {
    if (err) return res.status(500).send(err);

    console.log(`File uploaded! ${__dirname + "/" + "emails.txt"}`);
    res.redirect("index.html");
  });
});

io.on("connection", async (socket) => {
  // Clean.find({}).then((data) => {
  //   socket.emit("new", data);
  // });

  socket.on("run", (data) => {
    console.log("woo");
    fs.writeFileSync("succes.txt", " ");
  });
  var oldline = " ";
  let start = 0;
  setInterval(() => {
    readLastLines.read("succes.txt", 1).then((lines) => {
      if (oldline != lines) {
        let sending = ` current email ${start}${lines}`;
        socket.emit("output", lines);
        start++;
        lines = oldline;
      }
    });
    // fs.readFile("succes.txt", function (err, data) {
    //   if (err) throw err;
    //sss
    //   const arr = data.toString().replace(/\r\n/g, "\n").split("\n").reverse();
    //   if (arr[0] != " ") {
    //     socket.emit("output", arr[0].toString());
    //   }
    // });
  }, 1000);
  eventEmitter.on("start", (data) => {
    socket.emit("output", data.toString());
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(80, async () => {
  try {
  } catch (error) {
    console.log(error);
  }
});
