const createTodoItem = (title, task, priority, dueDate) => {
	return {
		id: crypto.randomUUID(),
		title,
		task,
		priority,
		dueDate,
		done: false,
	};
};
export default createTodoItem;
