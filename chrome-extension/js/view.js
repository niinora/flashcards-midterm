// Debug flag - set to true to see debug information
const DEBUG = false;

// Function to show error messages
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

// Function to show debug information
function showDebugInfo(info) {
    if (!DEBUG) return;
    const debugDiv = document.getElementById('debug-info');
    if (debugDiv) {
        debugDiv.textContent += info + '\n';
    }
    console.log(info); // Also log to console
}

// Function to display flashcards
function displayFlashcards(flashcards) {
    const container = document.getElementById('flashcards-container');
    const noCards = document.getElementById('no-cards');

    // Clear existing content
    container.innerHTML = '';

    if (!flashcards || flashcards.length === 0) {
        showDebugInfo('No flashcards found in storage');
        noCards.style.display = 'block';
        container.style.display = 'none';
        return;
    }

    showDebugInfo(`Found ${flashcards.length} flashcards`);
    noCards.style.display = 'none';
    container.style.display = 'block';

    // Display flashcards in reverse chronological order
    const sortedCards = [...flashcards].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedCards.forEach((card, index) => {
        showDebugInfo(`Displaying card ${index + 1}:`);
        showDebugInfo(JSON.stringify(card, null, 2));

        const cardElement = document.createElement('div');
        cardElement.className = 'flashcard';

        try {
            const date = new Date(card.date);
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

            cardElement.innerHTML = `
                <div class="flashcard-front">Q: ${escapeHtml(card.front)}</div>
                <div class="flashcard-back">A: ${escapeHtml(card.back)}</div>
                ${card.tags && card.tags.length > 0 ? `
                    <div class="flashcard-tags">
                        ${card.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="flashcard-date">${formattedDate}</div>
            `;

            container.appendChild(cardElement);
        } catch (error) {
            showDebugInfo(`Error displaying card ${index + 1}: ${error.message}`);
        }
    });
}

// Function to escape HTML to prevent XSS
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Function to load flashcards from storage
function loadFlashcards() {
    showDebugInfo('Loading flashcards...');

    try {
        chrome.storage.local.get(['flashcards'], function (result) {
            if (chrome.runtime.lastError) {
                const error = chrome.runtime.lastError.message;
                showDebugInfo('Error accessing storage: ' + error);
                showError('Error accessing storage: ' + error);
                return;
            }

            showDebugInfo('Storage access successful');
            showDebugInfo('Retrieved data: ' + JSON.stringify(result, null, 2));

            displayFlashcards(result.flashcards);
        });
    } catch (error) {
        showDebugInfo('Error: ' + error.message);
        showError('Error: ' + error.message);
    }
}

// Listen for storage changes
chrome.storage.onChanged.addListener(function (changes, namespace) {
    if (namespace === 'local' && changes.flashcards) {
        showDebugInfo('Storage changed, reloading flashcards...');
        loadFlashcards();
    }
});

// Initialize when the document is loaded
document.addEventListener('DOMContentLoaded', function () {
    showDebugInfo('View page initialized');
    loadFlashcards();

    // Add click event listener to refresh button
    const refreshButton = document.getElementById('refresh-button');
    if (refreshButton) {
        refreshButton.addEventListener('click', loadFlashcards);
    }
});