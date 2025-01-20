// DOM Elements
const habitInput = document.getElementById('habit-input');
const addBtn = document.getElementById('add-btn');
const habitList = document.getElementById('habit-list');
const progressChart = document.getElementById('progress-chart');

const startBtn = document.getElementById('start-btn');
const dashboardSection = document.getElementById('dashboard');

// Load habits from Local Storage and normalize data
let habits = JSON.parse(localStorage.getItem('habits')) || [];
habits = habits.map(habit =>
  typeof habit === 'string' ? { name: habit, completed: false } : habit
);
localStorage.setItem('habits', JSON.stringify(habits));

// Track completed habits
let completedHabits = habits.filter(habit => habit.completed).length;

// Scroll to the dashboard section
startBtn.addEventListener('click', () => {
  dashboardSection.scrollIntoView({ behavior: 'smooth' });
  dashboardSection.classList.add('highlight');
  setTimeout(() => dashboardSection.classList.remove('highlight'), 1000);
});

// Event listener to add a habit
addBtn.addEventListener('click', addHabit);

// Initialize Chart.js
let chart;
function createChart() {
  const ctx = progressChart.getContext('2d');
  chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Completed', 'Remaining'],
      datasets: [
        {
          data: [completedHabits, habits.length - completedHabits],
          backgroundColor: ['#4caf50', '#f44336'],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: tooltipItem => {
              const label = tooltipItem.label || '';
              const value = tooltipItem.raw;
              return `${label}: ${value}`;
            },
          },
        },
      },
    },
  });
}

// Update the Chart
function updateChart() {
  if (chart) {
    chart.data.datasets[0].data = [
      completedHabits,
      habits.length - completedHabits,
    ];
    chart.update();

        // Check if all habits are completed
        if (completedHabits === habits.length && habits.length > 0) {
          showCongratulations();
        }

  }
}

// Display a congratulations message
function showCongratulations() {
  alert("🎉 Congratulations! You've completed all your daily habits! 🎉");
}

// Display habits
function displayHabits() {
  habitList.innerHTML = '';
  habits.forEach((habit, index) => {
    const habitItem = document.createElement('div');
    habitItem.classList.add('habit-item');
    habitItem.innerHTML = `
      <span class="${habit.completed ? 'completed' : ''}">${habit.name}</span>
      <button onclick="toggleCompletion(${index})">${
      habit.completed ? 'Uncheck' : 'Check'
    }</button>
      <button onclick="removeHabit(${index})">Delete</button>
    `;
    habitList.appendChild(habitItem);
  });
}

// Add a new habit
function addHabit() {
  const habitName = habitInput.value.trim();
  if (!habitName) {
    alert('Please enter a habit!');
    return;
  }

  // Add the new habit as an object
  habits.push({ name: habitName, completed: false });

  // Save to Local Storage
  localStorage.setItem('habits', JSON.stringify(habits));

  // Update UI and chart
  displayHabits();
  updateChart();

  // Clear input field
  habitInput.value = '';
}

// Toggle completion status of a habit
function toggleCompletion(index) {
  habits[index].completed = !habits[index].completed;
  completedHabits = habits.filter(habit => habit.completed).length;

  // Save to Local Storage
  localStorage.setItem('habits', JSON.stringify(habits));

  // Update UI and chart
  displayHabits();
  updateChart();
}

// Remove a habit
function removeHabit(index) {
  habits.splice(index, 1);
  completedHabits = habits.filter(habit => habit.completed).length;

  // Save to Local Storage
  localStorage.setItem('habits', JSON.stringify(habits));

  // Update UI and chart
  displayHabits();
  updateChart();
}

// Initial setup
createChart();
displayHabits();
updateChart();
