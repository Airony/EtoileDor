import APIError from "payload/dist/errors/APIError";
import { CollectionBeforeDeleteHook } from "payload/types";
import { Offer } from "../payload-types";

const onDeleteOfferImage: CollectionBeforeDeleteHook = async ({
    req, // full express request
    id, // id of document to delete
}) => {
    const offers = await req.payload.findGlobal({
        slug: "offers",
        depth: 1,
    });

    if (offers.list.some((offer) => offerContainsItem(offer, id))) {
        throw new APIError(
            "Cannot delete this image as it is referenced in an offer. Please replace it in the offers list first.",
            400,
            undefined,
            true,
        );
    }
};

function offerContainsItem(offer: Offer["list"][0], id: string | number) {
    if (typeof offer.image === "string") {
        return offer.image === id.toString();
    }
    return offer.image.id === id.toString();
}

export default onDeleteOfferImage;
