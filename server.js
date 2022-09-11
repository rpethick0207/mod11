//model imports

const fs = require("fs");
const path = require("path");
const express = require("express");
const { tasks } = require("./db/db");

//server variables

const PORT = process.env.PORT || 1217;
const app = express();

//express middleware

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(express.static("public"));

//data function

function createNewTask(body, tasksArray) {
  const task = body;
  tasksArray.push(task);
  fs.writeFileSync(
    path.join(__dirname, "./db/db.json"),
    JSON.stringify({ tasks: tasksArray }, null, 2)
  );
  return task;
}

//data validation

function testId(idArg) {
  let idList = tasks.map(({ id }) => id);
  for (i = 0; i < idList.length; i++) {
    if (idArg === parseInt(idList[i])) {
      console.log(`id ${idList[i]} is in use`);
      return false;
    } else {
      console.log(`id ${idList[i]} is available!`);
    }
  }
  return true;
}
function validateTask(task) {
  if (!task.title || typeof task.title !== "string") {
    return false;
  }
  if (!task.text || typeof task.text !== "string") {
    return false;
  }
  if (!testId(task.id)) {
    task.id++;
    validateTask(task);
  }
  return true;
}

//query delete function

function deleteTask(id, tasksArray) {
  const isSameId = (element) => element.id == id;
  let idIndex = tasksArray.findIndex(isSameId);
  let updatedArray = tasksArray.splice(idIndex, 1);
  fs.writeFileSync(
    path.join(__dirname, "./db/db.json"),
    JSON.stringify({ tasks: tasksArray }, null, 2)
  );
}
function findById(id, tasksArray) {
  const result = tasksArray.filter((task) => task.id === id)[0];
  return result;
}

//function for get routes

app.get("/notes", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/notes.html"));
});
app.get("/api/notes", (req, res) => {
  res.json(tasks);
});
app.get("/api/notes/:id", (req, res) => {
  const result = findById(req.params.id, tasks);
  if (result) {
    res.json(result);
  } else {
    res.send(404);
  }
});
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/index.html"));
});

//function to for post routes

app.post("/api/notes", (req, res) => {
  req.body.id = tasks.length.toString();

  if (!validateTask(req.body)) {
    res.status(400).send("Something went wrong!");
  } else {
    const task = createNewTask(req.body, tasks);
    res.json(task);
  }
});

//function to delete routes

app.delete("/api/notes/delete/:id", (req, res) => {
  deleteTask(req.params.id, tasks);
  console.log("note deleted");
  res.end();
});

//port listen

app.listen(PORT, () => {
  console.log(`now listening on port ${PORT}!`);
});