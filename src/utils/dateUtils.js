import { format, addDays, isToday, isSameDay } from 'date-fns'

const today = new Date()
console.log(format(today, 'yyyy-MM-dd'))
console.log('Is today?', isToday(today))
console.log('Is same day?', isSameDay(today, new Date()))

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