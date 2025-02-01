import { CollectionConfig } from "payload/types";
import onDeleteMenuItem from "../hooks/onDeleteMenuItem";
import { isAdmin } from "../accessControls";

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
            name: "Category",
            label: "Category",
            type: "relationship",
            relationTo: ["sub_categories", "categories"],
            required: true,
            hasMany: false,
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
    access: {
        read: () => true,
        create: isAdmin,
        update: isAdmin,
        delete: isAdmin,
        unlock: isAdmin,
    },
};

export default MenuItems;
