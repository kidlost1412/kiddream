import React, { useState, useEffect } from 'react';

interface ModelMessageProps {
    text: string;
}

const ModelMessage: React.FC<ModelMessageProps> = ({ text }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        setDisplayedText(''); // Reset on new message
        if (text) {
            let i = 0;
            const intervalId = setInterval(() => {
                setDisplayedText(prev => prev + text.charAt(i));
                i++;
                if (i === text.length) {
                    clearInterval(intervalId);
                }
            }, 20); // Adjust typing speed here

            return () => clearInterval(intervalId);
        }
    }, [text]);

    return <p>{displayedText}</p>;
};

export default ModelMessage;
