// ─── DOM References ───────────────────────────────────
const habitInput     = document.getElementById('habit-input');
const addBtn         = document.getElementById('add-btn');
const habitListEl    = document.getElementById('habit-list');
const progressChart  = document.getElementById('progress-chart');
const startBtn       = document.getElementById('start-btn');
const dashboardSection = document.getElementById('dashboard');
const themeToggle    = document.getElementById('theme-toggle');
const themeIcon      = document.querySelector('.theme-icon');
const congratsModal  = document.getElementById('congrats-modal');
const modalClose     = document.getElementById('modal-close');
const emptyState     = document.getElementById('empty-state');
const dateDisplay    = document.getElementById('date-display');
const statTotal      = document.getElementById('stat-total');
const statCompleted  = document.getElementById('stat-completed');
const statRemaining  = document.getElementById('stat-remaining');
const chartPercent   = document.getElementById('chart-percent');

// ─── State ────────────────────────────────────────────
let habits = JSON.parse(localStorage.getItem('habits')) || [];
habits = habits.map(h => (typeof h === 'string' ? { name: h, completed: false } : h));

// ─── Date display ─────────────────────────────────────
dateDisplay.textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
});

// ─── Dark mode ────────────────────────────────────────
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

themeToggle.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    themeIcon.textContent = next === 'dark' ? '☀️' : '🌙';
    updateChartColors();
});

// ─── Hero scroll ──────────────────────────────────────
startBtn.addEventListener('click', () => {
    dashboardSection.scrollIntoView({ behavior: 'smooth' });
});

// ─── Toast ────────────────────────────────────────────
let toastTimer;
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ─── Congrats modal ───────────────────────────────────
let congratsShownThisSession = false;

function showCongratulations() {
    if (congratsShownThisSession) return;
    congratsShownThisSession = true;
    congratsModal.classList.add('active');
    congratsModal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
    congratsModal.classList.remove('active');
    congratsModal.setAttribute('aria-hidden', 'true');
}

modalClose.addEventListener('click', closeModal);
congratsModal.addEventListener('click', e => { if (e.target === congratsModal) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ─── Chart ───────────────────────────────────────────
let chart;

function getChartColors() {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
        completed: '#10b981',
        remaining: dark ? '#334155' : '#e2e8f0',
    };
}

function createChart() {
    const ctx    = progressChart.getContext('2d');
    const colors = getChartColors();
    const done   = habits.filter(h => h.completed).length;
    const left   = habits.length - done;

    chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Remaining'],
            datasets: [{
                data: [done, left || 1],
                backgroundColor: [colors.completed, colors.remaining],
                borderWidth: 0,
                hoverOffset: 4,
            }],
        },
        options: {
            responsive: true,
            cutout: '74%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: habits.length > 0,
                    callbacks: { label: item => ` ${item.label}: ${item.raw}` },
                },
            },
            animation: { animateRotate: true, duration: 600 },
        },
    });
}

function updateChartColors() {
    if (!chart) return;
    const colors = getChartColors();
    chart.data.datasets[0].backgroundColor = [colors.completed, colors.remaining];
    chart.update('none');
}

function updateChart() {
    const done    = habits.filter(h => h.completed).length;
    const left    = habits.length - done;
    const percent = habits.length > 0 ? Math.round((done / habits.length) * 100) : 0;

    statTotal.textContent     = habits.length;
    statCompleted.textContent = done;
    statRemaining.textContent = left;
    chartPercent.textContent  = `${percent}%`;

    if (chart) {
        const colors = getChartColors();
        chart.data.datasets[0].data = [done, left || (habits.length === 0 ? 1 : 0)];
        chart.data.datasets[0].backgroundColor = [colors.completed, colors.remaining];
        chart.options.plugins.tooltip.enabled = habits.length > 0;
        chart.update();
    }

    emptyState.classList.toggle('visible', habits.length === 0);

    if (done === habits.length && habits.length > 0) {
        showCongratulations();
    } else {
        congratsShownThisSession = false;
    }
}

// ─── Display habits ───────────────────────────────────
function displayHabits() {
    habitListEl.innerHTML = '';

    habits.forEach((habit, index) => {
        const item = document.createElement('div');
        item.classList.add('habit-item');
        if (habit.completed) item.classList.add('completed-item');

        item.innerHTML = `
            <input type="checkbox" class="habit-checkbox" id="habit-${index}"
                   ${habit.completed ? 'checked' : ''}
                   aria-label="Mark '${habit.name}' as complete">
            <label class="habit-name ${habit.completed ? 'done' : ''}" for="habit-${index}">${habit.name}</label>
            <button class="delete-btn" data-index="${index}" aria-label="Remove ${habit.name}" title="Remove">✕</button>
        `;

        item.querySelector('.habit-checkbox').addEventListener('change', () => toggleCompletion(index));
        item.querySelector('.delete-btn').addEventListener('click', () => removeHabit(index));

        habitListEl.appendChild(item);
    });

    updateChart();
}

// ─── Add habit ────────────────────────────────────────
function addHabit() {
    const name = habitInput.value.trim();
    if (!name) {
        showToast('✏️  Please enter a habit name.');
        habitInput.focus();
        return;
    }

    habits.push({ name, completed: false });
    localStorage.setItem('habits', JSON.stringify(habits));
    displayHabits();
    habitInput.value = '';
    habitInput.focus();
}

addBtn.addEventListener('click', addHabit);
habitInput.addEventListener('keydown', e => { if (e.key === 'Enter') addHabit(); });

// ─── Toggle completion ────────────────────────────────
function toggleCompletion(index) {
    habits[index].completed = !habits[index].completed;
    localStorage.setItem('habits', JSON.stringify(habits));
    displayHabits();
}

// ─── Remove habit ─────────────────────────────────────
function removeHabit(index) {
    const name = habits[index].name;
    habits.splice(index, 1);
    localStorage.setItem('habits', JSON.stringify(habits));
    displayHabits();
    showToast(`🗑️  "${name}" removed.`);
}

// ─── Init ─────────────────────────────────────────────
createChart();
displayHabits();
