import compiledTodoItem from "./templates/todoItem.hbs";
import { formatDistanceToNow } from "date-fns";

function throttle(cb, delay) {
	let wait = false;

	return (...args) => {
		if (wait) {
			return;
		}
		cb(...args);
		wait = true;
		setTimeout(() => {
			wait = false;
		}, delay);
	};
}
export default class TodoList {
	constructor(eventEmitter) {
		this.eventEmitter = eventEmitter;
		this.currentPage = 1;
		this.throttledHandlePrevBtnClick = throttle(this.handlePrevBtnClick.bind(this), 500);
		this.throttledHandleNextBtnClick = throttle(this.handleNextBtnClick.bind(this), 500);
		this.eventEmitter.on("todoListUpdated", this.handleTodoListUpdated.bind(this));
	}
	handleTodoListUpdated({ projectName, list }) {
		this.renderTodoList({ projectName, list });
	}
	updatePageNumber(change) {
		this.currentPage += change;
	}
	createTodoItem({ todo: todoItem, projectName }) {
		const $todoItem = document.createElement("li");
		$todoItem.setAttribute("data-todo-id", todoItem.id);
		$todoItem.setAttribute("data-component", "todo-item");
		$todoItem.setAttribute("data-priority", todoItem.todoPriority);
		$todoItem.setAttribute("data-done", todoItem.done);
		$todoItem.setAttribute("data-project-name", projectName);
		$todoItem.className = "bg-white p-6 px-12 rounded-md self-start snap-start scroll-m-[50px_50px] pointer-events-auto";
		$todoItem.innerHTML = compiledTodoItem({
			...todoItem,
			todoDueDate: new Date(todoItem.todoDueDate).toLocaleDateString(),
		});

		// Priority Icons Styling
		const $priorityIcon = $todoItem.querySelector("#priorityIcon");
		switch ($todoItem.dataset.priority) {
			case "low":
				$priorityIcon.classList.add("text-green-500");
				break;
			case "medium":
				$priorityIcon.classList.add("text-yellow-500");
				break;
			case "high":
				$priorityIcon.classList.add("text-red-500");
				break;
		}

		// Days Ago
		const $daysAgo = $todoItem.querySelector(".daysAgo");
		$daysAgo.textContent = formatDistanceToNow(new Date(todoItem.todoDueDate), { addSuffix: true });
		// Today Tag Styling
		const $todayTag = $todoItem.querySelector("[data-component=tag][data-date]");
		$todayTag.classList.toggle("hidden", $todayTag.dataset.date !== new Date(Date.now()).toLocaleDateString());

		return $todoItem;
	}
	createTodoList({ projectName, list }) {
		const $todoList = document.createElement("ul");
		$todoList.setAttribute("id", "todoList");
		$todoList.setAttribute("data-component", "todo-list");
		// $todoList.className = "flex flex-col gap-12";
		$todoList.className =
			"grid grid-flow-col grid-rows-[repeat(2,auto)] auto-cols-[800px] gap-10 overflow-x-scroll snap-x snap-mandatory max-w-[900px] scroll-smooth grid h-full content-center pointer-events-none";

		for (const todo of list) {
			const $todoItem = this.createTodoItem({ todo, projectName });
			$todoList.appendChild($todoItem);
		}
		return $todoList;
	}
	createPagesNumbering() {
		const $pagesNumbering = document.createElement("div");
		$pagesNumbering.setAttribute("id", "pagesNumbering");
		$pagesNumbering.className = "absolute bottom-0 -z-10 left-1/2 -translate-x-1/2 flex gap-4";
		for (let i = 0; i < this.maxPages; i++) {
			const $pageButton = this.createPageButton(i);
			$pagesNumbering.appendChild($pageButton);
		}
		return $pagesNumbering;
	}
	createPageButton(pageNumber) {
		const $pageButton = document.createElement("button");
		$pageButton.className = `${pageNumber + 1 === this.currentPage ? "bg-blue-700" : "bg-green-800 hover:bg-green-600"} text-white p-4 px-6 text-lg font-bold duration-200 ease-in-out`;
		$pageButton.textContent = pageNumber + 1;
		$pageButton.addEventListener("click", (e) => {
			e.preventDefault();
			if (pageNumber + 1 === this.currentPage) return;
			if (pageNumber + 1 > this.currentPage) {
				this.scrollRight(800 * Math.abs(pageNumber + 1 - this.currentPage));
			} else if (pageNumber + 1 < this.currentPage) {
				this.scrollLeft(800 * Math.abs(pageNumber + 1 - this.currentPage));
			}
			this.currentPage = pageNumber + 1;
			this.renderPageNumbering();
		});
		return $pageButton;
	}
	renderTodoList({ projectName, list }) {
		const $todoListContainer = document.querySelector("#todoListContainer");
		$todoListContainer.innerHTML = "";
		const $todoList = this.createTodoList({ projectName, list });
		$todoListContainer.appendChild($todoList);
		this.maxPages = Math.floor($todoList.scrollWidth / 800);

		this.renderPageNumbering();

		this.cacheDOM();

		this.bindEvents();
	}
	renderPageNumbering() {
		const $todoListContainer = document.querySelector("#todoListContainer");
		const $pagesNumbering = this.createPagesNumbering();
		$todoListContainer.appendChild($pagesNumbering);
	}
	bindEvents() {
		this.$todoItems.forEach(($todoItem) => {
			$todoItem.addEventListener("click", (e) => {
				const target = e.target.closest("button,input");
				if (!target) return;

				// Cache DOM
				const $todoItem = e.target.closest("[data-component=todo-item]");
				const todoItemId = $todoItem.dataset.todoId;
				const $title = $todoItem.querySelector(".todoTitle");
				const $description = $todoItem.querySelector(".todoDescription");
				const $dueDate = $todoItem.querySelector(".todoDueDate");
				const priority = $todoItem.dataset.priority;
				const $tags = $todoItem.querySelectorAll(".todoTags [data-component=tag]");
				const projectName = $todoItem.dataset.projectName;

				const $todoDetails = $todoItem.querySelector("#todoDetails");
				const $expandIcon = $todoItem.querySelector("#expandIcon");
				const $collapseIcon = $todoItem.querySelector("#collapseIcon");

				const $indicator = $todoItem.querySelector("#todoDone + div");

				// Bind Events Accroding to ID
				if (target.id === "deleteTodoBtn") {
					this.eventEmitter.emit("deleteTodo", todoItemId);
				} else if (target.id === "editTodoBtn") {
					const data = {
						todoTitle: $title.textContent,
						todoDescription: $description.textContent,
						todoDueDate: new Date($dueDate.textContent).toISOString().slice(0, 10),
						todoPriority: priority,
						tags: [...$tags].map(($tag) => $tag.textContent),
						projectName: projectName,
					};
					this.eventEmitter.emit("openEditTodoForm", { todoId: todoItemId, data });
				} else if (target.id === "detailsBtn") {
					if (target.dataset.action === "expand") {
						this.collapseAllTodoItems();

						$todoItem.classList.add("active");
						target.dataset.action = "collapse";
					} else if (target.dataset.action === "collapse") {
						$todoItem.classList.remove("active");
						target.dataset.action = "expand";
					}

					$expandIcon.classList.toggle("opacity-0");
					$collapseIcon.classList.toggle("opacity-0");
				} else if (target.id === "todoDone") {
					$indicator.addEventListener(
						"transitionend",
						() => {
							this.eventEmitter.emit("doneChecked", todoItemId);
						},
						{ once: true }
					);
				}
			});
			this.$prevBtn.addEventListener("click", (e) => {
				e.stopImmediatePropagation();
				this.throttledHandlePrevBtnClick();
			});
			this.$nextBtn.addEventListener("click", (e) => {
				e.stopImmediatePropagation();
				this.throttledHandleNextBtnClick();
			});
		});
	}
	handlePrevBtnClick() {
		if (this.$todoList.scrollLeft <= 0) return;
		this.scrollLeft();
		console.log("currentPage", this.currentPage);
		if (this.currentPage >= 1) {
			this.updatePageNumber(-1);
			console.log("currentPage", this.currentPage);
			this.renderPageNumbering();
		}
	}
	handleNextBtnClick() {
		if (this.$todoList.scrollLeft >= this.$todoList.scrollWidth) return;
		this.scrollRight();
		if (this.currentPage < this.maxPages) {
			this.updatePageNumber(1);
			this.renderPageNumbering();
		}
	}
	collapseAllTodoItems() {
		this.$todoItems.forEach(($todoItem) => {
			$todoItem.classList.remove("active");
			const $expandIcon = $todoItem.querySelector("#expandIcon");
			const $collapseIcon = $todoItem.querySelector("#collapseIcon");
			const $todoDetailsBtn = $todoItem.querySelector("#detailsBtn");
			$todoDetailsBtn.dataset.action = "expand";
			$expandIcon.classList.remove("opacity-0");
			$collapseIcon.classList.add("opacity-0");
		});
	}
	scrollRight(scrollByValue = 800) {
		this.$todoList.scrollBy({
			top: 0,
			left: scrollByValue,
		});
	}
	scrollLeft(scrollByValue = 800) {
		this.$todoList.scrollBy({
			top: 0,
			left: scrollByValue * -1,
		});
	}
	cacheDOM() {
		this.$todoList = document.querySelector("#todoList");
		this.$prevBtn = document.querySelector("#prevBtn");
		this.$nextBtn = document.querySelector("#nextBtn");
		this.$todoItems = document.querySelectorAll("[data-component=todo-item]");
	}
}
