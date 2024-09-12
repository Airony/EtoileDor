import defaultTheme from "tailwindcss/defaultTheme";
import reactAriaPlugin from "tailwindcss-react-aria-components";

/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{astro,html,js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: "rgba(240, 249, 255, 1)",
                    100: "rgba(232, 241, 246, 1)",
                    200: "rgba(221, 229, 235, 1)",
                    300: "rgba(204, 212, 218, 1)",
                    400: "rgba(167, 175, 181, 1)",
                    500: "rgba(135, 143, 148, 1)",
                    600: "rgba(96, 103, 108, 1)",
                    700: "rgba(77, 84, 89, 1)",
                    750: "rgba(47, 54, 58, 1)",
                    800: "rgba(33, 40, 44, 1)",
                    850: "rgba(27, 35, 39, 1)",
                    900: "rgba(22, 30, 34, 1)",
                    950: "rgba(15, 22, 26, 1)",
                    1000: "rgba(7, 11, 13, 1)",
                },
                secondary: {
                    50: "rgba(243, 236, 217, 1)",
                    100: "rgba(219, 207, 184, 1)",
                    200: "rgba(190, 175, 147, 1)",
                    300: "rgba(160, 143, 110, 1)",
                    400: "rgba(137, 119, 81, 1)",
                    500: "rgba(115, 96, 53, 1)",
                    600: "rgba(105, 86, 46, 1)",
                    700: "rgba(90, 73, 37, 1)",
                    800: "rgba(78, 59, 29, 1)",
                    900: "rgba(64, 45, 19, 1)",
                    250: "rgba(169, 153, 121, 1)",
                },
                error: "rgba(255, 125, 125, 1)",
            },
            fontFamily: {
                main: ["Lora", "serif"],
            },
            fontSize: {
                "6xl": " 4rem",
                "5xl": " 3.25rem",
                "4xl": " 2.75rem",
                "3xl": " 2.25rem",
                "2xl": " 1.88rem",
                xl: " 1.5rem",
                xs: " 0.88rem",
                sm: " 1rem",
                lg: " 1.25rem",
                base: " 1.12rem",
            },
            maxWidth: {
                section: "86rem",
            },
            transitionTimingFunction: {
                "elastic-in": "cubic-bezier(0.32, 0.33, 0.14, 1.39)",
            },
            gridTemplateColumns: {
                "max-2": "repeat(2,max-content)",
            },
        },
        screens: {
            xs: "400px",
            nmd: "800px",
            nlg: "1100px",
            nxl: "1400px",
            ...defaultTheme.screens,
        },
    },
    plugins: [reactAriaPlugin],
};
