console.log("JavaScript connected successfully");            
"use strict";

const STORAGE_KEYS = {
  tasks: "lifeDashboardTasks",
  links: "lifeDashboardLinks",
  name: "lifeDashboardName",
  theme: "lifeDashboardTheme",
  spotify: "spotifyPlaylist"
};

const state = {
  tasks: loadFromStorage(STORAGE_KEYS.tasks, []),
  links: loadFromStorage(STORAGE_KEYS.links, [
    { id: crypto.randomUUID(), name: "Google", url: "https://google.com" },
    { id: crypto.randomUUID(), name: "Gmail", url: "https://mail.google.com" },
    { id: crypto.randomUUID(), name: "Calendar", url: "https://calendar.google.com" }
  ]),
  spotify: loadFromStorage(STORAGE_KEYS.spotify, ""),
  timerSeconds: 25 * 60,
  timerInterval: null,
  timerRunning: false
};

const greetingElement = document.querySelector("#greeting");
const dateElement = document.querySelector("#current-date");
const timeElement = document.querySelector("#current-time");

const themeToggle = document.querySelector("#theme-toggle");

const timerDisplay = document.querySelector("#timer-display");
const timerStatus = document.querySelector("#timer-status");
const startTimerButton = document.querySelector("#start-timer");
const pauseTimerButton = document.querySelector("#pause-timer");
const resetTimerButton = document.querySelector("#reset-timer");

const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const taskMessage = document.querySelector("#task-message");
const taskTemplate = document.querySelector("#task-template");
const taskSort = document.querySelector("#task-sort");
const taskDateInput = document.querySelector("#task-date");
const taskTimeInput = document.querySelector("#task-time");
const remainingCount = document.querySelector("#remaining-count");
const completedCount = document.querySelector("#completed-count");

const linkForm = document.querySelector("#link-form");
const linkNameInput = document.querySelector("#link-name");
const linkUrlInput = document.querySelector("#link-url");
const linkMessage = document.querySelector("#link-message");
const quickLinksContainer = document.querySelector("#quick-links");

const dailyQuote = document.querySelector("#daily-quote");
const quoteAuthor = document.querySelector("#quote-author");
const spotifyForm = document.querySelector("#spotify-form");
const spotifyLink = document.querySelector("#spotify-link");
const spotifyPlayer = document.querySelector("#spotify-player");
const nameForm = document.querySelector("#name-form");
const nameInput = document.querySelector("#name-input");


const dailyGoalInput = document.querySelector("#daily-goal-input");
const saveDailyGoalButton = document.querySelector("#save-daily-goal");
const dailyGoalDisplay = document.querySelector("#daily-goal-display");

const DAILY_GOAL_KEY = "hocusFocusDailyGoal";

function loadDailyGoal() {
  const savedGoal = localStorage.getItem(DAILY_GOAL_KEY);

  dailyGoalDisplay.textContent = savedGoal
    ? savedGoal
    : "No daily goal set yet.";
}

function saveDailyGoal() {
  const goal = dailyGoalInput.value.trim();

  if (!goal) {
    localStorage.removeItem(DAILY_GOAL_KEY);
    dailyGoalDisplay.textContent = "No daily goal set yet.";
    return;
  }

  localStorage.setItem(DAILY_GOAL_KEY, goal);
  dailyGoalDisplay.textContent = goal;
  dailyGoalInput.value = "";
}

saveDailyGoalButton.addEventListener("click", saveDailyGoal);

loadDailyGoal();

function loadFromStorage(key, fallback) {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : fallback;
  } catch (error) {
    console.error(`Could not load ${key}:`, error);
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Could not save ${key}:`, error);
  }
}

function updateDateTime() {
  const now = new Date();

  timeElement.textContent = now.toLocaleTimeString("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit"
});

  dateElement.textContent = now.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const hour = now.getHours();
  let greeting = "Good Evening";

  if (hour < 12) {
    greeting = "Good Morning";
  } else if (hour < 18) {
    greeting = "Good Afternoon";
  }

  const savedName = localStorage.getItem(STORAGE_KEYS.name);
  greetingElement.textContent = savedName
    ? `${greeting}, ${savedName}`
    : greeting;
}

function applySavedTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "☀️";
  }
}

function toggleTheme() {
  const isDarkMode = document.body.classList.toggle("dark-mode");

  localStorage.setItem(
    STORAGE_KEYS.theme,
    isDarkMode ? "dark" : "light"
  );

  themeToggle.textContent = isDarkMode ? "☀️" : "🌙";
}

function formatTimer(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

function updateTimerDisplay() {
  timerDisplay.textContent = formatTimer(state.timerSeconds);
}

function startTimer() {
  if (state.timerRunning) {
    return;
  }

  state.timerRunning = true;
  timerStatus.textContent = "Focusing";

  state.timerInterval = window.setInterval(() => {
    if (state.timerSeconds <= 0) {
      clearInterval(state.timerInterval);
      state.timerRunning = false;
      timerStatus.textContent = "Completed";
      alert("Focus session completed! Take a short break.");
      return;
    }

    state.timerSeconds -= 1;
    updateTimerDisplay();
  }, 1000);
}

function pauseTimer() {
  clearInterval(state.timerInterval);
  state.timerRunning = false;
  timerStatus.textContent = "Paused";
}

function resetTimer() {
  clearInterval(state.timerInterval);
  state.timerRunning = false;
  state.timerSeconds = 25 * 60;
  timerStatus.textContent = "Ready";
  updateTimerDisplay();
}

function taskExists(taskText, excludedTaskId = null) {
  const normalizedText = taskText.trim().toLowerCase();

  return state.tasks.some(
    (task) =>
      task.id !== excludedTaskId &&
      task.text.trim().toLowerCase() === normalizedText
  );
}

function addTask(taskText, taskDate, taskTime) {
  if (!taskText.trim()) {
    taskMessage.textContent = "Please enter a task.";
    return;
  }

  if (taskExists(taskText)) {
    taskMessage.textContent = "This task already exists.";
    return;
  }

  state.tasks.push({
    id: crypto.randomUUID(),
    text: taskText.trim(),
    date: taskDate,
    time: taskTime,
    completed: false,
    createdAt: Date.now()
  });

  saveToStorage(STORAGE_KEYS.tasks, state.tasks);

  taskInput.value = "";
  taskDateInput.value = "";
  taskTimeInput.value = "";
  taskMessage.textContent = "";

  renderTasks();
}

function toggleTask(taskId) {
  state.tasks = state.tasks.map((task) =>
    task.id === taskId
      ? { ...task, completed: !task.completed }
      : task
  );

  saveToStorage(STORAGE_KEYS.tasks, state.tasks);
  renderTasks();
}

function editTask(taskId) {
  const task = state.tasks.find((item) => item.id === taskId);

  if (!task) {
    return;
  }

  const updatedText = window.prompt("Edit task:", task.text);

  if (updatedText === null) {
    return;
  }

  if (!updatedText.trim()) {
    taskMessage.textContent = "Task cannot be empty.";
    return;
  }

  if (taskExists(updatedText, taskId)) {
    taskMessage.textContent = "This task already exists.";
    return;
  }

  task.text = updatedText.trim();

  saveToStorage(STORAGE_KEYS.tasks, state.tasks);
  taskMessage.textContent = "";

  renderTasks();
}

function deleteTask(taskId) {
  state.tasks = state.tasks.filter((task) => task.id !== taskId);

  saveToStorage(STORAGE_KEYS.tasks, state.tasks);
  renderTasks();
}

function getSortedTasks() {
  const tasksCopy = [...state.tasks];

  switch (taskSort.value) {
    case "active":
      return tasksCopy.sort(
        (firstTask, secondTask) =>
          Number(firstTask.completed) - Number(secondTask.completed)
      );

    case "completed":
      return tasksCopy.sort(
        (firstTask, secondTask) =>
          Number(secondTask.completed) - Number(firstTask.completed)
      );

    case "alphabetical":
      return tasksCopy.sort((firstTask, secondTask) =>
        firstTask.text.localeCompare(secondTask.text)
      );

    default:
      return tasksCopy.sort(
        (firstTask, secondTask) =>
          firstTask.createdAt - secondTask.createdAt
      );
  }
}

function renderTasks() {
  taskList.innerHTML = "";

  const tasksToRender = getSortedTasks();

  if (tasksToRender.length === 0) {
    const emptyState = document.createElement("li");
    emptyState.className = "empty-state";
    emptyState.textContent = "No tasks yet. Add your first task!";
    taskList.append(emptyState);
  }

  tasksToRender.forEach((task) => {
    const taskNode = taskTemplate.content.cloneNode(true);
    const taskItem = taskNode.querySelector(".task-item");
    const taskCheckbox = taskNode.querySelector(".task-checkbox");
    const taskText = taskNode.querySelector(".task-text");
    const editButton = taskNode.querySelector(".edit-task");
    const deleteButton = taskNode.querySelector(".delete-task");
    const calendarButton = taskNode.querySelector(".calendar-task");

    taskText.textContent = task.text;
    if (task.date) {
    const scheduleText = document.createElement("small");
    scheduleText.className = "task-schedule";
    scheduleText.textContent = task.time
    ? `${task.date} • ${task.time}`
    : task.date;

  taskText.append(document.createElement("br"));
  taskText.append(scheduleText);
}
    taskCheckbox.checked = task.completed;

    if (task.completed) {
      taskItem.classList.add("completed");
    }

    taskCheckbox.addEventListener("change", () => toggleTask(task.id));
    editButton.addEventListener("click", () => editTask(task.id));
    deleteButton.addEventListener("click", () => deleteTask(task.id));
    calendarButton.addEventListener("click", () => {

  addTaskToCalendar(task);
});
    taskList.append(taskNode);
  });

  remainingCount.textContent = state.tasks.filter(
    (task) => !task.completed
  ).length;

  completedCount.textContent = state.tasks.filter(
    (task) => task.completed
  ).length;
}

function normalizeUrl(url) {
  const trimmedUrl = url.trim();

  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  return `https://${trimmedUrl}`;
}

function addQuickLink(name, url) {
  const normalizedUrl = normalizeUrl(url);

  try {
    new URL(normalizedUrl);
  } catch {
    linkMessage.textContent = "Please enter a valid website URL.";
    return;
  }

  state.links.push({
    id: crypto.randomUUID(),
    name: name.trim(),
    url: normalizedUrl
  });

  saveToStorage(STORAGE_KEYS.links, state.links);

  linkNameInput.value = "";
  linkUrlInput.value = "";
  linkMessage.textContent = "";

  renderQuickLinks();
}

function deleteQuickLink(linkId) {
  state.links = state.links.filter((link) => link.id !== linkId);

  saveToStorage(STORAGE_KEYS.links, state.links);
  renderQuickLinks();
}

function convertSpotifyUrl(url){

    if(!url.includes("spotify.com")){
        return null;
    }

    return url
        .replace("/playlist/","/embed/playlist/")
        .split("?")[0];

}

function loadSpotify(){

    const savedPlaylist = localStorage.getItem(STORAGE_KEYS.spotify);

    if(savedPlaylist){

        spotifyPlayer.src = savedPlaylist;

    }

}

function saveSpotify(event){

    event.preventDefault();

    const url = spotifyLink.value.trim();

    const embed = convertSpotifyUrl(url);

    if(!embed){

        alert("Please enter a valid Spotify playlist.");

        return;

    }

    spotifyPlayer.src = embed;

    localStorage.setItem(STORAGE_KEYS.spotify,embed);

    spotifyLink.value="";

}

function renderQuickLinks() {
  quickLinksContainer.innerHTML = "";

  if (state.links.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = "No quick links yet.";
    quickLinksContainer.append(emptyState);
    return;
  }

  state.links.forEach((link) => {
    const wrapper = document.createElement("div");
    const anchor = document.createElement("a");
    const deleteButton = document.createElement("button");

    wrapper.className = "quick-link";

    anchor.href = link.url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.textContent = link.name;

    deleteButton.type = "button";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", `Delete ${link.name}`);
    deleteButton.addEventListener("click", () => deleteQuickLink(link.id));

    wrapper.append(anchor, deleteButton);
    quickLinksContainer.append(wrapper);
  });
}

const quotes = [
  {
    text: "Small progress is still progress.",
    author: "Unknown"
  },
  {
    text: "Success is the sum of small efforts repeated day after day.",
    author: "Robert Collier"
  },
  {
    text: "You do not have to be perfect. You just have to keep going.",
    author: "Unknown"
  },
  {
    text: "The future depends on what you do today.",
    author: "Mahatma Gandhi"
  },
  {
    text: "Dreams become plans when you give them a deadline.",
    author: "Unknown"
  },
  {
    text: "Consistency will take you places motivation cannot.",
    author: "Unknown"
  },
  {
    text: "One step closer is still closer.",
    author: "Unknown"
  }
];

function showDailyQuote() {
  const today = new Date();
  const dayNumber = today.getDate();
  const quoteIndex = dayNumber % quotes.length;
  const selectedQuote = quotes[quoteIndex];

  dailyQuote.textContent = `"${selectedQuote.text}"`;
  quoteAuthor.textContent = `— ${selectedQuote.author}`;
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addTask(
    taskInput.value,
    taskDateInput.value,
    taskTimeInput.value
  );
  taskInput.value = "";
  taskDateInput.value = "";
  taskTimeInput.value = "";
});

taskSort.addEventListener("change", renderTasks);

linkForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = linkNameInput.value.trim();
  const url = linkUrlInput.value.trim();

  if (!name || !url) {
    linkMessage.textContent = "Please complete both fields.";
    return;
  }

  addQuickLink(name, url);
});

nameForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = nameInput.value.trim();

  if (!name) {
    localStorage.removeItem(STORAGE_KEYS.name);
  } else {
    localStorage.setItem(STORAGE_KEYS.name, name);
  }

  updateDateTime();
  nameInput.value = "";
});

themeToggle.addEventListener("click", toggleTheme);
startTimerButton.addEventListener("click", startTimer);
pauseTimerButton.addEventListener("click", pauseTimer);
resetTimerButton.addEventListener("click", resetTimer);
spotifyForm.addEventListener("submit", saveSpotify);

applySavedTheme();
updateDateTime();
updateTimerDisplay();
renderTasks();
renderQuickLinks();
showDailyQuote();
loadSpotify();

window.setInterval(updateDateTime, 1000);     