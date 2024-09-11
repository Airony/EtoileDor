import { GlobalConfig } from "payload/types";
import { isAdmin } from "../accessControls";

const menuConfig: GlobalConfig = {
    slug: "menu",
    access: {
        read: () => {
            return true;
        },
        update: isAdmin,
    },

    fields: [
        {
            name: "categories",
            label: "Categories",
            type: "array",
            minRows: 1,
            required: true,
            fields: [
                {
                    name: "category_name",
                    label: "Category Name",
                    type: "text",
                    required: true,
                },
                {
                    name: "main_items",
                    label: "Main category items",
                    type: "array",

                    fields: [
                        {
                            name: "item",
                            label: "Item",
                            type: "text",
                            required: true,
                        },
                        {
                            name: "price",
                            label: "Price",
                            type: "number",
                            required: true,
                        },
                    ],
                },
                {
                    name: "sub_categories",
                    label: "Sub Categories",
                    type: "array",

                    fields: [
                        {
                            name: "sub_category_name",
                            label: "Sub Category Name",
                            type: "text",
                            required: true,
                        },
                        {
                            name: "sub_category_items",
                            label: "Sub Category Items",
                            type: "array",
                            required: true,
                            minRows: 1,
                            fields: [
                                {
                                    name: "item",
                                    label: "Item",
                                    type: "text",
                                    required: true,
                                },
                                {
                                    name: "price",
                                    label: "Price",
                                    type: "number",
                                    required: true,
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};

export default menuConfig;
