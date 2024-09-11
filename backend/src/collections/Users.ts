import { CollectionConfig } from "payload/types";
import { isAdmin } from "../accessControls";

const Users: CollectionConfig = {
    slug: "users",
    auth: {
        cookies: {
            secure: true,
            sameSite: "strict",
        },
    },
    admin: {
        useAsTitle: "email",
    },
    fields: [
        {
            name: "role",
            type: "select",
            options: [
                { label: "Admin", value: "admin" },
                { label: "Staff", value: "staff" },
                { label: "Public", value: "public" },
            ],
            required: true,
            defaultValue: "staff",
            validate: (_, { user, siblingData }) => {
                if (
                    user.role !== siblingData.role &&
                    user.id === siblingData.id
                ) {
                    return "You cannot change your own role";
                }
            },
        },
    ],
    access: {
        update: isAdmin,
        create: isAdmin,
        delete: isAdmin,
        unlock: isAdmin,
    },
};

export default Users;
