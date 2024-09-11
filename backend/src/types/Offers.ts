import { Menu, Offer, OfferImage } from "../payload-types";

export type MenuItem = NonNullable<Menu["categories"][0]["main_items"]>[0];

export interface detailedOffer extends Offer {
    list: {
        menu_item: string;
        image: string | OfferImage;
        id?: string;
        details: MenuItem;
    }[];
}
