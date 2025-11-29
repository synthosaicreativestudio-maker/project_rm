/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                neon: {
                    blue: '#00f3ff',
                    purple: '#bc13fe',
                    pink: '#ff00ff',
                },
                glass: {
                    100: 'rgba(255, 255, 255, 0.1)',
                    200: 'rgba(255, 255, 255, 0.2)',
                }
            },
            backgroundImage: {
                'cyber-gradient': 'linear-gradient(to right bottom, #0f0c29, #302b63, #24243e)',
            }
        },
    },
    plugins: [],
}
