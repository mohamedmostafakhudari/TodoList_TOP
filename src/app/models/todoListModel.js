// import pubsub from "pubsub-js";
// const createTodoList = () => {
// 	let todoList = [];

// 	return {
// 		addTodo: (todo) => {
// 			todoList.push(todo);
// 			pubsub.publish("todoListUpdated", todoList);
// 		},
// 		removeTodo: (id) => {
// 			const newTodoList = todoList.filter((todo) => todo.id !== id);
// 			// const deletedTodo = todoList[id];
// 			todoList = newTodoList;
// 			pubsub.publish("todoListUpdated", todoList);
// 		},
// 		editTodo(id, updatedData) {
// 			const currentTodo = todoList.find((todo) => todo.id === id);
// 			// const { title, text, priority, done } = currentTodo;
// 			const updatedTodo = Object.assign({}, currentTodo, updatedData);
// 			const newTodoList = todoList.map((todo) => (todo.id === id ? updatedTodo : todo));
// 			todoList = newTodoList;
// 			pubsub.publish("todoListUpdated", todoList);
// 		},

// 		getTodos: () => {
// 			return todoList;
// 		},
// 	};
// };
export class TodoListModel {
	constructor() {
		this.todos = [
			{
				id: 1,
				title: "Todo 1",
				task: "Todo 1 task",
				priority: "low",
				done: false,
			},
		];
	}

	addTodo(todo) {
		this.todos.push(todo);
	}
	deleteTodo(todoId) {
		this.todos = this.todos.filter((t) => t.id !== todoId);
	}
	editTodo(todoId, updatedTodo) {
		this.todos = this.todos.map((todo) => (todo.id === +todoId ? Object.assign({}, todo, updatedTodo) : todo));
	}
	getTodos() {
		return this.todos;
	}
}
