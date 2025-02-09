import { CollectionConfig } from "payload/types";
import { isAdmin } from "../accessControls";
import updateCategoriesHandler from "../endpointHandlers/updateCategoriesHandler";
import deleteCategoryHandler from "../endpointHandlers/deleteCategoryHandler";

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
    ],
};

export default Categories;
