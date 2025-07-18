# Weekly Planner - Desktop App

A modern, offline-first weekly planner built with Tauri, React, TypeScript, and SQLite.

## Features

- **Offline-First**: Works completely offline with local SQLite database
- **Drag & Drop**: Intuitive task management with drag and drop functionality
- **Week View**: Organize tasks by day and status (To Do, In Progress, Completed)
- **Priority Levels**: Set task priorities (Low, Medium, High)
- **Local Storage**: All data stored locally on your machine
- **Cross-Platform**: Works on Windows, macOS, and Linux

## Tech Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Backend**: Rust + Tauri
- **Database**: SQLite (local file-based)
- **UI Components**: Custom components with drag-and-drop support
- **Build Tool**: Vite

## Prerequisites

### Required Software
- **Node.js 18+** and npm
- **Rust** (latest stable) - Install via [rustup.rs](https://rustup.rs/)
- **Tauri CLI** - Will be installed as a dev dependency

### Platform-Specific Requirements

#### Windows
- **Microsoft Visual Studio C++ Build Tools** or **Visual Studio 2022**
- **WebView2** (usually pre-installed with Windows 10/11)
- **Windows 10 SDK** (for building installers)

#### macOS
- **Xcode Command Line Tools**: `xcode-select --install`
- **macOS 10.15+** (for building)

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev
```

#### Linux (Fedora)
```bash
sudo dnf install webkit2gtk3-devel \
    gtk3-devel \
    libappindicator-gtk3-devel \
    librsvg2-devel \
    openssl-devel \
    curl \
    wget
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd desktop-weekly-planner
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Verify Rust installation**
   ```bash
   rustc --version
   cargo --version
   ```

4. **Install Tauri CLI** (if not already installed)
   ```bash
   npm install --save-dev @tauri-apps/cli
   ```

5. **Verify Tauri installation**
   ```bash
   npx tauri --version
   ```

## Development

### Start Development Server
```bash
npm run tauri:dev
```

This command will:
- Start the Vite dev server on `http://localhost:5173`
- Compile the Rust backend
- Launch the Tauri application window
- Enable hot reload for both frontend and backend changes

### Available Scripts
```bash
npm run dev          # Start Vite dev server only
npm run build        # Build frontend for production
npm run tauri:dev    # Start Tauri development
npm run tauri:build  # Build Tauri app for production
npm run tauri:clean  # Clean Tauri build artifacts
```

### Build for Production
```bash
npm run tauri:build
```

This creates platform-specific installers:
- **Windows**: MSI installer in `src-tauri/target/release/bundle/msi/`
- **macOS**: DMG file in `src-tauri/target/release/bundle/dmg/`
- **Linux**: AppImage in `src-tauri/target/release/bundle/appimage/`

## Project Structure

```
desktop-weekly-planner/
├── src/                    # React frontend
│   ├── components/         # React components
│   ├── services/          # Frontend services
│   ├── types/             # TypeScript type definitions
│   └── App.tsx            # Main application component
├── src-tauri/             # Rust backend
│   ├── src/
│   │   ├── database.rs    # SQLite database operations
│   │   ├── lib.rs         # Tauri commands and setup
│   │   └── main.rs        # Application entry point
│   ├── Cargo.toml         # Rust dependencies
│   └── tauri.conf.json    # Tauri configuration
├── package.json           # Node.js dependencies
└── README.md             # This file
```

## Database Schema

The application uses SQLite with a single `tasks` table:

```sql
CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    day TEXT NOT NULL,
    status TEXT NOT NULL,
    priority TEXT NOT NULL,
    week_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

## Key Features

### Task Management
- Create, edit, and delete tasks
- Set task priority (Low, Medium, High)
- Track task status (To Do, In Progress, Completed)
- Organize tasks by day of the week

### Drag & Drop
- Move tasks between status columns
- Move tasks between different days
- Visual feedback during drag operations

### Data Persistence
- All data stored locally in SQLite database
- No internet connection required
- Data persists between application restarts

## Development Notes

### Frontend (React/TypeScript)
- Uses modern React hooks and functional components
- TypeScript for type safety
- Tailwind CSS for styling
- Drag and drop powered by @dnd-kit

### Backend (Rust/Tauri)
- SQLite database with rusqlite crate
- Tauri commands for frontend-backend communication
- Local file storage in app data directory
- Thread-safe database operations with Mutex

### Data Flow
1. Frontend calls Tauri commands via `invoke()`
2. Rust backend processes requests and updates SQLite
3. Database changes are immediately reflected in the UI
4. All operations are synchronous and local

## Building for Distribution

### Windows
```bash
npm run tauri:build
# Installer will be in src-tauri/target/release/bundle/msi/
```

### macOS
```bash
npm run tauri:build
# App bundle will be in src-tauri/target/release/bundle/dmg/
```

### Linux
```bash
npm run tauri:build
# AppImage will be in src-tauri/target/release/bundle/appimage/
```

## Troubleshooting

### Common Issues

1. **Rust compilation errors**
   - Ensure you have the latest Rust toolchain: `rustup update`
   - Check platform-specific build tools are installed
   - Clear Rust cache: `cargo clean`

2. **Tauri build failures**
   - Clear build cache: `npm run tauri:clean`
   - Reinstall dependencies: `npm install`
   - Check Tauri version compatibility: `npx tauri --version`

3. **Database issues**
   - Database file is stored in app data directory
   - Check application logs for SQLite errors
   - Database file location varies by platform:
     - Windows: `%APPDATA%/weekly-planner/weekly_planner.db`
     - macOS: `~/Library/Application Support/weekly-planner/weekly_planner.db`
     - Linux: `~/.local/share/weekly-planner/weekly_planner.db`

4. **Port conflicts**
   - If port 5173 is in use, change it in `vite.config.ts` and `src-tauri/tauri.conf.json`

### Development Tips

- Use `npm run tauri:dev` for development with hot reload
- Check browser console for frontend errors
- Check terminal output for Rust compilation errors
- Use `cargo check` to verify Rust code without building
- Database is automatically created on first run

### Debugging

- **Frontend**: Open browser dev tools in the Tauri window (Ctrl+Shift+I)
- **Backend**: Check terminal output for Rust logs
- **Database**: Use SQLite browser to inspect `planner.db` file

## License

This project is licensed under the MIT License.
