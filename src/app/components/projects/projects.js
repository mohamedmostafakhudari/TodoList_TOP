import { subDays, subHours, isToday, isFuture, isPast } from "date-fns";
const filters = {
	byTime: ["today", "upcoming", "overdue"],
	byStatus: ["completed", "incomplete"],
	byPriority: ["high", "medium", "low"],
};
export default class Projects {
	constructor(eventEmitter) {
		this.eventEmitter = eventEmitter;
		this.eventEmitter.on("submitFormData", this.handleSubmitFormData.bind(this));
		this.eventEmitter.on("deleteTodo", this.handleDeleteTodo.bind(this));
		this.eventEmitter.on("doneChecked", this.handleDoneChecked.bind(this));
		this.filters = [];
		// this.filteredList = [];
		this.initialProjects = [
			{
				id: "1",
				name: "Project 1",
				list: [
					{
						id: "1",
						todoTitle: "Todo A",
						todoDescription: "Todo 1 description",
						todoDueDate: new Date(Date.now()),
						todoPriority: "low",
						done: false,
						tags: ["tag1", "tag2"],
					},
					{
						id: "2",
						todoTitle: "Todo B",
						todoDescription: "Todo 1 description",
						todoDueDate: new Date(subHours(Date.now(), 3)),
						todoPriority: "medium",
						done: true,
						tags: ["tag1", "tag2"],
					},
					{
						id: "3",
						todoTitle: "Todo C",
						todoDescription: "Todo 1 description",
						todoDueDate: new Date(subDays(Date.now(), 1)),
						todoPriority: "high",
						done: false,
						tags: ["tag1", "tag2"],
					},
					{
						id: "4",
						todoTitle: "Todo C",
						todoDescription: "Todo 1 description",
						todoDueDate: new Date(subDays(Date.now(), 1)),
						todoPriority: "high",
						done: false,
						tags: ["tag1", "tag2"],
					},
					{
						id: "5",
						todoTitle: "Todo C",
						todoDescription: "Todo 1 description",
						todoDueDate: new Date(subDays(Date.now(), 1)),
						todoPriority: "high",
						done: false,
						tags: ["tag1", "tag2"],
					},
					{
						id: "6",
						todoTitle: "Todo C",
						todoDescription: "Todo 1 description",
						todoDueDate: new Date(subDays(Date.now(), 1)),
						todoPriority: "high",
						done: false,
						tags: ["tag1", "tag2"],
					},
					{
						id: "7",
						todoTitle: "Todo C",
						todoDescription: "Todo 1 description",
						todoDueDate: new Date(subDays(Date.now(), 1)),
						todoPriority: "high",
						done: false,
						tags: ["tag1", "tag2"],
					},
				],
			},
		];
		this.projects = localStorage.getItem("projects") ? JSON.parse(localStorage.getItem("projects")) : this.initialProjects;
		this.selectedProjectId = "1";
		this.selectedProject = this.getProjectById(this.selectedProjectId);
		this.defaultFilterValue = "all";
		this.defaultSortValue = "alphabetically";
		this.renderProjectsList(this.projects, this.selectedProjectId);
	}

	getProjects() {
		return this.projects;
	}
	addProject(projectName) {
		const newProjectId = crypto.randomUUID();
		const newProject = {
			id: newProjectId,
			name: projectName,
			list: [],
		};
		this.projects.push(newProject);
		this.selectedProjectId = newProjectId;
		this.renderProjectsList(this.projects, this.selectedProjectId);
	}
	removeProject(id) {
		const newProjects = this.projects.filter((project) => project.id !== id);
		this.projects = newProjects;
	}
	getProjectById(id) {
		return this.projects.find((project) => project.id === id);
	}
	getProjectByName(name) {
		return this.projects.find((project) => project.name === name);
	}
	getTodoById(projectId, todoId) {
		const project = this.getProjectById(projectId);
		return project.list.find((todo) => todo.id === todoId);
	}
	isEmpty(project) {
		return project.list.length === 0;
	}
	addTodo(todo) {
		// The rest of todo data is coming from the form
		const todoItem = {
			id: crypto.randomUUID(),
			done: false,
			...todo,
		};
		const projectExist = this.getProjectByName(todo.projectName);
		if (!projectExist) {
			this.addProject(todo.projectName);
		}
		const selectedProject = this.getProjectById(this.selectedProjectId);
		if (todo.projectName === selectedProject.name) {
			selectedProject.list.push(todoItem);
			this.eventEmitter.emit("todoListUpdated", { projectName: selectedProject.name, list: selectedProject.list });
			localStorage.setItem("projects", JSON.stringify(this.projects));
		} else {
			const project = this.getProjectByName(todo.projectName);
			project.list.push(todoItem);
			this.selectedProjectId = project.id;
			this.handleProjectSelected(project.id);
		}
	}
	editTodo(updatedTodo, todoId) {
		const projectName = updatedTodo.projectName;
		const selectedProject = this.getProjectById(this.selectedProjectId);

		if (selectedProject.name === projectName) {
			const newProjects = this.projects.map((project) => {
				if (project.name === projectName) {
					return {
						...project,
						list: project.list.map((todo) => {
							if (todo.id === todoId) {
								return {
									...todo,
									...updatedTodo,
								};
							}
							return todo;
						}),
					};
				}
				return project;
			});
			this.projects = newProjects;
			const updatedSelectedProject = this.getProjectById(this.selectedProjectId);

			this.eventEmitter.emit("todoListUpdated", { projectName: selectedProject.name, list: updatedSelectedProject.list });
			localStorage.setItem("projects", JSON.stringify(this.projects));
		} else {
			const removedTodo = this.removeTodoFromProject(this.selectedProjectId, todoId);
			const project = this.getProjectByName(projectName);
			project.list.push({
				...removedTodo,
				...updatedTodo,
			});
			this.selectedProjectId = project.id;
			this.handleProjectSelected(project.id);
		}
	}
	removeTodoFromProject(projectId, todoId) {
		const removedTodo = this.getTodoById(projectId, todoId);
		const newProjects = this.projects.map((project) => {
			if (project.id === projectId) {
				return {
					...project,
					list: project.list.filter((todo) => todo.id !== todoId),
				};
			}
			return project;
		});
		this.projects = newProjects;
		return removedTodo;
	}
	isFilterExist(filterValue) {
		return this.filters.includes(filterValue);
	}
	addFilter(filterValue) {
		if (this.isFilterExist(filterValue) || filterValue === "all") return;
		this.filters.push(filterValue);
	}
	removeFilter(filterValue) {
		this.filters = this.filters.filter((filter) => filter !== filterValue);
	}
	clearFilters() {
		this.filters = [];
	}
	setFilterValue(filterValue) {
		this.$filterSelect.value = filterValue;
	}
	matchAllFilters(todo) {
		const filtersCheckMap = {
			today: isToday(todo.todoDueDate),
			upcoming: isFuture(todo.todoDueDate),
			overdue: isPast(todo.todoDueDate) && !isToday(todo.todoDueDate),
			completed: todo.done,
			incomplete: !todo.done,
			high: todo.todoPriority === "high",
			medium: todo.todoPriority === "medium",
			low: todo.todoPriority === "low",
		};
		console.log(filtersCheckMap);
		for (const filter of this.filters) {
			if (!filtersCheckMap[filter]) {
				return false;
			}
		}
		return true;
	}
	filterList(list) {
		let filteredList = list;
		filteredList = filteredList.filter((todo) => {
			if (this.matchAllFilters(todo)) {
				return true;
			}
		});
		return filteredList;
	}
	sortListBy(list, sortValue) {
		if (sortValue === "alphabetically") {
			return this.sortAlphabetically(list);
		} else if (sortValue === "byDate") {
			return this.sortByDate(list);
		} else if (sortValue === "byStatus") {
			return this.sortByStatus(list);
		} else if (sortValue === "byPriority") {
			return this.sortByPriority(list);
		}
	}
	sortAlphabetically(list) {
		return list.sort((a, b) => {
			return a.todoTitle.localeCompare(b.todoTitle);
		});
	}
	sortByDate(list) {
		return list.sort((a, b) => {
			return new Date(b.todoDueDate) - new Date(a.todoDueDate);
		});
	}
	sortByStatus(list) {
		return list.sort((a, b) => {
			if (a.done === b.done) {
				return 0;
			} else if (a.done) {
				return -1;
			} else if (b.done) {
				return 1;
			}
		});
	}
	sortByPriority(list) {
		const priorityValuesMap = new Map([
			["high", 2],
			["medium", 1],
			["low", 0],
		]);
		return list.sort((a, b) => {
			return priorityValuesMap.get(b.todoPriority) - priorityValuesMap.get(a.todoPriority);
		});
	}
	setSortValue(sortValue) {
		this.$sortSelect.value = sortValue;
	}
	createProject(project, selectedProjectId, $list) {
		const $project = document.createElement("li");
		$project.setAttribute("data-project-id", project.id);
		$project.setAttribute("data-component", "project");

		const $projectName = document.createElement("button");
		$projectName.className = `${project.id === selectedProjectId ? "bg-blue-700" : "bg-green-800 hover:bg-green-600"} block w-full py-4 duration-200 ease-in-out`;

		$projectName.textContent = project.name;

		$project.appendChild($projectName);

		$list.appendChild($project);
	}
	createProjectsList(projects, selectedProjectId) {
		const $list = document.createElement("ul");
		$list.setAttribute("id", "projectsList");
		$list.setAttribute("data-component", "projects");
		$list.className = "flex flex-col";
		for (const project of projects) {
			this.createProject(project, selectedProjectId, $list);
		}
		return $list;
	}
	createFilterElement(filter) {
		const $filter = document.createElement("button");
		$filter.className = "bg-blue-500 text-white p-2 px-4 rounded-full";
		$filter.textContent = filter;
		$filter.dataset.filter = filter;

		$filter.addEventListener("click", (e) => {
			const filter = e.target.dataset.filter;
			this.handleFilterButtonClick(filter);
		});
		return $filter;
	}
	renderProjectsList(projects, selectedProjectId) {
		const $projects = document.querySelector("aside#projects");
		$projects.innerHTML = "";
		$projects.appendChild(this.createProjectsList(projects, selectedProjectId));

		const selectedProject = this.getProjectById(selectedProjectId);

		this.cacheDOM();

		this.bindEvents();
		this.eventEmitter.emit("todoListUpdated", { projectName: selectedProject.name, list: selectedProject.list });
		localStorage.setItem("projects", JSON.stringify(this.projects));
		this.eventEmitter.emit("projectsUpdated", { selectedProject, projectsNames: this.projects.map((project) => project.name) });
	}
	updateFiltersUI() {
		const $filterList = document.querySelector("#filterList");
		$filterList.innerHTML = "";
		for (const filter of this.filters) {
			const $filter = this.createFilterElement(filter);
			$filterList.appendChild($filter);
		}
	}
	bindEvents() {
		this.$projectList.addEventListener("click", (e) => {
			const target = e.target.closest("[data-component=project]");
			if (!target) return;
			const projectId = target.dataset.projectId;
			this.handleProjectSelected(projectId);
		});
		this.$filterSelect.addEventListener("change", (e) => {
			const filterValue = e.target.value;
			this.handleFilterChange(filterValue);
		});
		this.$sortSelect.addEventListener("change", (e) => {
			const sortValue = e.target.value;
			this.handleSortChange(sortValue);
		});
	}
	handleFilterChange(filterValue) {
		const selectedProject = this.getProjectById(this.selectedProjectId);
		if (filterValue !== "all") {
			this.addFilter(filterValue);
			const filteredList = this.filterList(selectedProject.list);
			// console.log(filteredList);
			this.eventEmitter.emit("todoListUpdated", { projectName: selectedProject.name, list: filteredList });
		} else {
			this.clearFilters();
			this.eventEmitter.emit("todoListUpdated", { projectName: selectedProject.name, list: selectedProject.list });
		}
		localStorage.setItem("projects", JSON.stringify(this.projects));
		this.updateFiltersUI();
	}
	handleFilterButtonClick(filterValue) {
		this.removeFilter(filterValue);
		const selectedProject = this.getProjectById(this.selectedProjectId);
		const filteredList = this.filterList(selectedProject.list);
		this.eventEmitter.emit("todoListUpdated", { projectName: selectedProject.name, list: filteredList });
		this.updateFiltersUI();
	}
	handleSortChange(sortValue) {
		const selectedProject = this.getProjectById(this.selectedProjectId);
		const sortedList = this.sortListBy(selectedProject.list, sortValue);
		this.eventEmitter.emit("todoListUpdated", { projectName: selectedProject.name, list: sortedList });
	}
	handleSubmitFormData({ data, mode, todoId }) {
		if (mode === "add") {
			this.addTodo(data);
		} else if (mode === "edit") {
			this.editTodo(data, todoId);
		}
	}
	handleProjectSelected(projectId) {
		// const project = this.getProjectById(projectId);
		this.selectedProjectId = projectId;
		this.clearFilters();
		this.updateFiltersUI();
		this.setFilterValue(this.defaultFilterValue);
		this.setSortValue(this.defaultSortValue);
		this.renderProjectsList(this.projects, projectId);
		// this.eventEmitter.emit("projectsUpdated", { selectedProject: project, projectsNames: this.projects.map((project) => project.name) });
		// this.eventEmitter.emit("todoListUpdated", { projectName: project.name, list: project.list });
	}
	handleDeleteTodo(todoId) {
		this.removeTodoFromProject(this.selectedProjectId, todoId);
		const selectedProject = this.getProjectById(this.selectedProjectId);
		if (this.isEmpty(selectedProject)) {
			this.removeProject(this.selectedProjectId);
			this.selectedProjectId = this.projects[0].id;
			this.handleProjectSelected(this.projects[0].id);
		} else {
			this.eventEmitter.emit("todoListUpdated", { projectName: selectedProject.name, list: selectedProject.list });
			localStorage.setItem("projects", JSON.stringify(this.projects));
		}
	}
	handleDoneChecked(todoId) {
		const newProjects = this.projects.map((project) => {
			if (project.id === this.selectedProjectId) {
				return {
					...project,
					list: project.list.map((todo) => {
						if (todo.id === todoId) {
							return {
								...todo,
								done: !todo.done,
							};
						}
						return todo;
					}),
				};
			}
			return project;
		});
		this.projects = newProjects;
		// const selectedProject = this.getProjectById(this.selectedProjectId);
		// this.eventEmitter.emit("todoListUpdated", { projectName: selectedProject.name, list: selectedProject.list });
		localStorage.setItem("projects", JSON.stringify(this.projects));
	}
	cacheDOM() {
		this.$projectList = document.querySelector("#projectsList");
		this.$addTodoBtn = document.querySelector("#addTodoBtn");
		this.$filterSelect = document.querySelector("#filterBy");
		this.$sortSelect = document.querySelector("#sortBy");
	}
}
