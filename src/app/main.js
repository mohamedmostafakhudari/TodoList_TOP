import "./style.css";
import { TodoListView } from "./views/todoListView";
import { TodoListModel } from "./models//todoListModel.js";
import createTodoItem from "./models/todoItemModel.js";

class TodoListController {
	constructor() {
		this.model = new TodoListModel();
		this.view = new TodoListView(this);
		this.view.renderTodoList(this.model.getTodos());
	}

	addTodo({ title, task, priority, dueDate }) {
		const todo = createTodoItem(title, task, priority, dueDate);
		this.model.addTodo(todo);
		this.view.renderTodoList(this.model.getTodos());
	}
	deleteTodo(todoId) {
		this.model.deleteTodo(todoId);
		this.view.renderTodoList(this.model.getTodos());
	}
	editTodo(todoId, updatedTodo) {
		console.log(todoId);
		this.model.editTodo(todoId, updatedTodo);
		this.view.renderTodoList(this.model.getTodos());
	}
}

const todoListController = new TodoListController();
