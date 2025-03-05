import { CollectionConfig, FieldHook } from "payload/types";
import { isAdmin } from "../accessControls";
import TimeDisplay from "../components/TimeDisplay";
import { clearTimeComponent } from "../utils/time";
import DefaultCell from "../components/DefaultCell";
import dayFieldFilter from "../fields/dayFieldFilter";
import TimeSelect from "../fields/TimeSelect";

const beforeValdiateDayHook: FieldHook = ({ value }): Date => {
    return clearTimeComponent(new Date(value));
};

const afterReadDayHook: FieldHook<never, string, unknown> = ({ value }) => {
    const date = new Date(value);
    return date.toLocaleDateString().split("T")[0];
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
            admin: {
                components: {
                    Cell: DefaultCell,
                    Filter: dayFieldFilter,
                },
            },
            hooks: {
                beforeValidate: [beforeValdiateDayHook],
                afterRead: [afterReadDayHook],
            },
        },
        {
            name: "start_time",
            type: "number",
            required: true,
            admin: {
                components: {
                    Field: TimeSelect,
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
                    Field: TimeSelect,
                    Cell: TimeDisplay,
                },
            },
            validate: (value: number, { siblingData }) => {
                return (
                    value > siblingData.start_time ||
                    "End time must be after start time"
                );
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
