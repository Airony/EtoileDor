import { CollectionConfig } from "payload/types";
import { isAdmin } from "../accessControls";
import deleteSubCategoryHandler from "../endpointHandlers/deleteSubCategoryHandler";

const SubCategories: CollectionConfig = {
    slug: "sub_categories",
    labels: {
        singular: "Sub Category",
        plural: "Sub Categories",
    },
    fields: [
        {
            name: "name",
            label: "Name",
            type: "text",
            required: true,
        },
        {
            name: "menu_items",
            label: "Menu Items",
            type: "relationship",
            relationTo: "menu_items",
            hasMany: true,
            required: true,
        },
        {
            name: "index",
            label: "Index",
            type: "number",
            required: true,
            defaultValue: -1,
        },
    ],
    admin: {
        useAsTitle: "name",
        group: "Menu",
    },
    endpoints: [
        {
            path: "/:id",
            method: "delete",
            handler: deleteSubCategoryHandler,
        },
    ],
    access: {
        read: () => true,
        update: isAdmin,
        create: isAdmin,
        delete: isAdmin,
        unlock: isAdmin,
    },
};

export default SubCategories;
