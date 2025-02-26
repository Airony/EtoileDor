import { GlobalConfig } from "payload/types";

export const reservationsConfig: GlobalConfig = {
    slug: "reservations_config",
    label: "Reservations Config",
    fields: [
        {
            name: "reservations_start",
            type: "date",
            label: "Reservations Start",
            required: true,
            admin: {
                date: {
                    pickerAppearance: "timeOnly",
                    timeIntervals: 15,
                    timeFormat: "HH:mm",
                },
            },
        },
        {
            name: "reservations_end",
            type: "date",
            label: "Reservations End",
            required: true,
            admin: {
                date: {
                    pickerAppearance: "timeOnly",
                    timeIntervals: 15,
                    timeFormat: "HH:mm",
                },
            },
            validate: (value: string, { siblingData }) => {
                return (
                    new Date(value) >
                        new Date(siblingData.reservations_start) ||
                    "End time must be after start time"
                );
            },
        },
        {
            name: "increment_minutes",
            type: "number",
            label: "Increments in Minutes",
            required: true,
            min: 1,
            max: 60 * 24 - 1,
        },
    ],
};
