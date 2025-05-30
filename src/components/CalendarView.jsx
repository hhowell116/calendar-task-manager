import { useState, useEffect } from 'react';
import {
    format,
    isToday,
    isSameDay,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    startOfWeek,
    endOfWeek,
    addMonths,
    parseISO,
    isBefore,
    isYesterday
} from 'date-fns';
import { FiPlus, FiCheck, FiChevronLeft, FiChevronRight, FiTrash2 } from 'react-icons/fi';
import useLocalStorage from '../hooks/useLocalStorage';
import StreakCounter from './StreakCounter';

export default function CalendarView() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [tasks, setTasks] = useLocalStorage('calendarTasks', []);
    const [completedTasks, setCompletedTasks] = useLocalStorage('completedTasks', []);
    const [exclusions, setExclusions] = useLocalStorage('exclusions', []);
    const [showCalendarTasks, setShowCalendarTasks] = useState(false);
    const [newTaskTexts, setNewTaskTexts] = useState({
        Monday: '', Tuesday: '', Wednesday: '', Thursday: '', Friday: '',
        Saturday: '', Sunday: ''
    });
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    // Calculate time left until midnight
    function calculateTimeLeft() {
        const now = new Date();
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0);
        return Math.floor((midnight - now) / 1000);
    }

    // Timer effect with proper streak validation
    useEffect(() => {
        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);

            if (newTimeLeft <= 0) {
                validateStreak();
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [tasks, completedTasks]);

    // Properly validate streak at midnight
    const validateStreak = () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        const yesterdayKey = format(yesterday, 'yyyy-MM-dd');

        // Get all recurring tasks
        const recurringTasks = tasks.filter(task => task.isRecurring);

        // Get tasks actually completed yesterday
        const yesterdayCompleted = completedTasks.filter(task => {
            const taskDate = new Date(task.completedDate);
            taskDate.setHours(0, 0, 0, 0);
            return taskDate.getTime() === yesterday.getTime();
        });

        // Check if all recurring tasks were completed yesterday
        const allCompleted = recurringTasks.length > 0 &&
            recurringTasks.every(task =>
                yesterdayCompleted.some(completed => completed.id === task.id)
            );

        const currentStreak = parseInt(localStorage.getItem('streak')) || 0;
        const lastStreakDate = localStorage.getItem('lastStreakDate');

        if (allCompleted) {
            // Only increment if we haven't already today
            if (lastStreakDate !== yesterdayKey) {
                const newStreak = currentStreak + 1;
                localStorage.setItem('streak', newStreak.toString());
                localStorage.setItem('lastStreakDate', yesterdayKey);
                window.dispatchEvent(new Event('storage')); // Trigger update
            }
        } else {
            // Reset streak if not all tasks completed
            if (lastStreakDate !== yesterdayKey && recurringTasks.length > 0) {
                localStorage.setItem('streak', '0');
                window.dispatchEvent(new Event('storage')); // Trigger update
            }
        }
    };

    // Format time for display
    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Navigation
    const prevMonth = () => setCurrentDate(addMonths(currentDate, -1));
    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const goToToday = () => setCurrentDate(new Date());

    // Add recurring task
    const addRecurringTask = (day) => {
        if (newTaskTexts[day].trim()) {
            const newTask = {
                id: Date.now().toString(),
                text: newTaskTexts[day],
                day,
                isRecurring: true,
                created: new Date().toISOString()
            };
            setTasks([...tasks, newTask]);
            setNewTaskTexts({...newTaskTexts, [day]: ''});
        }
    };

    // Complete task
    const completeTask = (task, date = new Date()) => {
        const completion = {
            ...task,
            completedDate: date.toISOString(),
            completedOnDate: format(date, 'yyyy-MM-dd')
        };
        setCompletedTasks([...completedTasks, completion]);

        if (!task.isRecurring) {
            setTasks(tasks.filter(t => t.id !== task.id));
        }
    };

    // Remove task from specific day only
    const removeFromDay = (task, day) => {
        const dateKey = format(day, 'yyyy-MM-dd');

        if (task.completedDate) {
            setCompletedTasks(completedTasks.filter(
                ct => !(ct.id === task.id && ct.completedOnDate === dateKey)
            ));
        } else {
            setExclusions([...exclusions, {
                taskId: task.id,
                date: dateKey,
                id: `exclude-${task.id}-${dateKey}`
            }]);
        }
    };

    // Get days for the month grid
    const getMonthDays = () => {
        const start = startOfWeek(startOfMonth(currentDate));
        const end = endOfWeek(endOfMonth(currentDate));
        return eachDayOfInterval({ start, end });
    };

    // Get tasks for a specific day
    const getDayTasks = (day) => {
        const dayName = format(day, 'EEEE');
        const dateKey = format(day, 'yyyy-MM-dd');

        const recurringTasks = tasks
            .filter(task => task.isRecurring && task.day === dayName)
            .filter(task => !exclusions.some(ex => ex.taskId === task.id && ex.date === dateKey));

        const oneTimeTasks = tasks.filter(
            task => !task.isRecurring && isSameDay(parseISO(task.date), day)
        );

        const completions = completedTasks.filter(
            task => task.completedOnDate === dateKey
        );

        const allTasks = [
            ...recurringTasks.map(task => {
                const isCompleted = completions.some(c => c.id === task.id);
                return isCompleted ? null : task;
            }).filter(Boolean),
            ...oneTimeTasks,
            ...completions
        ];

        return allTasks;
    };

    // Determine day color
    const getDayColor = (day) => {
        if (isToday(day)) return 'bg-blue-900 bg-opacity-50';

        const dayTasks = getDayTasks(day);
        if (dayTasks.length === 0) return 'bg-gray-900';

        const completedCount = dayTasks.filter(t => t.completed || t.completedDate).length;
        const totalTasks = dayTasks.length;

        if (isBefore(day, new Date())) {
            if (completedCount === totalTasks) return 'bg-green-900 bg-opacity-30';
            if (completedCount > 0) return 'bg-yellow-900 bg-opacity-30';
            return 'bg-red-900 bg-opacity-30';
        }

        if (completedCount === totalTasks) return 'bg-green-900 bg-opacity-30';
        if (completedCount > 0) return 'bg-yellow-900 bg-opacity-30';
        return 'bg-gray-800';
    };

    return (
        <div className="bg-black text-white h-screen p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-800 rounded-full">
                        <FiChevronLeft />
                    </button>
                    <h2 className="text-2xl font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-800 rounded-full">
                        <FiChevronRight />
                    </button>
                    <button onClick={goToToday} className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm">
                        Today
                    </button>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowCalendarTasks(!showCalendarTasks)}
                        className={`px-4 py-2 rounded-lg ${showCalendarTasks ? 'bg-white text-black' : 'bg-gray-900 hover:bg-gray-800'}`}
                    >
                        {showCalendarTasks ? 'Hide Tasks' : 'Calendar Tasks'}
                    </button>
                    <StreakCounter timeLeft={timeLeft} />
                </div>
            </div>

            {showCalendarTasks ? (
                <div className="bg-gray-900 rounded-lg p-6 mb-6">
                    <h3 className="text-xl font-semibold mb-4">Weekly Recurring Tasks</h3>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <div key={day} className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">{day}</h4>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newTaskTexts[day]}
                                        onChange={(e) => setNewTaskTexts({...newTaskTexts, [day]: e.target.value})}
                                        onKeyDown={(e) => e.key === 'Enter' && addRecurringTask(day)}
                                        className="bg-gray-800 text-white px-3 py-1 rounded flex-1"
                                        placeholder={`Add ${day} task`}
                                    />
                                    <button
                                        onClick={() => addRecurringTask(day)}
                                        className="bg-white text-black p-1 rounded"
                                    >
                                        <FiPlus />
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1">
                                {tasks
                                    .filter(task => task.day === day)
                                    .map(task => (
                                        <div key={task.id} className="group flex items-center justify-between bg-gray-800 p-2 rounded">
                                            <span className="flex-1">{task.text}</span>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => completeTask(task)}
                                                    className="text-green-500 hover:text-green-400"
                                                    title="Mark as complete"
                                                >
                                                    <FiCheck />
                                                </button>
                                                <button
                                                    onClick={() => setTasks(tasks.filter(t => t.id !== task.id))}
                                                    className="text-red-500 hover:text-red-400"
                                                    title="Delete task permanently"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center p-2 text-gray-400">{day}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {getMonthDays().map(day => {
                            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                            const dayTasks = getDayTasks(day);
                            const dayColor = getDayColor(day);

                            return (
                                <div
                                    key={day.toString()}
                                    className={`min-h-32 p-1 border border-gray-800 rounded-lg ${dayColor} ${!isCurrentMonth ? 'opacity-50' : ''}`}
                                >
                                    <div className={`text-right p-1 ${isToday(day) ? 'font-bold text-blue-300' : ''}`}>
                                        {format(day, 'd')}
                                    </div>
                                    <div className="space-y-1 max-h-20 overflow-y-auto">
                                        {dayTasks.map(task => (
                                            <div
                                                key={task.id + (task.completedOnDate || '')}
                                                className={`text-xs p-1 rounded flex items-center justify-between ${
                                                    task.completed || task.completedDate
                                                        ? 'line-through bg-green-500 bg-opacity-30'
                                                        : 'bg-gray-800'
                                                }`}
                                            >
                                                <span>{task.text}</span>
                                                <div className="flex gap-1">
                                                    {!(task.completed || task.completedDate) ? (
                                                        <>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    completeTask(task, day);
                                                                }}
                                                                className="text-green-500 hover:text-green-400 text-xs"
                                                                title="Mark complete"
                                                            >
                                                                <FiCheck size={12} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    removeFromDay(task, day);
                                                                }}
                                                                className="text-red-500 hover:text-red-400 text-xs"
                                                                title="Remove from this day only"
                                                            >
                                                                <FiTrash2 size={12} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeFromDay(task, day);
                                                            }}
                                                            className="text-red-500 hover:text-red-400 text-xs"
                                                            title="Remove completion"
                                                        >
                                                            <FiTrash2 size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}