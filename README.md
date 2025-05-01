# Midterm Flashcards Chrome Extension

A Chrome extension that allows you to quickly create flashcards while browsing the web. Simply highlight text, right-click, and save it as a flashcard.

## Features

- Create flashcards from any webpage by highlighting text
- Add front (question) and back (answer) to your flashcards
- Optional hints and tags for better organization
- Simple and intuitive interface
- Local storage for your flashcards

## Installation

1. Clone this repository:
```bash
git clone https://github.com/YOUR_USERNAME/midterm-flashcards.git
```

2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the `chrome-extension` folder from this repository

## Usage

1. Highlight any text on a webpage
2. Right-click and select "Save as Flashcard"
3. In the popup window:
   - The highlighted text will appear in the "Back" field
   - Add your question/prompt in the "Front" field
   - Optionally add hints and tags
4. Click "Save Card" to store your flashcard

## Development

The extension is built using:
- HTML/CSS for the popup interface
- JavaScript for functionality
- Chrome Extension Manifest V3

### Project Structure
```
chrome-extension/
├── manifest.json
├── html/
│   └── popup.html
├── js/
│   ├── background.js
│   ├── content.js
│   └── popup.js
└── assets/
    └── extension-icons/
```

## License

This project is licensed under the MIT License - see the LICENSE file for details. 