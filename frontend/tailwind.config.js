/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Overpass", "sans-serif"],
      },
      colors: {
        // Map Omo Bank Corporate colors clearly
        "omo-blue": "#004b8d", // Primary Corporate Blue
        "omo-cyan": "#00adef", // Secondary Cyan
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        omo: {
          primary: "#00adef",
          secondary: "#004b8d",
          "base-100": "#ffffff",
          // ... rest of your config
        },
      },
    ],
  },
};
