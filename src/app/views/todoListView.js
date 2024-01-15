import compiledTodoListTemplate from "../../views/partials/todoList.hbs";
const $todoFormDialog = document.querySelector("#todoFormDialog");

export class TodoListView {
	constructor(controller) {
		this.controller = controller;
		this.todoListContainer = document.getElementById("todoListContainer");

		this.addTodoForm = document.querySelector("#addTodoForm");
		this.editTodoForm = document.querySelector("#editTodoForm");

		this.openAddTodoForm = document.querySelector("button#openAddTodoForm");
		this.bindEvents();
		this.bindEventDelegation();
	}
	bindEvents() {
		this.openAddTodoForm.addEventListener("click", () => {
			$todoFormDialog.showModal();
			this.editTodoForm.classList.add("hidden", "pointer-events-none");
			this.addTodoForm.classList.remove("hidden", "pointer-events-none");
		});
		this.addTodoForm.addEventListener("submit", (e) => {
			e.preventDefault();
			const $titleInput = this.addTodoForm.querySelector("#todoTitle");
			const $taskInput = this.addTodoForm.querySelector("#todoTask");
			const $dueDateInput = this.addTodoForm.querySelector("#todoDueDate");
			const $priorityInput = this.addTodoForm.querySelector("#todoPriority");
			const title = $titleInput.value;
			const task = $taskInput.value;
			const dueDate = $dueDateInput.value;
			const priority = $priorityInput.value;
			this.controller.addTodo({ title, task, priority, dueDate });

			$titleInput.value = "";
			$taskInput.value = "";
			$dueDateInput.value = "";
			$priorityInput.value = "low";

			$todoFormDialog.close();
		});
		this.editTodoForm.addEventListener("submit", (e) => {
			e.preventDefault();
			const $titleInput = this.editTodoForm.querySelector("#todoTitle");
			const $taskInput = this.editTodoForm.querySelector("#todoTask");
			const $dueDateInput = this.editTodoForm.querySelector("#todoDueDate");
			const $priorityInput = this.editTodoForm.querySelector("#todoPriority");
			const title = $titleInput.value;
			const task = $taskInput.value;
			const dueDate = $dueDateInput.value;
			const priority = $priorityInput.value;
			this.controller.editTodo(this.editTodoForm.dataset.todoid, { title, task, priority, dueDate });
			$todoFormDialog.close();
			this.editTodoForm.classList.remove("block", "pointer-events-auto");
			this.editTodoForm.classList.add("hidden", "pointer-events-none");
			$titleInput.value = "";
			$taskInput.value = "";
			$dueDateInput.value = "";
			$priorityInput.value = "low";
		});
	}
	bindEventDelegation() {
		this.todoListContainer.addEventListener("click", (e) => {
			const todo = e.target.closest("li");
			if (todo) {
				if (e.target.matches("#deleteTodo")) {
					this.controller.deleteTodo(todo.dataset.todoid);
				} else if (e.target.matches("#editTodo")) {
					const $titleInput = this.editTodoForm.querySelector("#todoTitle");
					const $taskInput = this.editTodoForm.querySelector("#todoTask");
					const $dueDateInput = this.editTodoForm.querySelector("#todoDueDate");
					const $priorityInput = this.editTodoForm.querySelector("#todoPriority");

					const todoCurrentTitle = todo.querySelector("[data-type=title]");
					const todoCurrentTask = todo.querySelector("[data-type=task]");
					const todoCurrentDueDate = todo.querySelector("[data-type=dueDate]");
					const todoCurrentPriority = todo.querySelector("[data-type=priority]");

					$titleInput.value = todoCurrentTitle.textContent;
					$taskInput.value = todoCurrentTask.textContent;
					$dueDateInput.value = todoCurrentDueDate;
					$priorityInput.value = todoCurrentPriority.textContent;

					console.log();
					$todoFormDialog.showModal();
					this.addTodoForm.classList.add("hidden", "pointer-events-none");
					this.editTodoForm.classList.remove("hidden", "pointer-events-none");
					this.editTodoForm.dataset.todoid = todo.dataset.todoid;
				}
			}
		});
	}
	renderTodoList(todos) {
		console.log(todos);
		this.todoListContainer.innerHTML = "";
		const renderedHtml = compiledTodoListTemplate({ todoItems: todos });
		this.todoListContainer.innerHTML = renderedHtml;
	}
}
