let taskArray = [];
const inputTask = document.getElementById("task")
const addTaskBtn = document.getElementById("add-btn")
const taskList = document.getElementById("task-list")
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
    let displayedTask = ""
    taskArray.forEach((task, index) => {
        displayedTask += `
        <li id="task${index}">
            <input type="checkbox" name="user-task" id="user-task-${index}"/>
            <label for="user-task-${index}"> ${task.text} </label>
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