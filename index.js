// TASK: import helper functions from utils
import { getTasks, createNewTask, patchTask, deleteTask } from './utils/taskFunctions.js';
// TASK: import initialData
import { initialData } from './initialData.js';


/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData));
    localStorage.setItem('showSideBar', 'true')
    console.log('Data initialized in localStorage');
  } else {
    console.log('Data already exists in localStorage');
  }
}

// TASK: Get elements from the DOM
const elements = {
  headerBoardName: document.getElementById('header-board-name'),
  columnDivs: document.querySelectorAll('.column-div'),
  filterDiv: document.getElementById('filterDiv'),
  modalWindow: document.querySelector('.new-task-modal-window'),
  editTaskModal: document.querySelector('.edit-task-modal-window'),
  hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
  showSideBarBtn: document.getElementById('show-side-bar-btn'),
  themeSwitch: document.getElementById('switch'),
  cancelEditBtn: document.getElementById('cancel-edit-btn'),
  cancelAddTaskBtn: document.getElementById('cancel-add-task-btn'),
  createNewTaskBtn: document.getElementById('create-task-btn'),
  addNewTaskBtn: document.getElementById('add-new-task-btn'),
  logo: document.getElementById('logo'),
  buttons: document.querySelectorAll('.board-btn'),
  titleInput: document.getElementById('title-input'),
  description: document.getElementById('desc-input'),
  selectStatus: document.getElementById('select-status'),
  editTitleInput: document.getElementById('edit-task-title-input'),
  editDescription: document.getElementById('edit-task-desc-input'),
  editSelectStatus: document.getElementById('edit-select-status'),
  saveTaskChangesBtn: document.getElementById('save-task-changes-btn'),
  deleteTaskBtn: document.getElementById('delete-task-btn'),
}

let activeBoard = ""

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
    activeBoard = localStorageBoard ? localStorageBoard : boards[0];
    elements.headerBoardName.textContent = activeBoard
    styleActiveBoard(activeBoard)
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.onclick = () => {
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
      styleActiveBoard(activeBoard)
    };
    boardsContainer.appendChild(boardElement);
  });
}


// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName);
  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => {
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener('click', () => {
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}


function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}
/**
*@param {string} boardName
*/
// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => {

    if (btn.textContent === boardName) {
      btn.classList.add('active')
    }
    else {
      btn.classList.remove('active');
    }
  });
}


function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`);
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);

  tasksContainer.appendChild(taskElement);
}




function setupEventListeners() {

  // Cancel editing task event listener
  var cancelEditBtn = document.getElementById('cancel-edit-btn');
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', () => toggleModal(false, elements.editTaskModal));
  }

  // Cancel adding new task event listener
  var cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  if (cancelAddTaskBtn) {
    cancelAddTaskBtn.addEventListener('click', () => {
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
    });
  }

  // Clicking outside the modal to close it
  if (elements.filterDiv) {
    elements.filterDiv.addEventListener('click', () => {
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
    });
  }
  // Show sidebar event listener
  if (elements.hideSideBarBtn) {
    elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(false));
  }

  if (elements.showSideBarBtn) {
    elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(true));
  }

  // Theme switch event listener
  if (elements.themeSwitch) {
    elements.themeSwitch.addEventListener('change', toggleTheme);
  }

  // Show Add New Task Modal event listener
  if (elements.addNewTaskBtn) {
    elements.addNewTaskBtn.addEventListener('click', () => {
      toggleModal(true);
      elements.filterDiv.style.display = 'block'; // Also show the filter overlay
    });
  }

  // Add new task form submission event listener
  if (elements.modalWindow) {
    elements.modalWindow.addEventListener('submit', (event) => {
      addTask(event)
    });
  }
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none';
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault();

  //Assign user input to the task object
  const task = {
    description: elements.description.value,
    title: elements.titleInput.value,
    status: elements.selectStatus.value,
    board: activeBoard

  };
  const newTask = createNewTask(task);
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
    event.target.reset();
    refreshTasksUI();
  }
}


function toggleSidebar(show) {
  const sidebar = document.querySelector('.side-bar');
  sidebar.classList.toggle('show-sidebar', show);
  if (elements.showSideBarBtn) {
    elements.showSideBarBtn.style.display = show ? 'none' : 'block';
  }
  localStorage.setItem('showSideBar', show.toString());
}

function toggleTheme() {
  const themeSwitch = elements.themeSwitch;
  const isLightTheme = themeSwitch.checked;
  document.body.classList.toggle('light-theme', isLightTheme);
  localStorage.setItem('light-theme', isLightTheme ? 'enabled' : 'disabled');
}



function openEditTaskModal(task) {
  // Set task details in modal inputs
  document.getElementById('edit-task-title-input').value = task.title;
  document.getElementById('edit-task-desc-input').value = task.description;
  document.getElementById('edit-select-status').value = task.status;

  // Get button elements from the task modal
  const saveChangesBtn = document.getElementById('save-task-changes-btn');
  const deleteTaskBtn = document.getElementById('delete-task-btn');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');

  // Call saveTaskChanges upon click of Save Changes button
  saveChangesBtn.onclick = () => {
    saveTaskChanges(task.id);
  }

  // Delete task using a helper function and close the task modal
  deleteTaskBtn.onclick = () => {
    deleteTask(task.id);
    toggleModal(false, elements.editTaskModal);
  };

  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}

function saveTaskChanges(taskId) {
  // Get new user inputs
  const updatedTitle = document.getElementById('title-input').value;
  const updatedDescription = document.getElementById('desc-input').value;
  const updatedStatus = document.getElementById('select-status').value;

  // Create an object with the updated task details
  const updatedTask = {
    title: updatedTitle,
    description: updatedDescription,
    status: updatedStatus,
    board: activeBoard
  };

  // Update task using a hlper functoin
  patchTask(taskId, updatedTask);

  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function () {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  initializeData();
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}
