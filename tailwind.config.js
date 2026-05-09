module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                figtree: ['var(--font-figtree)'],
                poppins: ['var(--font-poppins)'],
            },
            colors: {
                primary: {
                    p1: '#F7CD29',
                    p2: '#D89D03',
                    p3: '#C98D02',
                    tint1: '#F8DC8C',
                    tint2: '#F9E99E',
                    tint3: '#FAF1BF',
                    tint4: '#FDF8E4',
                    tint5: '#FEFBEF',
                },
                secondary: {
                    s1: '#FFFFFF',
                    s2: '#C8C8C8',
                    s3: '#A8A8A8',
                },
                tertiary: {
                    t1: '#000000',
                    t2: '#161616',
                    t3: '#2D2D2D',
                },
            },
            keyframes: {
                progress: {
                    '0%': { width: '0%' },
                    '100%': { width: '100%' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
            },
            animation: {
                progress: 'progress 5s linear forwards',
                float: 'float 3s ease-in-out infinite',
            },
            screens: {
                xs: '475px',
                sm: '640px',
                md: '768px',
                lg: '1024px',
                xl: '1280px',
                '2xl': '1536px',
            },
        },
    },
    plugins: [require('@tailwindcss/line-clamp'), require('tailwind-scrollbar')],
};
