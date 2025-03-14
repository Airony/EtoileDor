import { CollectionConfig } from "payload/types";
import { isAdmin } from "../accessControls";
import deleteSubCategoryHandler from "../endpointHandlers/deleteSubCategoryHandler";
import orderSubCategoriesHandler from "../endpointHandlers/orderSubCategoriesHandler";
import addSubCategoryHandler from "../endpointHandlers/addSubCategoryHandler";
import getSubCategoriesHandler from "../endpointHandlers/getSubCategoriesHandler";
import setSubCategoryParentHandler from "../endpointHandlers/setSubCategoryParentHandler";

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
            path: "/get_all",
            method: "get",
            handler: getSubCategoriesHandler,
        },
        {
            path: "/:id",
            method: "delete",
            handler: deleteSubCategoryHandler,
        },
        {
            path: "/order",
            method: "patch",
            handler: orderSubCategoriesHandler,
        },
        {
            path: "/",
            method: "post",
            handler: addSubCategoryHandler,
        },
        {
            path: "/set_parent/:id",
            method: "patch",
            handler: setSubCategoryParentHandler,
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
