import { CollectionConfig } from "payload/types";
import { isAdmin } from "../accessControls";
import addMenuItemHandler from "../endpointHandlers/addMenuItemHandler";
import orderMenuItemsHandler from "../endpointHandlers/orderMenuItemsHandler";
import deleteMenuItemHandler from "../endpointHandlers/deleteMenuItemHandler";
import setMenuItemParentHandler from "../endpointHandlers/setMenuItemParentHandler";

const MenuItems: CollectionConfig = {
    slug: "menu_items",
    labels: {
        singular: "Menu Item",
        plural: "Menu Items",
    },
    fields: [
        {
            name: "name",
            label: "Name",
            type: "text",
            required: true,
        },
        {
            name: "price",
            label: "Price",
            type: "number",
            required: true,
        },
        {
            name: "index",
            required: true,
            type: "number",
            defaultValue: -1,
        },
    ],
    admin: {
        useAsTitle: "name",
        group: "Menu",
    },
    endpoints: [
        {
            path: "/order",
            method: "patch",
            handler: orderMenuItemsHandler,
        },
        {
            path: "/",
            method: "post",
            handler: addMenuItemHandler,
        },
        {
            path: "/:id",
            method: "delete",
            handler: deleteMenuItemHandler,
        },
        {
            path: "/set_parent/:id",
            method: "patch",
            handler: setMenuItemParentHandler,
        },
    ],
    access: {
        read: () => true,
        create: isAdmin,
        update: isAdmin,
        delete: isAdmin,
        unlock: isAdmin,
    },
};

export default MenuItems;
