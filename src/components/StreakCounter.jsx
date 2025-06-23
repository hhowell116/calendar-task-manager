import { useState, useEffect } from 'react';
import { format, isYesterday, isToday } from 'date-fns';
import useLocalStorage from '../hooks/useLocalStorage';

export default function StreakCounter({ timeLeft }) {
    const [streak, setStreak] = useLocalStorage('streak', 0);
    const [lastStreakDate, setLastStreakDate] = useLocalStorage('lastStreakDate', null);
    const [manualStreak, setManualStreak] = useState(streak);
    const [isEditMode, setIsEditMode] = useState(false);

    // Check streak validation at midnight
    useEffect(() => {
        if (timeLeft <= 0) {
            validateStreak();
        }
    }, [timeLeft]);

    const validateStreak = () => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayKey = format(yesterday, 'yyyy-MM-dd');

        // Check if we already validated today
        if (lastStreakDate === today) return;

        // Get all recurring tasks
        const recurringTasks = JSON.parse(localStorage.getItem('calendarTasks')) || [];
        const completedToday = JSON.parse(localStorage.getItem('completedTasks')) || []
            .filter(task => task.completedOnDate === yesterdayKey);

        // Check if all recurring tasks were completed yesterday
        const allCompleted = recurringTasks.length > 0 &&
            recurringTasks.every(task =>
                completedToday.some(completed => completed.id === task.id)
            );

        if (allCompleted) {
            // Only increment if yesterday was consecutive
            const newStreak = lastStreakDate && isYesterday(new Date(lastStreakDate))
                ? streak + 1
                : 1;
            setStreak(newStreak);
            setLastStreakDate(today);
        } else if (lastStreakDate && !isYesterday(new Date(lastStreakDate))) {
            // Reset if missed a day
            setStreak(0);
        }
    };

    // Format time display
    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Manual editing functions
    const handleManualStreakChange = (e) => {
        const value = Math.max(0, parseInt(e.target.value) || 0);
        setManualStreak(value);
    };

    const saveManualStreak = () => {
        setStreak(manualStreak);
        setLastStreakDate(manualStreak > 0 ? format(new Date(), 'yyyy-MM-dd') : null);
        setIsEditMode(false);
    };

    const resetStreak = () => {
        setStreak(0);
        setLastStreakDate(null);
        setManualStreak(0);
        setIsEditMode(false);
    };

    return (
        <div className="flex items-center gap-4">
            {isEditMode ? (
                <div className="flex items-center gap-2 bg-gray-800 p-2 rounded-lg">
                    <input
                        type="number"
                        value={manualStreak}
                        onChange={handleManualStreakChange}
                        min="0"
                        className="w-16 bg-gray-700 text-white px-2 py-1 rounded border border-gray-600"
                    />
                    <button
                        onClick={saveManualStreak}
                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                    >
                        Save
                    </button>
                    <button
                        onClick={resetStreak}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                    >
                        Reset
                    </button>
                    <button
                        onClick={() => setIsEditMode(false)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded"
                    >
                        Cancel
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-gray-800 px-3 py-1 rounded-full">
                            🔥 Streak: {streak} days
                        </div>
                        <button
                            onClick={() => {
                                setManualStreak(streak);
                                setIsEditMode(true);
                            }}
                            className="text-gray-400 hover:text-white"
                            title="Adjust streak"
                        >
                            ✏️
                        </button>
                    </div>

                    <div className={`px-3 py-1 rounded-full ${timeLeft < 3600 ? 'bg-red-500' : 'bg-gray-800'}`}>
                        ⏳ {formatTime(timeLeft)} until reset
                    </div>
                </div>
            )}
        </div>
    );
}