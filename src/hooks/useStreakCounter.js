import { useState, useEffect } from 'react';
import { format, isYesterday, addDays } from 'date-fns';

export default function useStreakCounter() {
    const [streak, setStreak] = useState(() => {
        const saved = localStorage.getItem('streak');
        return saved ? parseInt(saved) : 0;
    });
    const [lastStreakDate, setLastStreakDate] = useState(() => {
        return localStorage.getItem('lastStreakDate') || null;
    });

    // Manual streak adjustment
    const setStreakManually = (newStreak) => {
        setStreak(newStreak);
        localStorage.setItem('streak', newStreak.toString());
    };

    // Check if we should increment streak
    const checkStreak = (completedAllRecurringTasks) => {
        const today = format(new Date(), 'yyyy-MM-dd');

        if (completedAllRecurringTasks) {
            if (lastStreakDate !== today) {
                const newStreak = isYesterday(new Date(lastStreakDate || 0)) ? streak + 1 : 1;
                setStreak(newStreak);
                setLastStreakDate(today);
                localStorage.setItem('streak', newStreak.toString());
                localStorage.setItem('lastStreakDate', today);
                return true;
            }
        } else if (lastStreakDate && !isYesterday(new Date(lastStreakDate))) {
            // Reset streak if missed a day
            setStreak(0);
            localStorage.setItem('streak', '0');
            return false;
        }
        return false;
    };

    return {
        streak,
        checkStreak,
        setStreakManually,
        lastStreakDate
    };
}