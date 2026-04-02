const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const filterButtons = document.querySelectorAll(".filters button");
const taskCounter = document.getElementById("taskCounter");
const searchInput = document.getElementById("searchInput");
const clearSearch = document.getElementById("clearSearch");


let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
// load saved tasks from browser storage.



function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));//save data in browser
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
// ADD THIS FUNCTION TO TOGGLE TASK COMPLETION
function toggleTaskComplete(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        updateNextUpCard();
        updateStats();
    }
}
function renderTasks(filter = "all") {
    currentFilter = filter;  // ADD THIS LINE
    taskList.innerHTML = "";
// function draws tasks on the screen.
let filteredTasks = tasks.filter(task => {
    if (filter === "completed") return task.completed;
    if (filter === "pending") return !task.completed;
    if (filter === "important") return task.important; 
    return true;
});

let searchText = searchInput.value.trim().toLowerCase();
if (searchText !== "") {
    filteredTasks = filteredTasks.filter(task =>
        task.text.toLowerCase().includes(searchText)
    );
}

    filteredTasks.forEach((task, index) => {
        const li = document.createElement("li");
       li.className = `
    ${task.completed ? "completed" : ""}
    ${task.important ? "important" : ""}
`;

    li.innerHTML = `
    <div>
        <span onclick="toggleTask(${index})">${task.important ? "⭐" : ""} ${highlightText(task.text)}</span>
        ${task.dueDate ? `<div style="font-size:12px;color:gray;">📅 ${task.dueDate}</div>` : ""}
    </div>

   <div class="task-buttons">
    <button class="edit-btn" onclick="openInlineEdit(${index})">✎</button>
    <button class="tick-btn" onclick="toggleTask(${index})" title="Mark Complete">${task.completed ? '✓' : '✓'}</button>
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
    renderTasks(currentFilter);
    updateNextUpCard();
;

    taskInput.value = "";
 document.getElementById("dueDate").value = "";
}

function toggleImportant(index) {
    tasks[index].important = !tasks[index].important;
    saveTasks();
    renderTasks(currentFilter);
   


}


function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks(currentFilter);
    updateNextUpCard();


}

function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks(currentFilter);
    updateNextUpCard();



}
function updateStreakBar() {
    const maxStreak = 7; // weekly goal
    const currentStreak = streakData.streak || 0;

    const percent = Math.min((currentStreak / maxStreak) * 100, 100);

    document.getElementById("progressText").textContent =
        `${currentStreak} days unstoppable 🔥`;

    document.getElementById("progressFill").style.width =
        `${percent}%`;
    updateStreakBar();

}
function highlightText(text) {
    const searchText = searchInput.value.trim();

    if (!searchText) return text;

    const regex = new RegExp(`(${searchText})`, "gi");
    return text.replace(regex, `<mark>$1</mark>`);
}

addBtn.addEventListener("click", addTask);


// NEW: Add task when Enter key is pressed
taskInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        addTask();
    }
    if (text === "") return;

});
document.getElementById("progressFill").style.width = "5 days unstoppable";


filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        renderTasks(button.dataset.filter);
    });
});
searchInput.addEventListener("input", () => {
    const value = searchInput.value.trim();

    clearSearch.style.display = value ? "block" : "none";
    renderTasks(currentFilter);

});

clearSearch.addEventListener("click", () => {
    searchInput.value = "";
    clearSearch.style.display = "none";
    renderTasks(currentFilter);

});
// INLINE EDIT FUNCTIONS
let editingIndex = null;
let currentFilter = "all";

function openInlineEdit(index) {
    editingIndex = index;
    const task = tasks[index];
    
    document.getElementById("editTaskInput").value = task.text;
    document.getElementById("editDueDate").value = task.dueDate || "";
    document.getElementById("inlineEditBox").style.display = "flex";
    
    document.getElementById("editTaskInput").focus();
}

function saveEdit() {
    if (editingIndex === null) return;
    
    const newText = document.getElementById("editTaskInput").value.trim();
    const newDueDate = document.getElementById("editDueDate").value;
    
    if (newText === "") {
        alert("Task name cannot be empty!");
        return;
    }
    
    tasks[editingIndex].text = newText;
    tasks[editingIndex].dueDate = newDueDate || null;
    
    saveTasks();
    renderTasks(currentFilter);
    cancelEdit();
}

function cancelEdit() {
    document.getElementById("inlineEditBox").style.display = "none";
    editingIndex = null;
}

// Save on Enter, Cancel on Escape
document.addEventListener("keydown", function(event) {
    if (event.key === "Enter" && editingIndex !== null) {
        saveEdit();
    }
    if (event.key === "Escape" && editingIndex !== null) {
        cancelEdit();
    }
});
// UPDATE NEXT UP CARD WITH ALL UPCOMING TASKS
function updateNextUpCard() {
    const nextUpDiv = document.getElementById("nextUpTask");
    
    // Get all pending tasks and sort by due date
    const pendingTasks = tasks
        .filter(task => !task.completed && task.dueDate)
        .sort((a, b) => {
            return new Date(a.dueDate) - new Date(b.dueDate);
        });
    
    if (pendingTasks.length === 0) {
        nextUpDiv.innerHTML = `<p style="color: #999; text-align: center;">🎉 All tasks completed!</p>`;
    } else {
        let tasksHTML = '';
        pendingTasks.forEach(task => {
            tasksHTML += `
                <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e0e0e0;">
                    <p style="margin: 0 0 5px 0; font-weight: bold; color: #333;"><strong>${task.text}</strong></p>
                    <p style="margin: 0 0 3px 0; color: #ff6b6b; font-weight: bold;">📅 ${task.dueDate || 'No date'}</p>
                    <p style="margin: 0; font-size: 12px; color: #999;">Priority: ${task.important ? '⭐ Important' : '• Normal'}</p>
                </div>
            `;
        });
        nextUpDiv.innerHTML = tasksHTML;
    }
    
    // Update stats
    updateStats();
    updateDailyTasks();

}
// NEW FUNCTION: UPDATE DAILY TASKS CARD (NO DATE TASKS)
function updateDailyTasks() {
    const dailyTasksDiv = document.getElementById("dailyTasksList");
    
    if (!dailyTasksDiv) return; // If card doesn't exist, skip
    
    // Get all pending tasks WITHOUT dates
    const noDatTasks = tasks.filter(task => !task.completed && !task.dueDate);
    
    if (noDatTasks.length === 0) {
        dailyTasksDiv.innerHTML = `<p style="color: #999; text-align: center;">✅ No daily tasks!</p>`;
    } else {
        let tasksHTML = '';
        noDatTasks.forEach(task => {
            tasksHTML += `
                <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e0e0e0;">
                    <p style="margin: 0 0 5px 0; font-weight: bold; color: #333;"><strong>${task.text}</strong></p>
                    <p style="margin: 0; font-size: 12px; color: #999;">Priority: ${task.important ? '⭐ Important' : '• Normal'}</p>
                </div>
            `;
        });
        dailyTasksDiv.innerHTML = tasksHTML;
    }
}

function updateStats() {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Count completed tasks
    let todayCount = 0;
    let weekCount = 0;
    let totalCount = tasks.filter(task => task.completed).length;
    
    tasks.forEach(task => {
        if (task.completed) {
           
            if (task.dueDate === today) {
                todayCount++;
            }
            if (task.dueDate >= weekAgo && task.dueDate <= today) {
                weekCount++;
            }
        }
    });
    
    document.getElementById("todayCompleted").textContent = todayCount;
    document.getElementById("weekCompleted").textContent = weekCount;
    document.getElementById("totalCompleted").textContent = totalCount;
}
renderTasks(currentFilter);
updateNextUpCard();

updateStreakBar();
