function createProject(name) {
	let lists = [];
	return {
		name,
		addList: (list) => {
			lists.push(list);
		},
		getLists: () => {
			return lists;
		},
		removeList: (id) => {
			const newLists = lists.filter((list) => list.id !== id);
			lists = newLists;
		},
	};
}
