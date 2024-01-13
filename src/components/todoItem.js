const createTodoItem = (title, text, priority) => {
	return {
		id: crypto.randomUUID(),
		title,
		text,
		priority,
		done: false,
	};
};
export default createTodoItem;
