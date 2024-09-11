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
        useAsTitle: "Name",
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
            validate: validateRole,
        },
    ],
    access: {
        update: isAdmin,
        create: isAdmin,
        delete: isAdmin,
        unlock: isAdmin,
    },
};

function validateRole(_, { user, siblingData }) {
    // Igonre validation when creating default root user.
    if (siblingData?.email === rootEmail) {
        return null;
    }

    if (!user) {
        return "You must be logged in to change a user's role";
    }

    if (
        user.role !== siblingData.role &&
        user.id === siblingData.id
    ) {
        return "You cannot change your own role";
    }
}

export default Users;

export const rootEmail = "root@root.com";