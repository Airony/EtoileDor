import { GlobalConfig } from "payload/types";
import TimeInput from "../fields/TimeInput";

export const reservationsConfig: GlobalConfig = {
    slug: "reservations_config",
    label: "Reservations Config",
    fields: [
        {
            name: "reservations_start",
            type: "number",
            label: "Reservations Start",
            required: true,
            admin: {
                components: {
                    Field: TimeInput,
                },
            },
            defaultValue: 11 * 60, // 11:00
        },
        {
            name: "reservations_end",
            type: "number",
            label: "Reservations End",
            required: true,
            admin: {
                components: {
                    Field: TimeInput,
                },
            },
            validate: (value: number, { siblingData }) => {
                return (
                    value > siblingData.reservations_start ||
                    "End time must be after start time"
                );
            },
            defaultValue: 21 * 60, // 21:00
        },
        {
            name: "increment_minutes",
            type: "number",
            label: "Increments in Minutes",
            required: true,
            min: 1,
            max: 60 * 24 - 1,
            defaultValue: 30,
        },
        {
            name: "max_party_size",
            type: "number",
            label: "Max Party Size",
            min: 0,
            defaultValue: 15,
        },
        {
            name: "max_reservation_advance_days",
            type: "number",
            label: "Max Reservation Advance Days",
            min: 1,
            required: true,
            defaultValue: 30,
        },
    ],
};
