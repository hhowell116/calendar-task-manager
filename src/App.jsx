import TaskManager from './components/TaskManager';
import CalendarView from './components/CalendarView';

function App() {
    return (
        <div className="flex min-h-screen bg-black">
            <div className="w-1/3 relative">
                <TaskManager />
                <div className="absolute right-0 top-0 bottom-0 w-px bg-gray-700"></div>
            </div>
            <div className="flex-1">
                <CalendarView />
            </div>
        </div>
    );
}

export default App;