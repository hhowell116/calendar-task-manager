import { useState } from 'react';
import { FiPlus, FiCheck, FiArrowLeft, FiCalendar, FiEdit2, FiTrash2, FiRotateCw } from 'react-icons/fi';
import useLocalStorage from '../hooks/useLocalStorage';

export default function TaskManager() {
    const [tasks, setTasks, { editItem: editTask, removeItem: removeTask }] = useLocalStorage('tasks', []);
    const [completedTasks, setCompletedTasks, { removeItem: removeCompletedTask }] = useLocalStorage('completedTasks', []);
    const [scheduledTasks, setScheduledTasks, { editItem: editScheduledTask, removeItem: removeScheduledTask }] = useLocalStorage('scheduledTasks', []);
    const [newTaskText, setNewTaskText] = useState('');
    const [newTaskDate, setNewTaskDate] = useState('');
    const [view, setView] = useState('active');
    const [isCreating, setIsCreating] = useState(false);
    const [isScheduling, setIsScheduling] = useState(false);
    const [showScheduledDropdown, setShowScheduledDropdown] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    // Task counters
    const completedTasksCount = completedTasks.length;
    const scheduledTasksCount = scheduledTasks.length;

    // Add task function
    const addTask = () => {
        if (newTaskText.trim()) {
            const newTask = {
                id: Date.now(),
                text: newTaskText,
                date: isScheduling ? newTaskDate : null,
                completed: false
            };

            if (isScheduling && newTaskDate) {
                setScheduledTasks([...scheduledTasks, newTask]);
            } else {
                setTasks([...tasks, newTask]);
            }

            setNewTaskText('');
            setNewTaskDate('');
            setIsCreating(false);
            setIsScheduling(false);
        }
    };

    // Complete task function
    const completeTask = (task) => {
        setCompletedTasks([...completedTasks, { ...task, completed: true }]);
        setTasks(tasks.filter(t => t.id !== task.id));
        setScheduledTasks(scheduledTasks.filter(t => t.id !== task.id));
    };

    // Edit task functions
    const startEditing = (task, listType) => {
        setEditingTask({ ...task, listType });
    };

    const saveEdit = () => {
        if (!editingTask || !editingTask.text.trim()) return;

        const updatedTask = {
            text: editingTask.text,
            ...(editingTask.date && { date: editingTask.date })
        };

        switch (editingTask.listType) {
            case 'active':
                editTask(editingTask.id, updatedTask);
                break;
            case 'scheduled':
                editScheduledTask(editingTask.id, updatedTask);
                break;
            default:
                break;
        }

        setEditingTask(null);
    };

    // Clear completed tasks
    const clearCompletedTasks = () => {
        setCompletedTasks([]);
    };

    // Task background colors (rotating through options)
    const getTaskColor = (index) => {
        const colors = [
            'bg-gray-800',
            'bg-gray-700',
            'bg-blue-900',
            'bg-purple-900'
        ];
        return colors[index % colors.length];
    };

    return (
        <div className="bg-black text-white h-screen p-6 overflow-y-auto">
            {view === 'completed' ? (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <button
                            onClick={() => setView('active')}
                            className="flex items-center gap-2 text-white hover:text-gray-300"
                        >
                            <FiArrowLeft /> Back to Tasks
                        </button>
                        <button
                            onClick={clearCompletedTasks}
                            className="flex items-center gap-2 text-red-500 hover:text-red-400"
                        >
                            <FiRotateCw /> Clear All
                        </button>
                    </div>

                    <h2 className="text-2xl font-bold mb-6">Completed Tasks</h2>

                    {completedTasks.length === 0 ? (
                        <p className="text-gray-400">No completed tasks yet</p>
                    ) : (
                        completedTasks.map((task, index) => (
                            <div
                                key={task.id}
                                className={`mb-2 p-3 rounded-lg ${getTaskColor(index)} line-through text-gray-400`}
                            >
                                <div className="flex justify-between items-center">
                                    <span>
                                        {task.text}
                                        {task.date && (
                                            <span className="text-sm ml-2 text-gray-500">
                                                ({new Date(task.date).toLocaleDateString()})
                                            </span>
                                        )}
                                    </span>
                                    <button
                                        onClick={() => removeCompletedTask(task.id)}
                                        className="text-red-500 hover:text-red-400"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div>
                    <h2 className="text-2xl font-bold mb-6">Tasks</h2>

                    {/* Active Tasks */}
                    <div className="mb-4">
                        {tasks.map((task, index) => (
                            <div
                                key={task.id}
                                className={`mb-2 p-3 rounded-lg ${getTaskColor(index)} hover:bg-opacity-80 transition-all`}
                            >
                                <div className="flex justify-between items-center">
                                    {editingTask?.id === task.id ? (
                                        <input
                                            type="text"
                                            value={editingTask.text}
                                            onChange={(e) => setEditingTask({ ...editingTask, text: e.target.value })}
                                            onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                            className="bg-gray-700 text-white flex-1 rounded px-2"
                                            autoFocus
                                        />
                                    ) : (
                                        <span className="flex-1 cursor-pointer" onClick={() => completeTask(task)}>
                                            {task.text}
                                        </span>
                                    )}
                                    <div className="flex gap-2 ml-2">
                                        {/* Complete Button */}
                                        <button
                                            onClick={() => completeTask(task)}
                                            className="text-green-500 hover:text-green-400"
                                            title="Mark as complete"
                                        >
                                            <FiCheck />
                                        </button>

                                        {editingTask?.id === task.id ? (
                                            <button
                                                onClick={saveEdit}
                                                className="text-blue-500 hover:text-blue-400"
                                            >
                                                <FiCheck />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => startEditing({ ...task, listType: 'active' })}
                                                className="text-blue-500 hover:text-blue-400"
                                            >
                                                <FiEdit2 />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => removeTask(task.id)}
                                            className="text-red-500 hover:text-red-400"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Task Creation */}
                    {isCreating ? (
                        <div className="mb-4 space-y-3">
                            <input
                                type="text"
                                value={newTaskText}
                                onChange={(e) => setNewTaskText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addTask()}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                                autoFocus
                                placeholder="Task description"
                            />
                            {isScheduling && (
                                <input
                                    type="date"
                                    value={newTaskDate}
                                    onChange={(e) => setNewTaskDate(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                                />
                            )}
                            <div className="flex gap-2">
                                <button
                                    onClick={addTask}
                                    className="bg-white text-black p-3 rounded-lg flex-1 font-medium flex items-center justify-center gap-2"
                                >
                                    <FiCheck /> Add Task
                                </button>
                                {!isScheduling && (
                                    <button
                                        onClick={() => setIsScheduling(true)}
                                        className="bg-gray-800 text-white p-3 rounded-lg flex items-center justify-center"
                                    >
                                        <FiCalendar />
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => {
                                setIsCreating(true);
                                setIsScheduling(false);
                            }}
                            className="mb-4 w-full bg-gray-900 hover:bg-gray-800 p-3 rounded-lg flex items-center justify-center gap-2"
                        >
                            <FiPlus /> Create New Task
                        </button>
                    )}

                    {/* Scheduled Tasks Dropdown */}
                    <div className="mb-8 relative">
                        <button
                            onClick={() => setShowScheduledDropdown(!showScheduledDropdown)}
                            className="w-full bg-gray-900 hover:bg-gray-800 p-3 rounded-lg flex justify-between items-center"
                        >
                            <div className="flex items-center">
                                <span>Scheduled</span>
                                {scheduledTasksCount > 0 && (
                                    <span className="ml-2 bg-black text-white text-sm rounded-full px-2 py-1">
                                        {scheduledTasksCount}
                                    </span>
                                )}
                            </div>
                            <span className={`inline-block transition-transform ${showScheduledDropdown ? 'rotate-180' : ''}`}>
                                ▼
                            </span>
                        </button>

                        {showScheduledDropdown && scheduledTasks.length > 0 && (
                            <div className="mt-2 bg-gray-900 rounded-lg p-2">
                                {scheduledTasks
                                    .filter(task => !task.completed)
                                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                                    .map((task, index) => (
                                        <div
                                            key={task.id}
                                            className={`mb-2 p-3 rounded-lg ${getTaskColor(index)} hover:bg-opacity-80 transition-all`}
                                        >
                                            <div className="flex justify-between items-center">
                                                {editingTask?.id === task.id ? (
                                                    <div className="flex-1 flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={editingTask.text}
                                                            onChange={(e) => setEditingTask({ ...editingTask, text: e.target.value })}
                                                            onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                                            className="bg-gray-700 text-white flex-1 rounded px-2"
                                                            autoFocus
                                                        />
                                                        <input
                                                            type="date"
                                                            value={editingTask.date}
                                                            onChange={(e) => setEditingTask({ ...editingTask, date: e.target.value })}
                                                            className="bg-gray-700 text-white rounded px-2"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex-1 flex items-center gap-2">
                                                        <FiCalendar className="text-gray-400" />
                                                        <span className="cursor-pointer" onClick={() => completeTask(task)}>
                                                            {task.text}
                                                        </span>
                                                        <span className="text-sm text-gray-400 ml-auto">
                                                            {new Date(task.date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex gap-2 ml-2">
                                                    {/* Complete Button for scheduled tasks */}
                                                    <button
                                                        onClick={() => completeTask(task)}
                                                        className="text-green-500 hover:text-green-400"
                                                        title="Mark as complete"
                                                    >
                                                        <FiCheck />
                                                    </button>

                                                    {editingTask?.id === task.id ? (
                                                        <button
                                                            onClick={saveEdit}
                                                            className="text-blue-500 hover:text-blue-400"
                                                        >
                                                            <FiCheck />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => startEditing({ ...task, listType: 'scheduled' })}
                                                            className="text-blue-500 hover:text-blue-400"
                                                        >
                                                            <FiEdit2 />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => removeScheduledTask(task.id)}
                                                        className="text-red-500 hover:text-red-400"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>

                    {/* Completed Tasks Button */}
                    <button
                        onClick={() => setView('completed')}
                        className="w-full bg-gray-900 hover:bg-gray-800 p-3 rounded-lg flex justify-between items-center"
                    >
                        <div className="flex items-center">
                            <span>Completed</span>
                            {completedTasksCount > 0 && (
                                <span className="ml-2 bg-black text-white text-sm rounded-full px-2 py-1">
                                    {completedTasksCount}
                                </span>
                            )}
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
}