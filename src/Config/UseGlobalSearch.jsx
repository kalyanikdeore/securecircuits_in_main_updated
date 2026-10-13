import { useState, useMemo } from "react";

export function UseGlobalSearch(data = []) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) return data;

        const query = searchTerm.toLowerCase().trim();

        return data.filter((item) =>
            Object.values(item || {}).some((val) => {
                if (val === null || val === undefined) return false;
                return String(val).toLowerCase().includes(query);
            })
        );
    }, [data, searchTerm]);

    return {
        searchTerm,
        setSearchTerm,
        filteredData,
    };
}