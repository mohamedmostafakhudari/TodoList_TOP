import "./style.css";
import Handlebars from "handlebars";
import createTodoList from "../components/todoList";
import createTodoItem from "../components/todoItem";
import Logger from "../logger";
import compiledTodoListTemplate from "../views/partials/todoList.handlebars";
const tempData = {
	listTitle: "My Todo List",
	todoItems: [
		{
			title: "title1",
			text: "text1",
			priority: "priority1",
			done: "done1",
		},
		{
			title: "title2",
			text: "text2",
			priority: "priority2",
			done: "done2",
		},
	],
};
const div = document.createElement("div");
const populatedTodoListTemplate = compiledTodoListTemplate(tempData);
console.log(populatedTodoListTemplate);
div.innerHTML = populatedTodoListTemplate;
document.body.appendChild(div);
const todoList = createTodoList();
Logger.log(todoList);
const todoItem1 = createTodoItem(prompt("title"), prompt("text"), prompt("priority"));
const todoItem1Id = todoItem1.id;
todoList.addTodo(todoItem1);
Logger.log(todoList.getTodos());
const todoItem2 = createTodoItem(prompt("title"), prompt("text"), prompt("priority"));
const todoItem2Id = todoItem2.id;
todoList.addTodo(todoItem2);
Logger.log(todoList.getTodos());

todoList.editTodo(todoItem2.id);
Logger.log(todoList.getTodos());
