// GoalsTab.jsx
import { useState } from 'react';
import { FiPlus, FiTrash2, FiEdit2, FiCheck } from 'react-icons/fi';
import useLocalStorage from '../hooks/useLocalStorage';

export default function GoalsTab() {
    const [goals, setGoals] = useLocalStorage('goals', []);
    const [newGoal, setNewGoal] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');

    const addGoal = () => {
        if (newGoal.trim()) {
            setGoals([...goals, { id: Date.now(), text: newGoal, completed: false }]);
            setNewGoal('');
        }
    };

    const toggleGoal = (id) => {
        setGoals(goals.map(goal =>
            goal.id === id ? { ...goal, completed: !goal.completed } : goal
        ));
    };

    const startEditing = (id, text) => {
        setEditingId(id);
        setEditText(text);
    };

    const saveEdit = (id) => {
        setGoals(goals.map(goal =>
            goal.id === id ? { ...goal, text: editText } : goal
        ));
        setEditingId(null);
    };

    const deleteGoal = (id) => {
        setGoals(goals.filter(goal => goal.id !== id));
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Goals</h2>
            <div className="flex mb-4">
                <input
                    type="text"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addGoal()}
                    className="flex-1 border rounded-l p-2"
                    placeholder="Add a new goal"
                />
                <button
                    onClick={addGoal}
                    className="bg-blue-500 text-white p-2 rounded-r"
                >
                    <FiPlus />
                </button>
            </div>
            <ul className="space-y-2">
                {goals.map(goal => (
                    <li key={goal.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center">
                            <button
                                onClick={() => toggleGoal(goal.id)}
                                className={`w-5 h-5 border rounded mr-2 flex items-center justify-center ${
                                    goal.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                                }`}
                            >
                                {goal.completed && <FiCheck size={14} className="text-white" />}
                            </button>
                            {editingId === goal.id ? (
                                <input
                                    type="text"
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    className="border-b flex-1"
                                    autoFocus
                                />
                            ) : (
                                <span className={`${goal.completed ? 'line-through text-gray-400' : ''}`}>
                                    {goal.text}
                                </span>
                            )}
                        </div>
                        <div className="flex space-x-2">
                            {editingId === goal.id ? (
                                <button
                                    onClick={() => saveEdit(goal.id)}
                                    className="text-green-500"
                                >
                                    <FiCheck />
                                </button>
                            ) : (
                                <button
                                    onClick={() => startEditing(goal.id, goal.text)}
                                    className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <FiEdit2 />
                                </button>
                            )}
                            <button
                                onClick={() => deleteGoal(goal.id)}
                                className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <FiTrash2 />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}