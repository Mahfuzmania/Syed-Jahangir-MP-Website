/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#00522e",
          red: "#d21335",
          cream: "#f5efe5",
          ink: "#102218"
        }
      },
      boxShadow: {
        soft: "0 12px 32px rgba(16, 34, 24, 0.14)"
      }
    }
  },
  plugins: []
};
