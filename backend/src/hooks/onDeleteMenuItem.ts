import APIError from "payload/dist/errors/APIError";
import { CollectionBeforeDeleteHook } from "payload/types";
import { Offer } from "../payload-types";

const onDeleteMenuItem: CollectionBeforeDeleteHook = async ({
    req, // full express request
    id, // id of document to delete
}) => {
    const offers = await req.payload.findGlobal({
        slug: "offers",
        depth: 1,
    });

    if (offers.list.some((offer) => offerContainsItem(offer, id))) {
        throw new APIError(
            "Cannot delete this item as it is an offer. Please replace it in the offers list first.",
            400,
            undefined,
            true,
        );
    }
};

function offerContainsItem(offer: Offer["list"][0], id: string | number) {
    if (typeof offer.menu_item === "string") {
        return offer.menu_item === id.toString();
    }
    return offer.menu_item.id === id.toString();
}

export default onDeleteMenuItem;
