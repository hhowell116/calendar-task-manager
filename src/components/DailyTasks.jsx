import { useState } from 'react'
import { format, isToday } from 'date-fns'
import { FiPlus, FiCheck } from 'react-icons/fi'
import useLocalStorage from '../hooks/useLocalStorage'

export default function DailyTasks({ date }) {
    const [dailyTasks, setDailyTasks] = useLocalStorage('dailyTasks', {})
    const [newTaskText, setNewTaskText] = useState('')
    const [isCreating, setIsCreating] = useState(false)

    const dateKey = format(date, 'yyyy-MM-dd')
    const tasks = dailyTasks[dateKey] || []

    const addTask = () => {
        if (newTaskText.trim()) {
            const updatedTasks = {
                ...dailyTasks,
                [dateKey]: [...tasks, { id: Date.now(), text: newTaskText, completed: false }]
            }
            setDailyTasks(updatedTasks)
            setNewTaskText('')
            setIsCreating(false)
        }
    }

    const toggleTask = (taskId) => {
        const updatedTasks = {
            ...dailyTasks,
            [dateKey]: tasks.map(task =>
                task.id === taskId ? { ...task, completed: !task.completed } : task
            )
        }
        setDailyTasks(updatedTasks)
    }

    return (
        <div>
            <h3 className="text-lg font-semibold mb-2">{format(date, 'MMMM d, yyyy')}</h3>

            {tasks.length === 0 && !isCreating ? (
                <p className="text-gray-500 mb-2">No tasks for today</p>
            ) : (
                <ul className="mb-4">
                    {tasks.map(task => (
                        <li
                            key={task.id}
                            onClick={() => toggleTask(task.id)}
                            className={`p-2 rounded cursor-pointer ${task.completed ? 'line-through text-gray-400' : 'hover:bg-gray-100'}`}
                        >
                            <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded border flex items-center justify-center ${task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>
                  {task.completed && <FiCheck size={12} />}
                </span>
                                {task.text}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {isCreating ? (
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTask()}
                        className="flex-1 border rounded p-2"
                        autoFocus
                        placeholder="Enter task"
                    />
                    <button
                        onClick={addTask}
                        className="bg-blue-500 text-white p-2 rounded"
                    >
                        <FiCheck />
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 text-blue-500"
                >
                    <FiPlus /> Add Daily Task
                </button>
            )}
        </div>
    )
}