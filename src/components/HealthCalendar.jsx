import { useState, useEffect } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    startOfWeek,
    endOfWeek,
    addMonths,
    isToday,
    isSameMonth,
    isSameDay,
    parseISO
} from 'date-fns';
import { FiChevronLeft, FiChevronRight, FiPlus, FiTrendingUp } from 'react-icons/fi';
import useLocalStorage from '../hooks/useLocalStorage';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export default function HealthCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [weightEntries, setWeightEntries] = useLocalStorage('weightEntries', []);
    const [calorieEntries, setCalorieEntries] = useLocalStorage('calorieEntries', []);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [newWeight, setNewWeight] = useState('');
    const [newCalories, setNewCalories] = useState('');
    const [showGraph, setShowGraph] = useState(false);

    const prevMonth = () => setCurrentDate(addMonths(currentDate, -1));
    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const goToToday = () => {
        setCurrentDate(new Date());
        setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
    };

    const getMonthDays = () => {
        const start = startOfWeek(startOfMonth(currentDate));
        const end = endOfWeek(endOfMonth(currentDate));
        return eachDayOfInterval({ start, end });
    };

    const addHealthEntry = () => {
        if (newWeight && !isNaN(newWeight)) {
            setWeightEntries(prev => [
                ...prev.filter(entry => entry.date !== selectedDate),
                {
                    date: selectedDate,
                    weight: parseFloat(newWeight)
                }
            ]);
            setNewWeight('');
        }
        if (newCalories && !isNaN(newCalories)) {
            setCalorieEntries(prev => [
                ...prev.filter(entry => entry.date !== selectedDate),
                {
                    date: selectedDate,
                    calories: parseInt(newCalories)
                }
            ]);
            setNewCalories('');
        }
    };

    const getDayData = (day) => {
        const dateKey = format(day, 'yyyy-MM-dd');
        return {
            weight: weightEntries.find(entry => entry.date === dateKey),
            calories: calorieEntries.find(entry => entry.date === dateKey)
        };
    };

    // Prepare data for the weight graph
    const weightGraphData = {
        labels: weightEntries
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map(entry => format(new Date(entry.date), 'MMM d')),
        datasets: [
            {
                label: 'Weight (lbs)',
                data: weightEntries
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map(entry => entry.weight),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                tension: 0.1
            }
        ]
    };

    const graphOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Weight Progress',
            },
        },
        scales: {
            y: {
                min: Math.min(...weightEntries.map(e => e.weight)) - 5 || 0,
                max: Math.max(...weightEntries.map(e => e.weight)) + 5 || 200
            }
        }
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
                <button
                    onClick={() => setShowGraph(!showGraph)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                    <FiTrendingUp />
                    {showGraph ? 'Hide Graph' : 'Show Graph'}
                </button>
            </div>

            {showGraph && weightEntries.length > 0 && (
                <div className="mb-6 bg-gray-900 p-4 rounded-lg">
                    <div className="h-64">
                        <Line options={graphOptions} data={weightGraphData} />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center p-2 text-gray-400">{day}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {getMonthDays().map(day => {
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isSelected = selectedDate === format(day, 'yyyy-MM-dd');
                    const dayData = getDayData(day);
                    const hasData = dayData.weight || dayData.calories;

                    return (
                        <div
                            key={day.toString()}
                            onClick={() => setSelectedDate(format(day, 'yyyy-MM-dd'))}
                            className={`min-h-32 p-1 border rounded-lg cursor-pointer ${
                                isSelected ? 'bg-black border-white' :
                                    hasData ? 'bg-green-900 bg-opacity-30' :
                                        isToday(day) ? 'bg-blue-900 bg-opacity-20' :
                                            'bg-gray-800'
                            } ${!isCurrentMonth ? 'opacity-50' : ''}`}
                        >
                            <div className={`text-right p-1 ${isToday(day) ? 'font-bold text-blue-300' : ''}`}>
                                {format(day, 'd')}
                            </div>
                            {hasData && (
                                <div className="text-xs mt-1">
                                    {dayData.weight && <div>W: {dayData.weight.weight}lbs</div>}
                                    {dayData.calories && <div>C: {dayData.calories.calories}kcal</div>}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 bg-gray-900 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">
                    {format(new Date(selectedDate), 'MMMM d, yyyy')}
                </h3>

                <div className="mb-4">
                    <h4 className="font-medium mb-2">Weight (lbs)</h4>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={newWeight}
                            onChange={(e) => setNewWeight(e.target.value)}
                            className="flex-1 bg-gray-800 text-white p-2 rounded"
                            placeholder="Enter weight"
                            step="0.1"
                        />
                    </div>
                    {getDayData(new Date(selectedDate)).weight && (
                        <p className="mt-2 text-sm">Current: {getDayData(new Date(selectedDate)).weight.weight} lbs</p>
                    )}
                </div>

                <div className="mb-4">
                    <h4 className="font-medium mb-2">Calories</h4>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={newCalories}
                            onChange={(e) => setNewCalories(e.target.value)}
                            className="flex-1 bg-gray-800 text-white p-2 rounded"
                            placeholder="Enter calories"
                        />
                    </div>
                    {getDayData(new Date(selectedDate)).calories && (
                        <p className="mt-2 text-sm">Current: {getDayData(new Date(selectedDate)).calories.calories} kcal</p>
                    )}
                </div>

                <button
                    onClick={addHealthEntry}
                    className="w-full bg-white text-black p-2 rounded-lg font-medium"
                >
                    Save Entries
                </button>
            </div>
        </div>
    );
}