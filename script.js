// Due date: April 20, 2026, 12:00 UTC
const DUE_DATE = new Date('2026-04-20T12:00:00Z');

function calculateTimeRemaining() {
    const now = new Date();
    const diffMs = DUE_DATE - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffMs < 0) {
        const overdueHours = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60));
        const overdueMinutes = Math.floor((Math.abs(diffMs) % (1000 * 60 * 60)) / (1000 * 60));
        if (overdueHours > 0) {
            return `Overdue by ${overdueHours} hours`;
        } else {
            return `Overdue by ${overdueMinutes} minutes`;
        }
    } else if (diffDays > 1) {
        return `Due in ${diffDays} days`;
    } else if (diffDays === 1) {
        return 'Due tomorrow';
    } else if (diffHours > 0) {
        return `Due in ${diffHours} hours`;
    } else if (diffMinutes > 0) {
        return `Due in ${diffMinutes} minutes`;
    } else {
        return 'Due now!';
    }
}

function updateTimeRemaining() {
    const timeRemainingElement = document.querySelector('[data-testid="test-todo-time-remaining"]');
    if (timeRemainingElement) {
        timeRemainingElement.textContent = calculateTimeRemaining();
    }
}

function handleCompleteToggle() {
    const card = document.querySelector('[data-testid="test-todo-card"]');
    const statusElement = document.querySelector('[data-testid="test-todo-status"]');
    const checkbox = document.querySelector('[data-testid="test-todo-complete-toggle"]');

    if (checkbox.checked) {
        card.classList.add('completed');
        statusElement.textContent = 'Done';
    } else {
        card.classList.remove('completed');
        statusElement.textContent = 'Pending';
    }
}

function handleEdit() {
    console.log('Edit button clicked');
    // Dummy action
}

function handleDelete() {
    alert('Delete button clicked');
    // Dummy action
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateTimeRemaining();

    // Update time remaining every 60 seconds
    setInterval(updateTimeRemaining, 60000);

    // Event listeners
    const checkbox = document.querySelector('[data-testid="test-todo-complete-toggle"]');
    const editButton = document.querySelector('[data-testid="test-todo-edit-button"]');
    const deleteButton = document.querySelector('[data-testid="test-todo-delete-button"]');

    if (checkbox) {
        checkbox.addEventListener('change', handleCompleteToggle);
    }

    if (editButton) {
        editButton.addEventListener('click', handleEdit);
    }

    if (deleteButton) {
        deleteButton.addEventListener('click', handleDelete);
    }
});