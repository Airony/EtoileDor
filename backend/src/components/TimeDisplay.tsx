import React from "react";
import { minutesPastMidnightToTimeString } from "../utils/time";
export default function TimeDisplay({ cellData }: { cellData: number }) {
    return <div>{minutesPastMidnightToTimeString(cellData)}</div>;
}
