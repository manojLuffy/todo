const taskList = document.getElementById('task-list');
const slayedTaskList = document.getElementById('slayed-task-list');
const newTaskInput = document.getElementById('new-task');
const addTaskButton = document.getElementById('add-task');

// Add task functionality
addTaskButton.addEventListener('click', () => {
  const taskText = newTaskInput.value.trim();
  if (taskText) {
    addTaskToList(taskText);
    newTaskInput.value = ''; // Clear input
    updateTasksInStorage(); // Update storage after adding a task
  }
});

// Add task when Enter key is pressed
newTaskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const taskText = newTaskInput.value.trim();
    if (taskText) {
      addTaskToList(taskText);
      newTaskInput.value = ''; // Clear input
      updateTasksInStorage(); // Update storage after adding a task
    }
  }
});

// Load tasks from storage
chrome.storage.sync.get(['tasks', 'points'], (data) => {
  if (data.tasks) {
    data.tasks.forEach((task) => {
      addTaskToList(task.text, task.completed);
    });
  }

  // if (data.points) {
  //   document.getElementById('points').textContent = data.points;
  // }
});

// Function to add task to the list
function addTaskToList(taskText, completed = false) {
  const listItem = document.createElement('li');
  listItem.innerText = taskText;
  listItem.setAttribute('data-task', taskText);

  const completeButton = createButton('../img/complete.svg', () => {
    listItem.classList.toggle('completed');

    // Remove the task from its current list
    const currentList = listItem.parentNode;
    currentList.removeChild(listItem);

    const targetList = listItem.classList.contains('completed') ? slayedTaskList : taskList;
    targetList.appendChild(listItem); // Move to the appropriate list
    animateListItemTransition(listItem, targetList); // Animate the transition

    updateTasksInStorage();
    updateCompletedTaskCount(); // Update the completed task count
    toggleQuirkyText(); // Toggle quirky text display
    updatePoints(); // Update the user's points
  });

  const removeButton = createButton('../img/remove.svg', () => {
    const currentList = listItem.parentNode;
    animateListItemRemoval(listItem); // Call the animation function before removing the item
    currentList.removeChild(listItem);
    updateTasksInStorage();
    updateCompletedTaskCount();
    toggleQuirkyText();
    updatePoints(); // Update the user's points
  });

  // Create a div to group the buttons
  const groupedButtons = document.createElement('div');
  groupedButtons.classList.add('grouped-buttons');
  groupedButtons.appendChild(completeButton);
  groupedButtons.appendChild(removeButton);
  listItem.appendChild(groupedButtons); // Add the grouped buttons to the list item

  // Determine which list to add the task to based on completion status
  if (completed) {
    listItem.classList.add('completed');
    slayedTaskList.appendChild(listItem);
  } else {
    taskList.appendChild(listItem);
  }

  animateListItemAddition(listItem); // Animate the addition

  updateCompletedTaskCount(); // Update the completed task count
  toggleQuirkyText(); // Toggle quirky text display
  updatePoints(); // Update the user's points
}

function updatePoints() {
  chrome.storage.sync.get('points', (data) => {
    let points = data.points || 0;
    const completedTasks = slayedTaskList.querySelectorAll('li.completed').length;
    points = completedTasks * 10; // Update points based on completed tasks
    document.getElementById('points').textContent = points;
    chrome.storage.sync.set({ points });
  });
}

// Helper function to animate list item addition
function animateListItemAddition(listItem) {
  
    listItem.classList.add('animate-add');
 
}

// Helper function to animate list item transition
function animateListItemTransition(listItem, targetList) {
  listItem.style.transition = 'transform 0.3s ease-in-out';
  listItem.style.transform = 'translateX(100%)';
  setTimeout(() => {
    listItem.style.transform = 'translateX(0)';
    targetList.appendChild(listItem);
  }, 10);
}

// Helper function to animate list item removal

function animateListItemRemoval(listItem) {
  listItem.classList.add('animate-remove'); // Add the animation class
  listItem.addEventListener('animationend', () => {
    setTimeout(() => {
    listItem.remove(); // Remove thbackground.js content.js manifest.json popup README.mde item after the animation completes
    }, 300);
  });
}

// Helper function to update the completed task count
function updateCompletedTaskCount() {
  const completedTasks = slayedTaskList.querySelectorAll('li.completed').length;
  document.getElementById('completed-task-count').textContent = completedTasks;
}

// Helper function to toggle quirky text display
function toggleQuirkyText() {
  const quirkyText = document.getElementById('quirky-text');
  if (slayedTaskList.querySelectorAll('li.completed').length === 0) {
    quirkyText.style.display = 'block'; // Show quirky text if no completed tasks
  } else {
    quirkyText.style.display = 'none'; // Hide quirky text if there are completed tasks
  }
}

// Helper function to create buttons
function createButton(imgSrc, onClick) {
  const button = document.createElement('button');
  const img = document.createElement('img');
  img.src = imgSrc;
  button.appendChild(img);
  button.addEventListener('click', onClick);
  return button;
}

function updateTasksInStorage() {
  const tasks = [];
  let points = 0; // Initialize points to 0

  taskList.querySelectorAll('li').forEach(task => {
    tasks.push({ text: task.innerText, completed: task.classList.contains('completed') });
    if (task.classList.contains('completed')) {
      points += 10; // Award 10 points for each completed task
    }
  });

  slayedTaskList.querySelectorAll('li').forEach(task => {
    tasks.push({ text: task.innerText, completed: task.classList.contains('completed') });
    if (task.classList.contains('completed')) {
      points += 10; // Award 10 points for each completed task
    }
  });

  chrome.storage.sync.set({ tasks, points });
}