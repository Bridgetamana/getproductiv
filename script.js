let taskArray = [];
const taskInput = document.getElementById("task")
const addTaskBtn = document.getElementById("add-task-btn")
const currentTask = document.getElementById("current-task")
const emptyState = document.getElementById("empty-state")
const showQueueBtn = document.getElementById("show-queue")
const overlay = document.querySelector(".overlay")
const closeQueueBtn = document.querySelector(".close-queue-btn")
loadTask()

addTaskBtn.addEventListener("click", function () {
    if (taskInput.value !== "") {
        taskArray.push({ "status": "pending", "text": taskInput.value })
        displayTask()
        saveTask(taskArray)
        taskInput.value = ""
    } else {
        alert("Add a task!")
    }
})

function displayTask() {
    if (taskArray.length === 0) {
        emptyState.style.display = "block"
        currentTask.innerHTML = ""
        return
    }

    emptyState.style.display = "none"

    const li = document.createElement("li")
    li.classList.add("task-item")
    li.innerHTML = `
        <label>${taskArray[0].text}</label>
        <button class="complete-task-btn hover"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30" color="#dfd7d7ff" fill="none" stroke="#dfd7d7ff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 14.5C5 14.5 6.5 14.5 8.5 18C8.5 18 14.0588 8.83333 19 7" />
        </svg></button>
    `

    currentTask.innerHTML = ""
    currentTask.appendChild(li)

    li.querySelector(".complete-task-btn").addEventListener("click", function () {
        taskArray.shift()
        displayTask()
        saveTask(taskArray)
    })
}

function saveTask(task) {
    return localStorage.setItem("Tasks", JSON.stringify(task))
}

function loadTask() {
    const storedTask = JSON.parse(localStorage.getItem("Tasks")) || []
    taskArray = storedTask
    displayTask()
}

showQueueBtn.addEventListener("click", () => {
    overlay.style.display = "flex"
})

closeQueueBtn.addEventListener("click", () => {
    overlay.style.display = "none"
})