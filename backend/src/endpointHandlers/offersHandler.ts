import { PayloadRequest } from "payload/types";
import type { Response } from "express";
import { detailedOffer, MenuItem } from "../types/Offers";
import type { Offer, Menu } from "../payload-types";

async function offersHandler(req: PayloadRequest, res: Response) {
    const offers = await req.payload.findGlobal({
        slug: "offers",
    });

    const menu = await req.payload.findGlobal({
        slug: "menu",
    });

    let fullOffers: detailedOffer;
    try {
        fullOffers = getNewOffers(offers, menu);
        res.status(200).send(fullOffers).end();
    } catch (error) {
        res.status(500).send(error.message).end();
    }
}

function getNewOffers(offers: Offer, menu: Menu): detailedOffer {
    const detailedList = offers.list.map((listItem) => {
        const itemDetails = findById(listItem.menu_item, menu);
        return {
            ...listItem,
            details: itemDetails,
        };
    });
    return {
        ...offers,
        list: detailedList,
    };
}

function findById(id: string, menu: Menu): MenuItem {
    for (const category of menu.categories) {
        if (category.main_items) {
            for (const item of category.main_items) {
                if (item.id === id) {
                    return item;
                }
            }
        }
        if (category.sub_categories) {
            for (const subCategory of category.sub_categories) {
                for (const item of subCategory.sub_category_items) {
                    if (item.id === id) {
                        return item;
                    }
                }
            }
        }
    }
    throw new Error(`Item with id ${id} not found`);
}
export default offersHandler;
