let taskArray = [];
const inputTask = document.getElementById("task")
const addTaskBtn = document.getElementById("add-btn")
const taskList = document.getElementById("task-list")
const noTask = document.getElementById("no-task")
loadTask()

addTaskBtn.addEventListener("click", function () {
    if (inputTask.value !== "") {
        taskArray.push({ "status": "pending", "text": inputTask.value })
        displayTask()
        saveTask(taskArray)
        inputTask.value = ""
    } else {
        alert("Add a task!")
    }
})

function displayTask() {
    if (taskArray.length !== 0) {
        noTask.style.display = "none"
    }
    let displayedTask = ""
    taskArray.forEach((task, index) => {
        displayedTask += `
            <li id="task${index}" class="task-item">
            <label for="user-task-${index}"> ${task.text} </label>
            <button id="user-task-${index}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30" color="#dfd7d7ff" fill="none" stroke="#dfd7d7ff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M5 14.5C5 14.5 6.5 14.5 8.5 18C8.5 18 14.0588 8.83333 19 7" />
</svg></button>
            </li>
            `
    })
    taskList.innerHTML = displayedTask

    taskArray.forEach((task, index) => {
        const li = document.getElementById(`task${index}`)
        if (!li) return
        li.addEventListener("click", function () {
            taskArray.splice(index, 1)
            displayTask()
            saveTask(taskArray)
        })
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