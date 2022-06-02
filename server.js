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
var path = require("path");

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

try {
  var runPython = spawn("python3", ["clean.py"], {
    detached: true,
  });
} catch (error) {
  console.log(error);
}

const runPythonFile = (sending, kill = false) => {
  runPython.stdout.on("data", async (data) => {
    console.log(data);

    eventEmitter.emit("start", data);
    // await Clean.create({ email: data });
    sending.emit("output", data.toString());
  });

  runPython.on("error", function (err) {
    eventEmitter.emit("start", err);
    // await Clean.create({ email: data });
    sending.emit("output", err.toString());
  });
  runPython.on("close", (data) => {
    console.log("data.toString()");
    console.log(data.toString());
    // sending.emit("output", data);
  });

  if (kill === true) {
    runPython.kill();
    sending.emit("output", "stopped");
  }
};

io.on("connection", async (socket) => {
  // Clean.find({}).then((data) => {
  //   socket.emit("new", data);
  // });

  eventEmitter.on("start", (data) => {
    socket.emit("output", data.toString());
  });
  socket.on("run", (msg) => {
    runPythonFile(socket);
  });

  socket.on("stop", (msg) => {
    runPythonFile(socket, true);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
  socket.on("run", (data) => {
    console.log(data);
  });
});

runPython.stdout.on("data", async (data) => {
  eventEmitter.emit("start", data);
});
server.listen(8000, async () => {
  try {
  } catch (error) {
    console.log(error);
  }
});
