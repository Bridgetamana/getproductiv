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
const pipBtn = document.getElementById("pip-btn")
let pipWindow = null

let audioContext = null

function getAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume()
    }
    return audioContext
}

loadTask()

function showToast(message) {
    toast.textContent = message
    toast.classList.add("visible")
    setTimeout(() => {
        toast.classList.remove("visible")
    }, 2500)
}

function deleteQueuedTask(index) {
    const actualIndex = index + 1
    if (actualIndex > 0 && actualIndex < taskArray.length) {
        taskArray.splice(actualIndex, 1)
        displayTask()
        saveTask(taskArray)
        showToast("Task removed")
    }
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
        playCompletionSound()
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
                    <button class="delete-queued-task hover" data-index="${index}" aria-label="Delete task">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </li>
            `
        })
        queueListWrapper.innerHTML = queueList

        queueListWrapper.querySelectorAll(".delete-queued-task").forEach(btn => {
            btn.addEventListener("click", function () {
                const index = parseInt(this.dataset.index)
                deleteQueuedTask(index)
            })
        })
    }

    if (pipWindow) {
        renderPipContent()
    }
}

function saveTask(task) {
    return localStorage.setItem("Tasks", JSON.stringify(task))
}

function loadTask() {
    const storedTask = JSON.parse(localStorage.getItem("Tasks")) || []
    taskArray = storedTask
    displayTask()
    handleShortcutAction()
}

function handleShortcutAction() {
    const urlParams = new URLSearchParams(window.location.search)
    const action = urlParams.get('action')

    if (action === 'new-task') {
        setTimeout(() => {
            taskInput.focus()
        }, 100)
        window.history.replaceState({}, document.title, window.location.pathname)
    } else if (action === 'view-queue') {
        setTimeout(() => {
            overlay.classList.add("visible")
        }, 100)
        window.history.replaceState({}, document.title, window.location.pathname)
    }
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
        playCompletionSound()
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

function isPipSupported() {
    return "documentPictureInPicture" in window
}

if (!isPipSupported()) {
    pipBtn.classList.add("hidden")
}

function getCurrentTaskText() {
    if (taskArray.length === 0) {
        return null
    }
    return taskArray[0].text
}

function getQueueStatus() {
    const remaining = taskArray.length - 1
    if (remaining <= 0) return ""
    return remaining === 1 ? "1 more" : `${remaining} more`
}

async function openPip() {
    if (!("documentPictureInPicture" in window)) {
        showToast("Mini window not available")
        return
    }

    try {
        pipWindow = await documentPictureInPicture.requestWindow({
            width: 340,
            height: 160
        })

        const style = pipWindow.document.createElement("style")
        style.textContent = `
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: "Open Sans", -apple-system, BlinkMacSystemFont, sans-serif;
                background: #121212;
                color: #f0f0f0;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                height: 100vh;
                padding: 20px;
            }
            .pip-content {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
            }
            .pip-task {
                font-size: 1.25rem;
                font-weight: 600;
                line-height: 1.4;
                color: #f0f0f0;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
            }
            .pip-empty {
                text-align: center;
            }
            .pip-empty-icon {
                font-size: 2.5rem;
                margin-bottom: 8px;
            }
            .pip-empty-text {
                color: #888;
                font-size: 0.9rem;
            }
            .pip-footer {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-top: 16px;
            }
            .pip-queue {
                font-size: 0.8rem;
                color: #666;
            }
            .pip-btn {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                border: none;
                background: #197278;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.15s ease;
            }
            .pip-btn:hover { 
                background: #1a8a91;
                transform: scale(1.05); 
            }
            .pip-btn:active { transform: scale(0.95); }
            .pip-btn svg { width: 24px; height: 24px; }
        `
        pipWindow.document.head.appendChild(style)

        const container = pipWindow.document.createElement("div")
        container.id = "pip-container"
        pipWindow.document.body.appendChild(container)

        renderPipContent()

        pipWindow.addEventListener("pagehide", () => {
            pipWindow = null
        })

    } catch (e) {
        console.log("PiP failed:", e)
        showToast("Could not open mini window")
    }
}

function renderPipContent() {
    if (!pipWindow) return

    const container = pipWindow.document.getElementById("pip-container")
    if (!container) return

    const taskText = getCurrentTaskText()
    const queueStatus = getQueueStatus()

    if (!taskText) {
        container.innerHTML = `
            <div class="pip-content">
                <div class="pip-empty">
                    <div class="pip-empty-icon">✨</div>
                    <div class="pip-empty-text">All clear! Add a task to get started.</div>
                </div>
            </div>
        `
    } else {
        container.innerHTML = `
            <div class="pip-content">
                <div class="pip-task">${escapeHtml(taskText)}</div>
            </div>
            <div class="pip-footer">
                <span class="pip-queue">${queueStatus}</span>
                <button class="pip-btn" id="pip-complete" aria-label="Complete task">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M5 13l4 4L19 7"/>
                    </svg>
                </button>
            </div>
        `

        pipWindow.document.getElementById("pip-complete").addEventListener("click", () => {
            completeCurrentTask()
            playCompletionSound()
            renderPipContent()
        })
    }
}

function escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
}

function closePip() {
    if (pipWindow) {
        pipWindow.close()
        pipWindow = null
    }
}

function playCompletionSound() {
    try {
        const ctx = getAudioContext()
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)

        oscillator.frequency.setValueAtTime(880, ctx.currentTime)
        oscillator.type = "sine"

        gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)

        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.3)
    } catch (e) {
    }
}

pipBtn.addEventListener("click", openPip)

document.addEventListener("click", () => {
    if (Notification.permission === "default") {
        Notification.requestPermission()
    }
}, { once: true })