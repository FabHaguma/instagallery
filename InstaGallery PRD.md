# **Product Requirements Document (PRD)**

**Product Name:** InstaGallery (Local Media Viewer)

**Target Platform:** Localhost (Web Browser)

**Primary Interface:** React (Frontend) \+ Node.js/Express (Backend) \+ SQLite (Database)

## **1\. Product Overview**

InstaGallery is a locally hosted, browser-based media viewer. It allows users to track specific local folders on their computer and view the images and videos inside them. The core differentiator is its UX/UI: it must closely mimic the web version of Instagram, featuring a profile-like square grid for media, skeleton loaders during data fetching, and an immersive, dark-mode overlay modal for viewing individual media files.

## **2\. Tech Stack**

* **Frontend:** React (**Locked in: Vite for tooling**), Tailwind CSS (for Instagram-like styling), React Router DOM (for navigation), Lucide React (for icons).  
* **Backend:** Node.js, Express.js.  
* **Database:** SQLite (**Locked in: sqlite3 package**).  
* **Development Tooling:** concurrently (or similar) to run both frontend and backend development servers with a single terminal command.  
* **Media Serving:** Express static file serving with proper HTTP Range headers for video streaming.

## **3\. Database Schema (SQLite)**

A very simple database to persist the folders the user has added.

**Table:** folders

* id (INTEGER, Primary Key, Auto-increment)  
* name (TEXT) \- e.g., "Summer Vacation"  
* path (TEXT) \- The absolute path on the local OS (e.g., C:\\Users\\Me\\Pictures\\Summer or /Users/Me/Pictures/Summer)  
* created\_at (DATETIME, Default CURRENT\_TIMESTAMP)

## **4\. UI/UX Specifications (The "Instagram" Feel)**

The application must strictly follow these design paradigms:

### **A. Global Layout**

* **Header:** Sticky top navigation bar with a clean, centered logo, and a "+" button on the right to add a new folder. Border-bottom to separate it from content.  
* **Background/Theme:** Clean white or subtle off-white background (like Instagram Light Mode), or a sleek Dark Mode. Use a max-width container (e.g., max-w-4xl mx-auto) to keep the content centered like Instagram's web layout.

### **B. Home Page (Folder List)**

* Displays a list or a grid of saved folders.  
* Each folder acts like an "Instagram Profile" the user can click into.  
* Should show the Folder Name and the Absolute Path as a subtitle.

### **C. Folder View (The Grid)**

* **Layout:** A strict 3-column CSS Grid.  
* **Items:** Every item must be a perfect square (aspect-square in Tailwind).  
* **Images/Thumbnails:** Must use object-cover so they fill the square without distorting.  
* **Video Indicator:** If the item is a video, display a small "Play" icon in the top-right corner of the square (exactly like Instagram Reels/Videos in a profile grid).  
* **Hover Effect:** Subtle dark overlay on hover.  
* **Loading State:** Before media is loaded, display grey skeleton boxes (animate-pulse) in the 3-column grid.

### **D. Media Modal (The "Post" View)**

When a user clicks a square in the grid:

* **Overlay:** A dark, semi-transparent backdrop (bg-black/80).  
* **Container:** A centered container that holds the media.  
* **Images:** Displayed at their natural aspect ratio, constrained by the viewport height/width so they don't overflow (like Instagram's modal).  
* **Videos:** \* Auto-play enabled.  
  * Loop enabled.  
  * Controls hidden by default, or just a simple custom Mute/Unmute button in the bottom right corner.  
  * Clicking the video itself pauses/plays it.  
* **Close:** Clicking the dark backdrop or an 'X' in the top right closes the modal and stops video playback immediately.

## **5\. API Specifications**

The Express backend must implement the following REST endpoints:

* GET /api/folders  
  * Returns: List of all folders from SQLite.  
* POST /api/folders  
  * Payload: { "name": "String", "path": "Absolute OS Path" }  
  * Action: Saves to SQLite.  
* DELETE /api/folders/:id  
  * Action: Removes folder from SQLite.  
* GET /api/folders/:id/media  
  * Action: Looks up the folder path in SQLite. Uses Node fs.readdir to scan the physical directory. Filters for valid extensions (.jpg, .png, .mp4, etc.).  
  * Returns: Array of objects { name, type (image|video), streamUrl }.  
* GET /stream  
  * Query Param: ?path=URL\_ENCODED\_ABSOLUTE\_FILE\_PATH  
  * Action: Streams the file. **CRITICAL:** For .mp4 and .webm, this endpoint *must* support HTTP 206 Partial Content (Range requests) so videos can scrub and play instantly in the React \<video\> tag without downloading entirely into memory first.

## **6\. Implementation Steps for the AI Agent**

**Agent, please follow these phases sequentially to build the application:**

### **Phase 1: Workspace & Backend Setup**

1. Initialize a root Node.js project. Install concurrently to manage the mono-repo style start command.  
2. Set up the "start" script in the root package.json to trigger both frontend and backend simultaneously (e.g., "dev": "concurrently \\"npm run server\\" \\"npm run client\\"").  
3. Create the backend structure. Install express, cors, and sqlite3.  
4. Create db.js to initialize the SQLite database and create the folders table if it doesn't exist.  
5. Create server.js and implement the CRUD endpoints for /api/folders.

### **Phase 2: File System & Streaming Logic**

1. Implement /api/folders/:id/media. Ensure you handle fs errors gracefully (e.g., if a folder path is invalid or was deleted by the OS).  
2. Implement the /stream endpoint. Ensure proper parsing of the Range header from the browser request. Calculate start, end, and chunksize. Set headers Content-Range, Accept-Ranges, Content-Length, and Content-Type. Pipe the fs.createReadStream to the response.

### **Phase 3: Frontend Setup & Routing**

1. Initialize Vite React app in a client folder.  
2. Install react-router-dom, lucide-react, and configure Tailwind CSS.  
3. Set up the global layout (Top Navbar with "Add Folder" button).  
4. Create routing: / (Home/Folder List) and /folder/:id (Grid View).

### **Phase 4: UI Implementation (Home & Add Folder)**

1. Build a simple UI on the home page to display saved folders.  
2. Implement a modal or form to add a new folder (requiring the user to input the Name and Absolute OS Path).  
3. Connect to GET and POST /api/folders.

### **Phase 5: UI Implementation (Instagram Grid & Modal)**

1. On the /folder/:id route, fetch media. Implement the skeleton loader state.  
2. Build the 3-column aspect-square grid using Tailwind.  
3. Build the Media Modal. Ensure it handles both \<img\> and \<video\> tags dynamically based on the clicked item's type.  
4. Implement the Instagram video behaviors: auto-play, loop, mute toggle, and stop playback on unmount/close.

## **7\. Edge Cases to Handle**

* **Invalid Paths:** If a user adds a path that doesn't exist, the backend should catch the fs error and return a 404/500 with a clean message, which the frontend displays gracefully.  
* **Unsupported Files:** The backend fs.readdir filter must strictly ignore .DS\_Store, Thumbs.db, and non-media files to prevent the UI from breaking.  
* **Path Encoding:** Ensure file paths sent from the frontend to the /stream endpoint are properly encodeURIComponent'd to handle spaces and special characters in file names.