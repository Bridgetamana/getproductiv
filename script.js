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
const timerDisplay = document.getElementById("timer-display")
const timerMinutesInput = document.getElementById("timer-minutes")
const timerSecondsInput = document.getElementById("timer-seconds")
const timerStartBtn = document.getElementById("timer-start")
const timerPauseBtn = document.getElementById("timer-pause")
const timerResetBtn = document.getElementById("timer-reset")
let timerInterval = null
let timerRunning = false
let timerSecondsLeft = 25 * 60
let savedMinutes = 25
let savedSeconds = 0

// Audio context for mobile compatibility - created once and reused
let audioContext = null

function getAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }
    // Resume if suspended (required for mobile browsers)
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

    // P - Toggle timer (start/pause)
    if (e.key === "p" || e.key === "P") {
        e.preventDefault()
        toggleTimer()
    }
})

function getTimerValues() {
    const mins = parseInt(timerMinutesInput.value) || 0
    const secs = parseInt(timerSecondsInput.value) || 0
    return { mins, secs }
}

function updateTimerDisplay() {
    const minutes = Math.floor(timerSecondsLeft / 60)
    const seconds = timerSecondsLeft % 60
    timerMinutesInput.value = minutes.toString().padStart(2, "0")
    timerSecondsInput.value = seconds.toString().padStart(2, "0")
    if (timerRunning) {
        document.title = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")} - Getproductiv`
    }
}

function startTimer() {
    if (timerRunning) return
    const { mins, secs } = getTimerValues()
    savedMinutes = mins
    savedSeconds = secs
    timerSecondsLeft = (mins * 60) + secs

    if (timerSecondsLeft <= 0) {
        showToast("Set a time first")
        return
    }

    timerRunning = true
    timerStartBtn.style.display = "none"
    timerPauseBtn.style.display = "flex"
    timerDisplay.classList.add("running")

    timerInterval = setInterval(() => {
        timerSecondsLeft--
        updateTimerDisplay()

        if (timerSecondsLeft <= 0) {
            timerComplete()
        }
    }, 1000)
}

function pauseTimer() {
    timerRunning = false
    timerStartBtn.style.display = "flex"
    timerPauseBtn.style.display = "none"
    timerDisplay.classList.remove("running")

    if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
    }

    document.title = "Getproductiv - Focus on one task at a time"
}

function resetTimer() {
    pauseTimer()
    timerSecondsLeft = (savedMinutes * 60) + savedSeconds
    updateTimerDisplay()
}

function toggleTimer() {
    if (timerRunning) {
        pauseTimer()
    } else {
        startTimer()
    }
}

function timerComplete() {
    pauseTimer()
    playTimerSound()
    if (Notification.permission === "granted") {
        new Notification("Getproductiv", {
            body: "Time's up!",
            icon: "./assets/icons/android-chrome-192x192.png"
        })
    }

    showToast("Time's up!")
}

function playTimerSound() {
    try {
        const ctx = getAudioContext()
        const frequencies = [523.25, 659.25, 783.99, 1046.50]
        frequencies.forEach((freq, i) => {
            const oscillator = ctx.createOscillator()
            const gainNode = ctx.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(ctx.destination)

            oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15)
            oscillator.type = "sine"

            gainNode.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.15)
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.5)

            oscillator.start(ctx.currentTime + i * 0.15)
            oscillator.stop(ctx.currentTime + i * 0.15 + 0.5)
        })
    } catch (e) {
        console.log("Audio not available:", e)
    }
}

timerStartBtn.addEventListener("click", startTimer)
timerPauseBtn.addEventListener("click", pauseTimer)
timerResetBtn.addEventListener("click", resetTimer)

timerMinutesInput.addEventListener("change", () => {
    let val = parseInt(timerMinutesInput.value) || 0
    val = Math.max(0, Math.min(99, val))
    timerMinutesInput.value = val.toString().padStart(2, "0")
    timerSecondsLeft = (val * 60) + (parseInt(timerSecondsInput.value) || 0)
})

timerSecondsInput.addEventListener("change", () => {
    let val = parseInt(timerSecondsInput.value) || 0
    val = Math.max(0, Math.min(59, val))
    timerSecondsInput.value = val.toString().padStart(2, "0")
    timerSecondsLeft = ((parseInt(timerMinutesInput.value) || 0) * 60) + val
})

timerMinutesInput.addEventListener("focus", () => timerMinutesInput.select())
timerSecondsInput.addEventListener("focus", () => timerSecondsInput.select())

document.addEventListener("click", () => {
    if (Notification.permission === "default") {
        Notification.requestPermission()
    }
}, { once: true })
updateTimerDisplay()