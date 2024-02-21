import compiledTodoForm from "./templates/todoForm.hbs";
import { addHours, differenceInHours } from "date-fns";
export default class TodoForm {
	constructor(eventEmitter) {
		this.eventEmitter = eventEmitter;
		this.$todoFormDialog = document.querySelector("#todoFormDialog");
		this.$closeButton = this.$todoFormDialog.querySelector("#closeBtn");
		this.mode = "add";
		this.tags = [];
		this.selectedPriority = "low";
		this.initialInputFields = {
			todoTitle: "",
			todoDescription: "",
			todoDueDate: new Date(Date.now()).toISOString().split("T")[0],
			todoPriority: "low",
			tags: [],
			projectName: "",
			existingProjects: [],
		};
		this.eventEmitter.on("projectsUpdated", this.handleProjectsUpdated.bind(this));
		this.eventEmitter.on("openEditTodoForm", this.handleOpenEditTodoForm.bind(this));
	}

	setInputs(data) {
		this.initialInputFields = {
			...this.initialInputFields,
			...data,
		};
	}
	submitData() {
		return {
			todoTitle: this.$todoTitleInput.value,
			todoDescription: this.$todoDescriptionInput.value,
			todoDueDate: new Date(this.$todoDueDateInput.value),
			todoPriority: this.selectedPriority,
			tags: this.tags,
			projectName: this.$projectName.value,
		};
	}
	setPriority(priority) {
		this.selectedPriority = priority;
	}
	setTags(tags) {
		if (typeof tags === "string") {
			const tagsList = tags.split(" ");
			this.tags = this.tags.concat(tagsList);
		} else if (Array.isArray(tags)) {
			this.tags = tags;
		}
	}
	checkTagsExist(tags) {
		for (const tag of tags.split(" ")) {
			if (this.tags.includes(tag)) {
				return true;
			}
		}
	}
	deleteTag(index) {
		this.tags = this.tags.slice(0, index).concat(this.tags.slice(index + 1));
	}
	setProject(projectName) {
		this.$projectName.value = projectName;
	}
	clear() {
		this.mode = "add";
		this.$todoFormDialog.dataset.todoId = "";
		this.tags = [];
		this.initialInputFields = {
			...this.initialInputFields,
			todoTitle: "",
			todoDescription: "",
			todoDueDate: new Date(Date.now()).toISOString().split("T")[0],
			todoPriority: "low",
			tags: [],
		};
	}
	handleProjectsUpdated({ selectedProject, projectsNames }) {
		this.initialInputFields.projectName = selectedProject.name;
		this.initialInputFields.existingProjects = projectsNames;
	}
	handleOpenEditTodoForm({ todoId, data }) {
		this.mode = "edit";
		this.$todoFormDialog.dataset.todoId = todoId;
		this.setInputs(data);
		this.setTags(data.tags);
		this.setPriority(data.todoPriority);
		this.render();
		this.openDialog();
	}
	createForm(inputFields, mode) {
		const $form = document.createElement("form");
		$form.setAttribute("id", "todoForm");
		$form.setAttribute("data-component", "todo-form");
		$form.setAttribute("method", "dialog");
		$form.className = "px-10 flex flex-col gap-10 text-slate-600 w-[550px] max-w-[550px]";
		$form.innerHTML = compiledTodoForm({ inputFields });

		$form.dataset.mode = mode;
		this.updatePriorityOptionsUI(this.initialInputFields.todoPriority, $form);

		this.updateTagsListUI(this.initialInputFields.tags, $form);

		if (mode === "edit") {
			const $formTitle = $form.querySelector("#formTitle");
			const $formSubmitBtn = $form.querySelector("#submitBtn");
			$formTitle.textContent = "Edit Todo";
			$formSubmitBtn.textContent = "Edit";
		}
		return $form;
	}
	render() {
		while (this.$todoFormDialog.lastElementChild.firstElementChild.tagName !== "BUTTON") {
			this.$todoFormDialog.removeChild(this.$todoFormDialog.lastElementChild);
		}
		const $form = this.createForm(this.initialInputFields, this.mode);
		this.$todoFormDialog.appendChild($form);
		this.cacheDOM();

		this.bindEvents();
	}
	bindEvents() {
		this.$todoPrioritySelect.addEventListener("click", (e) => {
			const target = e.target.closest("[data-component=priority-option]");
			if (!target) return;
			const choice = target.dataset.priority;
			this.setPriority(choice);
			this.updatePriorityOptionsUI(choice, this.$formElement);
		});

		this.$projectName.addEventListener("focus", () => {
			this.$projectsOptionsWrapper.classList.add("block");
		});

		this.$formElement.addEventListener("click", (e) => {
			const projectContainer = e.target.closest("#projectContainer");
			if (projectContainer) return;
			this.$projectsOptionsWrapper.classList.remove("block");
		});

		this.$projectName.addEventListener("input", (e) => {
			e.preventDefault();
			this.updateProjectOptionsUI(e.target.value);
		});

		this.$projectsOptions.forEach((option) => {
			option.addEventListener("click", (e) => {
				this.setProject(e.target.value);
				this.$projectsOptionsWrapper.classList.remove("block");
			});
		});
		this.$todoTagsInput.addEventListener("input", (e) => {
			this.$tagsContainer.classList.remove("bg-red-200");
			this.$todoTagsInput.classList.remove("bg-red-200");
		});
		this.$todoTagsInput.addEventListener("keydown", (e) => {
			if (e.key === "Enter") {
				e.preventDefault();
				const tags = this.$todoTagsInput.value;
				if (this.checkTagsExist(tags)) {
					this.$tagsContainer.classList.add("bg-red-200");
					this.$todoTagsInput.classList.add("bg-red-200");
					return;
				}
				this.setTags(tags);
				this.updateTagsListUI(this.tags, this.$formElement);
				this.$todoTagsInput.value = "";
			}
		});

		this.$formElement.addEventListener("submit", (e) => {
			e.preventDefault();
			e.stopImmediatePropagation();
			const data = this.submitData();
			this.eventEmitter.emit("submitFormData", { data, mode: this.mode, todoId: this.$todoFormDialog.dataset.todoId });
			this.closeDialog();
		});

		this.$closeButton.addEventListener("click", (e) => {
			this.$formElement.remove();
			this.closeDialog();
		});
	}
	updateProjectOptionsUI(projectName) {
		this.$projectsOptions.forEach((option) => {
			if (option.value.toUpperCase().indexOf(projectName.toUpperCase()) > -1) {
				option.style.display = "block";
			} else {
				option.style.display = "none";
			}
		});
	}
	updateTagsListUI(tags, $formRef) {
		const $tagsList = $formRef.querySelector("#tagsList");
		while ($tagsList.firstElementChild && $tagsList.firstElementChild !== $tagsList.lastElementChild) {
			$tagsList.removeChild($tagsList.firstElementChild);
		}
		this.createTags(tags, $tagsList);
	}
	createTags(tags, $tagsList) {
		for (const tag of tags) {
			const $tagWrapper = document.createElement("div");
			$tagWrapper.className = "flex items-center gap-2 bg-green-500 text-slate-800 py-1 px-2 rounded-full";
			$tagWrapper.setAttribute("data-component", "tag");
			const $tag = document.createElement("li");
			$tag.innerText = tag;
			const $deleteTagBtn = document.createElement("button");
			$deleteTagBtn.setAttribute("type", "button");
			const deleteIcon = `<div><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>close</title><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" /></svg></div>`;
			$deleteTagBtn.innerHTML = deleteIcon;
			$deleteTagBtn.className = "w-4 aspect-square";
			$deleteTagBtn.addEventListener("click", (e) => {
				const target = e.target.closest("[data-component=tag]");
				if (!target) return;
				const targetIndex = [...$tagsList.children].indexOf(target);
				this.deleteTag(targetIndex);
				this.updateTagsListUI(this.tags, this.$formElement);
			});
			$tagWrapper.appendChild($deleteTagBtn);
			$tagWrapper.appendChild($tag);
			$tagsList.insertAdjacentElement("afterbegin", $tagWrapper);
		}
	}
	updatePriorityOptionsUI(priority, $formRef) {
		const $todoPrioritySelect = $formRef.querySelector("#todoPriority");
		const $priorityOptions = $todoPrioritySelect.querySelectorAll("[data-component=priority-option]");

		$priorityOptions.forEach(($option) => {
			const $priorityIcon = $option.querySelector("#priorityIcon");
			if ($option.dataset.priority === priority) {
				$option.classList.remove("border-r-transparent", "shadow-black/0");
				$option.classList.add("border-r-yellow-500", "shadow-black/20", "-translate-x-3");
				$priorityIcon.classList.remove("scale-90");
			} else {
				$option.classList.remove("border-r-yellow-500", "shadow-black/20", "-translate-x-3");
				$option.classList.add("border-r-transparent", "shadow-black/0");
				$priorityIcon.classList.add("scale-90");
			}
		});
	}
	openDialog() {
		this.$todoFormDialog.showModal();
	}
	closeDialog() {
		this.$todoFormDialog.close();
	}

	cacheDOM() {
		this.$formElement = document.querySelector("#todoForm");
		this.$inputs = this.$formElement.querySelectorAll(":where(input, select, textarea)");
		this.$todoTitleInput = this.$formElement.querySelector("#todoTitle");
		this.$todoDescriptionInput = this.$formElement.querySelector("#todoDescription");
		this.$todoDueDateInput = this.$formElement.querySelector("#todoDueDate");
		this.$todoPrioritySelect = this.$formElement.querySelector("#todoPriority");
		this.$priorityOptions = this.$todoPrioritySelect.querySelectorAll("[data-component=priority-option]");
		this.$projectName = this.$formElement.querySelector("#projectName");
		this.$projectsOptionsWrapper = this.$formElement.querySelector("#projects");
		this.$projectsOptions = this.$projectsOptionsWrapper.querySelectorAll("option");
		this.$todoTagsInput = this.$formElement.querySelector("#tags");
		this.$tagsContainer = this.$formElement.querySelector("#tagsContainer");
		this.$tagsList = this.$formElement.querySelector("#tagsList");
	}
}
