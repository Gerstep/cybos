/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        mono: ['SF Mono', 'Monaco', 'Inconsolata', 'monospace'],
      },
      colors: {
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        rule: 'var(--rule)',
        surface: 'var(--surface)',
        'dot-green': 'var(--dot-green)',
        'dot-red': 'var(--dot-red)',
        'dot-gold': 'var(--dot-gold)',
        'dot-blue': 'var(--dot-blue)',
      },
    },
  },
  plugins: [],
}
