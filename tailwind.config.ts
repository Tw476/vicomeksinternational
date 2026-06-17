import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#080808",
        gold: "#c9a45c",
        champagne: "#f2ead9"
      },
      boxShadow: {
        premium: "0 24px 70px rgba(0,0,0,.12)"
      }
    }
  },
  plugins: []
};

export default config;
