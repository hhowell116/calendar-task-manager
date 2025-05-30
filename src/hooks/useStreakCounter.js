import { useState, useEffect } from 'react'
import { format } from 'date-fns'

export default function useStreakCounter() {
    const [streak, setStreak] = useState(0)
    const [lastCompletedDate, setLastCompletedDate] = useState(null)

    useEffect(() => {
        const savedStreak = localStorage.getItem('streak')
        const savedDate = localStorage.getItem('lastCompletedDate')

        if (savedStreak) setStreak(parseInt(savedStreak))
        if (savedDate) setLastCompletedDate(savedDate)
    }, [])

    const incrementStreak = () => {
        const today = format(new Date(), 'yyyy-MM-dd')
        const newStreak = lastCompletedDate === today ? streak : streak + 1
        setStreak(newStreak)
        setLastCompletedDate(today)
        localStorage.setItem('streak', newStreak.toString())
        localStorage.setItem('lastCompletedDate', today)
    }

    return { streak, incrementStreak }
}