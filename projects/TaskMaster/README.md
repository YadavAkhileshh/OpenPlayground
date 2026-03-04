# TaskMaster - Kanban Project Management Tool

A comprehensive Kanban-style project management application built with React (via CDN) that rivals tools like Trello and Asana.

## ✨ Features

### 📋 Interactive Kanban Board
- **Drag-and-drop** tasks between columns (To Do, In Progress, Review, Done)
- Smooth physics-based animations powered by SortableJS
- Visual feedback during drag operations

### 🏷️ Rich Task Management
- **Priority Levels**: Low, Medium, High, Critical with color-coded badges
- **Due Dates**: Visual countdown and overdue warnings
- **Tags**: Custom tags for categorization
- **Descriptions**: Detailed task descriptions

### 🔍 Advanced Search & Filter
- **Instant Search**: Find tasks by title or description
- **Priority Filter**: Filter by priority levels
- **Tag Filter**: Filter by custom tags
- **Combined Filters**: Use multiple filters simultaneously

### ⚡ Quick Actions
- **Quick Add Button**: Floating action button for rapid task creation
- **Context Menu**: Right-click tasks for quick actions (Edit, Duplicate, Delete)
- **Double-click**: Double-click any task to edit

### 💾 Data Persistence
- **Auto-save**: All changes automatically saved to localStorage
- **State Restoration**: Pick up exactly where you left off

## 🎨 Design Features

- Modern dark theme with premium aesthetics
- Smooth animations and transitions
- Fully responsive (mobile, tablet, desktop)
- High contrast for readability
- Glassmorphism effects
- Custom scrollbars

## 🚀 How to Use

### Creating Tasks
1. Click the "New Task" button in the header or the floating "+" button
2. Fill in task details:
   - Title (required)
   - Description (optional)
   - Column/Status
   - Priority level
   - Due date
   - Tags (press Enter to add)
3. Click "Create Task"

### Managing Tasks
- **Move**: Drag and drop tasks between columns
- **Edit**: Double-click a task or right-click → Edit
- **Duplicate**: Right-click → Duplicate
- **Delete**: Right-click → Delete

### Search & Filter
- Use the search bar to find tasks by name or content
- Click "Priority" or "Tags" to filter by specific criteria
- Combine multiple filters for precise results
- Click "Clear Filters" to reset

## 🛠️ Technical Implementation

### Tech Stack
- **React 18** (via CDN - no build process)
- **Babel Standalone** (JSX transformation in browser)
- **SortableJS** (drag-and-drop functionality)
- **localStorage** (data persistence)
- **CSS Grid** (responsive layout)
- **Font Awesome** (icons)
- **Google Fonts** (Inter typography)

### Architecture
- **Component-based**: Modular React components
- **Context API**: Centralized state management with TaskStore
- **Hooks**: useState, useEffect, useContext, useRef
- **Event-driven**: Efficient state updates and re-renders

### Key Components
- `TaskStoreProvider`: Global state management
- `App`: Main application container
- `SearchFilterBar`: Search and filter UI
- `KanbanColumn`: Column container with drag-and-drop
- `TaskCard`: Individual task display
- `TaskModal`: Task creation/editing form

## 📊 Data Structure

### Task Object
```javascript
{
  id: "uuid",
  title: "Task title",
  description: "Task description",
  priority: "low" | "medium" | "high" | "critical",
  dueDate: "YYYY-MM-DD",
  tags: ["tag1", "tag2"],
  columnId: "column-id",
  createdAt: "ISO timestamp",
  updatedAt: "ISO timestamp"
}
```

### Column Object
```javascript
{
  id: "uuid",
  title: "Column name",
  order: 0
}
```

## 🎯 Future Enhancements

- [ ] Dark/Light mode toggle
- [ ] Export/Import boards (JSON)
- [ ] Keyboard shortcuts
- [ ] Task attachments
- [ ] Subtasks/checklists
- [ ] Custom column colors
- [ ] Backend API integration
- [ ] Multi-board support
- [ ] Real-time collaboration
- [ ] Analytics dashboard

## 📱 Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)

## 🐛 Known Limitations

- No backend - data stored locally only
- No user authentication
- No collaboration features
- Single board only

## 📝 License

Part of the 100 Days of Web Development challenge.

## 🤝 Contributing

Feel free to fork and improve! This is a learning project.

---

**Built with ❤️ as part of Day 129 - 100 Days of Web Development**
