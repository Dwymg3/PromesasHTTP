document.addEventListener("DOMContentLoaded", () => {
    const modal = document.querySelector("#taskModal");
    const newTaskButton = document.querySelector(".new-task-button");
    const cancelTaskButton = document.querySelector("#cancelTask");
    const darkModeToggle = document.querySelector("#darkModeToggle");
    const taskForm = document.querySelector("#taskForm");
    const taskTitle = document.querySelector("#taskTitle");
    const taskDescription = document.querySelector("#taskDescription");
    const taskAssigned = document.querySelector("#taskAssigned");
    const taskPriority = document.querySelector("#taskPriority");
    const taskDueDate = document.querySelector("#taskDueDate");
    const taskState = document.querySelector("#taskState");
    const searchBar = document.querySelector("#searchBar");

    let editingTask = null;
    let draggedTask = null;

    function openModal(task = null) {
        if (task) {
            taskTitle.value = task.querySelector("h3").textContent;
            taskDescription.value = task.querySelector("p:nth-of-type(1)").textContent;
            taskAssigned.value = task.querySelector("p:nth-of-type(2)").textContent.replace("Asignado a: ", "");
            taskPriority.value = task.querySelector("p:nth-of-type(3)").textContent.replace("Prioridad: ", "");
            taskDueDate.value = task.querySelector("p:nth-of-type(4)").textContent.replace("Fecha límite: ", "");
            taskState.value = task.closest(".column").getAttribute("data-state");
            editingTask = task;
        } else {
            taskTitle.value = "";
            taskDescription.value = "";
            taskAssigned.value = "";
            taskPriority.value = "Low";
            taskDueDate.value = "";
            taskState.value = "Backlog";
            editingTask = null;
        }
        modal.classList.add("is-active");
    }

    newTaskButton.addEventListener("click", () => openModal());

    cancelTaskButton.addEventListener("click", () => {
        modal.classList.remove("is-active");
    });

    document.querySelector(".modal-close").addEventListener("click", () => {
        modal.classList.remove("is-active");
    });

    darkModeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        const section = document.querySelector('.section');
        if(section.classList.contains('dark-mode')){
            section.classList.remove('dark-mode');
        } else{
            section.classList.add('dark-mode');
        }
    });

    function isDateValid(date) {
        const fechaActual = new Date();
        const [añoA, mesA, diaA] = [parseInt(fechaActual.getFullYear()), parseInt(fechaActual.getMonth()) + 1, parseInt(fechaActual.getDate())];
        const separado = date.split("-");
        const [añoD, mesD, diaD] = [parseInt(separado[0]), parseInt(separado[1]), parseInt(separado[2])];
        if (añoD === añoA || añoD > añoA) {
            if (mesD === mesA || mesD > mesA) {
                if (diaD === diaA || diaD > diaA) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    taskForm.addEventListener("submit", (e) => {
        e.preventDefault();

        if (!taskTitle.value || !taskDueDate.value || !taskState.value) {
            alert("Please fill out all required fields.");
            return;
        }

        if (!isDateValid(taskDueDate.value)) {
            alert("Fecha invalida. La fecha ingresada es de un dia anterior al actual");
            return;
        }

        const state = taskState.value.toLowerCase().replace(" ", "-");
        const column = document.querySelector(`#${state}`);

        if (!column) {
            console.error(`Column with ID ${state} not found.`);
            return;
        }

        const newTask = document.createElement("div");
        newTask.className = "box";
        newTask.draggable = true;

        let priorityClass = "";
        if (taskPriority.value === "High") {
            priorityClass = "highPriority";
        } else if (taskPriority.value === "Medium") {
            priorityClass = "mediumPriority";
        } else if (taskPriority.value === "Low") {
            priorityClass = "lowPriority";
        }
        //console.log(priorityClass);
        //console.log(typeof(priorityClass));
        newTask.innerHTML = `         
            <h4 id="${priorityClass}"></h4>
            <h3 class="title is-5">${taskTitle.value}</h3>
            <p>${taskDescription.value || "Sin descripción"}</p>
            <p><strong>Asignado a:</strong> ${taskAssigned.value}</p>
            <p><strong>Prioridad:</strong> ${taskPriority.value}</p>
            <p><strong>Fecha límite:</strong> ${taskDueDate.value}</p>
            <div class="task-actions">
            <button class="button is-info edit-task-button">Edit</button>
            <button class="button is-danger delete-task-button">Delete</button>
            </div>
        `;

        addDragAndDropListeners(newTask);

        if (editingTask) {
            editingTask.replaceWith(newTask);
            column.appendChild(newTask);
            editingTask = null;
        } else {
            column.appendChild(newTask);
        }

        modal.classList.remove("is-active");
        taskForm.reset();
    });

    function addDragAndDropListeners(task) {
        task.addEventListener("dragstart", () => {
            draggedTask = task;
            setTimeout(() => {
                task.classList.add("dragging");
            }, 0);
        });

        task.addEventListener("dragend", () => {
            setTimeout(() => {
                if (draggedTask) {
                    draggedTask.classList.remove("dragging");
                    draggedTask = null;
                }
            }, 0);
        });

        addTaskActionListeners(task); 
    }

    function setupColumns() {
        document.querySelectorAll(".column").forEach(column => {
            column.addEventListener("dragover", (e) => {
                e.preventDefault();
                column.classList.add("over");
            });

            column.addEventListener("dragleave", () => {
                column.classList.remove("over");
            });

            column.addEventListener("drop", () => {
                column.classList.remove("over");
                if (draggedTask) {
                    column.appendChild(draggedTask);
                    draggedTask.classList.remove("dragging");
                    draggedTask = null;
                }
            });
        });
    }

    document.querySelectorAll(".box").forEach(task => addDragAndDropListeners(task));
    setupColumns();

    function filterTasks(query) {
        const tasks = document.querySelectorAll(".box");
        tasks.forEach(task => {
            const title = task.querySelector("h3").textContent.toLowerCase();
            const description = task.querySelector("p:nth-of-type(1)").textContent.toLowerCase();
            const assigned = task.querySelector("p:nth-of-type(2)").textContent.toLowerCase();

            if (title.includes(query) || description.includes(query) || assigned.includes(query)) {
                task.style.display = "block";
            } else {
                task.style.display = "none";
            }
        });
    }

    searchBar.addEventListener("input", () => {
        const query = searchBar.value.toLowerCase();
        filterTasks(query);
    });

    function handleDeleteTask(event) {
        const task = event.target.closest(".box");
        if (task) {
            task.remove();
        }
    }

    function handleEditTask(event) {
        const task = event.target.closest(".box");
        if (task) {
            openModal(task);
        }
    }

    function addTaskActionListeners(task) {
        const editButton = task.querySelector(".edit-task-button");
        const deleteButton = task.querySelector(".delete-task-button");

        if (editButton) {
            editButton.addEventListener("click", handleEditTask);
        }
        if (deleteButton) {
            deleteButton.addEventListener("click", handleDeleteTask);
        }
    }
});
