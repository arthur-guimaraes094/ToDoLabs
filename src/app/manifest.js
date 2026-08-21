export default function manifest() {
  return {
    name: 'ToDoLabs - Gestão Ágil de Demandas',
    short_name: 'ToDoLabs',
    description: 'Sistema de gestão de atividades e fluxo de trabalho para equipes ágeis.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0B1120',
    theme_color: '#004C94',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable any'
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable any'
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png'
      }
    ]
  };
}
