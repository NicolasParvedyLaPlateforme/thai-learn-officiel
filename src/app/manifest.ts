import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ThaiLearn',
    short_name: 'ThaiLearn',
    description: 'Apprenez le thaïlandais facilement',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAFAFA',
    theme_color: '#10b981',
    icons: [
      {
        src: '/icon.svg',
        sizes: '192x192 512x512',
        type: 'image/svg+xml',
      }
    ],
  }
}
