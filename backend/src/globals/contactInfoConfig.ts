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
            defaultValue: [
                {
                    phone_number: 1234567890,
                },
            ],
        },
        {
            name: "email",
            label: "Email",
            type: "email",
            required: true,
            defaultValue: "contact@example.com",
        },
        {
            name: "address",
            label: "Address",
            type: "text",
            required: true,
            defaultValue: "Example Address",
        },
        {
            name: "google_maps_link",
            label: "Google Maps Link",
            type: "text",
        },
    ],
};

export default contantInfoConfig;
