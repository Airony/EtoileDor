import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import svgr from "vite-plugin-svgr";

import react from "@astrojs/react";
import { config } from "dotenv";
if (process.env != "production") {
    config();
}
// https://astro.build/config
export default defineConfig({
    integrations: [tailwind(), icon(), react()],
    vite: {
        plugins: [svgr()],
        ssr: { noExternal: ["react-spinners", "react-loader-spinner"] },
    },
    image: {
        domains: [new URL(process.env.CMS_URL).hostname],
    },
});
