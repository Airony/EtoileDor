import { CollectionConfig, FieldHook } from "payload/types";
import { isAdmin } from "../accessControls";
import TimeDisplay from "../components/TimeDisplay";
import { clearTimeComponent } from "../utils/time";

const beforeValdiateDayHook: FieldHook = ({ value }): Date => {
    return clearTimeComponent(new Date(value));
};

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
            hooks: {
                beforeValidate: [beforeValdiateDayHook],
            },
        },
        {
            name: "start_time",
            type: "number",
            required: true,
            admin: {
                components: {
                    Cell: TimeDisplay,
                },
            },
        },
        {
            name: "end_time",
            type: "number",
            required: true,
            admin: {
                components: {
                    Cell: TimeDisplay,
                },
            },
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
