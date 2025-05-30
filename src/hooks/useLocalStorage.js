import { useState, useEffect } from 'react';

export default function useLocalStorage(key, initialValue) {
    const [value, setValue] = useState(() => {
        try {
            const storedValue = localStorage.getItem(key);
            return storedValue ? JSON.parse(storedValue) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error writing to localStorage key "${key}":`, error);
        }
    }, [key, value]);

    const editItem = (id, newValue) => {
        setValue(prev => prev.map(item =>
            item.id === id ? { ...item, ...newValue } : item
        ));
    };

    const removeItem = (id) => {
        setValue(prev => prev.filter(item => item.id !== id));
    };

    return [value, setValue, { editItem, removeItem }];
}