import { CollectionConfig } from "payload/types";

const RestaurantTables: CollectionConfig = {
    slug: "restaurant_tables",
    labels: {
        plural: "Restaurant Tables",
        singular: "Restaurant Table",
    },
    fields: [
        {
            name: "number",
            label: "Table Number",
            type: "number",
            required: true,
            min: 1,
            unique: true,
        },
        {
            name: "capacity",
            label: "Table Capacity",
            type: "number",
            required: true,
            min: 1,
        },
    ],
};

export default RestaurantTables;
