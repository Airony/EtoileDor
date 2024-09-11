import { CollectionConfig } from "payload/types";
import { isAdmin } from "../accessControls";

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
            name: "date",
            type: "date",
            required: true,
        },
        { name: "party_size", type: "text", required: true },
    ],
    access: {
        update: isAdmin,
        create: isAdmin,
        delete: isAdmin,
        unlock: isAdmin,
    },
};

export default Reservations;
