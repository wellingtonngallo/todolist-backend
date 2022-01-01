const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(400).json({ message: 'User not found!' });
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const verifyIfExistsUser = users.find(user => user.username === username);

  if (verifyIfExistsUser) {
    return response.status(400).json({ error: 'Username already exists!' })
  }

  const newUser = {
    name,
    username,
    id: uuidv4(),
    todos: []
  }
  
  users.push(newUser);

  return response.status(201).send(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);
  
  return response.status(201).send(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  const findTask = user.todos.find(task => task.id === id);

  if (!findTask) {
    return response.status(404).send({ error: "Task not found" })
  }

  findTask.deadline = new Date(deadline);
  findTask.title = title;

  return response.status(200).send(findTask)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const findTask = user.todos.find(task => task.id === id);

  if (!findTask) {
    return response.status(404).send({ error: "Task not found" })
  }

  findTask.done = !findTask.done;

  return response.status(200).send(findTask)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const findTask = user.todos.find(task => task.id === id);

  if (!findTask) {
    return response.status(404).send({ error: "Task not found" })
  }

  user.todos.splice(findTask, 1);

  return response.status(204).send();
});

module.exports = app;