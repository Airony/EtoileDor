import React from "react";
export default function TimeDisplay({ cellData }: { cellData: number }) {
    return <div>{stringifyTime(cellData)}</div>;
}

function stringifyTime(time: number) {
    const hours = Math.floor(time / 60);
    const mins = time % 60;
    return `${hours}:${mins < 10 ? "0" : ""}${mins}`;
}
