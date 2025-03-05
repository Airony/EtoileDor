import React from "react";
import { useField, Label, DateTimeInput } from "payload/components/forms";
import { Props } from "payload/components/fields/Number";
type TimeInputProps = Props;
const TimeInput = ({ path, name, required = false, label }: TimeInputProps) => {
    const { value, setValue, showError, errorMessage } = useField<number>({
        path,
    });

    return (
        <div className="field-type select">
            <Label
                label={label || name}
                htmlFor={path}
                required={required}
            ></Label>
            <DateTimeInput
                showError={showError}
                errorMessage={errorMessage}
                path={path}
                value={dateFromMinutesPastMidnight(value)}
                onChange={(value) => {
                    setValue(minutesPastMidnightFromDate(value));
                }}
                datePickerProps={{
                    timeIntervals: 15,
                    pickerAppearance: "timeOnly",
                    timeFormat: "HH:mm",
                }}
                components={{}}
            />
        </div>
    );
};

function dateFromMinutesPastMidnight(minutesPastMidnight: number): Date {
    const date = new Date();
    if (isNaN(minutesPastMidnight)) {
        return null;
    }
    date.setHours(0, 0, 0, 0);
    date.setMinutes(minutesPastMidnight);
    return date;
}

function minutesPastMidnightFromDate(date: Date): number {
    return date.getHours() * 60 + date.getMinutes();
}

export default TimeInput;
