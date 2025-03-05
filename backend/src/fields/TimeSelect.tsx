import type { ReservationsConfig } from "../payload-types";
import React, { useState, useEffect } from "react";
import { useField, SelectInput, Label } from "payload/components/forms";
import {
    dateTimeToMinutesPastMidnight,
    getTimeRange,
    minutesPastMidnightToTimeString,
} from "../utils/time";
import { Props } from "payload/components/fields/Number";
import { ToastContainer, toast } from "react-toastify";
type TimeSelectProps = Props;
const TimeSelect = ({
    path,
    name,
    required = false,
    label,
}: TimeSelectProps) => {
    const { value, setValue, showError, errorMessage } = useField<number>({
        path,
    });
    const [options, setOptions] = useState<number[]>([]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const response = await fetch(
                    "/api/globals/reservations_config?depth=0",
                );
                if (!response.ok) {
                    throw new Error();
                }
                const {
                    reservations_start,
                    reservations_end,
                    increment_minutes,
                } = (await response.json()) as ReservationsConfig;
                const reservationsStartMinutes =
                    dateTimeToMinutesPastMidnight(reservations_start);
                const reservationsEndMinutes =
                    dateTimeToMinutesPastMidnight(reservations_end);

                setOptions(
                    getTimeRange(
                        reservationsStartMinutes,
                        reservationsEndMinutes,
                        increment_minutes,
                    ),
                );
            } catch (error) {
                console.error("Failed to fetch time options", error);
                toast.error("Failed to fetch. Please refresh the page.", {
                    position: "bottom-center",
                });
            }
        };

        fetchOptions();
        return () => {};
    }, []);

    return (
        <div className="field-type select">
            <Label
                label={label || name}
                htmlFor={path}
                required={required}
            ></Label>
            <SelectInput
                showError={showError}
                errorMessage={errorMessage}
                name={name}
                path={path}
                options={options.map((option) => ({
                    label: minutesPastMidnightToTimeString(option),
                    value: option.toString(),
                }))}
                onChange={(option) => {
                    setValue(parseInt(option.value as string));
                }}
                value={value?.toString()}
            />
            <ToastContainer />
        </div>
    );
};

export default TimeSelect;
