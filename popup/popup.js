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
chrome.storage.sync.get('tasks', (data) => {
  if (data.tasks) {
    data.tasks.forEach((task) => {
      addTaskToList(task.text, task.completed); // Pass the task text and completion status
    });
  }
});

// Function to add task to the list
function addTaskToList(taskText, completed = false) {
  const listItem = document.createElement('li');
  listItem.innerText = taskText;
  listItem.setAttribute('data-task', taskText);

  const completeButton = createButton('../img/complete.svg', () => {
    listItem.classList.toggle('completed');
    const targetList = listItem.classList.contains('completed') ? slayedTaskList : taskList;
    targetList.appendChild(listItem); // Move to the appropriate list
    updateTasksInStorage();
    updateCompletedTaskCount(); // Update the completed task count
    toggleQuirkyText(); // Toggle quirky text display
  });

  const removeButton = createButton('../img/remove.svg', () => {
    listItem.classList.add('animate-remove');
    // Function to remove the list item after animation
    const removeListItem = () => {
      listItem.remove();
      updateTasksInStorage();
      updateCompletedTaskCount(); // Update the completed task count
      toggleQuirkyText(); // Toggle quirky text display
    };
    // Ensure animation class is removed before actual removal
    listItem.addEventListener('animationend', removeListItem, { once: true }); // Use { once: true } to remove the listener after it's triggered
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

  updateCompletedTaskCount(); // Update the completed task count
  toggleQuirkyText(); // Toggle quirky text display
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

// Update tasks in storage
function updateTasksInStorage() {
  const tasks = [];
  taskList.querySelectorAll('li').forEach(task => tasks.push({ text: task.innerText, completed: task.classList.contains('completed') }));
  slayedTaskList.querySelectorAll('li').forEach(task => tasks.push({ text: task.innerText, completed: task.classList.contains('completed') }));
  chrome.storage.sync.set({ tasks });
}