export default {
  darkMode: "class",   // 👈 ADD THIS
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        eco: "#3A7D44",
        beige: "#F5F3EF",
        charcoal: "#1E1E1E",

        // Dark mode luxury tones
        darkbg: "#0F1211",
        darkcard: "#171A19",
        darktext: "#E6E6E6",
        muted: "#9CA3AF",
      },
    },
  },
  plugins: [],
};
