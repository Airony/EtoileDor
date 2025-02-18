import { CollectionConfig } from "payload/types";
import { isAdmin } from "../accessControls";
import updateCategoriesHandler from "../endpointHandlers/updateCategoriesHandler";
import deleteCategoryHandler from "../endpointHandlers/deleteCategoryHandler";
import orderCategoriesHandler from "../endpointHandlers/orderCategoriesHandler";

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
        {
            name: "sub_categories",
            label: "Sub Categories",
            type: "relationship",
            relationTo: "sub_categories",
            hasMany: true,
        },
        {
            name: "menu_items",
            label: "Menu Items",
            type: "relationship",
            relationTo: "menu_items",
            hasMany: true,
        },
    ],
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
            path: "/update_all",
            method: "patch",
            handler: updateCategoriesHandler,
        },
        {
            path: "/:id",
            method: "delete",
            handler: deleteCategoryHandler,
        },
        {
            path: "/order",
            method: "patch",
            handler: orderCategoriesHandler,
        },
    ],
};

export default Categories;
