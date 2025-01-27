import { CollectionConfig } from "payload/types";
import { isAdmin } from "../accessControls";

const Categories: CollectionConfig = {
    slug: "categories",
    fields: [
        {
            name: "name",
            label: "Name",
            type: "text",
            required: true,
        },
    ],
    admin: {
        useAsTitle: "name",
        group: "Menu",
    },
    access: {
        update: isAdmin,
        create: isAdmin,
        delete: isAdmin,
        unlock: isAdmin,
    },
};

export default Categories;
