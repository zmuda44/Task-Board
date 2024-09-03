// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

// HTML elements
const taskTitleEl = $('#task-title');
const taskDescriptionEl = $('#task-description')
const taskSubmitBtn = $('#task-submit')
const taskDateInputEl = $('#due-date');

// Read the task list from local storage, if none return empty array
function readTasksFromStorage () {
    let tasks = JSON.parse(localStorage.getItem('tasks'))

    if (!tasks) {
        tasks = [];
    }

    return tasks
}

// Save tasks to local storage
function saveTasksToStorage (tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Function to generate a unique task id
function generateTaskId() {
    return Date.now();
}

// Function to create a task card
function createTaskCard(task) {

    const taskCard = $('<div>').addClass('card task-card draggable my-3').attr('data-task-id', task.id)

    const cardHeader = $('<div>').addClass('card-header h4').text(task.title);
    const cardBody = $('<div>').addClass('card-body');

    const cardDescription = $('<p>').addClass('card-text').text(task.description);
    const cardDueDate = $('<p>').addClass('card-text').text(task.dueDate);
    const cardDeleteBtn = $('<button>').addClass('btn btn-danger delete').text('Delete').attr('data-task-id', task.id);

    cardDeleteBtn.on('click', handleDeleteTask);

    if (task.dueDate && task.status !== 'done') {
      const now = dayjs();
      const taskDueDate = dayjs(task.dueDate, 'DD/MM/YYYY');
  
      // ? If the task is due today, make the card yellow. If it is overdue, make it red.
      if (now.isSame(taskDueDate, 'day')) {
        taskCard.addClass('bg-warning text-white');
      } else if (now.isAfter(taskDueDate)) {
        taskCard.addClass('bg-danger text-white');
        cardDeleteBtn.addClass('border-light');
      }
    }

    cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);  //add card due date
    taskCard.append(cardHeader, cardBody);

    return taskCard
}

// Function to render the task list and make cards draggable
function renderTaskList() {
    const tasks = readTasksFromStorage()


    const toDoList = $('#todo-cards')
    toDoList.empty();

    const inProgressList = $('#in-progress-cards')
    inProgressList.empty();

    const doneList = $('#done-cards')
    doneList.empty();

    for (let task of tasks) {
        if (task.status === 'to-do') {
            toDoList.append(createTaskCard(task))
        }
        else if (task.status === 'in-progress') {
            inProgressList.append(createTaskCard(task))
        }
        else if (task.status === 'done') {
            doneList.append(createTaskCard(task))
        }
    }

    $('.draggable').draggable({
        opacity: 0.7,
        zIndex: 100,
        // ? This is the function that creates the clone of the card that is dragged. This is purely visual and does not affect the data.
        helper: function (e) {
          // ? Check if the target of the drag event is the card itself or a child element. If it is the card itself, clone it, otherwise find the parent card  that is draggable and clone that.
          const original = $(e.target).hasClass('ui-draggable')
            ? $(e.target)
            : $(e.target).closest('.ui-draggable');
          // ? Return the clone with the width set to the width of the original card. This is so the clone does not take up the entire width of the lane. This is to also fix a visual bug where the card shrinks as it's dragged to the right.
          return original.clone().css({
            width: original.outerWidth(),
          });
        },
      });
}

// Function to handle adding a new task
function handleAddTask(event){
    event.preventDefault();

    const taskTitle = taskTitleEl.val().trim();
    const taskDueDate = taskDateInputEl.val(); // yyyy-mm-dd format
    const taskDescription = taskDescriptionEl.val()

    const newTask = {
        id: generateTaskId(),
        title: taskTitle,
        description: taskDescription,
        dueDate: taskDueDate,
        status: 'to-do',
    }

    const tasks = readTasksFromStorage();
    tasks.push(newTask)

    saveTasksToStorage(tasks);

    renderTaskList()

    taskTitleEl.val('')
    taskDateInputEl.val('')
    taskDescriptionEl.val('')
}

// Function to handle deleting a task
function handleDeleteTask(event){
    const taskId = $(this).attr('data-task-id');
    const tasks = readTasksFromStorage();

    tasks.forEach((task) => {
      if (task.id == taskId) {
        console.log(typeof(task.id))
        console.log(typeof(taskId))
        tasks.splice(tasks.indexOf(task), 1);
      }
    });
  
    saveTasksToStorage(tasks);
  
    renderTaskList();
}

// Function to handle dropping a task into a new status lane
function handleDrop(event, ui) {

  const tasks = readTasksFromStorage();
  
  // Get the tasks id from the event
  const taskId = ui.draggable[0].dataset.taskId;

  // Get the id of the lane that the card was dropped into
  const newStatus = event.target.id;

  for (let task of tasks) {
    // Find the task card by the `id` and update the task status.
    if (task.id == taskId) {
      task.status = newStatus;
    }
  }
  // Save the updated tasks array to localStorage (overwritting the previous one) and render the new tasks to the screen.
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTaskList()
}


// On page load, render the task list, add event listener to 'add task' button, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    taskSubmitBtn.on('click', handleAddTask);

    renderTaskList()

    $('.lane').droppable({
        accept: '.draggable',
        drop: handleDrop,
      });

    taskDateInputEl.datepicker({
      changeMonth: true,
      changeYear: true,
    });
});
