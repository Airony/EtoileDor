import { CollectionConfig } from "payload/types";
import onDeleteMenuItem from "../hooks/onDeleteMenuItem";
import { isAdmin } from "../accessControls";
import addMenuItemHandler from "../endpointHandlers/addMenuItemHandler";
import orderMenuItemsHandler from "../endpointHandlers/orderMenuItemsHandler";
import deleteMenuItemHandler from "../endpointHandlers/deleteMenuItemHandler";

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

    hooks: {
        beforeDelete: [onDeleteMenuItem],
    },
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
