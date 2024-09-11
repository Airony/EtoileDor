import { webpackBundler } from "@payloadcms/bundler-webpack";
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { slateEditor } from "@payloadcms/richtext-slate";
import { buildConfig } from "payload/config";
import menuConfig from "./globals/menuConfig";
import path from "path";
import Users from "./collections/Users";
import contactInfoConfig from "./globals/contactInfoConfig";
import Reservations from "./collections/Reservations";
import offersConfig from "./globals/offersConfig";
import { OfferImages } from "./collections/OfferImages";
import deploymentConfig from "./globals/deploymentConfig";

export default buildConfig({
    collections: [Users, Reservations, OfferImages],
    admin: {
        bundler: webpackBundler(),
    },
    rateLimit: {
        trustProxy: true,
    },
    editor: slateEditor({}),
    db: mongooseAdapter({
        url: process.env.MONGO_URL,
    }),
    typescript: {
        outputFile: path.resolve(__dirname, "payload-types.ts"),
        declare: false,
    },
    globals: [menuConfig, contactInfoConfig, offersConfig, deploymentConfig],
});
