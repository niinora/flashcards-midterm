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
                ${card.hint ? `<div class="flashcard-hint">Hint: ${escapeHtml(card.hint)}</div>` : ''}
                <div class="flashcard-buttons">
                    ${card.hint ? `<button class="flashcard-button hint-button">Show Hint</button>` : ''}
                    <button class="flashcard-button answer-button">Show Answer</button>
                </div>
                ${card.tags && card.tags.length > 0 ? `
                    <div class="flashcard-tags">
                        ${card.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="flashcard-date">${formattedDate}</div>
            `;

            // Add click handlers
            cardElement.addEventListener('click', function (e) {
                // Toggle active state only if clicking the card itself (not buttons)
                if (e.target === cardElement || e.target.classList.contains('flashcard-front')) {
                    this.classList.toggle('active');
                }
            });

            // Add button click handlers
            const hintButton = cardElement.querySelector('.hint-button');
            const answerButton = cardElement.querySelector('.answer-button');
            const hintDiv = cardElement.querySelector('.flashcard-hint');
            const backDiv = cardElement.querySelector('.flashcard-back');

            if (hintButton) {
                hintButton.addEventListener('click', function (e) {
                    e.stopPropagation(); // Prevent card click
                    hintDiv.style.display = hintDiv.style.display === 'block' ? 'none' : 'block';
                    this.textContent = hintDiv.style.display === 'block' ? 'Hide Hint' : 'Show Hint';
                });
            }

            if (answerButton) {
                answerButton.addEventListener('click', function (e) {
                    e.stopPropagation(); // Prevent card click
                    backDiv.style.display = backDiv.style.display === 'block' ? 'none' : 'block';
                    this.textContent = backDiv.style.display === 'block' ? 'Hide Answer' : 'Show Answer';
                });
            }

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

// Function to clear all flashcards
function clearAllFlashcards() {
    if (confirm('Are you sure you want to delete all flashcards? This action cannot be undone.')) {
        chrome.storage.local.set({ flashcards: [] }, function () {
            if (chrome.runtime.lastError) {
                showError('Error clearing flashcards: ' + chrome.runtime.lastError.message);
                return;
            }
            loadFlashcards(); // Refresh the display
        });
    }
}

// Initialize when the document is loaded
document.addEventListener('DOMContentLoaded', function () {
    showDebugInfo('View page initialized');
    loadFlashcards();

    // Add click event listener to refresh button
    const refreshButton = document.getElementById('refresh-button');
    if (refreshButton) {
        refreshButton.addEventListener('click', loadFlashcards);
    }

    // Add click event listener to clear button
    const clearButton = document.getElementById('clear-button');
    if (clearButton) {
        clearButton.addEventListener('click', clearAllFlashcards);
    }
});