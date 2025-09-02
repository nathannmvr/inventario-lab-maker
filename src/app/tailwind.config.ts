import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Adicionando as cores da paleta IF ao tema do Tailwind
      colors: {
        primary: {
          50: '#e0f2e0',    // Verde bem claro
          100: '#b3dfb3',
          500: '#006633',  // Verde institucional do IF
          600: '#005a2d',  // Verde um pouco mais escuro para hover
        },
        secondary: {
          500: '#ed1c24',  // Vermelho do IF
          600: '#d61a21',  // Vermelho para hover
        },
        // Adicione cores específicas para backgrounds e textos se quiser usar aqui
        // Ex: bg-app-light, text-app-light, etc.
      },
    },
  },
  plugins: [],
};
export default config;