import type { Config } from "tailwindcss";

const config: Config = {

    darkMode: "class",

    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    DEFAULT: "#0a348f",
                    light: "#1e40af",
                    dark: "#1e3a8a",
                }
            }
        },
    },
    plugins: [],
};

export default config;