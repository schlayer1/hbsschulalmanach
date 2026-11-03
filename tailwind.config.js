/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        school: {
          primary: '#006185',
          primaryDark: '#004c6a',
          primaryLight: '#e1f3fa',
          primaryContainer: '#0b7ba7',
          onPrimaryContainer: '#f6faff',
          secondary: '#006b5f',
          secondaryDark: '#005047',
          secondaryLight: '#e0f7f4',
          secondaryContainer: '#76f4e0',
          tertiary: '#854d00',
          tertiaryDark: '#693c00',
          tertiaryLight: '#fff9f6',
          tertiaryContainer: '#ffdcbd',
          surface: '#f8fafc',
          surfaceDim: '#e2e8f0',
          surfaceContainer: '#f1f5f9',
          surfaceContainerHigh: '#e2e8f0',
          card: '#ffffff',
          textMain: '#091d2e',
          textMuted: '#475569',
          border: '#cbd5e1',
          borderLight: '#f1f5f9',
          error: '#ba1a1a',
          errorBg: '#ffdad6',
          success: '#006b5f',
          successBg: '#e0f7f4',
          amberWarm: '#b45309',
          amberBg: '#fef3c7',
          indigoDeep: '#3730a3',
          indigoBg: '#e0e7ff',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 12px -2px rgba(0, 97, 133, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        'float': '0 10px 25px -5px rgba(0, 97, 133, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 20px -3px rgba(0, 97, 133, 0.35)',
      }
    },
  },
  plugins: [],
}
