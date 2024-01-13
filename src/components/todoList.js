const createTodoList = () => {
	let todoList = [];
	return {
		addTodo: (todo) => {
			todoList.push(todo);
		},
		removeTodo: (id) => {
			const newTodoList = todoList.filter((todo) => todo.id !== id);
			todoList = newTodoList;
		},
		editTodo(id) {
			const currentTodo = todoList.find((todo) => todo.id === id);
			const { title, text, priority, done } = currentTodo;
			const updatedTodo = {
				...currentTodo,
				title: "updated",
				text: "updated",
			};
			const newTodoList = todoList.map((todo) => (todo.id === id ? updatedTodo : todo));
			todoList = newTodoList;
		},
		getTodos: () => {
			return todoList;
		},
	};
};

export default createTodoList;
