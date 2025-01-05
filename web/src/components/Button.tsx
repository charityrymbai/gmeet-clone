import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
    text: string;
    onClick: () => void;
    className?: string;
    disabled?: boolean
}

const Button: React.FunctionComponent<ButtonProps> = ({ text, onClick, className, disabled=true}) => {
    return (
        <motion.button
            whileHover={{
                scale: disabled? 1 : 1.1,
                transition: { duration: 0.1 },
            }}
            whileTap={{ scale: disabled? 1: 0.9 }}
            onClick={onClick}
            className={`text-md md:text-lg rounded-md ${disabled? "text-gray-400" : ""} ${className}`}
            disabled={disabled}
        >
            {text}
        </motion.button>
    );
};

export default Button;