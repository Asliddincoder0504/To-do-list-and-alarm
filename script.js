let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
const alarmSound = document.getElementById('alarmSound');

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function addTask() {
    const taskInput = document.getElementById('taskInput');
    const priorityInput = document.getElementById('priorityInput');
    const categoryInput = document.getElementById('categoryInput');
    const deadlineInput = document.getElementById('deadlineInput');
    const text = taskInput.value.trim();
    if (text === '') return;

    const task = {
        id: Date.now(),
        text,
        priority: priorityInput.value,
        category: categoryInput.value,
        deadline: deadlineInput.value,
        completed: false,
        createdAt: new Date().toLocaleString('uz-UZ')
    };

    tasks.push(task);
    saveTasks();
    taskInput.value = '';
    deadlineInput.value = '';
    renderTasks();
    if (task.deadline) scheduleAlarm(task);
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

function toggleTask(id) {
    tasks = tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasks();
    renderTasks();
}

function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
}

function filterTasks(filter) {
    renderTasks(filter);
}

function scheduleAlarm(task) {
    if (!task.deadline) return;
    const deadlineTime = new Date(task.deadline).getTime();
    const now = new Date().getTime();
    const timeUntilDeadline = deadlineTime - now;

    if (timeUntilDeadline > 0) {
        setTimeout(() => {
            if (!task.completed) {
                alarmSound.play();
                alert(`Eslatma: ${task.text} muddati hozir!`);
            }
        }, timeUntilDeadline);
    }
}

function updateStats() {
    const total = tasks.length;
    const active = tasks.filter(task => !task.completed).length;
    const completed = total - active;
    
    document.getElementById('totalTasks').textContent = total;
    document.getElementById('activeTasks').textContent = active;
    document.getElementById('completedTasks').textContent = completed;
}

function changeTheme() {
    const themeSelect = document.getElementById('themeSelect');
    const selectedTheme = themeSelect.value;
    
    document.body.classList.remove('green', 'blue', 'pink', 'yellow', 'purple', 'orange', 'cyan', 'red');
    document.body.classList.add(selectedTheme);
    
    localStorage.setItem('theme', selectedTheme);
}

function renderTasks(filter = 'all') {
    const taskList = document.getElementById('taskList');
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    taskList.innerHTML = '';

    let filteredTasks = tasks;
    if (filter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (filter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }

    filteredTasks = filteredTasks.filter(task => 
        task.text.toLowerCase().includes(searchInput) ||
        task.category.toLowerCase().includes(searchInput)
    );

    filteredTasks.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `${task.completed ? 'completed' : ''} category-${task.category}`;
        const deadlineText = task.deadline ? `Muddati: ${new Date(task.deadline).toLocaleString('uz-UZ')}` : '';
        li.innerHTML = `
            <span class="priority-${task.priority}">
                ${task.text} (${task.category})<br>
                <small>${task.createdAt} ${deadlineText}</small>
            </span>
            <div class="actions">
                <button onclick="toggleTask(${task.id})">${task.completed ? 'Qaytarish' : 'Bajarildi'}</button>
                <button onclick="deleteTask(${task.id})">O'chirish</button>
            </div>
        `;
        taskList.appendChild(li);
    });

    updateStats();
}

document.getElementById('taskInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

document.getElementById('searchInput').addEventListener('input', () => renderTasks());

const savedTheme = localStorage.getItem('theme') || 'green';
document.body.classList.add(savedTheme);
document.getElementById('themeSelect').value = savedTheme;

tasks.forEach(task => scheduleAlarm(task));

renderTasks();