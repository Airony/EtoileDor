import { CollectionConfig } from "payload/types";
import { isAdmin } from "../accessControls";
import validateReservationTime from "../utils/validateReservationTime";

const Reservations: CollectionConfig = {
    slug: "reservations",
    fields: [
        {
            name: "first_name",
            type: "text",
            required: true,
        },
        {
            name: "last_name",
            type: "text",
            required: true,
        },
        {
            name: "tel",
            type: "text",
            required: true,
        },
        {
            name: "day",
            type: "date",
            required: true,
            admin: {
                date: {
                    pickerAppearance: "dayOnly",
                },
            },
        },
        {
            name: "start_time",
            type: "number",
            required: true,
            validate: (time) =>
                validateReservationTime(time) || "Invalid start time",
        },
        {
            name: "end_time",
            type: "number",
            required: true,
            validate: (time) =>
                validateReservationTime(time) || "Invalid end time",
        },
        {
            name: "table",
            label: "Table",
            type: "relationship",
            relationTo: ["restaurant_tables"],
            hasMany: false,
            required: true,
        },
        { name: "party_size", type: "number", min: 1, required: true },
    ],
    access: {
        update: isAdmin,
        create: isAdmin,
        delete: isAdmin,
        unlock: isAdmin,
    },
};

export default Reservations;
