import { PayloadRequest } from "payload/types";
import type { Response } from "express";
import { MenuItem, OfferImage } from "../payload-types";
import { FetchedOffer } from "../types/FetchedOffer";

async function offersHandler(req: PayloadRequest, res: Response) {
    const offers = await req.payload.findGlobal({
        slug: "offers",
        depth: 1,
    });

    if (
        offers.list.some((offer) => {
            // If the menu item or image is  a string, it is an ID, Which means it was deleted, and only the ID remains.
            return (
                !offer.menu_item ||
                !offer.image ||
                typeof offer.menu_item === "string" ||
                typeof offer.image === "string"
            );
        })
    ) {
        return res
            .status(500)
            .send("Some offers are missing menu items or images");
    }
    offers.list.forEach((offer) => {
        if (!offer.menu_item || typeof offer.menu_item === "string") {
            // Do something
        }
    });

    const data: FetchedOffer[] = offers.list.map((offer) => {
        const item = offer.menu_item as MenuItem;
        return {
            name: item.name,
            price: item.price,
            imageUrl: (offer.image as OfferImage).url || "",
        };
    });

    res.status(200).json(data);
}

export default offersHandler;
