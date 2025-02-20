import { PayloadHandler } from "payload/config";
import { isAdmin } from "../accessControls";
import { Category, MenuItem, SubCategory } from "../payload-types";

const setMenuItemParentHandler: PayloadHandler = async (req, res) => {
    if (!isAdmin({ req })) {
        return res.status(401).send("Unauthorized");
    }

    const id = req?.params?.id;
    const newParentId = req?.body?.newParentId;
    const newParentType: "categories" | "sub_categories" =
        req?.body?.newParentType;
    if (!id || typeof id !== "string") {
        return res.status(404).send("Missing id");
    }
    if (!newParentId || typeof newParentId !== "string") {
        return res.status(404).send("Missing newParentId");
    }
    if (!newParentType || typeof newParentType !== "string") {
        return res.status(404).send("Missing newParentType");
    }

    // Try to find current parent

    let oldParentCollection: "categories" | "sub_categories" = "categories";
    let oldParent: Category | SubCategory = (
        await req.payload.find({
            collection: "categories",
            depth: 1,
            where: {
                menu_items: {
                    contains: id,
                },
            },
        })
    ).docs[0];

    if (!oldParent) {
        oldParentCollection = "sub_categories";
        oldParent = (
            await req.payload.find({
                collection: "sub_categories",
                depth: 1,
                where: {
                    menu_items: {
                        contains: id,
                    },
                },
            })
        ).docs[0];
    }

    if (!oldParent) {
        return res.status(404).send("Old parent not found");
    }

    const newParent = (
        await req.payload.find({
            collection: newParentType,
            depth: 1,
            where: {
                id: {
                    equals: newParentId,
                },
            },
        })
    ).docs[0];

    if (!newParent) {
        return res.status(404).send("New parent not found");
    }

    // First, calculate new index

    let index = 0;
    const newMenuItems = (newParent.menu_items as MenuItem[]) || [];
    if (newMenuItems && newMenuItems.length > 0) {
        index = Math.max(...newMenuItems.map((item) => item.index)) + 1;
    }

    const oldMenuItems = (oldParent.menu_items as MenuItem[]) || [];
    const oldIds = oldMenuItems.map((item) => item.id);

    const newIds = newMenuItems.map((item) => item.id);

    try {
        // Use a transaction here
        const updatedMenuItem = await req.payload.update({
            collection: "menu_items",
            id,
            data: {
                index,
            },
        });
        if (!updatedMenuItem) {
            throw new Error("Failed to update menu item");
        }

        const updatedOldParent = await req.payload.update({
            collection: oldParentCollection,
            id: oldParent.id,
            data: {
                menu_items: oldIds.filter((item) => item !== id),
            },
        });

        if (!updatedOldParent) {
            throw new Error("Failed to update old parent");
        }

        const updatedNewParent = await req.payload.update({
            collection: newParentType,
            id: newParentId,
            data: {
                menu_items: [...newIds, id],
            },
        });

        if (!updatedNewParent) {
            throw new Error("Failed to update new parent");
        }

        return res.status(200).send("Updated menu item parent successfully.");
    } catch (error) {
        console.error(error);
        return res.status(500).send("Failed to update menu item parent");
    }
};

export default setMenuItemParentHandler;
