// components/GlobalSearchInput.jsx
import React, { useState } from "react";

function GlobalSearchInput({
    value,
    onChange,
    placeholder = "Search anything...",
    className = "filter-input",
    onEnter,
}) {
    const [inputValue, setInputValue] = useState(value || "");

    const handleChange = (e) => {
        const val = e.target.value;
        setInputValue(val);
        if (onChange) {
            onChange(val);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            if (onEnter) {
                onEnter(inputValue);
            } else if (onChange) {
                onChange(inputValue);
            }
        }
    };

    return (
        <input
            type="text"
            className={className}
            placeholder={placeholder}
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
        />
    );
}

export default GlobalSearchInput;