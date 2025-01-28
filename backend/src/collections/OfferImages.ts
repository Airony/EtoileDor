import { CollectionConfig } from "payload/types";
import { isAdmin } from "../accessControls";
import path from "path";
import onDeleteOfferImage from "../hooks/onDeleteOfferImage";

export const OfferImages: CollectionConfig = {
    slug: "offer-images",
    upload: {
        staticDir: path.resolve(__dirname, "../../storage/offer-images"),
        staticURL: "/media/offer-images",
        imageSizes: [
            {
                name: "thumbnail",
                width: 400,
                height: 300,
                position: "centre",
                formatOptions: {
                    format: "jpeg",
                    options: {
                        quality: 80,
                        progressive: true,
                    },
                },
            },
        ],
        crop: true,
        adminThumbnail: "thumbnail",
        mimeTypes: [
            "image/jpeg",
            "image/png",
            "image/jpg",
            "image/webp",
            "image/avif",
            "image/jfif",
        ],
    },
    fields: [],
    hooks: {
        beforeDelete: [onDeleteOfferImage],
    },
    access: {
        read: () => true,
        create: isAdmin,
        update: isAdmin,
        delete: isAdmin,
    },
};
