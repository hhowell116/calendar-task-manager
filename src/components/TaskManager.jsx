import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiCheck, FiArrowLeft, FiCalendar, FiEdit2, FiTrash2, FiRotateCw } from 'react-icons/fi';
import useLocalStorage from '../hooks/useLocalStorage';

export default function TaskManager() {
    const [tasks, setTasks] = useLocalStorage('tasks', []);
    const [completedTasks, setCompletedTasks] = useLocalStorage('completedTasks', []);
    const [scheduledTasks, setScheduledTasks] = useLocalStorage('scheduledTasks', []);
    const [newTaskText, setNewTaskText] = useState('');
    const [newTaskDate, setNewTaskDate] = useState('');
    const [view, setView] = useState('active');
    const [isCreating, setIsCreating] = useState(false);
    const [isScheduling, setIsScheduling] = useState(false);
    const [showScheduled, setShowScheduled] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    const taskOperations = {
        add: () => {
            if (newTaskText.trim()) {
                const newTask = {
                    id: Date.now(),
                    text: newTaskText,
                    date: isScheduling ? newTaskDate : null,
                    completed: false
                };
                const target = isScheduling && newTaskDate ? setScheduledTasks : setTasks;
                target(prev => [...prev, newTask]);
                setNewTaskText('');
                setNewTaskDate('');
                setIsCreating(false);
                setIsScheduling(false);
            }
        },
        complete: (task) => {
            setCompletedTasks(prev => [...prev, { ...task, completed: true }]);
            setTasks(prev => prev.filter(t => t.id !== task.id));
            setScheduledTasks(prev => prev.filter(t => t.id !== task.id));
        },
        edit: (task, updates) => {
            const target = task.date ? setScheduledTasks : setTasks;
            target(prev => prev.map(t => t.id === task.id ? { ...t, ...updates } : t));
            setEditingTask(null);
        },
        delete: (task) => {
            const target = task.date ? setScheduledTasks : setTasks;
            target(prev => prev.filter(t => t.id !== task.id));
        }
    };

    const clearCompleted = () => {
        setCompletedTasks([]);
    };

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
        <div className="space-y-4">
            <AnimatePresence mode="wait">
                {view === 'completed' ? (
                    <motion.div
                        key="completed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setView('active')}
                                className="flex items-center gap-2 text-white hover:text-gray-300"
                            >
                                <FiArrowLeft /> Back to Tasks
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={clearCompleted}
                                className="flex items-center gap-2 text-red-500 hover:text-red-400"
                            >
                                <FiRotateCw /> Clear All
                            </motion.button>
                        </div>

                        <h2 className="text-2xl font-bold mb-4">Completed Tasks</h2>

                        {completedTasks.length === 0 ? (
                            <p className="text-gray-500 mb-2">No completed tasks yet</p>
                        ) : (
                            <AnimatePresence>
                                {completedTasks.map((task, index) => (
                                    <motion.div
                                        key={task.id}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
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
                                            <motion.button
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => taskOperations.delete(task)}
                                                className="text-red-500 hover:text-red-400"
                                            >
                                                <FiTrash2 />
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="active"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <h2 className="text-2xl font-bold mb-4">Tasks</h2>

                        {/* Task List */}
                        <div className="mb-4">
                            <AnimatePresence>
                                {tasks.map((task, index) => (
                                    <motion.div
                                        key={task.id}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className={`group mb-2 p-3 rounded-lg ${getTaskColor(index)} hover:bg-opacity-80 transition-all`}
                                    >
                                        <div className="flex justify-between items-center">
                                            {editingTask?.id === task.id ? (
                                                <input
                                                    type="text"
                                                    value={editingTask.text}
                                                    onChange={(e) => setEditingTask({ ...editingTask, text: e.target.value })}
                                                    onKeyDown={(e) => e.key === 'Enter' && taskOperations.edit(task, { text: e.target.value })}
                                                    className="bg-gray-700 text-white flex-1 rounded px-2"
                                                    autoFocus
                                                />
                                            ) : (
                                                <span className="flex-1 cursor-pointer" onClick={() => taskOperations.complete(task)}>
                                                    {task.text}
                                                </span>
                                            )}
                                            <div className="flex gap-2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <motion.button
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => taskOperations.complete(task)}
                                                    className="text-green-500 hover:text-green-400"
                                                    title="Mark as complete"
                                                >
                                                    <FiCheck />
                                                </motion.button>

                                                {editingTask?.id === task.id ? (
                                                    <motion.button
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => taskOperations.edit(task, { text: editingTask.text })}
                                                        className="text-blue-500 hover:text-blue-400"
                                                    >
                                                        <FiCheck />
                                                    </motion.button>
                                                ) : (
                                                    <motion.button
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => setEditingTask({ ...task })}
                                                        className="text-blue-500 hover:text-blue-400"
                                                    >
                                                        <FiEdit2 />
                                                    </motion.button>
                                                )}
                                                <motion.button
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => taskOperations.delete(task)}
                                                    className="text-red-500 hover:text-red-400"
                                                >
                                                    <FiTrash2 />
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Task Creation */}
                        <AnimatePresence>
                            {isCreating ? (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-4 space-y-3"
                                >
                                    <input
                                        type="text"
                                        value={newTaskText}
                                        onChange={(e) => setNewTaskText(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && taskOperations.add()}
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
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={taskOperations.add}
                                            className="bg-white text-black p-3 rounded-lg flex-1 font-medium flex items-center justify-center gap-2"
                                        >
                                            <FiCheck /> Add Task
                                        </motion.button>
                                        {!isScheduling && (
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setIsScheduling(true)}
                                                className="bg-gray-800 text-white p-3 rounded-lg flex items-center justify-center"
                                            >
                                                <FiCalendar />
                                            </motion.button>
                                        )}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => { setIsCreating(true); setIsScheduling(false); }}
                                    className="mb-4 w-full bg-gray-900 hover:bg-gray-800 p-3 rounded-lg flex items-center justify-center gap-2"
                                >
                                    <FiPlus /> Create New Task
                                </motion.button>
                            )}
                        </AnimatePresence>

                        {/* Scheduled Tasks */}
                        <div className="mb-6">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowScheduled(!showScheduled)}
                                className="w-full bg-gray-900 hover:bg-gray-800 p-3 rounded-lg flex justify-between items-center"
                            >
                                <span>Scheduled ({scheduledTasks.length})</span>
                                <span>{showScheduled ? '▲' : '▼'}</span>
                            </motion.button>

                            <AnimatePresence>
                                {showScheduled && scheduledTasks.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-2 space-y-2"
                                    >
                                        {scheduledTasks
                                            .sort((a, b) => new Date(a.date) - new Date(b.date))
                                            .map((task, index) => (
                                                <motion.div
                                                    key={task.id}
                                                    className={`p-3 rounded-lg ${getTaskColor(index)} hover:bg-opacity-80`}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex-1 flex items-center gap-2">
                                                            <FiCalendar className="text-gray-400" />
                                                            <span className="cursor-pointer" onClick={() => taskOperations.complete(task)}>
                                                                {task.text}
                                                            </span>
                                                            <span className="text-sm text-gray-400 ml-auto">
                                                                {new Date(task.date).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <motion.button
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => taskOperations.complete(task)}
                                                                className="text-green-500 hover:text-green-400"
                                                            >
                                                                <FiCheck />
                                                            </motion.button>
                                                            <motion.button
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => setEditingTask({ ...task })}
                                                                className="text-blue-500 hover:text-blue-400"
                                                            >
                                                                <FiEdit2 />
                                                            </motion.button>
                                                            <motion.button
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => taskOperations.delete(task)}
                                                                className="text-red-500 hover:text-red-400"
                                                            >
                                                                <FiTrash2 />
                                                            </motion.button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Completed Tasks Button */}
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setView('completed')}
                            className="w-full bg-gray-900 hover:bg-gray-800 p-3 rounded-lg flex justify-between items-center"
                        >
                            <span>Completed</span>
                            <span>({completedTasks.length})</span>
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}