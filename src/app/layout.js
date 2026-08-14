import { Outfit, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata = {
  title: "ToDoLabs - Gestão Ágil de Demandas",
  description: "Sistema de gestão de atividades e fluxo de trabalho para equipes de engenharia de software.",
  keywords: ["ToDoLabs", "Kanban", "Gestão de Atividades", "Dev", "Agile", "Next.js", "Neon PostgreSQL"],
  authors: [{ name: "ToDoLabs Engineering" }],
  openGraph: {
    title: "ToDoLabs - Gestão Ágil de Demandas",
    description: "Sistema de gestão de atividades e fluxo de trabalho para equipes de engenharia de software.",
    url: "http://localhost:3000",
    siteName: "ToDoLabs",
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#f8fafc",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html 
      lang="pt-BR" 
      className={`h-full antialiased ${outfit.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <meta charSet="UTF-8" />
        <link rel="preconnect" href="https://api.dicebear.com" />
      </head>
      <body className="min-h-full flex flex-col bg-[#f8fafc] text-slate-800 font-sans selection:bg-[#F7941D] selection:text-white">
        {children}
      </body>
    </html>
  );
}
