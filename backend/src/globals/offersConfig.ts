import { GlobalConfig } from "payload/types";
import { isAdmin } from "../accessControls";
import offerSelectComponent from "../fields/offerSelectComponent";
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
                    type: "text",
                    required: true,
                    admin: {
                        components: { Field: offerSelectComponent },
                    },
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
