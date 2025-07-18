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

- Node.js 18+ and npm
- Rust (latest stable)
- Platform-specific build tools:
  - **Windows**: Visual Studio Build Tools
  - **macOS**: Xcode Command Line Tools
  - **Linux**: Build essentials

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd desktop-weekly-planner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Tauri CLI**
   ```bash
   npm install --save-dev @tauri-apps/cli
   ```

## Development

### Start Development Server
```bash
npm run tauri:dev
```

This will:
- Start the Vite dev server
- Build the Rust backend
- Launch the Tauri application window

### Build for Production
```bash
npm run tauri:build
```

This creates platform-specific installers in the `src-tauri/target/release/bundle/` directory.

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

2. **Tauri build failures**
   - Clear build cache: `npm run tauri clean`
   - Reinstall dependencies: `npm install`

3. **Database issues**
   - Database file is stored in app data directory
   - Check application logs for SQLite errors

### Development Tips

- Use `npm run tauri:dev` for development with hot reload
- Check browser console for frontend errors
- Check terminal output for Rust compilation errors
- Database file location varies by platform:
  - Windows: `%APPDATA%/weekly-planner/weekly_planner.db`
  - macOS: `~/Library/Application Support/weekly-planner/weekly_planner.db`
  - Linux: `~/.local/share/weekly-planner/weekly_planner.db`

## License

This project is licensed under the MIT License.
