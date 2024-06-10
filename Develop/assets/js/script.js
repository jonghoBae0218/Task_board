//DEPENDENCIES
const dialogFormEl = $('#formModal');
const taskNameEl = $('#task');
const taskDateEl = $('#date');
const taskDescEl = $('#description');
const modalSubmitEl = $('#modalSubmit');




// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));


// A function to generate a unique task id
function generateTaskId() {
    
    // console.log()
    return crypto.randomUUID();
}

//  A function to create a task card
function createTaskCard(task) {
   
    // Make card body and add classes
    const taskCard = $('<div>')
        .addClass('card project-card draggable my-3')
        .attr('data-project-id', task.id);
    // save input info to const
    const cardHeader = $('<div>').addClass('card-header h4').text(task.name);
    const cardBody = $('<div>').addClass('card-body');
    const cardDescription = $('<p>').addClass('card-text').text(task.description);
    const cardDueDate = $('<p>').addClass('card-text').text(task.date);
    const cardDeleteBtn = $('<button>')
        .addClass('btn btn-danger delete')
        .text('Delete')
        .attr('data-project-id', task.id);
    // If the button is clicked, call handleDeleteTask
    cardDeleteBtn.on('click', handleDeleteTask);

//   If it is not in done section, give color based on due date.
  if (task.date && task.status !== 'done') {
    const now = dayjs();
    const taskDueDate = dayjs(task.date, 'DD/MM/YYYY');

   
    if (now.isSame(taskDueDate, 'day')) {
      taskCard.addClass('bg-warning text-white');
    } else if (now.isAfter(taskDueDate)) {
      taskCard.addClass('bg-danger text-white');
      cardDeleteBtn.addClass('border-light');
    }
  }

  
  cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
  taskCard.append(cardHeader, cardBody);
  return taskCard;
}

// A function to render the task list and make cards draggable
function renderTaskList() {
    const projects = readProjectsFromStorage();

  // Empty existing project cards out of the lanes
    const todoList = $('#todo-cards');
    todoList.empty();

     const inProgressList = $('#in-progress-cards');
     inProgressList.empty();

     const doneList = $('#done-cards');
     doneList.empty();

  // Loop through projects and create project cards for each status
    for (let project of projects) {
      if (project.status === 'to-do') {
          todoList.append(createTaskCard(project));
        } else if (project.status === 'in-progress') {
        inProgressList.append(createTaskCard(project));
        } else if (project.status === 'done') {
        doneList.append(createTaskCard(project));
        }
    }

    // Use JQuery UI to make task cards draggable
    $('.draggable').draggable({
        opacity: 0.7,
        zIndex: 100,
        // This is the function that creates the clone of the card that is dragged. This is purely visual and does not affect the data.
        helper: function (e) {
        // Check if the target of the drag event is the card itself or a child element. If it is the card itself, clone it, otherwise find the parent card  that is draggable and clone that.
        const original = $(e.target).hasClass('ui-draggable')
            ? $(e.target)
            : $(e.target).closest('.ui-draggable');
        // Return the clone with the width set to the width of the original card. This is so the clone does not take up the entire width of the lane. This is to also fix a visual bug where the card shrinks as it's dragged to the right.
        return original.clone().css({
            width: original.outerWidth(),
        });
        },
    });
}

// A function to handle adding a new task
function handleAddTask(event){
    
    // Create newTask object
    newTask = {
        id: generateTaskId(),
        // name: taskNameEl.val(),
        name: 'some name',
        date: taskDateEl.val(),
        description: taskDescEl.val().trim(),
        status: 'to-do',
    };
    
    // Call projects and add new task
    const projects = readProjectsFromStorage();
    projects.push(newTask);

    // Save the updated projects array to localStorage
    saveProjectsToStorage(projects);
    // Update the view
    renderTaskList();
    
}

// A function to handle deleting a task
function handleDeleteTask(event){

    const projectId = $(this).attr('data-project-id');
    const projects = readProjectsFromStorage();

  // Remove project from the array
    projects.forEach((project) => {
        if (project.id === projectId) {
        // console.log(projectId);
        projects.splice(projects.indexOf(project), 1);
        }
    });
    saveProjectsToStorage(projects);
    renderTaskList();

}

// A function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    
    // Read projects from localStorage
  const projects = readProjectsFromStorage();

  // Get the project id from the event
  const taskId = ui.draggable[0].dataset.projectId;

  // Get the id of the lane that the card was dropped into
  const newStatus = event.target.id;

  for (let project of projects) {
    // Find the project card by the `id` and update the project status.
    if (project.id === taskId) {
      project.status = newStatus;
    }
  }
  // Save the updated projects array to localStorage (overwritting the previous one) and render the new project data to the screen.
  localStorage.setItem('projects', JSON.stringify(projects));
  renderTaskList();
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    renderTaskList();

    modalSubmitEl.click(handleAddTask);
    $('#taskDueDate').datepicker({
    changeMonth: true,
    changeYear: true,
  });

  // Make lanes droppable
  $('.lane').droppable({
    accept: '.draggable',
    drop: handleDrop,
  });

});


function readProjectsFromStorage() {
    // Retrieve projects from localStorage and parse the JSON to an array.
    let projects = JSON.parse(localStorage.getItem('projects'));
  
    // If no projects were retrieved from localStorage, assign projects to a new empty array to push to later.
    if (!projects) {
      projects = [];
    }
  
    // Return the projects array either empty or with data in it whichever it was determined to be by the logic right above.
    return projects;
}


function saveProjectsToStorage(projects){
    localStorage.setItem('projects', JSON.stringify(projects));
}




