import React from "react";
import { DateTimeInput } from "payload/components/forms";
import { clearTimeComponent } from "../utils/time";

const dayFieldFilter = (props) => {
    function handleValueChannge(date: Date) {
        props.onChange(clearTimeComponent(new Date(date)));
    }
    return (
        <DateTimeInput
            path=""
            components={{
                Label: () => null,
            }}
            {...props}
            onChange={handleValueChannge}
        />
    );
};
export default dayFieldFilter;
