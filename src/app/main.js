import "./style.css";
import EventEmitter from "./Event.js";
import TodoList from "./components/todoList/todoList.js";
import TodoForm from "./components/todoForm/todoForm.js";
import Projects from "./components/projects/projects.js";
const eventEmitter = new EventEmitter();
const $openTodoForm = document.querySelector("#openTodoForm");
const todoList = new TodoList(eventEmitter);

const todoForm = new TodoForm(eventEmitter);
$openTodoForm.addEventListener("click", () => {
	todoForm.clear();
	todoForm.render();
	todoForm.openDialog();
});

const projects = new Projects(eventEmitter);
