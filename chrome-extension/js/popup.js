document.addEventListener('DOMContentLoaded', function () {
    const frontText = document.getElementById('frontText');
    const backText = document.getElementById('backText');
    const hintText = document.getElementById('hintText');
    const tagsText = document.getElementById('tagsText');
    const saveButton = document.getElementById('saveButton');
    const clearButton = document.getElementById('clearButton');

    // Get the last selected text when popup opens
    chrome.storage.local.get(['lastSelectedText'], function (result) {
        if (result.lastSelectedText) {
            backText.value = result.lastSelectedText;
            // Show visual feedback that text was loaded
            backText.style.backgroundColor = '#f0f9f0';
            setTimeout(() => {
                backText.style.backgroundColor = '';
            }, 200);
        }
    });

    // Save button click handler
    saveButton.addEventListener('click', function () {
        if (frontText.value.trim() && backText.value.trim()) {
            // Get existing flashcards
            chrome.storage.local.get(['flashcards'], function (result) {
                const flashcards = result.flashcards || [];

                // Add new flashcard
                flashcards.push({
                    front: frontText.value.trim(),
                    back: backText.value.trim(),
                    hint: hintText.value.trim(),
                    tags: tagsText.value.split(',').map(tag => tag.trim()).filter(tag => tag),
                    date: new Date().toISOString()
                });

                // Save updated flashcards
                chrome.storage.local.set({ 'flashcards': flashcards }, function () {
                    // Clear the last selected text
                    chrome.storage.local.remove(['lastSelectedText']);
                    // Clear the badge
                    chrome.action.setBadgeText({ text: '' });
                    // Show success message
                    saveButton.textContent = 'Saved!';
                    saveButton.style.backgroundColor = '#28a745';
                    setTimeout(() => {
                        saveButton.textContent = 'Save Card';
                        saveButton.style.backgroundColor = '#4a6da7';
                        // Clear the form
                        clearForm();
                    }, 1000);
                });
            });
        } else {
            // Show error if front or back is empty
            saveButton.textContent = 'Front and Back Required';
            saveButton.style.backgroundColor = '#dc3545';
            setTimeout(() => {
                saveButton.textContent = 'Save Card';
                saveButton.style.backgroundColor = '#4a6da7';
            }, 2000);
        }
    });

    // Clear button click handler
    clearButton.addEventListener('click', clearForm);

    // Function to clear the form
    function clearForm() {
        frontText.value = '';
        backText.value = '';
        hintText.value = '';
        tagsText.value = '';
    }

    // Add keyboard shortcuts
    document.addEventListener('keydown', function (e) {
        // Ctrl/Cmd + Enter to save
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            saveButton.click();
        }
        // Escape to clear
        if (e.key === 'Escape') {
            clearButton.click();
        }
    });
});

