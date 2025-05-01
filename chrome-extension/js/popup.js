document.addEventListener('DOMContentLoaded', function () {
    const frontText = document.getElementById('frontText');
    const backText = document.getElementById('backText');
    const hintText = document.getElementById('hintText');
    const tagsText = document.getElementById('tagsText');
    const saveButton = document.getElementById('saveButton');
    const clearButton = document.getElementById('clearButton');
    const viewCardsLink = document.getElementById('viewCardsLink');

    // Debug: Check if storage is accessible
    chrome.storage.local.get(null, function (items) {
        console.log('Current storage contents:', items);
    });

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
                // Initialize as empty array if undefined
                const flashcards = result.flashcards || [];
                console.log('Current flashcards before adding:', flashcards);

                const newCard = {
                    front: frontText.value.trim(),
                    back: backText.value.trim(),
                    hint: hintText.value.trim(),
                    tags: tagsText.value.split(',').map(tag => tag.trim()).filter(tag => tag),
                    date: new Date().toISOString()
                };

                // Add the new card
                flashcards.push(newCard);

                // Save updated flashcards
                chrome.storage.local.set({ 'flashcards': flashcards }, function () {
                    if (chrome.runtime.lastError) {
                        console.error('Error saving:', chrome.runtime.lastError);
                        saveButton.textContent = 'Error: ' + chrome.runtime.lastError.message;
                        saveButton.style.backgroundColor = '#dc3545';
                        return;
                    }

                    console.log('Saved flashcard:', newCard);
                    console.log('Total flashcards:', flashcards.length);
                    console.log('Updated storage:', flashcards);

                    // Clear the last selected text
                    chrome.storage.local.remove(['lastSelectedText']);

                    // Show success message
                    saveButton.textContent = 'Saved!';
                    saveButton.style.backgroundColor = '#28a745';

                    setTimeout(() => {
                        // Reset button
                        saveButton.textContent = 'Save Card';
                        saveButton.style.backgroundColor = '#4a6da7';

                        // Close the popup window after a delay
                        setTimeout(() => {
                            window.close();
                        }, 500);
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

    // View cards link handler
    viewCardsLink.addEventListener('click', function (e) {
        e.preventDefault();
        // Get the chrome-extension:// URL for the view.html file
        const viewUrl = chrome.runtime.getURL('/html/view.html');
        console.log('Opening view page at:', viewUrl);

        // First try to find if a view window is already open
        chrome.windows.getAll({ populate: true }, function (windows) {
            let viewWindow = null;
            for (let window of windows) {
                for (let tab of window.tabs) {
                    if (tab.url === viewUrl) {
                        viewWindow = window;
                        break;
                    }
                }
                if (viewWindow) break;
            }

            if (viewWindow) {
                // Focus the existing window
                chrome.windows.update(viewWindow.id, { focused: true });
            } else {
                // Create a new window
                chrome.windows.create({
                    url: viewUrl,
                    type: 'popup',
                    width: 800,
                    height: 600
                }, function (window) {
                    if (chrome.runtime.lastError) {
                        console.error('Error opening window:', chrome.runtime.lastError);
                        // Try alternative method
                        chrome.tabs.create({ url: viewUrl });
                    }
                });
            }
        });
    });

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

