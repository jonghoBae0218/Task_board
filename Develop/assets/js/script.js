//DEPENDENCIES
const dialogFormEl = $('#formModal');
const taskNameEl = $('#task');
const taskDateEl = $('#date');
const taskDescEl = $('#description');
const modalSubmitEl = $('#modalSubmit');




// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));


// Todo: create a function to generate a unique task id
function generateTaskId() {
    
    // console.log()
    return crypto.randomUUID();
}

// Todo: create a function to create a task card
function createTaskCard(task) {
   //입력값으로 카드 만들어서 리턴
//    task.()

const taskCard = $('<div>')
    .addClass('card project-card draggable my-3')
    .attr('data-project-id', task.id);
  const cardHeader = $('<div>').addClass('card-header h4').text(task.name);
  const cardBody = $('<div>').addClass('card-body');
  const cardDescription = $('<p>').addClass('card-text').text(task.description);
  const cardDueDate = $('<p>').addClass('card-text').text(task.date);
  const cardDeleteBtn = $('<button>')
    .addClass('btn btn-danger delete')
    .text('Delete')
    .attr('data-project-id', task.id);
  cardDeleteBtn.on('click', handleDeleteTask);

  
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

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
    //로컬에서 불러와서 출력, 각 항목 드래거블
    const projects = readProjectsFromStorage();

  // ? Empty existing project cards out of the lanes
  const todoList = $('#todo-cards');
  todoList.empty();

  const inProgressList = $('#in-progress-cards');
  inProgressList.empty();

  const doneList = $('#done-cards');
  doneList.empty();

  // ? Loop through projects and create project cards for each status
  for (let project of projects) {
    if (project.status === 'to-do') {
      todoList.append(createTaskCard(project));
    } else if (project.status === 'in-progress') {
      inProgressList.append(createTaskCard(project));
    } else if (project.status === 'done') {
      doneList.append(createTaskCard(project));
    }
  }

  // ? Use JQuery UI to make task cards draggable
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

// Todo: create a function to handle adding a new task
function handleAddTask(event){
    console.log("INIT");
    console.log(taskNameEl);
    //새로운거 만든거 프로젝스에 푸시, 저장, 랜더
    newTask = {
        id: generateTaskId(),
        // name: taskNameEl.val(),
        name: 'some name',
        date: taskDateEl.val(),
        description: taskDescEl.val().trim(),
        status: 'to-do',
    };
    
    const projects = readProjectsFromStorage();
    projects.push(newTask);

    // ? Save the updated projects array to localStorage
    saveProjectsToStorage(projects);
    // console.log(readProjectsFromStorage());
    renderTaskList();
    
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event){
    console.log("DEL INIT");
    //버튼 눌린놈 프로젝스에서 제거, 저장 , 랜더
    const projectId = $(this).attr('data-project-id');
    // console.log(projectId);
  const projects = readProjectsFromStorage();

  // ? Remove project from the array. There is a method called `filter()` for this that is better suited which we will go over in a later activity. For now, we will use a `forEach()` loop to remove the project.
  projects.forEach((project) => {
    if (project.id === projectId) {
    // console.log(projectId);
      projects.splice(projects.indexOf(project), 1);
    }
  });
  saveProjectsToStorage(projects);
  renderTaskList();

}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    //어디로 떨어졌나 보고 프로젝스에서 해당 요소 상태 바꾸기, 프로젝스에 푸시, 저장
    // ? Read projects from localStorage
  const projects = readProjectsFromStorage();

  // ? Get the project id from the event
  const taskId = ui.draggable[0].dataset.projectId;

  // ? Get the id of the lane that the card was dropped into
  const newStatus = event.target.id;

  for (let project of projects) {
    // ? Find the project card by the `id` and update the project status.
    if (project.id === taskId) {
      project.status = newStatus;
    }
  }
  // ? Save the updated projects array to localStorage (overwritting the previous one) and render the new project data to the screen.
  localStorage.setItem('projects', JSON.stringify(projects));
  renderTaskList();
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    
    modalSubmitEl.click(handleAddTask);
    $('#taskDueDate').datepicker({
    changeMonth: true,
    changeYear: true,
  });

  // ? Make lanes droppable
  $('.lane').droppable({
    accept: '.draggable',
    drop: handleDrop,
  });

});


function readProjectsFromStorage() {
    // ? Retrieve projects from localStorage and parse the JSON to an array.
    // ? We use `let` here because there is a chance that there are no projects in localStorage (which means the projects variable will be equal to `null`) and we will need it to be initialized to an empty array.
    let projects = JSON.parse(localStorage.getItem('projects'));
  
    // ? If no projects were retrieved from localStorage, assign projects to a new empty array to push to later.
    if (!projects) {
      projects = [];
    }
  
    // ? Return the projects array either empty or with data in it whichever it was determined to be by the logic right above.
    return projects;
}
function saveProjectsToStorage(projects){

    localStorage.setItem('projects', JSON.stringify(projects));
}




