const EDIT_DESCRIPTION_THRESHOLD = 140;
const REFRESH_MS = 30000;

let todoState = {
    title: 'Complete the Frontend Task',
    description:
        'Build a testable todo item card component with all required elements and accessibility features. It should support editing, priority changes, expand/collapse interactions, and accessible controls.',
    priority: 'Medium',
    status: 'Pending',
    dueDate: '2026-04-20T12:00:00Z',
    completed: false,
    expanded: false,
};

let savedState = { ...todoState };
let intervalId = null;

const elements = {};

function formatDueDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return 'Due date invalid';
    }
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(date);
}

function calculateTimeRemaining() {
    if (todoState.status === 'Done') {
        return 'Completed';
    }

    const now = new Date();
    const due = new Date(todoState.dueDate);
    const diffMs = due - now;
    const diffAbs = Math.abs(diffMs);
    const days = Math.floor(diffAbs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffAbs / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diffAbs / (1000 * 60)) % 60);

    if (diffMs < 0) {
        if (days > 0) {
            return `Overdue by ${days} day${days === 1 ? '' : 's'}`;
        }
        if (hours > 0) {
            return `Overdue by ${hours} hour${hours === 1 ? '' : 's'}`;
        }
        if (minutes > 0) {
            return `Overdue by ${minutes} minute${minutes === 1 ? '' : 's'}`;
        }
        return 'Overdue';
    }

    if (days > 1) {
        return `Due in ${days} days`;
    }
    if (days === 1) {
        return 'Due tomorrow';
    }
    if (hours > 0) {
        return `Due in ${hours} hour${hours === 1 ? '' : 's'}`;
    }
    if (minutes > 0) {
        return `Due in ${minutes} minute${minutes === 1 ? '' : 's'}`;
    }
    return 'Due now!';
}

function syncCheckboxAndStatus() {
    const checked = todoState.status === 'Done';
    elements.completeToggle.checked = checked;
    if (checked) {
        todoState.completed = true;
    } else if (todoState.completed && todoState.status === 'Done') {
        todoState.status = 'Pending';
        todoState.completed = false;
    }
}

function updatePriorityStyles() {
    elements.priorityIndicator.classList.remove('priority-low', 'priority-medium', 'priority-high');
    const normalized = todoState.priority.toLowerCase();
    elements.priorityIndicator.classList.add(`priority-${normalized}`);
}

function updateUI() {
    elements.todoTitle.textContent = todoState.title;
    elements.todoDescription.textContent = todoState.description;
    elements.priorityText.textContent = todoState.priority;
    elements.priorityIndicator.setAttribute('aria-label', `${todoState.priority} priority`);
    elements.statusIndicator.textContent = todoState.status;
    elements.statusControl.value = todoState.status;
    elements.dueDate.textContent = `Due ${formatDueDate(todoState.dueDate)}`;
    elements.dueDate.setAttribute('datetime', todoState.dueDate);
    elements.timeRemaining.textContent = calculateTimeRemaining();
    elements.overdueIndicator.classList.toggle('hidden', todoState.status === 'Done' || !isOverdue());
    elements.todoCard.classList.toggle('completed', todoState.status === 'Done');
    elements.todoCard.classList.toggle('in-progress', todoState.status === 'In Progress');
    elements.todoCard.classList.toggle('overdue', isOverdue() && todoState.status !== 'Done');
    elements.todoCard.classList.toggle('pending', todoState.status === 'Pending');
    updatePriorityStyles();
    syncCheckboxAndStatus();

    const isLong = todoState.description.length > EDIT_DESCRIPTION_THRESHOLD;
    if (isLong) {
        elements.expandToggle.classList.remove('hidden');
        elements.collapsibleSection.classList.toggle('expanded', todoState.expanded);
        elements.collapsibleSection.classList.toggle('collapsed', !todoState.expanded);
        elements.expandToggle.textContent = todoState.expanded ? 'Show less' : 'Show more';
        elements.expandToggle.setAttribute('aria-expanded', String(todoState.expanded));
        elements.collapsibleSection.setAttribute('aria-hidden', String(!todoState.expanded));
    } else {
        elements.expandToggle.classList.add('hidden');
        elements.collapsibleSection.classList.remove('collapsed');
        elements.collapsibleSection.classList.add('expanded');
        elements.collapsibleSection.setAttribute('aria-hidden', 'false');
    }
}

function isOverdue() {
    const now = new Date();
    const due = new Date(todoState.dueDate);
    return due < now && todoState.status !== 'Done';
}

function openEditMode() {
    savedState = { ...todoState };
    elements.editTitle.value = todoState.title;
    elements.editDescription.value = todoState.description;
    elements.editPriority.value = todoState.priority;
    elements.editDueDate.value = todoState.dueDate.slice(0, 16);
    elements.editForm.classList.remove('hidden');
    elements.editButton.setAttribute('aria-expanded', 'true');
    elements.editTitle.focus();
}

function closeEditMode(returnFocus = true) {
    elements.editForm.classList.add('hidden');
    elements.editButton.setAttribute('aria-expanded', 'false');
    if (returnFocus) {
        elements.editButton.focus();
    }
}

function handleSave() {
    const title = elements.editTitle.value.trim();
    const description = elements.editDescription.value.trim();
    const priority = elements.editPriority.value;
    const dueDate = elements.editDueDate.value;

    if (title) {
        todoState.title = title;
    }
    if (description) {
        todoState.description = description;
    }
    todoState.priority = priority;
    if (dueDate) {
        todoState.dueDate = new Date(dueDate).toISOString();
    }
    updateUI();
    closeEditMode();
}

function handleCancel() {
    todoState = { ...savedState };
    updateUI();
    closeEditMode();
}

function handleCompleteToggle() {
    if (elements.completeToggle.checked) {
        todoState.status = 'Done';
    } else if (todoState.status === 'Done') {
        todoState.status = 'Pending';
    }
    updateUI();
}

function handleStatusControl(event) {
    todoState.status = event.target.value;
    updateUI();
}

function handleExpandToggle() {
    todoState.expanded = !todoState.expanded;
    updateUI();
}

function handleEditButton() {
    openEditMode();
}

function handleDeleteButton() {
    alert('Delete clicked');
}

function updateCurrentTime() {
    const timeElement = document.querySelector('[data-testid="test-user-time"]');
    if (!timeElement) {
        return;
    }
    timeElement.textContent = `Current time: ${Date.now()} ms`;
}

function initializeElements() {
    elements.todoCard = document.querySelector('[data-testid="test-todo-card"]');
    elements.todoTitle = document.querySelector('[data-testid="test-todo-title"]');
    elements.todoDescription = document.querySelector('[data-testid="test-todo-description"]');
    elements.priorityText = document.querySelector('[data-testid="test-todo-priority"]');
    elements.priorityIndicator = document.querySelector('[data-testid="test-todo-priority-indicator"]');
    elements.statusIndicator = document.querySelector('[data-testid="test-todo-status"]');
    elements.statusControl = document.querySelector('[data-testid="test-todo-status-control"]');
    elements.dueDate = document.querySelector('[data-testid="test-todo-due-date"]');
    elements.timeRemaining = document.querySelector('[data-testid="test-todo-time-remaining"]');
    elements.overdueIndicator = document.querySelector('[data-testid="test-todo-overdue-indicator"]');
    elements.completeToggle = document.querySelector('[data-testid="test-todo-complete-toggle"]');
    elements.editButton = document.querySelector('[data-testid="test-todo-edit-button"]');
    elements.deleteButton = document.querySelector('[data-testid="test-todo-delete-button"]');
    elements.expandToggle = document.querySelector('[data-testid="test-todo-expand-toggle"]');
    elements.collapsibleSection = document.querySelector('[data-testid="test-todo-collapsible-section"]');
    elements.editForm = document.querySelector('[data-testid="test-todo-edit-form"]');
    elements.editTitle = document.querySelector('[data-testid="test-todo-edit-title-input"]');
    elements.editDescription = document.querySelector('[data-testid="test-todo-edit-description-input"]');
    elements.editPriority = document.querySelector('[data-testid="test-todo-edit-priority-select"]');
    elements.editDueDate = document.querySelector('[data-testid="test-todo-edit-due-date-input"]');
    elements.saveButton = document.querySelector('[data-testid="test-todo-save-button"]');
    elements.cancelButton = document.querySelector('[data-testid="test-todo-cancel-button"]');
}

function startTimer() {
    intervalId = setInterval(() => {
        if (todoState.status !== 'Done') {
            updateUI();
        }
    }, REFRESH_MS);
}

function setupEventListeners() {
    elements.completeToggle.addEventListener('change', handleCompleteToggle);
    elements.statusControl.addEventListener('change', handleStatusControl);
    elements.editButton.addEventListener('click', handleEditButton);
    elements.deleteButton.addEventListener('click', handleDeleteButton);
    elements.expandToggle.addEventListener('click', handleExpandToggle);
    elements.saveButton.addEventListener('click', handleSave);
    elements.cancelButton.addEventListener('click', handleCancel);
}

function initializeFormDefaults() {
    elements.editDueDate.value = todoState.dueDate.slice(0, 16);
}

window.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    initializeFormDefaults();
    setupEventListeners();
    updateUI();
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    startTimer();
});