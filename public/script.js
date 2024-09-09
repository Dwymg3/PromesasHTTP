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
    const baseUrl = "http://localhost:3000/api/tasks";

    let editingTask = null;
    let draggedTask = null;

    function obtenerBack() {

        document.querySelectorAll(".column").forEach(column => {
            const tasks = column.querySelectorAll(".box"); 
            tasks.forEach(task => task.remove());
        });

        fetch(baseUrl)
            .then(response => {
                if (!response.ok) {
                    console.log('Error')
                }
                return response.json();
            })
            .then(data => {
                data.forEach(task => {
                    const column = document.querySelector(`#${task.status.toLowerCase().replace(" ", "-")}`);

                    const newTask = document.createElement("div");
                    newTask.className = "box";
                    newTask.setAttribute("data-id", task.id);
                    newTask.draggable = true;

                    let priorityClass = task.priority === "High" ? "highPriority" : task.priority === "Medium" ? "mediumPriority" : "lowPriority";

                    newTask.innerHTML = `
                        <h4 id="${priorityClass}"></h4>
                        <h3 class="title is-5">${task.title}</h3>
                        <p>${task.description || "Sin descripción"}</p>
                        <p><strong>Asignado a:</strong> ${task.assignedTo}</p>
                        <p><strong>Prioridad:</strong> ${task.priority}</p>
                        <p><strong>Fecha límite:</strong> ${task.endDate}</p>
                        <div class="task-actions">
                            <button class="button is-info edit-task-button">Edit</button>
                            <button class="button is-danger delete-task-button">Delete</button>
                        </div>
                    `;

                    addDragAndDropListeners(newTask);
                    addTaskActionListeners(newTask);

                    column.appendChild(newTask);

                });
            })
            .catch(error => {
                console.log(error);

            });
    }

    obtenerBack();

    // function isDateValid(date) {
    //     const fechaActual = new Date();
    //     const [añoA, mesA, diaA] = [parseInt(fechaActual.getFullYear()), parseInt(fechaActual.getMonth()) + 1, parseInt(fechaActual.getDate())];
    //     const separado = date.split("-");
    //     const [añoD, mesD, diaD] = [parseInt(separado[0]), parseInt(separado[1]), parseInt(separado[2])];
    //     if (añoD === añoA || añoD > añoA) {
    //         if (mesD === mesA || mesD > mesA) {
    //             if (diaD === diaA || diaD > diaA) {
    //                 return true;
    //             } else {
    //                 return false;
    //             }
    //         } else {
    //             return false;
    //         }
    //     } else {
    //         return false;
    //     }
    // }

    function isDateValid(date) {
        const fechaActual = new Date();
        const fechaIngresada = new Date(date);
        return fechaIngresada >= fechaActual;
    }


    function openModal(task = null) {
        if (task) {
            taskTitle.value = task.querySelector("h3").textContent;
            taskDescription.value = task.querySelector("p:nth-of-type(1)").textContent;
            taskAssigned.value = task.querySelector("p:nth-of-type(2)").textContent.replace("Asignado a: ", "");
            taskPriority.value = task.querySelector("p:nth-of-type(3)").textContent.replace("Prioridad: ", "");

            const endDate = task.querySelector("p:nth-of-type(4)").textContent.replace("Fecha límite: ", "");
            const fechaConvertida = new Date(endDate);

            if (!isNaN(fechaConvertida)) {
                const formattedDate = fechaConvertida.toISOString().split('T')[0];
                taskDueDate.value = formattedDate;
            } else {
                taskDueDate.value = "";
            }

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
        if (section.classList.contains('dark-mode')) {
            section.classList.remove('dark-mode');
        } else {
            section.classList.add('dark-mode');
        }
    });

    taskForm.addEventListener("submit", (e) => {
        e.preventDefault();

        if (!taskTitle.value || !taskDueDate.value || !taskState.value) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        if (!isDateValid(taskDueDate.value)) {
            dateError.style.display = "block";
            return;
        } else {
            dateError.style.display = "none";
        }

        const newTaskData = {
            title: taskTitle.value,
            description: taskDescription.value || "Sin descripción",
            assignedTo: taskAssigned.value,
            priority: taskPriority.value,
            endDate: taskDueDate.value,
            status: taskState.value
        };
        if (editingTask) {

            const taskId = editingTask.getAttribute("data-id");
            fetch(`${baseUrl}/${taskId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newTaskData)
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Tarea actualizada:', data);
                    obtenerBack();
                    modal.classList.remove("is-active");
                    //location.reload();
                    taskForm.reset();
                    editingTask = null;
                })
                .catch(error => console.log('Error al actualizar la tarea:', error));
        } else {

            fetch(baseUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newTaskData)
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Tarea creada:', data);
                    obtenerBack();
                    //location.reload();
                    modal.classList.remove("is-active");
                    taskForm.reset();
                })
                .catch(error => console.log('Error al crear tarea:', error));
        }
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
                    const currentStatus = draggedTask.closest(".column").getAttribute("data-state");
                    const newStatus = column.getAttribute("data-state");
                    const taskId = draggedTask.getAttribute("data-id");

                    if (currentStatus !== newStatus) {
                        fetch(`${baseUrl}/${taskId}`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({ status: newStatus })
                        })
                            .then(response => response.json())
                            .then(data => {
                                console.log('Estado de la tarea actualizado:', data);
                                obtenerBack();
                            })
                            .catch(error => console.log('Error al actualizar el estado:', error));

                        draggedTask.classList.remove("dragging");
                        draggedTask = null;
                    }
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
        const taskId = task.getAttribute("data-id");

        if (taskId && confirm("¿Estás seguro de que deseas eliminar esta tarea?")) {
            fetch(`${baseUrl}/${taskId}`, {
                method: "DELETE"
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Error al eliminar la tarea');
                    }
                    task.remove();
                    console.log('Tarea eliminada');
                    if (modal.classList.contains("is-active")) {
                        modal.classList.remove("is-active");
                        editingTask = null;
                        taskForm.reset();
                    }
                })
                .catch(error => console.log('Error:', error));
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
