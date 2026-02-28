const { useState, useEffect, useRef, createContext, useContext } = React;
const { createRoot } = ReactDOM;

// =============================================
// UTILITY FUNCTIONS
// =============================================

const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getCountdown = (dueDate) => {
    if (!dueDate) return null;

    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return { text: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`, status: 'overdue' };
    } else if (diffDays === 0) {
        return { text: 'Due today', status: 'due-soon' };
    } else if (diffDays === 1) {
        return { text: 'Due tomorrow', status: 'due-soon' };
    } else if (diffDays <= 3) {
        return { text: `${diffDays} days left`, status: 'due-soon' };
    } else {
        return { text: `${diffDays} days left`, status: 'normal' };
    }
};

const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

// =============================================
// STATE MANAGEMENT - TaskStore Context
// =============================================

const TaskStoreContext = createContext();

const DEFAULT_COLUMNS = [
    { id: 'todo', title: 'To Do', order: 0 },
    { id: 'in-progress', title: 'In Progress', order: 1 },
    { id: 'review', title: 'Review', order: 2 },
    { id: 'done', title: 'Done', order: 3 }
];

const TaskStoreProvider = ({ children }) => {
    const [tasks, setTasks] = useState([]);
    const [columns, setColumns] = useState(DEFAULT_COLUMNS);
    const [filters, setFilters] = useState({
        search: '',
        priority: [],
        tags: [],
        dateRange: null
    });

    // Load from localStorage on mount
    useEffect(() => {
        const savedTasks = localStorage.getItem('taskmaster_tasks');
        const savedColumns = localStorage.getItem('taskmaster_columns');

        if (savedTasks) {
            try {
                setTasks(JSON.parse(savedTasks));
            } catch (e) {
                console.error('Failed to load tasks:', e);
            }
        }

        if (savedColumns) {
            try {
                setColumns(JSON.parse(savedColumns));
            } catch (e) {
                console.error('Failed to load columns:', e);
            }
        }
    }, []);

    // Save to localStorage whenever tasks or columns change
    useEffect(() => {
        localStorage.setItem('taskmaster_tasks', JSON.stringify(tasks));
    }, [tasks]);

    useEffect(() => {
        localStorage.setItem('taskmaster_columns', JSON.stringify(columns));
    }, [columns]);

    const addTask = (task) => {
        const newTask = {
            ...task,
            id: generateUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setTasks(prev => [...prev, newTask]);
        return newTask;
    };

    const updateTask = (id, updates) => {
        setTasks(prev => prev.map(task =>
            task.id === id
                ? { ...task, ...updates, updatedAt: new Date().toISOString() }
                : task
        ));
    };

    const deleteTask = (id) => {
        setTasks(prev => prev.filter(task => task.id !== id));
    };

    const moveTask = (taskId, targetColumnId, newIndex) => {
        setTasks(prev => {
            const taskIndex = prev.findIndex(t => t.id === taskId);
            if (taskIndex === -1) return prev;

            const updatedTasks = [...prev];
            updatedTasks[taskIndex] = {
                ...updatedTasks[taskIndex],
                columnId: targetColumnId,
                updatedAt: new Date().toISOString()
            };

            return updatedTasks;
        });
    };

    const duplicateTask = (id) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        const duplicated = {
            ...task,
            id: generateUUID(),
            title: `${task.title} (Copy)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setTasks(prev => [...prev, duplicated]);
    };

    const addColumn = (column) => {
        const newColumn = {
            ...column,
            id: generateUUID(),
            order: columns.length
        };
        setColumns(prev => [...prev, newColumn]);
    };

    const updateColumn = (id, updates) => {
        setColumns(prev => prev.map(col =>
            col.id === id ? { ...col, ...updates } : col
        ));
    };

    const deleteColumn = (id) => {
        // Move all tasks from this column to the first column
        const firstColumn = columns.find(c => c.id !== id);
        if (firstColumn) {
            setTasks(prev => prev.map(task =>
                task.columnId === id
                    ? { ...task, columnId: firstColumn.id }
                    : task
            ));
        }
        setColumns(prev => prev.filter(col => col.id !== id));
    };

    const getFilteredTasks = () => {
        return tasks.filter(task => {
            // Search filter
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                const matchesTitle = task.title.toLowerCase().includes(searchLower);
                const matchesDescription = task.description?.toLowerCase().includes(searchLower);
                if (!matchesTitle && !matchesDescription) return false;
            }

            // Priority filter
            if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
                return false;
            }

            // Tags filter
            if (filters.tags.length > 0) {
                const hasMatchingTag = filters.tags.some(tag =>
                    task.tags?.includes(tag)
                );
                if (!hasMatchingTag) return false;
            }

            return true;
        });
    };

    const getAllTags = () => {
        const tagsSet = new Set();
        tasks.forEach(task => {
            task.tags?.forEach(tag => tagsSet.add(tag));
        });
        return Array.from(tagsSet);
    };

    const value = {
        tasks,
        columns,
        filters,
        setFilters,
        addTask,
        updateTask,
        deleteTask,
        moveTask,
        duplicateTask,
        addColumn,
        updateColumn,
        deleteColumn,
        getFilteredTasks,
        getAllTags
    };

    return (
        <TaskStoreContext.Provider value={value}>
            {children}
        </TaskStoreContext.Provider>
    );
};

const useTaskStore = () => {
    const context = useContext(TaskStoreContext);
    if (!context) {
        throw new Error('useTaskStore must be used within TaskStoreProvider');
    }
    return context;
};

// =============================================
// TASK CARD COMPONENT
// =============================================

const TaskCard = React.memo(({ task, onEdit, onDelete, onDuplicate }) => {
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowContextMenu(false);
            }
        };

        if (showContextMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showContextMenu]);

    const handleContextMenu = (e) => {
        e.preventDefault();
        setMenuPosition({ x: e.clientX, y: e.clientY });
        setShowContextMenu(true);
    };

    const handleCardClick = (e) => {
        if (e.detail === 2) { // Double click
            onEdit(task);
        }
    };

    // --- HTML5 NATIVE DRAG HANDLERS ---
    const handleDragStart = (e) => {
        e.dataTransfer.setData('text/plain', task.id);
        e.dataTransfer.effectAllowed = 'move';
        e.target.classList.add('dragging');
    };

    const handleDragEnd = (e) => {
        e.target.classList.remove('dragging');
    };

    const countdown = getCountdown(task.dueDate);

    return (
        <>
            {/* Draggable attribute set to true */}
            <div
                className={`task-card priority-${task.priority}`}
                onContextMenu={handleContextMenu}
                onClick={handleCardClick}
                draggable="true"
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                data-task-id={task.id}
            >
                <div className="task-header">
                    <h3 className="task-title">{task.title}</h3>
                    <span className={`priority-badge ${task.priority}`}>
                        {task.priority}
                    </span>
                </div>

                {task.description && (
                    <p className="task-description">{task.description}</p>
                )}

                <div className="task-meta">
                    {task.dueDate && countdown && (
                        <div className={`due-date ${countdown.status}`}>
                            <i className="far fa-calendar"></i>
                            {countdown.text}
                        </div>
                    )}

                    {task.tags && task.tags.length > 0 && (
                        <div className="task-tags">
                            {task.tags.map((tag, idx) => (
                                <span key={idx} className="tag">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showContextMenu && (
                <div
                    ref={menuRef}
                    className="context-menu"
                    style={{ left: menuPosition.x, top: menuPosition.y }}
                >
                    <div className="context-menu-item" onClick={() => {
                        onEdit(task);
                        setShowContextMenu(false);
                    }}>
                        <i className="fas fa-edit"></i> Edit Task
                    </div>
                    <div className="context-menu-item" onClick={() => {
                        onDuplicate(task.id);
                        setShowContextMenu(false);
                    }}>
                        <i className="fas fa-copy"></i> Duplicate
                    </div>
                    <div className="context-menu-divider"></div>
                    <div className="context-menu-item danger" onClick={() => {
                        onDelete(task.id);
                        setShowContextMenu(false);
                    }}>
                        <i className="fas fa-trash"></i> Delete
                    </div>
                </div>
            )}
        </>
    );
});
TaskCard.displayName = 'TaskCard';

// =============================================
// KANBAN COLUMN COMPONENT
// =============================================

const KanbanColumn = ({ column, tasks, onEdit, onDelete, onDuplicate }) => {
    const { moveTask } = useTaskStore();
    const [isDragOver, setIsDragOver] = useState(false);

    // --- HTML5 NATIVE DROP HANDLERS ---
    const handleDragOver = (e) => {
        e.preventDefault(); // Necessary to allow dropping
        e.dataTransfer.dropEffect = 'move';
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const taskId = e.dataTransfer.getData('text/plain');

        if (taskId) {
            // Append to end of column
            moveTask(taskId, column.id, tasks.length);
        }
    };

    // Memoize task rendering
    const taskElements = React.useMemo(() => {
        if (tasks.length === 0) {
            return (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <i className="fas fa-inbox"></i>
                    </div>
                    <p className="empty-state-text">No tasks yet</p>
                </div>
            );
        }

        return tasks.map(task => (
            <TaskCard
                key={task.id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
            />
        ));
    }, [tasks, onEdit, onDelete, onDuplicate]);

    return (
        <div
            className={`kanban-column ${isDragOver ? 'drag-over' : ''}`}
            data-column-id={column.id}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="column-header">
                <div className="column-title-section">
                    <h2 className="column-title">{column.title}</h2>
                    <span className="column-count">{tasks.length}</span>
                </div>
            </div>

            <div className="column-tasks">
                {taskElements}
            </div>
        </div>
    );
};

// =============================================
// TASK MODAL COMPONENT
// =============================================

const TaskModal = ({ isOpen, onClose, task, defaultColumnId }) => {
    const { addTask, updateTask, columns } = useTaskStore();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        tags: [],
        columnId: defaultColumnId || columns[0]?.id
    });
    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                priority: task.priority || 'medium',
                dueDate: task.dueDate || '',
                tags: task.tags || [],
                columnId: task.columnId || defaultColumnId || columns[0]?.id
            });
        } else {
            setFormData({
                title: '',
                description: '',
                priority: 'medium',
                dueDate: '',
                tags: [],
                columnId: defaultColumnId || columns[0]?.id
            });
        }
    }, [task, defaultColumnId, columns]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            alert('Please enter a task title');
            return;
        }

        if (task) {
            updateTask(task.id, formData);
        } else {
            addTask(formData);
        }

        onClose();
    };

    const handleAddTag = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!formData.tags.includes(tagInput.trim())) {
                setFormData(prev => ({
                    ...prev,
                    tags: [...prev.tags, tagInput.trim()]
                }));
            }
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{task ? 'Edit Task' : 'Create New Task'}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="form-label">Title *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Enter task title..."
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                className="form-textarea"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Add task description..."
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Column</label>
                            <select
                                className="form-select"
                                value={formData.columnId}
                                onChange={(e) => setFormData(prev => ({ ...prev, columnId: e.target.value }))}
                            >
                                {columns.map(col => (
                                    <option key={col.id} value={col.id}>{col.title}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Priority</label>
                            <select
                                className="form-select"
                                value={formData.priority}
                                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Due Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={formData.dueDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Tags</label>
                            <div className="tag-input-container">
                                {formData.tags.map((tag, idx) => (
                                    <div key={idx} className="tag-chip">
                                        {tag}
                                        <button type="button" onClick={() => handleRemoveTag(tag)}>
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>
                                ))}
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleAddTag}
                                    placeholder="Type and press Enter..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {task ? 'Update Task' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// =============================================
// SEARCH & FILTER BAR COMPONENT
// =============================================

const SearchFilterBar = () => {
    const { filters, setFilters, getAllTags } = useTaskStore();
    const [showPriorityFilter, setShowPriorityFilter] = useState(false);
    const [showTagFilter, setShowTagFilter] = useState(false);

    const handleSearchChange = debounce((value) => {
        setFilters(prev => ({ ...prev, search: value }));
    }, 300);

    const togglePriorityFilter = (priority) => {
        setFilters(prev => ({
            ...prev,
            priority: prev.priority.includes(priority)
                ? prev.priority.filter(p => p !== priority)
                : [...prev.priority, priority]
        }));
    };

    const toggleTagFilter = (tag) => {
        setFilters(prev => ({
            ...prev,
            tags: prev.tags.includes(tag)
                ? prev.tags.filter(t => t !== tag)
                : [...prev.tags, tag]
        }));
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            priority: [],
            tags: [],
            dateRange: null
        });
        document.querySelector('.search-box input').value = '';
    };

    const hasActiveFilters = filters.search || filters.priority.length > 0 || filters.tags.length > 0;
    const allTags = getAllTags();

    return (
        <div className="search-filter-bar">
            <div className="search-box">
                <i className="fas fa-search search-icon"></i>
                <input
                    type="text"
                    placeholder="Search tasks..."
                    onChange={(e) => handleSearchChange(e.target.value)}
                    defaultValue={filters.search}
                />
            </div>

            <div className="filter-group">
                <div className="filter-dropdown">
                    <button
                        className={`filter-btn ${filters.priority.length > 0 ? 'active' : ''}`}
                        onClick={() => setShowPriorityFilter(!showPriorityFilter)}
                    >
                        <i className="fas fa-flag"></i>
                        Priority {filters.priority.length > 0 && `(${filters.priority.length})`}
                    </button>
                    {showPriorityFilter && (
                        <div className="context-menu" style={{ position: 'absolute', top: '100%', marginTop: '0.5rem' }}>
                            {['low', 'medium', 'high', 'critical'].map(priority => (
                                <div
                                    key={priority}
                                    className="context-menu-item"
                                    onClick={() => togglePriorityFilter(priority)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={filters.priority.includes(priority)}
                                        readOnly
                                        style={{ marginRight: '0.5rem' }}
                                    />
                                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {allTags.length > 0 && (
                    <div className="filter-dropdown">
                        <button
                            className={`filter-btn ${filters.tags.length > 0 ? 'active' : ''}`}
                            onClick={() => setShowTagFilter(!showTagFilter)}
                        >
                            <i className="fas fa-tags"></i>
                            Tags {filters.tags.length > 0 && `(${filters.tags.length})`}
                        </button>
                        {showTagFilter && (
                            <div className="context-menu" style={{ position: 'absolute', top: '100%', marginTop: '0.5rem' }}>
                                {allTags.map(tag => (
                                    <div
                                        key={tag}
                                        className="context-menu-item"
                                        onClick={() => toggleTagFilter(tag)}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={filters.tags.includes(tag)}
                                            readOnly
                                            style={{ marginRight: '0.5rem' }}
                                        />
                                        {tag}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {hasActiveFilters && (
                    <button className="clear-filters-btn" onClick={clearFilters}>
                        <i className="fas fa-times"></i> Clear Filters
                    </button>
                )}
            </div>
        </div>
    );
};

// =============================================
// MAIN APP COMPONENT
// =============================================

const App = () => {
    const { columns, getFilteredTasks, deleteTask, duplicateTask } = useTaskStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [defaultColumnId, setDefaultColumnId] = useState(null);

    const filteredTasks = getFilteredTasks();

    const handleOpenModal = (columnId = null) => {
        setDefaultColumnId(columnId);
        setEditingTask(null);
        setIsModalOpen(true);
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setDefaultColumnId(task.columnId);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTask(null);
        setDefaultColumnId(null);
    };

    const handleDeleteTask = (taskId) => {
        if (confirm('Are you sure you want to delete this task?')) {
            deleteTask(taskId);
        }
    };

    const handleDuplicateTask = (taskId) => {
        duplicateTask(taskId);
    };

    return (
        <div className="app-container">
            <header className="app-header">
                <div className="header-top">
                    <div className="app-title">
                        <i className="fas fa-tasks logo-icon"></i>
                        <h1>TaskMaster</h1>
                    </div>
                    <div className="header-actions">
                        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                            <i className="fas fa-plus"></i>
                            New Task
                        </button>
                    </div>
                </div>
                <SearchFilterBar />
            </header>

            <div className="kanban-board">
                {columns.map(column => {
                    const columnTasks = filteredTasks.filter(task => task.columnId === column.id);
                    return (
                        <KanbanColumn
                            key={column.id}
                            column={column}
                            tasks={columnTasks}
                            onEdit={handleEditTask}
                            onDelete={handleDeleteTask}
                            onDuplicate={handleDuplicateTask}
                        />
                    );
                })}
            </div>

            <button
                className="quick-add-fab"
                onClick={() => handleOpenModal()}
                title="Quick Add Task"
            >
                <i className="fas fa-plus"></i>
            </button>

            <TaskModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                task={editingTask}
                defaultColumnId={defaultColumnId}
            />
        </div>
    );
};

// =============================================
// APP INITIALIZATION
// =============================================

const root = createRoot(document.getElementById('root'));
root.render(
    <TaskStoreProvider>
        <App />
    </TaskStoreProvider>
);
