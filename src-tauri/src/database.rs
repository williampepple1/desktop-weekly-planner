use rusqlite::{Connection, Result, params};
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use std::sync::Mutex;
use tauri::{AppHandle, Manager};

#[derive(Debug, Serialize, Deserialize)]
pub struct Task {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub day: String, // 'monday', 'tuesday', etc.
    pub status: String, // 'todo', 'in-progress', 'completed'
    pub priority: String, // 'low', 'medium', 'high'
    pub week_id: String, // ISO date string of the week start (e.g., '2024-01-01')
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

pub struct Database {
    conn: Mutex<Connection>,
}

impl Database {
    pub fn new(app_handle: &AppHandle) -> Result<Self> {
        let app_dir = app_handle.path().app_data_dir().expect("Failed to get app data dir");
        std::fs::create_dir_all(&app_dir).expect("Failed to create app data directory");
        
        let db_path = app_dir.join("weekly_planner.db");
        let conn = Connection::open(db_path)?;
        
        // Initialize the database with tables
        Self::init_database(&conn)?;
        
        Ok(Database {
            conn: Mutex::new(conn),
        })
    }
    
    fn init_database(conn: &Connection) -> Result<()> {
        conn.execute(
            "CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                day TEXT NOT NULL,
                status TEXT NOT NULL,
                priority TEXT NOT NULL,
                week_id TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )",
            [],
        )?;
        
        Ok(())
    }
    
    pub fn add_task(&self, task: &Task) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO tasks (id, title, description, day, status, priority, week_id, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
            params![
                task.id,
                task.title,
                task.description,
                task.day,
                task.status,
                task.priority,
                task.week_id,
                task.created_at.to_rfc3339(),
                task.updated_at.to_rfc3339(),
            ],
        )?;
        Ok(())
    }
    
    pub fn get_tasks_for_week(&self, week_id: &str) -> Result<Vec<Task>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, title, description, day, status, priority, week_id, created_at, updated_at
             FROM tasks WHERE week_id = ?1 ORDER BY created_at ASC"
        )?;
        
        let task_iter = stmt.query_map(params![week_id], |row| {
            Ok(Task {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                day: row.get(3)?,
                status: row.get(4)?,
                priority: row.get(5)?,
                week_id: row.get(6)?,
                created_at: DateTime::parse_from_rfc3339(&row.get::<_, String>(7)?)
                    .unwrap()
                    .with_timezone(&Utc),
                updated_at: DateTime::parse_from_rfc3339(&row.get::<_, String>(8)?)
                    .unwrap()
                    .with_timezone(&Utc),
            })
        })?;
        
        let mut tasks = Vec::new();
        for task in task_iter {
            tasks.push(task?);
        }
        Ok(tasks)
    }
    
    pub fn update_task(&self, id: &str, updates: &TaskUpdate) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        
        // For now, let's use a simpler approach - update each field individually if present
        if let Some(title) = &updates.title {
            conn.execute("UPDATE tasks SET title = ?, updated_at = ? WHERE id = ?", 
                params![title, Utc::now().to_rfc3339(), id])?;
        }
        if let Some(description) = &updates.description {
            conn.execute("UPDATE tasks SET description = ?, updated_at = ? WHERE id = ?", 
                params![description, Utc::now().to_rfc3339(), id])?;
        }
        if let Some(day) = &updates.day {
            conn.execute("UPDATE tasks SET day = ?, updated_at = ? WHERE id = ?", 
                params![day, Utc::now().to_rfc3339(), id])?;
        }
        if let Some(status) = &updates.status {
            conn.execute("UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?", 
                params![status, Utc::now().to_rfc3339(), id])?;
        }
        if let Some(priority) = &updates.priority {
            conn.execute("UPDATE tasks SET priority = ?, updated_at = ? WHERE id = ?", 
                params![priority, Utc::now().to_rfc3339(), id])?;
        }
        
        Ok(())
    }
    
    pub fn delete_task(&self, id: &str) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM tasks WHERE id = ?", params![id])?;
        Ok(())
    }
}

#[derive(Debug, Deserialize)]
pub struct TaskUpdate {
    pub title: Option<String>,
    pub description: Option<String>,
    pub day: Option<String>,
    pub status: Option<String>,
    pub priority: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateTaskRequest {
    pub title: String,
    pub description: Option<String>,
    pub day: String,
    pub status: String,
    pub priority: String,
    pub week_id: String,
} 