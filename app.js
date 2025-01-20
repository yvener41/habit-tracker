// DOM Elements
const habitInput = document.getElementById('habit-input');
const addBtn = document.getElementById('add-btn');
const habitList = document.getElementById('habit-list');
const progressChart = document.getElementById('progress-chart');

const startBtn = document.getElementById('start-btn');
const dashboardSection = document.getElementById('dashboard');

let habits = JSON.parse(localStorage.getItem('habits')) || [];
habits = habits.map(habit =>
  typeof habit === 'string' ? { name: habit, completed: false } : habit
);
localStorage.setItem('habits', JSON.stringify(habits));

let completedHabits = habits.filter(habit => habit.completed).length;

startBtn.addEventListener('click', () => {
  dashboardSection.scrollIntoView({ behavior: 'smooth' });
  dashboardSection.classList.add('highlight');
  setTimeout(() => dashboardSection.classList.remove('highlight'), 1000);
});

addBtn.addEventListener('click', addHabit);

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

function updateChart() {
  if (chart) {
    chart.data.datasets[0].data = [
      completedHabits,
      habits.length - completedHabits,
    ];
    chart.update();

        if (completedHabits === habits.length && habits.length > 0) {
          showCongratulations();
        }

  }
}

function showCongratulations() {
  alert("🎉 Congratulations! You've completed all your daily habits! 🎉");
}

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

function addHabit() {
  const habitName = habitInput.value.trim();
  if (!habitName) {
    alert('Please enter a habit!');
    return;
  }

  habits.push({ name: habitName, completed: false });

  localStorage.setItem('habits', JSON.stringify(habits));

  displayHabits();
  updateChart();

  habitInput.value = '';
}

function toggleCompletion(index) {
  habits[index].completed = !habits[index].completed;
  completedHabits = habits.filter(habit => habit.completed).length;

  localStorage.setItem('habits', JSON.stringify(habits));

  displayHabits();
  updateChart();
}

function removeHabit(index) {
  habits.splice(index, 1);
  completedHabits = habits.filter(habit => habit.completed).length;

  localStorage.setItem('habits', JSON.stringify(habits));

  displayHabits();
  updateChart();
}

createChart();
displayHabits();
updateChart();
