// ProductivityTimer.jsx
import { useState, useEffect } from 'react';

export default function ProductivityTimer() {
    const [timeLeft, setTimeLeft] = useState(120 * 60); // 2 hours in seconds
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            // Play completion sound
            new Audio('/notification.mp3').play().catch(e => console.log(e));
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(120 * 60);
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-2">Productivity Timer</h3>
            <div className="text-3xl font-mono mb-4">
                {formatTime(timeLeft)}
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => setIsActive(!isActive)}
                    className={`px-4 py-2 rounded-lg ${isActive ? 'bg-red-500' : 'bg-green-500'}`}
                >
                    {isActive ? 'Pause' : 'Start'}
                </button>
                <button
                    onClick={resetTimer}
                    className="px-4 py-2 bg-gray-700 rounded-lg"
                >
                    Reset
                </button>
            </div>
        </div>
    );
}