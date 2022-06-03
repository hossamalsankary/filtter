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

var path = require("path");
let run = false;
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

let runPython = null;

const runPythonFileNow = () => {
  try {
    PythonShell.run("clean.py", null, function (err, results) {
      if (err) throw err;
      // results is an array consisting of messages collected during execution
      console.log("results: %j", results);
    });
  } catch (error) {
    console.log(error);
  }
};
const runPythonFile = (sending, kill = false) => {
  runPython = spawn("watch", ["tail", "succes.txt "], {});

  runPython.stdout.on("data", async (data) => {
    console.log(data);

    eventEmitter.emit("start", data);
    // await Clean.create({ email: data });
    //sending.emit("output", data.toString());
  });
  runPython.stderr.on("data", (data) => {
    eventEmitter.emit("start", data);
  });

  runPython.on("close", (data) => {
    console.log("data.toString()");
    run = false;
  });
};

io.on("connection", async (socket) => {
  // Clean.find({}).then((data) => {
  //   socket.emit("new", data);
  // });

  eventEmitter.on("start", (data) => {
    socket.emit("output", data.toString());
  });
  socket.on("run", (msg) => {
    if (run == false) {
      console.log("runing");
      runPythonFile(socket);
      runPythonFileNow();
      run = true;
    }
  });

  socket.on("stop", (msg) => {
    if (runPython != undefined) {
      runPython.kill("SIGINT");
      let kill = spawn("killall", ["python3", " clean.py"]);

      kill.stdout.on("data", (daat) => {
        kill.kill("SIGINT");
      });
      runPython.stderr.on("data", (data) => {
        console.log("data");
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});
if (runPython != null) {
  runPython.stdout.on("data", async (data) => {
    eventEmitter.emit("start", data);
  });
}
server.listen(80, async () => {
  try {
  } catch (error) {
    console.log(error);
  }
});
