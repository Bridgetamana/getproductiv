let taskArray = [];
const taskInput = document.getElementById("task")
const addTaskBtn = document.querySelector(".add-task-btn")
const currentTask = document.getElementById("current-task")
const emptyState = document.getElementById("empty-state")
const currentTaskWrapper = document.getElementById("current-task-wrapper")
const showQueueBtn = document.getElementById("show-queue")
const overlay = document.querySelector(".overlay")
const closeQueueBtn = document.querySelector(".close-queue-btn")
const closeInfoBtn = document.getElementById("close-info-btn")
const openInfoBtn = document.querySelector(".open-info-btn")
const infoWrapper = document.querySelector(".info-wrapper")
const queueListWrapper = document.querySelector(".queue-list-wrapper")
const noQueuedTask = document.getElementById("no-queued-task")
const queueWrapper = document.querySelector(".queue-wrapper")
const queuedTasksCount = document.getElementById("queued-tasks-count")
const toast = document.getElementById("toast")
loadTask()

function showToast(message) {
    toast.textContent = message
    toast.classList.add("visible")
    setTimeout(() => {
        toast.classList.remove("visible")
    }, 2500)
}

function updateQueueCount() {
    const queueCount = taskArray.length > 1 ? taskArray.length - 1 : 0
    if (queueCount === 0) {
        queuedTasksCount.textContent = "0 next"
    } else if (queueCount === 1) {
        queuedTasksCount.textContent = "1 next"
    } else {
        queuedTasksCount.textContent = `${queueCount} next`
    }
}

function addTask() {
    if (taskInput.value.trim() === "") {
        showToast("Please enter a task")
        taskInput.focus()
        return
    }
    taskArray.push({ "status": "pending", "text": taskInput.value.trim() })
    displayTask()
    saveTask(taskArray)
    taskInput.value = ""
}

function toggleDisplay(element, show) {
    element.style.display = show ? "block" : "none"
}

taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addTask()
})

addTaskBtn.addEventListener("mousedown", (e) => e.preventDefault())

addTaskBtn.addEventListener("click", () => {
    addTask()
    taskInput.blur()
})

taskInput.addEventListener("focus", () => {
    addTaskBtn.style.opacity = 1
})

taskInput.addEventListener("blur", () => {
    addTaskBtn.style.opacity = 0
})

function displayTask() {
    updateQueueCount()

    if (taskArray.length === 0) {
        emptyState.classList.add("visible")
        currentTaskWrapper.classList.remove("visible")
        currentTask.innerHTML = ""
        queueListWrapper.innerHTML = ""
        noQueuedTask.style.display = "block"
        return
    }

    emptyState.classList.remove("visible")
    currentTaskWrapper.classList.add("visible")

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

    const queuedTasks = taskArray.slice(1)

    if (queuedTasks.length === 0) {
        noQueuedTask.style.display = "block"
        queueListWrapper.innerHTML = ""
    } else {
        noQueuedTask.style.display = "none"
        let queueList = ""
        queuedTasks.forEach((task, index) => {
            queueList += `
                <li>
                    <span>${index + 1}.</span>
                    <label>${task.text}</label>
                </li>
            `
        })
        queueListWrapper.innerHTML = queueList
    }
}

function saveTask(task) {
    return localStorage.setItem("Tasks", JSON.stringify(task))
}

function loadTask() {
    const storedTask = JSON.parse(localStorage.getItem("Tasks")) || []
    taskArray = storedTask
    displayTask()
}

showQueueBtn.addEventListener("click", () => overlay.classList.add("visible"))
closeQueueBtn.addEventListener("click", () => overlay.classList.remove("visible"))
overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.classList.remove("visible")
})

openInfoBtn.addEventListener("click", () => {
    infoWrapper.classList.add("visible")
    closeInfoBtn.style.display = "block"
    openInfoBtn.style.display = "none"
})

closeInfoBtn.addEventListener("click", () => {
    infoWrapper.classList.remove("visible")
    closeInfoBtn.style.display = "none"
    openInfoBtn.style.display = "block"
})

function completeCurrentTask() {
    if (taskArray.length > 0) {
        taskArray.shift()
        displayTask()
        saveTask(taskArray)
    }
}

document.addEventListener("keydown", (e) => {
    if (document.activeElement === taskInput) {
        return
    }

    if (e.key === "Escape") {
        if (overlay.classList.contains("visible")) {
            overlay.classList.remove("visible")
        }
        if (infoWrapper.classList.contains("visible")) {
            infoWrapper.classList.remove("visible")
            closeInfoBtn.style.display = "none"
            openInfoBtn.style.display = "block"
        }
    }

    // Q - Toggle queue
    if (e.key === "q" || e.key === "Q") {
        if (overlay.classList.contains("visible")) {
            overlay.classList.remove("visible")
        } else {
            overlay.classList.add("visible")
        }
    }

    // Space - Complete current task
    if (e.key === " " || e.code === "Space") {
        e.preventDefault()
        completeCurrentTask()
    }

    // N - Focus on new task input
    if (e.key === "n" || e.key === "N") {
        e.preventDefault()
        taskInput.focus()
    }

    // ? - Toggle info/help
    if (e.key === "?") {
        if (infoWrapper.classList.contains("visible")) {
            infoWrapper.classList.remove("visible")
            closeInfoBtn.style.display = "none"
            openInfoBtn.style.display = "block"
        } else {
            infoWrapper.classList.add("visible")
            closeInfoBtn.style.display = "block"
            openInfoBtn.style.display = "none"
        }
    }
})