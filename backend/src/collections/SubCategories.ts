import { CollectionConfig } from "payload/types";
import { isAdmin } from "../accessControls";
import onDeleteSubCategory from "../hooks/onDeleteSubCategory";

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
            name: "category",
            label: "Parent Category",
            type: "relationship",
            relationTo: ["categories"],
            required: true,
        },
    ],
    admin: {
        useAsTitle: "name",
        group: "Menu",
    },
    hooks: {
        beforeDelete: [onDeleteSubCategory],
    },
    access: {
        update: isAdmin,
        create: isAdmin,
        delete: isAdmin,
        unlock: isAdmin,
    },
};

export default SubCategories;
