// Tasks UI
const taskList = document.getElementById("task-list");
const slayedTaskList = document.getElementById("slayed-task-list");
const newTaskInput = document.getElementById("new-task");
const addTaskButton = document.getElementById("add-task");

// Gamification UI elements
const levelNameElement = document.getElementById("level-name");
const slayerPointsElement = document.getElementById("slayer-points");
const levelProgressElement = document.getElementById("level-progress");
const pointsAnimationContainer = document.getElementById("points-animation-container");

const levelUpModal = document.getElementById("level-up-modal");
const closeModalButton = document.getElementById("close-modal");
const newLevelNameElement = document.getElementById("new-level-name");

const confettiContainer = document.getElementById("confetti-container");
const numberOfConfetti = 30; // Adjust as needed

// Audio
const taskCompleteSound = new Audio("../audio/task_done.mp3");

// Dark Mode Toggle
const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');

// Check for user's dark mode preference on load
const isDarkMode = localStorage.getItem("darkMode") === "enabled";

let removeButtonSrc;
let todoSrc;
let completeSrc;

// Load icons initially
if (isDarkMode) {
	toggleSwitch.checked = true;
	document.body.classList.add("dark-mode");
	addTaskButton.src = "../img/add_dark.svg"; // Set dark mode icon
	removeButtonSrc = "../img/remove_dark.svg";
	todoSrc = "../img/todo_dark.svg";
	completeSrc = "../img/complete_dark.svg";
} else {
	addTaskButton.src = "../img/add_light.svg"; // Set light mode icon
	removeButtonSrc = "../img/remove_light.svg";
	todoSrc = "../img/todo_light.svg";
	completeSrc = "../img/complete_light.svg";
}

// Toggle Dark Mode

function switchTheme(e) {
	if (e.target.checked) {
		document.body.classList.add("dark-mode");
	} else {
		document.body.classList.remove("dark-mode");
	}

	// Store the user's preference in localStorage
	if (document.body.classList.contains("dark-mode")) {
		localStorage.setItem("darkMode", "enabled");
	} else {
		localStorage.setItem("darkMode", "disabled");
	}

	// Update the icons
	if (document.body.classList.contains("dark-mode")) {
		addTaskButton.src = "../img/add_dark.svg"; // Set dark mode icon
	} else {
		addTaskButton.src = "../img/add_light.svg"; // Set light mode icon
	}

	renderTasks(); // Update the task lists
}

toggleSwitch.addEventListener("change", switchTheme, false);

// Gamification data
let tasks = [];
let slayerPoints = 0;
let currentLevel = 1;

// Level thresholds
const levelThresholds = {
	1: 0,
	2: 100,
	3: 250,
	4: 500,
	5: 2500,
	6: 5000,
};

// Level Names
const levelNames = {
	1: "Apprentice Slayer (Level 1)",
	2: "Task Terminator (Level 2)",
	3: "Efficiency Expert (Level 3)",
	4: "Productivity Pro (Level 4)",
	5: "Legendary Task Master (Level 5)",
	6: "Ultimate Task Master (Level 6)",
};

// Load game data on startup
loadGameData();

// Task and Game Logic

// Add task functionality
addTaskButton.addEventListener("click", () => {
	const taskText = newTaskInput.value.trim();
	if (taskText) {
		addTask(taskText);
		newTaskInput.value = ""; // Clear input
	}
});

// Add task when Enter key is pressed
newTaskInput.addEventListener("keypress", (e) => {
	if (e.key === "Enter") {
		const taskText = newTaskInput.value.trim();
		if (taskText) {
			addTask(taskText);
			newTaskInput.value = ""; // Clear input
		}
	}
});

// Load tasks from storage
loadTasksFromStorage();

// Function to add a task to the tasks array
function addTask(taskText, completed = false) {
	tasks.unshift({
		text: taskText,
		completed: completed,
	});
	updateTasksInStorage();
	renderTasks();
}

// Function to render the tasks array to the UI
function renderTasks() {
	taskList.innerHTML = ""; // Clear existing tasks
	slayedTaskList.innerHTML = "";

	tasks.forEach((task, index) => {
		const listItem = document.createElement("li");
		listItem.innerText = task.text;
		listItem.setAttribute("data-task-index", index); // Function to render the tasks array to the UI
		listItem.draggable = true;

		// Drag and Drop functionality
		listItem.addEventListener("dragstart", handleDragStart);
		listItem.addEventListener("dragover", handleDragOver);
		listItem.addEventListener("drop", handleDrop);

		todoSrc = document.body.classList.contains("dark-mode") ? "../img/todo_dark.svg" : "../img/todo_light.svg";
		completeSrc = document.body.classList.contains("dark-mode") ? "../img/complete_dark.svg" : "../img/complete_light.svg";

		const completeButton = createButton(tasks[index].completed ? completeSrc : todoSrc, () => {
			completeTask(index);
		});

		removeButtonSrc = document.body.classList.contains("dark-mode") ? "../img/remove_dark.svg" : "../img/remove_light.svg";

		const removeButton = createButton(removeButtonSrc, () => {
			deleteTask(index);
		});

		const groupedButtons = document.createElement("div");
		groupedButtons.classList.add("grouped-buttons");
		groupedButtons.appendChild(completeButton);
		groupedButtons.appendChild(removeButton);
		listItem.appendChild(groupedButtons);

		if (task.completed) {
			listItem.classList.add("completed");
			slayedTaskList.appendChild(listItem);
		} else {
			taskList.appendChild(listItem);
		}
	});

	updateCompletedTaskCount();
	toggleQuirkyText();
}

// --- Drag and Drop Handlers ---

let draggedItemIndex = null;

function handleDragStart(event) {
	draggedItemIndex = parseInt(event.target.getAttribute("data-task-index"));
	event.dataTransfer.effectAllowed = "move";
	event.target.classList.add("dragging"); // Optional visual feedback
}

function handleDragOver(event) {
	event.preventDefault();
	event.target.classList.add("dragover"); // Optional visual feedback
}

function handleDrop(event) {
	event.preventDefault();
	const targetItemIndex = parseInt(event.target.getAttribute("data-task-index"));

	if (!isNaN(targetItemIndex) && draggedItemIndex !== targetItemIndex) {
		[tasks[draggedItemIndex], tasks[targetItemIndex]] = [tasks[targetItemIndex], tasks[draggedItemIndex]];

		updateTasksInStorage();
		renderTasks(); // Re-render the tasks after updating the array
	}

	event.target.classList.remove("dragover"); // Optional visual feedback
	draggedItemIndex = null; // Reset draggedItemIndex
}

// --- Task Management Functions ---

function completeTask(index) {
	// Store the previous completion status
	const wasCompleted = tasks[index].completed;

	// Toggle the task's completion status
	tasks[index].completed = !tasks[index].completed;

	if (tasks[index].completed) {
		// Task is now completed
		let pointsEarned = 5;
		awardSlayerPoints(pointsEarned);
		showPointsAnimation("+5 SP", "points-gain"); // Show +SP
		taskCompleteSound.play(); // Play the task complete sound
	} else if (!tasks[index].completed && wasCompleted) {
		// Task was completed, but now marked as incomplete
		let pointsToDeduct = 5;
		deductSlayerPoints(pointsToDeduct);
		showPointsAnimation("-5 SP", "points-loss"); // Show -SP
	}

	updateTasksInStorage();
	renderTasks();
}

function deleteTask(index) {
	tasks.splice(index, 1);
	updateTasksInStorage();
	renderTasks();
}

// --- Gamification Functions ---

function awardSlayerPoints(points) {
	slayerPoints += points;
	updateLevel();
	updateGamificationUI();
	saveGameData();
}

function updateLevel() {
	let newLevel = 1; // Start checking from level 1

	// Iterate through the level thresholds in descending order
	for (const [level, threshold] of Object.entries(levelThresholds).reverse()) {
		if (slayerPoints >= threshold) {
			newLevel = parseInt(level); // Update to the highest level reached
			break; // Important: Exit the loop once a level is found
		}
	}

	if (newLevel !== currentLevel) {
		if (newLevel > currentLevel) {
			// Level Up!
			newLevelNameElement.textContent = levelNames[newLevel];
			levelUpModal.style.display = "block"; // Show the modal
			createConfetti();
			console.log("Level Up! You are now a", levelNames[newLevel]);
		} else {
			// Level Down :(
			console.log("Level Down! You are now a", levelNames[newLevel]);
		}

		currentLevel = newLevel;
	}
}

// Event listener to close the modal
closeModalButton.addEventListener("click", () => {
	levelUpModal.style.display = "none";
});

function deductSlayerPoints(points) {
	slayerPoints = Math.max(0, slayerPoints - points); // Prevent negative points
	updateLevel();
	updateGamificationUI();
	saveGameData();
}

// Function to display the points animation
function showPointsAnimation(pointsText, className) {
	const pointsElement = document.createElement("div");
	pointsElement.className = `points-change ${className}`;
	pointsElement.textContent = pointsText;

	pointsAnimationContainer.appendChild(pointsElement);

	// Remove the animation element after a short delay (adjust as needed)
	setTimeout(() => {
		pointsElement.remove();
	}, 1000);
}

function createConfetti() {
	for (let i = 0; i < numberOfConfetti; i++) {
		const confetti = document.createElement("div");
		confetti.classList.add("confetti");

		// Apply random styles
		const randomColor = `hsl(${Math.random() * 360}, 80%, 60%)`;
		confetti.style.backgroundColor = randomColor;
		confetti.style.boxShadow = `0 0 5px ${randomColor}`;

		// Random shape (50% chance of being a circle)
		if (Math.random() < 0.5) {
			confetti.style.borderRadius = "50%";
		}

		confettiContainer.appendChild(confetti);
	}
}

function updateGamificationUI() {
	levelNameElement.textContent = levelNames[currentLevel];
	slayerPointsElement.textContent = slayerPoints + " SP";

	const nextLevel = currentLevel + 1;
	const currentThreshold = levelThresholds[currentLevel];
	const nextThreshold = levelThresholds[nextLevel] || slayerPoints; // If there's no next level, use current points as max
	const progress = Math.floor(((slayerPoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100);
	levelProgressElement.style.width = progress + "%";
}

// --- Helper Functions ---

function createButton(imgSrc, onClick) {
	const button = document.createElement("button");
	const img = document.createElement("img");
	img.src = imgSrc;
	button.appendChild(img);
	button.addEventListener("click", onClick);
	return button;
}

function updateCompletedTaskCount() {
	const completedTasks = slayedTaskList.querySelectorAll("li.completed").length;
	document.getElementById("completed-task-count").textContent = completedTasks;
}

function toggleQuirkyText() {
	const quirkyText = document.getElementById("quirky-text");
	if (slayedTaskList.querySelectorAll("li.completed").length === 0) {
		quirkyText.style.display = "block";
	} else {
		quirkyText.style.display = "none";
	}
}

// --- Storage Management ---

function updateTasksInStorage() {
	chrome.storage.sync.set({ tasks: tasks });
}

function loadTasksFromStorage() {
	chrome.storage.sync.get("tasks", (data) => {
		if (data.tasks) {
			tasks = data.tasks;
			renderTasks();
		}
	});
}

// --- Game Data Storage ---

function saveGameData() {
	localStorage.setItem("slayerPoints", slayerPoints);
	localStorage.setItem("currentLevel", currentLevel);
}

function loadGameData() {
	slayerPoints = parseInt(localStorage.getItem("slayerPoints")) || 0;
	currentLevel = parseInt(localStorage.getItem("currentLevel")) || 1;
	updateGamificationUI(); // Update UI on load
}

// Close the modal when the user clicks outside of it
window.addEventListener("click", (event) => {
	if (event.target === levelUpModal) {
		levelUpModal.style.display = "none";
	}
});
