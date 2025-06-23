import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskManager from './components/TaskManager';
import CalendarView from './components/CalendarView';
import GoalsTab from './components/GoalsTab';
import HealthCalendar from './components/HealthCalendar';
import ProductivityTimer from './components/ProductivityTimer';
import BibleVerse from './components/BibleVerse';

function App() {
    const [activeTab, setActiveTab] = useState('tasks');
    const [activeCalendar, setActiveCalendar] = useState('productivity');

    return (
        <div className="flex min-h-screen bg-black text-white">
            {/* Left Sidebar */}
            <motion.div
                className="w-1/3 flex flex-col border-r border-gray-700"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
            >
                {/* Tab Buttons */}
                <div className="flex border-b border-gray-700">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveTab('tasks')}
                        className={`flex-1 py-3 ${activeTab === 'tasks' ? 'bg-black' : 'bg-gray-800'}`}
                    >
                        Tasks
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveTab('goals')}
                        className={`flex-1 py-3 ${activeTab === 'goals' ? 'bg-black' : 'bg-gray-800'}`}
                    >
                        Goals
                    </motion.button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4">
                    <AnimatePresence mode="wait">
                        {activeTab === 'tasks' ? (
                            <motion.div
                                key="tasks"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-4"
                            >
                                <TaskManager />
                                <div className="space-y-4 mt-4">
                                    <ProductivityTimer />
                                    <BibleVerse />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="goals"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-4"
                            >
                                <GoalsTab />
                                <div className="space-y-4 mt-4">
                                    <ProductivityTimer />
                                    <BibleVerse />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Vertical Divider Line - Added back here */}
            <div className="border-r border-gray-700 h-full"></div>

            {/* Right Calendar Area */}
            <motion.div
                className="flex-1 flex flex-col"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
            >
                {/* Calendar Tabs */}
                <div className="flex border-b border-gray-700">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveCalendar('productivity')}
                        className={`flex-1 py-3 ${activeCalendar === 'productivity' ? 'bg-black' : 'bg-gray-800'}`}
                    >
                        Productivity Calendar
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveCalendar('health')}
                        className={`flex-1 py-3 ${activeCalendar === 'health' ? 'bg-black' : 'bg-gray-800'}`}
                    >
                        Health Calendar
                    </motion.button>
                </div>

                {/* Calendar Content */}
                <AnimatePresence mode="wait">
                    {activeCalendar === 'productivity' ? (
                        <motion.div
                            key="productivity"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex-1"
                        >
                            <CalendarView />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="health"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex-1"
                        >
                            <HealthCalendar />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

export default App;