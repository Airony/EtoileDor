import { CollectionConfig } from "payload/types";

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
            label: "Sub Category",
            type: "relationship",
            relationTo: ["sub_categories", "categories"],
            required: true,
            hasMany: false,
        }
    ],

    admin: {
        useAsTitle: "name",
        group: "Menu",
    }
}

export default MenuItems;