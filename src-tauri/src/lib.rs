mod database;

use database::{Database, Task, TaskUpdate, CreateTaskRequest};
use std::sync::Mutex;
use tauri::{State, Manager};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      
      // Initialize database
      let db = Database::new(&app.handle())?;
      app.manage(Mutex::new(db));
      
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      add_task,
      get_tasks_for_week,
      update_task,
      delete_task,
      update_task_status,
      update_task_day
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[tauri::command]
async fn add_task(
  db: State<'_, Mutex<Database>>,
  request: CreateTaskRequest,
) -> Result<String, String> {
  let db = db.lock().map_err(|_| "Database lock error")?;
  
  let task = Task {
    id: uuid::Uuid::new_v4().to_string(),
    title: request.title,
    description: request.description,
    day: request.day,
    status: request.status,
    priority: request.priority,
    week_id: request.week_id,
    created_at: chrono::Utc::now(),
    updated_at: chrono::Utc::now(),
  };
  
  db.add_task(&task).map_err(|e| e.to_string())?;
  Ok(task.id)
}

#[tauri::command]
async fn get_tasks_for_week(
  db: State<'_, Mutex<Database>>,
  week_id: String,
) -> Result<Vec<Task>, String> {
  let db = db.lock().map_err(|_| "Database lock error")?;
  db.get_tasks_for_week(&week_id).map_err(|e| e.to_string())
}

#[tauri::command]
async fn update_task(
  db: State<'_, Mutex<Database>>,
  id: String,
  updates: TaskUpdate,
) -> Result<(), String> {
  let db = db.lock().map_err(|_| "Database lock error")?;
  db.update_task(&id, &updates).map_err(|e| e.to_string())
}

#[tauri::command]
async fn delete_task(
  db: State<'_, Mutex<Database>>,
  id: String,
) -> Result<(), String> {
  let db = db.lock().map_err(|_| "Database lock error")?;
  db.delete_task(&id).map_err(|e| e.to_string())
}

#[tauri::command]
async fn update_task_status(
  db: State<'_, Mutex<Database>>,
  id: String,
  status: String,
) -> Result<(), String> {
  let db = db.lock().map_err(|_| "Database lock error")?;
  let updates = TaskUpdate {
    title: None,
    description: None,
    day: None,
    status: Some(status),
    priority: None,
  };
  db.update_task(&id, &updates).map_err(|e| e.to_string())
}

#[tauri::command]
async fn update_task_day(
  db: State<'_, Mutex<Database>>,
  id: String,
  day: String,
) -> Result<(), String> {
  let db = db.lock().map_err(|_| "Database lock error")?;
  let updates = TaskUpdate {
    title: None,
    description: None,
    day: Some(day),
    status: None,
    priority: None,
  };
  db.update_task(&id, &updates).map_err(|e| e.to_string())
}
