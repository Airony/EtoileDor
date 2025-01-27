import { CollectionConfig } from "payload/types";
import { isAdmin } from "../accessControls";

const SubCategories: CollectionConfig = {
    slug: "sub_categories",
    labels: {
        singular: "Sub Category",
        plural: "Sub Categories",
    },
    fields: [
        {
            "name": "name",
            "label": "Name",
            "type": "text",
            "required": true,
        },
        {
            "name": "category",
            "label": "Category",
            "type": "relationship",
            "relationTo": ["categories"],
            "required": true
        }
    ]
    ,
    admin: {
        useAsTitle: "name",
        group: "Menu",
    }
    ,
    access: {
        update: isAdmin,
        create: isAdmin,
        delete: isAdmin,
        unlock: isAdmin,
    },
}

export default SubCategories;