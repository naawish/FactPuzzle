# FactPuzzle (React Native + Expo)

> A gamified knowledge collection platform that combines logic puzzles with educational content, featuring a custom 3D UI, simulated local persistence, and cross-platform compatibility.

## Overview
This project satisfies the requirements of the Mobile Application Development practical assessment by providing a fully functional React Native + Expo game application.

The application includes secure authentication simulation, adaptive layouts, light and dark themes, and interactive game modules. To ensure ease of testing and portability, the application uses a **Simulated Database Architecture** (powered by AsyncStorage), allowing the app to persist user data, profiles, and game history locally on the device without requiring an external database server connection.

## Table of Contents
- [FactPuzzle (React Native + Expo)](#factpuzzle-react-native--expo)
  - [Overview](#overview)
  - [Assessment Alignment](#assessment-alignment)
  - [Feature Highlights](#feature-highlights)
  - [Architecture Notes](#architecture-notes)
  - [Project Structure](#project-structure)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Running the App](#running-the-app)
  - [Screenshots](#screenshots)
  - [Testing \& Debugging](#testing--debugging)
  - [Known Issues](#known-issues)
  - [Academic Project](#academic-project)
  - [License](#license)

## Assessment Alignment
| Requirement | Evidence in App |
| --- | --- |
| **UI / UX & Accessibility** | Custom "3D Game" aesthetic with tactile buttons; dynamic theming via `ThemeContext` supporting System/Light/Dark modes; responsive layouts for Mobile and Web; Accessibility props on buttons. |
| **Navigation Flow** | Modern **Expo Router** (file-based routing) in the `app/` directory, handling Auth stacks, Tab navigation, and Modal game screens. |
| **State Management** | Global context (`AuthContext`) manages user sessions, game logic, and data simulation; `ThemeContext` controls visual styling. |
| **Persistence** | **Simulated Multi-User DB**: Uses `AsyncStorage` to mock a relational database, allowing multiple users to sign up/login and maintain separate game histories and profiles locally. |
| **Core Functionality** | Five distinct games (Word Finder, Hangman, Trivia, Tic-Tac-Toe, Flags); Profile timeline generation; Social image sharing. |
| **Code Quality** | Written in **TypeScript**; modular folder structure; clean API integration; robust error handling and offline fallbacks. |

## Feature Highlights
- **Game Arcade Hub** – A central dashboard accessing five logic games with difficulty settings.
- **Word Finder Engine** – Generates grids based on difficulty with multi-directional placement.
- **Visual Hangman** – A classic word guessing game with a custom-drawn stick figure and offline fallback.
- **Unbeatable Tic-Tac-Toe** – Features a CPU opponent powered by the **Minimax Algorithm** (Hard Mode).
- **Flag Guesser** – A visual quiz game integrated with the RestCountries API.
- **Fact Timeline** – Solved puzzles unlock facts which are saved to a personal timeline, grouped by date.
- **Social Sharing** – Users can generate branded image cards of their discovered facts to share on social media.

## Architecture Notes
### Navigation (Expo Router)
The app uses the modern `expo-router` library.
- `app/(auth)`: Handles Login and Signup screens.
- `app/(tabs)`: Handles the main tab bar (Hub, Leaderboard, Profile).
- `app/game`: Handles specific game screens (WordFinder, Hangman, etc.) presented as cards.

### Persistence Strategy (Simulated Backend)
To ensure the app is easy to mark and test without network configuration:
- The `AuthContext` simulates a backend server.
- User data (credentials, solved puzzles, settings) is stored in JSON format inside the device's `AsyncStorage`.
- This allows for a full "Sign Up -> Login -> Play -> Logout -> Login as different user" flow to function 100% offline.

#### Data Flow
`Game Logic` -> `AuthContext (saveSolvedPuzzle)` -> `AsyncStorage (Mock DB)` -> `Profile Screen Update`

## Project Structure
```text
.
├── app/                    # Expo Router Pages
│   ├── (auth)/             # Login / Signup
│   ├── (tabs)/             # Home / Community / Profile
│   ├── game/               # Individual Game Screens
│   └── _layout.tsx         # Root Navigation & Providers
├── src/
│   ├── components/         # Reusable UI (Button3D)
│   ├── context/            # Global State (Auth, Theme)
│   ├── games/              # Game Logic Engines
│   │   ├── HangmanGame.tsx
│   │   ├── TicTacToeGame.tsx
│   │   ├── TriviaGame.tsx
│   │   ├── WordFinderGame.tsx
│   │   └── FlagGame.tsx
│   └── theme/              # Design System Tokens
├── assets/                 # Images and Icons
├── screenshots/            # Documentation Images
├── package.json
└── README.md
```

### Prerequisites
- Node.js installed on your machine.
- **Expo Go** app installed on your mobile device.
- Your computer and phone must be on the **same Wi-Fi network**.

### Installation
1.  **Clone and Install:**
    ```
    git clone https://github.com/naawish/FactPuzzle.git
    cd FactPuzzle
    npm install
    ```
##Running the App
- Since the database is simulated locally, you do not need to run a separate backend server.

##Start Expo:
    ```
    npx expo start -c
    ```
(The -c flag clears the cache to ensure assets load correctly).

Test on Device:
Scan the QR code with Expo Go (Android) or the Camera app (iOS).
Test on Web:
Press w in the terminal to launch the responsive web version.


### Quality Gates
- Offline Detection: The app includes an Axios interceptor that detects network failures and displays an "Offline Mode" badge if the server cannot be reached.
- IP Configuration: The app uses expo-constants to automatically detect your computer's IP address, removing the need for manual configuration in most network environments.

### Troubleshooting
- Network Error / Login Failed: Ensure your firewall allows connections on Port 3000. Ensure both devices are on the same Wi-Fi.
- Database Missing: If the server crashes, ensure you ran npm install inside the fact-puzzle-server folder specifically.
Screenshots

### Login & Onboarding
- Some screenshots may not reflect the latest build and may have some visual changes.
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
- Automated Testing: Unit tests for game logic (Tic-Tac-Toe algorithms) are included.
Run tests via: ``` npm test```
- Manual Testing: Each game includes fallback mechanisms (e.g., Hangman loads a local word list if the API fails/offline).
- Web Compatibility: Layouts utilize maxWidth constraints and platform-specific files (.web.tsx) to ensure the UI does not   stretch on desktop browsers. Currently web version are untested as it is not a part of the scope of this assignment project. 
- ARCHIVE_files and ARCHIVE_server is kept in the main folder, archived files from migration from Javascript to Typescript.

### Known Issues & Future Improvements
- Web View Limitations: The "Share Image" feature is disabled on the Web version due to browser security limitations regarding react-native-view-shot.
- Keyboard Handling: On smaller devices, the keyboard may occasionally cover input fields in the Trivia game, though KeyboardAvoidingView is implemented to minimize this.

### Academic Project
This is an educational project developed as part of:
Module: UFCF7H-15-3 Mobile Applications
Institution: University of West of England in association with Villa College

### License
- MIT License