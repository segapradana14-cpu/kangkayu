/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  // preflight dimatikan agar tidak bentrok dengan kk.css (gaya dari prototype)
  corePlugins: { preflight: false },
  theme: { extend: {} },
  plugins: [],
};
