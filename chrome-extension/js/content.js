// Keep track of selected text
let selectedText = '';

// Listen for text selection
document.addEventListener('mouseup', function () {
    const text = window.getSelection().toString().trim();
    if (text) {
        selectedText = text;
        // Send the selected text to the background script
        chrome.runtime.sendMessage({
            type: 'textSelected',
            text: selectedText
        });
    }
});

// Listen for messages from the extension
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type === "getSelectedText") {
        sendResponse({ text: selectedText });
    }
    return true; // Required to use sendResponse asynchronously
});