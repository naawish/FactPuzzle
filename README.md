# FactPuzzle (React Native + Expo)

> A gamified knowledge collection platform that combines logic puzzles with educational content, featuring a custom 3D UI, local SQL persistence, and cross-platform compatibility.

## Overview
This project satisfies the requirements of the Mobile Application Development practical assessment by providing a fully functional React Native + Expo game application. The application includes secure authentication, adaptive layouts, light and dark themes, persistent data storage through a local Node.js/SQLite backend, and interactive game modules. All navigation, state management, and data persistence specifications outlined in the assessment brief have been implemented and are detailed below.

## Table of Contents
- [FactPuzzle (React Native + Expo)](#factpuzzle-react-native--expo)
  - [Overview](#overview)
  - [Table of Contents](#table-of-contents)
  - [Assessment Alignment](#assessment-alignment)
  - [Feature Highlights](#feature-highlights)
  - [Architecture Notes](#architecture-notes)
    - [Navigation](#navigation)
    - [State Management](#state-management)
    - [Persistence Strategy](#persistence-strategy)
    - [Theming \& UI System](#theming--ui-system)
    - [Data Flow Snapshot](#data-flow-snapshot)
  - [Project Structure](#project-structure)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Run in Development](#run-in-development)
    - [Quality Gates](#quality-gates)
    - [Troubleshooting](#troubleshooting)
  - [Screenshots](#screenshots)
  - [Login \& Onboarding](#login--onboarding)
  - [Game Hub (Light \& Dark)](#game-hub-light--dark)
  - [Profile \& Timeline](#profile--timeline)
  - [Leaderboard \& Stats](#leaderboard--stats)
  - [Settings \& Sharing](#settings--sharing)
  - [Testing \& Debugging](#testing--debugging)
  - [Known Issues \& Future Improvements](#known-issues--future-improvements)
  - [Academic Project](#academic-project)
  - [License](#license)

## Assessment Alignment
| Requirement | Evidence in App |
| --- | --- |
| UI / UX & Accessibility | Custom "3D Game" aesthetic with tactile buttons and cards; dynamic theming via `ThemeContext` supporting System/Light/Dark modes; responsive layouts for Mobile and Web. |
| Navigation Flow | Nested Stack + Bottom Tab navigators in `App.js` covering Authentication, Game Hub, Profile, Leaderboard, and Settings. |
| State Management | Global context (`AuthContext`) manages user sessions and API calls; `ThemeContext` controls visual styling; local state handles game logic (Word Finder grid, Hangman drawing). |
| Persistence | Dual-layer persistence: `AsyncStorage` for session management and a local **Node.js + SQLite** server for permanent data storage (User profiles, Fact timelines, Feedback). |
| Core Functionality | Four distinct games (Word Finder, Hangman, Trivia, Tic-Tac-Toe); Profile timeline generation; Social image sharing (`react-native-view-shot`). |
| Code Quality & Documentation | Modular folder structure separating `screens/`, `games/`, and `context/`; clean API integration; automated IP detection for local server connectivity. |

## Feature Highlights
- **Game Arcade Hub** – A central dashboard accessing four distinct logic games with difficulty settings and locked/unlocked states.
- **Word Finder Engine** – A complex algorithm that generates grids based on difficulty, supports multi-directional word placement, and integrates a Dictionary API for hints.
- **Visual Hangman** – A classic word guessing game featuring a custom-drawn stick figure that reacts to player mistakes.
- **Unbeatable Tic-Tac-Toe** – Features a CPU opponent powered by the Minimax algorithm (Hard Mode) and a 2-Player Pass & Play mode.
- **Fact Timeline** – Solved puzzles unlock facts which are saved to a personal timeline, grouped by date (Today, Yesterday, Previous).
- **Social Sharing** – Users can generate branded image cards of their discovered facts to share on social media.
- **Local SQLite Backend** – A custom REST API server that handles multi-user data storage securely.

## Architecture Notes
### Navigation
- A "Switch-like" logic in `App.js` determines whether to show the Auth Stack (Login/Signup) or the App Stack (Tabs) based on the user's session.
- Games open in modal-style stack screens to preserve the "Arcade" feel.

### State Management
- `AuthContext`: Centralizes all API calls (Axios) and manages the `user` object and `isOffline` state.
- `ThemeContext`: Provides the color palette (Orange/Violet) to all components, enabling instant theme switching.

### Persistence Strategy
- **Frontend:** Uses `AsyncStorage` to cache the user profile so the app remains logged in between restarts.
- **Backend:** A Node.js Express server running `sqlite3`. Data is stored in `factpuzzle.sqlite`, allowing for relational data management (Users <-> Solved Facts).

### Theming & UI System
- A custom design system replaces standard native elements with "3D" styles (thick borders, deep shadows, rounded corners) to gamify the experience.
- Web support is handled via `.web.js` extensions, ensuring the layout adapts to desktop monitors (max-width constraints).

### Data Flow Snapshot
Game Logic -> AuthContext (saveSolvedPuzzle) -> Axios POST -> Node.js Server -> SQLite Database -> Profile Screen Update
## Project Structure
.
├── App.js # Main Navigation Entry
├── assets/ # Images and Icons
├── fact-puzzle-server/ # Backend Node.js Server
│ ├── database.js # SQLite Connection
│ ├── server.js # API Endpoints
│ └── factpuzzle.sqlite # Database File
├── src/
│ ├── config.js # Auto-IP Detection
│ ├── context/
│ │ ├── AuthContext.js
│ │ └── ThemeContext.js
│ ├── games/
│ │ ├── HangmanGame.js
│ │ ├── TicTacToeGame.js
│ │ ├── TriviaGame.js
│ │ └── WordFinderGame.js
│ └── screens/
│ ├── HomeScreen.js # Game Hub
│ ├── ProfileScreen.js
│ ├── LoginScreen.js
│ └── ...
├── screenshots/ # Images for README
├── package.json
└── README.md

## Getting Started
### Prerequisites
- Node.js installed on your machine.
- **Expo Go** app installed on your mobile device.
- Your computer and phone must be on the **same Wi-Fi network**.



### Installation
1.  **Install App Dependencies:**
Open your terminal/command prompt:
- git clone https://github.com/naawish/FactPuzzle.git
- cd FactPuzzle

    ```bash
    npm install
    npx expo install react react-dom react-native react-native-web @expo/metro-runtime @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context
    npx expo install @react-native-async-storage/async-storage axios expo-constants
    npx expo install react-native-svg @expo/vector-icons expo-sharing react-native-view-shot
    npm install concurrently
    ```

2.  **Install Server Dependencies:**
    ```bash
    cd fact-puzzle-server
    npm install express cors body-parser sqlite3
    npm install
    ```

### Run in Development
This project requires the backend server to be running. A concurrent script has been set up to launch both the App and the Server with one command:
    ```bash
    npm run dev
    ```

This command starts the Node.js server on Port 3000 and the Expo Bundler.

### Alternative Development
The Manual Method (Recommended for QR Code visibility)
If the QR code isn't showing up, open two separate terminal windows:

Terminal 1 (Backend Server):

    ```bash
        cd FactPuzzle/fact-puzzle-server
        node server.js
    ```
You should see: "SQLite Server running on port 3000"

Terminal 2 (Mobile App):
    ```bash
       cd FactPuzzle
       npx expo start -c
    ```

### Quality Gates
- Offline Detection: The app includes an Axios interceptor that detects network failures and displays an "Offline Mode" badge if the server cannot be reached.
- IP Configuration: The app uses expo-constants to automatically detect your computer's IP address, removing the need for manual configuration in most network environments.

### Troubleshooting
- Network Error / Login Failed: Ensure your firewall allows connections on Port 3000. Ensure both devices are on the same Wi-Fi.
- Database Missing: If the server crashes, ensure you ran npm install inside the fact-puzzle-server folder specifically.
Screenshots

### Login & Onboarding
User-friendly forms with custom 3D styling and theme support.
Login Screen	Sign Up Screen
<img src="screenshots/login.jpg" width="300" alt="Login" />	<img src="screenshots/sign_up.jpg" width="300" alt="Sign Up" />

## Game Hub (Light & Dark)
The central hub for accessing games, showcasing the dynamic theming engine.
Light Mode	Dark Mode
<img src="screenshots/Homescreen.jpg" width="300" alt="Home Light" />	<img src="screenshots/Homescreen_darkmode.jpg" width="300" alt="Home Dark" />

## Profile & Timeline
A visual timeline of unlocked knowledge, grouped by date.
Profile Light	Profile Dark
<img src="screenshots/Profile_screen.jpg" width="300" alt="Profile" />	<img src="screenshots/Profile_darkmode.jpg" width="300" alt="Profile Dark" />

## Leaderboard & Stats
Tracks individual game wins and global user rankings.
Leaderboard Light	Leaderboard Dark
<img src="screenshots/Leaderboard.jpg" width="300" alt="Leaderboard" />	<img src="screenshots/Leaderboard_darkmode.jpg" width="300" alt="Leaderboard Dark" />

## Settings & Sharing
Manage account details and share achievements.
Settings Menu	Social Share Card
<img src="screenshots/settings.jpg" width="300" alt="Settings" />	<img src="screenshots/fact%20share.PNG" width="300" alt="Fact Share" />


### Testing & Debugging
- DManual Testing: Each game has been tested for win/loss conditions, difficulty adjustments, and API failure fallbacks (e.g., Hangman uses a local word list if the API fails).
- DBackend Testing: API endpoints (/login, /save-puzzle) were verified using Postman and console logging within the custom server.js middleware.
Web Compatibility: Layouts utilize maxWidth constraints and platform-specific files (.web.js) to ensure the UI does not stretch on desktop browsers.

### Known Issues & Future Improvements
- Web View Limitations – The "Share Image" feature is disabled on the Web version due to browser security limitations regarding react-native-view-shot.
- Keyboard Handling – On smaller devices, the keyboard may occasionally cover input fields in the Trivia game, though KeyboardAvoidingView is implemented to minimize this.
- Cloud Migration – Moving from SQLite to Firebase Firestore would allow users to log in from any network (e.g., 4G/5G) without needing to be on the same local Wi-Fi.

### Academic Project
This is an educational project developed as part of:
Module: UFCF7H-15-3 Mobile Applications
Institution: University of West of England in association with Villa College

### License
MIT License