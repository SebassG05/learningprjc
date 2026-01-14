/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'brand': {
                    '50': '#f0f9ea',
                    '100': '#d5f0c5',
                    '200': '#a1db87', // Color verde corporativo
                    '300': '#8ac573',
                    '400': '#6dc042',
                    '500': '#5aa833',
                    '600': '#458526',
                    '700': '#366920',
                    DEFAULT: '#a1db87',
                },
                'gray': {
                    '600': '#595959', // Gris corporativo 65%
                    '800': '#333333', // Negro corporativo 80%
                },
            },
        },
    },
    plugins: [],
}