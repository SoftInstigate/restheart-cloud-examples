# React Product Search

A modern product search application built with React 18 and Vite, connected to RESTHeart Cloud backend.

## Features

- Real-time product search by name
- Filter by price range
- Filter by category
- Responsive design
- Beautiful gradient UI

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure your RESTHeart Cloud instance:
```bash
cp .env.example .env
# Edit .env and set VITE_RESTHEART_URL to your RESTHeart Cloud instance
```

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## RESTHeart Cloud Setup

Make sure you have set up your RESTHeart Cloud backend as described in the [documentation](https://restheart.org/docs/cloud/examples#e-commerce-product-catalog).

You need:
1. A `products` collection with sample data
2. Permissions configured for unauthenticated read access

## Tech Stack

- React 18 (with Hooks)
- Vite
- Native Fetch API for HTTP requests

## Project Structure

```
src/
├── App.jsx          # Main application component
├── App.css          # Styles
└── main.jsx         # Application entry point
```
