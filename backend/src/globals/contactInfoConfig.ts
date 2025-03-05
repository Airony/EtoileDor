import { GlobalConfig } from "payload/types";
import { isAdmin } from "../accessControls";

const contantInfoConfig: GlobalConfig = {
    slug: "contact_info",
    label: "Contact Info",
    access: {
        read: () => true,
        update: isAdmin,
    },

    fields: [
        {
            name: "phone_numbers",
            label: "Phone Numbers",
            type: "array",
            minRows: 1,
            required: true,
            fields: [
                {
                    name: "phone_number",
                    label: "Phone Number",
                    type: "number",
                    required: true,
                },
            ],
        },
        {
            name: "email",
            label: "Email",
            type: "email",
            required: true,
        },
        {
            name: "address",
            label: "Address",
            type: "text",
            required: true,
        },
        {
            name: "google_maps_link",
            label: "Google Maps Link",
            type: "text",
        },
    ],
};

export default contantInfoConfig;
