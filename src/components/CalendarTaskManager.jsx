import { useState } from 'react'
import { FiPlus, FiCheck } from 'react-icons/fi'
import useLocalStorage from '../hooks/useLocalStorage'

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

export default function CalendarTaskManager() {
    const [weeklyTasks, setWeeklyTasks] = useLocalStorage('weeklyTasks', {})
    const [newTasks, setNewTasks] = useState({})

    const addTask = (day) => {
        if (newTasks[day]?.trim()) {
            setWeeklyTasks(prev => ({
                ...prev,
                [day]: [...(prev[day] || []), {
                    id: Date.now() + day,
                    text: newTasks[day],
                    completed: false
                }]
            }))
            setNewTasks(prev => ({ ...prev, [day]: '' }))
        }
    }

    const toggleTask = (day, taskId) => {
        setWeeklyTasks(prev => ({
            ...prev,
            [day]: (prev[day] || []).map(task =>
                task.id === taskId ? { ...task, completed: !task.completed } : task
            )
        }))
    }

    return (
        <div>
            <h3 className="text-lg font-semibold mb-4">Weekly Tasks</h3>

            <div className="space-y-6">
                {weekdays.map(day => (
                    <div key={day} className="border rounded p-4">
                        <h4 className="font-medium mb-2">{day}</h4>

                        <ul className="mb-3 space-y-1">
                            {(weeklyTasks[day] || []).map(task => (
                                <li
                                    key={task.id}
                                    onClick={() => toggleTask(day, task.id)}
                                    className={`p-1 rounded cursor-pointer ${task.completed ? 'line-through text-gray-400' : 'hover:bg-gray-100'}`}
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

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newTasks[day] || ''}
                                onChange={(e) => setNewTasks(prev => ({ ...prev, [day]: e.target.value }))}
                                onKeyDown={(e) => e.key === 'Enter' && addTask(day)}
                                className="flex-1 border rounded p-2"
                                placeholder={`Add task for ${day}`}
                            />
                            <button
                                onClick={() => addTask(day)}
                                className="bg-blue-500 text-white p-2 rounded"
                            >
                                <FiCheck />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}