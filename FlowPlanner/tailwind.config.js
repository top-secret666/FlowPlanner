/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: "#01696f",
          light: "#018a92",
          dark: "#014d52",
        },
        surface: {
          DEFAULT: "#141414",
          raised: "#1e1e1e",
          elevated: "#272727",
        },
        border: "#2a2a2a",
        text: {
          primary: "#f0f0f0",
          secondary: "#a0a0a0",
          muted: "#606060",
        },
      },
      fontFamily: {
        inter: ["Inter_400Regular"],
        "inter-medium": ["Inter_500Medium"],
        "inter-semibold": ["Inter_600SemiBold"],
        "inter-bold": ["Inter_700Bold"],
      },
      borderRadius: {
        card: "16px",
        pill: "999px",
      },
    },
  },
  plugins: [],
};