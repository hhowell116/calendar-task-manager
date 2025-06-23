import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const DEFAULT_VERSE = {
    text: 'Your word is a lamp to my feet and a light to my path.',
    reference: 'Psalm 119:105'
};

const verseContainerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            delay: 0.3,
            when: "beforeChildren",
            staggerChildren: 0.1
        }
    }
};

const textVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            type: "spring",
            stiffness: 100
        }
    }
};

const referenceVariants = {
    hidden: { opacity: 0, x: 10 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            type: "spring",
            stiffness: 100
        }
    }
};

export default function BibleVerse() {
    const [verse, setVerse] = useState(DEFAULT_VERSE);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchVerse = async () => {
            try {
                setLoading(true);
                const response = await fetch('https://bible-api.com/?random=verse');
                if (!response.ok) return;
                const data = await response.json();
                setVerse({
                    text: data.text,
                    reference: data.reference
                });
            } catch (error) {
                console.log('Using default verse');
            } finally {
                setLoading(false);
            }
        };

        fetchVerse();
    }, []);

    return (
        <motion.div
            className="bg-gray-800 p-4 rounded-lg"
            initial="hidden"
            animate="visible"
            variants={verseContainerVariants}
            whileHover={{ y: -2 }}
        >
            <motion.h3
                className="text-lg font-semibold mb-2"
                whileHover={{ scale: 1.02 }}
            >
                Daily Verse
            </motion.h3>

            {loading ? (
                <motion.div
                    animate={{
                        opacity: [0.5, 1, 0.5],
                        scale: [0.98, 1, 0.98]
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: "easeInOut"
                    }}
                    className="text-center"
                >
                    Loading verse...
                </motion.div>
            ) : (
                <>
                    <motion.p
                        className="italic mb-2"
                        variants={textVariants}
                    >
                        "{verse.text}"
                    </motion.p>
                    <motion.p
                        className="text-right text-gray-400"
                        variants={referenceVariants}
                    >
                        {verse.reference}
                    </motion.p>
                </>
            )}
        </motion.div>
    );
}