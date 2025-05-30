import { useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

export default function StreakCounter({ timeLeft }) {
    const [streak, setStreak] = useLocalStorage('streak', 0);
    const [timeDisplay, setTimeDisplay] = useState('');

    // Format time for display
    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        // Update time display
        setTimeDisplay(formatTime(timeLeft));

        // Get current streak from localStorage
        const currentStreak = parseInt(localStorage.getItem('streak')) || 0;
        setStreak(currentStreak);

        // Listen for streak changes
        const handleStorageChange = () => {
            const updatedStreak = parseInt(localStorage.getItem('streak')) || 0;
            setStreak(updatedStreak);
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [timeLeft, setStreak]);

    return (
        <div className="flex gap-4 items-center">
            <div className="bg-gray-800 px-3 py-1 rounded-full">
                Streak: {streak} days
            </div>
            <div className={`px-3 py-1 rounded-full ${timeLeft < 3600 ? 'bg-red-500' : 'bg-gray-800'}`}>
                Time: {timeDisplay}
            </div>
        </div>
    );
}