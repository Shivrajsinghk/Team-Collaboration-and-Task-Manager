import tailwindScrollbar from 'tailwind-scrollbar'

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                base: '#000000',
                surface: '#0A0A0A',
                'surface-alt': '#141414',
                border: {
                    DEFAULT: '#242424',
                    strong: '#25D604',
                },
                muted: '#8FA396',
                ink: '#EDF5EF',
                accent: {
                    DEFAULT: '#2CFF05',
                    hover: '#25D604',
                    ink: '#0A1A08',
                },
                danger: '#F0524F',
            },
            fontFamily: {
                display: ['"Space Grotesk"', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [
        tailwindScrollbar
    ]
}