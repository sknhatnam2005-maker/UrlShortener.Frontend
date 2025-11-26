# URL Shortener Frontend

Vue.js frontend for URL Shortener service.

## Features

- Shorten long URLs
- Copy short URLs to clipboard
- View recent shortened URLs
- Responsive design
- RESTful API integration

## Prerequisites

- Node.js 18+
- npm or yarn

## Installation
```bash
npm install
```

## Development
```bash
npm run dev
```

The app will run on `http://localhost:8080`

## Build
```bash
npm run build
```

## Docker

### Build Image
```bash
docker build -t url-shortener-frontend:latest .
```

### Run Container
```bash
docker run -p 8080:80 url-shortener-frontend:latest
```

## Environment Variables

Create `.env` file:
```
VITE_API_URL=http://localhost:3000/api
```

## Project Structure
```
src/
├── components/     # Vue components
├── services/       # API services
├── utils/          # Utility functions
├── App.vue         # Root component
└── main.js         # Entry point
```

## Technologies

- Vue 3
- Vite
- Axios
- Nginx (production)

### Clone repositories
```bash
git clone https://github.com/sknhatnam2005-maker/UrlShortener.Frontend.git
git clone https://github.com/sknhatnam2005-maker/UrlShortener.Backend.git

test ci