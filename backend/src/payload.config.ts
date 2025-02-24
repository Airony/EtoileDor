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
import Categories from "./collections/Categories";
import SubCategories from "./collections/SubCategories";
import MenuItems from "./collections/MenuItems";
import categoryOrderView from "./views/categoryOrderView";
import RestaurantTables from "./collections/RestaurantTables";

export default buildConfig({
    collections: [
        Users,
        Reservations,
        OfferImages,
        Categories,
        SubCategories,
        MenuItems,
        RestaurantTables,
    ],
    admin: {
        bundler: webpackBundler(),
        components: {
            views: {
                categoryOrderView: {
                    Component: categoryOrderView,
                    path: "/category-order",
                },
            },
        },
        css: path.resolve(__dirname, "scss/style.scss"),
    },
    rateLimit: {
        trustProxy: true,
        skip: () => process.env?.ENVIROMENT === "development",
    },
    editor: slateEditor({}),
    db: mongooseAdapter({
        url: process.env.MONGO_URL,
        connectOptions: {
            replicaSet: "rs0",
        },
    }),
    typescript: {
        outputFile: path.resolve(__dirname, "payload-types.ts"),
        declare: false,
    },
    globals: [menuConfig, contactInfoConfig, offersConfig, deploymentConfig],
});
