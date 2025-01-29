import { CollectionConfig } from "payload/types";
import { isAdmin } from "../accessControls";
import onDeleteCategory from "../hooks/onDeleteCategory";
import reorderCategoriesHandler from "../endpointHandlers/reoderCategoriesHandler";

const Categories: CollectionConfig = {
    slug: "categories",
    fields: [
        {
            name: "name",
            label: "Name",
            type: "text",
            required: true,
        },
        {
            name: "index",
            type: "number",
            defaultValue: -1,
            required: true,
        },
    ],
    hooks: {
        beforeDelete: [onDeleteCategory],
    },
    admin: {
        useAsTitle: "name",
        group: "Menu",
        // hidden: true,
    },
    access: {
        read: () => true,
        update: isAdmin,
        create: isAdmin,
        delete: isAdmin,
        unlock: isAdmin,
    },
    endpoints: [
        {
            path: "/reorder",
            method: "patch",
            handler: reorderCategoriesHandler,
        },
    ],
};

export default Categories;
