# Kahf Book Project

## Overview
This project is a streamlined content management system for digital stories, particularly Islamic tales for children. Stories are added as JSON files in the root directory, with assets organized in prophet-specific subfolders under `assets/`.

## File Structure
- `index.html`: Library page listing available stories
- `book.html`: Book reader page
- `book.js`: Primary JavaScript for both library and reader functionality
- `book.css`: Main stylesheet
- `server.js`: Node.js server for serving files and API
- `prophet_nuh.json`: Sample story data
- `assets/`: Directory for image assets
  - `prophet_nuh/`: Subfolder for Prophet Nuh story images

## Running the Project
1. Install dependencies: `npm install`
2. Start the server: `node server.js`
3. Open `http://localhost:3000/index.html` in your browser

## Adding New Stories
1. Create a new JSON file in the root directory (e.g., `new_story.json`)
2. Organize images in `assets/new_story/` 
3. The library will automatically detect and list the new story

## JSON Schema Requirements
Each story JSON file must follow this structure:

```json
{
  "title": "Story Title",
  "subtitle": "Optional Subtitle",
  "pages": [
    {
      "text": "Page text content",
      "image": "assets/story_folder/image.jpg",
      "imageAlt": "Alternative text for image"
    }
    // Additional pages...
  ]
}
```

- `title`: Required string for the story title
- `subtitle`: Optional string
- `pages`: Array of page objects
  - `text`: Required string for page text
  - `image`: Optional path to image (relative to root)
  - `imageAlt`: Optional alt text for accessibility

Ensure image paths point to the correct subfolder in `assets/`.

## Testing
Run `node test.js` for automated tests using Puppeteer.