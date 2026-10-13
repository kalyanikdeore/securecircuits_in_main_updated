import React from "react";
import "../Config/TableLoader.css";

function TableLoader({ rows = 6, columns = 4 }) {
    return (
        <>
            {Array.from({ length: rows }).map((_, i) => (
                <tr key={i}>
                    {Array.from({ length: columns }).map((_, j) => (
                        <td key={j}>
                            <div className="table-skeleton"></div>
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}

export default TableLoader;