import { GlobalConfig } from "payload/types";
import { isAdmin } from "../accessControls";
import offersHandler from "../endpointHandlers/offersHandler";

const offersConfig: GlobalConfig = {
    slug: "offers",
    label: "Offers",
    access: {
        read: () => true,
        update: isAdmin,
    },

    fields: [
        {
            name: "list",
            label: "List",
            type: "array",
            minRows: 3,
            maxRows: 3,
            required: true,
            fields: [
                {
                    name: "menu_item",
                    label: "Menu Item",
                    required: true,
                    type: "relationship",
                    relationTo: "menu_items",
                },
                {
                    name: "image",
                    label: "Image",
                    required: true,
                    type: "upload",
                    relationTo: "offer-images",
                },
            ],
        },
    ],
    endpoints: [
        {
            path: "/full",
            method: "get",
            handler: offersHandler,
        },
    ],
};

export default offersConfig;
