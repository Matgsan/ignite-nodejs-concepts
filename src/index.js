const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} =  request.headers;
  if(!username){
    return response.status(404).json({error: 'Username not provided'});
  }
  const user = users.find(u=> u.username === username);
  if(!user){
    return response.status(404).json({error: 'Username not found'});
  }
  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;
  const findUser = users.findIndex(u=> u.username === username);
  if(findUser >= 0){
    return response.status(400).send({error: 'Username already exists'});
  }
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };
  users.push(user);
  return response.status(201).json(user);
});

app.use(checksExistsUserAccount)

app.get('/todos', (request, response) => {
  return response.json(request.user.todos)
});

app.post('/todos', (request, response) => {
  const {title , deadline} = request.body;
  const todo = { 
    id: uuidv4(),
    title: title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  } 
  request.user.todos.push(todo)
  return response.status(201).json(todo);
});

app.put('/todos/:id', (request, response) => {
  const {title , deadline} = request.body;

  const {id} = request.params;
  const index = request.user.todos.findIndex(todo => todo.id === id);
  if(index < 0){
    return response.status(404).json({error: 'Not found'});
  }
  const updatedTodo = {
    ...request.user.todos[index],
    title: title,
    deadline: new Date(deadline), 
  }
  request.user.todos[index] = updatedTodo;
  return response.status(200).json(updatedTodo);
});

app.patch('/todos/:id/done', (request, response) => {
  const {id} = request.params;
  const index = request.user.todos.findIndex(todo => todo.id === id);
  if(index < 0){
    return response.status(404).json({error: 'Not found'});
  }
  request.user.todos[index].done = true; 
  return response.status(200).json(request.user.todos[index]);
});

app.delete('/todos/:id', (request, response) => {
  const {id} = request.params;
  const index = request.user.todos.findIndex(todo => todo.id === id);
  if(index < 0){
    return response.status(404).json({error: 'Not found'});
  }
  request.user.todos.splice(index, 1);
  return response.status(204).send();
});

module.exports = app;