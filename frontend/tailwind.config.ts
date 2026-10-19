import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          forest: '#234B3C',
          'forest-deep': '#0F3826',
          'forest-dark': '#18372D',
          'forest-hover': '#092519',
          'forest-light': '#E8F0EB',
          copper: '#B8734E',
          'copper-light': '#D6926F',
          'copper-bg': '#FBF3ED',
          ivory: '#F7F4EC',
          'ivory-dark': '#EDE7D8',
          subtle: '#F2EFE7',
          surface: '#FFFFFF',
          charcoal: '#1E2621',
          'text-primary': '#1E2621',
          'text-muted': '#59655D',
          sage: '#E8EDE6',
          border: '#DCDDD4',
          'border-strong': '#C5C7BC',
          warning: '#B7791F',
          amber: '#B7791F',
          'amber-bg': '#FEF9EE',
          error: '#B84040',
          'alert-red': '#B84040',
          'alert-bg': '#FDF2F2',
          success: '#397553',
          'tag-bg': '#EBECE4',
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        'subtle-elevated': '0 4px 20px -2px rgba(24, 55, 45, 0.06), 0 1px 3px 0 rgba(24, 55, 45, 0.04)',
        'glass-panel': '0 12px 36px -4px rgba(24, 55, 45, 0.12), 0 2px 8px 0 rgba(24, 55, 45, 0.04)',
      },
    },
  },
  plugins: [],
};

export default config;
