const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const filterButtons = document.querySelectorAll(".filters button");
const taskCounter = document.getElementById("taskCounter");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
// load saved tasks from browser storage.



function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}
tasks = tasks.map(task => ({
    text: task.text,
    completed: task.completed,
    dueDate: task.dueDate || null,
    important: task.important || false
}));
saveTasks();

// This stores tasks permanently in the browser.
// Without this tasks disappear on refresh

function renderTasks(filter = "all") {
    taskList.innerHTML = "";
// function draws tasks on the screen.

    let filteredTasks = tasks.filter(task => {
        if (filter === "completed") return task.completed;
        if (filter === "pending") return !task.completed;
        if (filter === "important") return task.important; 
        return true;
    });

    filteredTasks.forEach((task, index) => {
        const li = document.createElement("li");
       li.className = `
    ${task.completed ? "completed" : ""}
    ${task.important ? "important" : ""}
`;

    li.innerHTML = `
    <div>
        <span onclick="toggleTask(${index})">${task.important ? "⭐" : ""} ${task.text}</span>
        ${task.dueDate ? `<div style="font-size:12px;color:gray;">📅 ${task.dueDate}</div>` : ""}
    </div>

    <div>
        <button onclick="toggleImportant(${index})">!</button>
        <button onclick="deleteTask(${index})">X</button>
    </div>
`;
        taskList.appendChild(li);
    });

    taskCounter.textContent = `Total Tasks: ${tasks.length}`;
}

function addTask() {
    const text = taskInput.value.trim();
    if (text === "") return;

    const dueDate = document.getElementById("dueDate").value;

tasks.push({
    text: text,
    completed: false,
    dueDate: dueDate || null,
    important: false   // NEW PROPERTY
});
 saveTasks();
    renderTasks();
    taskInput.value = "";
 document.getElementById("dueDate").value = "";
}

function toggleImportant(index) {
    tasks[index].important = !tasks[index].important;
    saveTasks();
    renderTasks();
}


function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();

}

addBtn.addEventListener("click", addTask);


// NEW: Add task when Enter key is pressed
taskInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        addTask();
    }
    if (text === "") return;

});


filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        renderTasks(button.dataset.filter);
    });
});

renderTasks();
