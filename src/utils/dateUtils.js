import { format, addDays, isToday, isSameDay } from 'date-fns'

export const formatDateKey = (date) => format(date, 'yyyy-MM-dd')

export const getWeekDates = (date) => {
    const weekDates = []
    const startDate = new Date(date)
    // Adjust to Monday
    startDate.setDate(date.getDate() - (date.getDay() + 6) % 7)

    for (let i = 0; i < 5; i++) {
        weekDates.push(addDays(startDate, i))
    }

    return weekDates
}