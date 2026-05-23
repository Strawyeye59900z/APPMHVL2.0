import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta Marinho (design escolhido)
        bg:         '#0c1422',
        'bg-soft':  '#131f33',
        card:       '#172335',
        'card-muted': '#111a2a',
        hairline:   '#22324a',
        ink:        '#e8eef5',
        'ink-2':    '#a0b2c5',
        muted:      '#5e7188',
        primary: {
          DEFAULT: '#5b9be8',
          soft:    '#1c3551',
          ink:     '#08121f',
        },
        accent: {
          DEFAULT: '#d4ad6b',
          soft:    '#2d2618',
          deep:    '#3a2e1c',
        },
        ok:         '#5fbf86',
        'ok-soft':  '#1a3528',
        warn:       '#d6a85b',
        'warn-soft': '#2e2616',
        nav:        '#070d18',
      },
      fontFamily: {
        sans:  ['DM Sans', '-apple-system', 'system-ui', 'sans-serif'],
        hero:  ['Instrument Serif', 'Georgia', 'serif'],
        mono:  ['ui-monospace', 'SF Mono', 'Consolas', 'monospace'],
      },
      borderRadius: {
        card: '22px',
        btn:  '999px',
      },
    },
  },
  plugins: [],
};

export default config;
