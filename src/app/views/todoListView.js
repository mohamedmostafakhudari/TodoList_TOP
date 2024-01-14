import compiledTodoListTemplate from "../../views/partials/todoList.hbs";
import createTodoItem from "../models/todoItemModel";
export class TodoListView {
	constructor(controller) {
		this.controller = controller;
		this.todoListContainer = document.getElementById("todoListContainer");
		this.addTodoForm = document.querySelector("#addTodoForm");
		this.bindEvents();
		this.bindEventDelegation();
	}
	bindEvents() {
		this.addTodoForm.addEventListener("submit", (e) => {
			e.preventDefault();
			const $titleInput = this.addTodoForm.querySelector("#todoTitle");
			const $taskInput = this.addTodoForm.querySelector("#todoTask");
			const $priorityInput = this.addTodoForm.querySelector("#todoPriority");
			const title = $titleInput.value;
			const task = $taskInput.value;
			const priority = $priorityInput.value;
			const todo = createTodoItem(title, task, priority);
			this.controller.addTodo(todo);

			$titleInput.value = "";
			$taskInput.value = "";
			$priorityInput.value = "low";
		});
	}
	bindEventDelegation() {
		this.todoListContainer.addEventListener("click", (e) => {
			const todo = e.target.closest("li");
			if (todo) {
				if (e.target.matches("#deleteTodo")) {
					this.controller.deleteTodo(todo.dataset.todoid);
				}
			}
		});
	}
	renderTodoList(todos) {
		this.todoListContainer.innerHTML = "";
		const renderedHtml = compiledTodoListTemplate({ todoItems: todos });
		this.todoListContainer.innerHTML = renderedHtml;
	}
}
