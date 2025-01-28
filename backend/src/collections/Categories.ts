import { CollectionConfig } from "payload/types";
import { isAdmin } from "../accessControls";
import onDeleteCategory from "../hooks/onDeleteCategory";

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
    hooks: {
        beforeDelete: [onDeleteCategory],
    },
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
