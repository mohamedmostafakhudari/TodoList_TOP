const createTodoItem = (title, task, priority) => {
	return {
		id: crypto.randomUUID(),
		title,
		task,
		priority,
		done: false,
	};
};
export default createTodoItem;
