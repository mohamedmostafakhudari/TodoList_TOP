/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}", "./src/app/**/*.hbs", "./src/**/*.html"],
	theme: {
		extend: {},
		fontFamily: {
			fira: ["Fira Sans", "sans-serif"],
			poppins: ["Poppins", "sans-serif"],
		},
	},
	plugins: [],
};
