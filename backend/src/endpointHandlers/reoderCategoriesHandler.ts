import { PayloadHandler } from "payload/config";
import { PayloadRequest } from "payload/types";
import { isAdmin } from "../accessControls";

interface Data {
    id: string;
    index: number;
}

const reorderCategoriesHandler: PayloadHandler = async (req, res) => {
    if (!isAdmin({ req })) {
        res.status(401).end("You are not authorized to perform this action.");
        return;
    }

    if (!req.body) {
        return res.status(400).end("No data provided");
    }
    // Use a transaction in the future
    const categories = req.body as Data[];
    const request = {} as PayloadRequest;
    try {
        for (const category of categories) {
            await req.payload.update({
                collection: "categories",
                id: category.id,
                data: {
                    index: category.index,
                },
                req: request,
            });
        }

        res.status(200).end();
    } catch (error) {
        console.error(error);
        res.status(500).end();
    }
};

export default reorderCategoriesHandler;
