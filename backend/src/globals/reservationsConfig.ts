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
        },
        {
            name: "increment_minutes",
            type: "number",
            label: "Increments in Minutes",
            required: true,
            min: 1,
            max: 60 * 24 - 1,
        },
        {
            name: "max_party_size",
            type: "number",
            label: "Max Party Size",
            min: 0,
        },
        {
            name: "max_reservation_advance_days",
            type: "number",
            label: "Max Reservation Advance Days",
            min: 1,
            required: true,
        },
    ],
};
