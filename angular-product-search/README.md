# Angular Product Search

A modern product search application built with Angular 18 (standalone components), connected to RESTHeart Cloud backend.

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
# Edit src/environments/environment.ts and set restHeartUrl to your instance
```

3. Run development server:
```bash
npm start
```

The app will be available at `http://localhost:4200/`

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

- Angular 18 (standalone components)
- RxJS for reactive programming
- HttpClient for HTTP requests
- FormsModule for two-way data binding

## Project Structure

```
src/
├── app/
│   ├── app.component.ts       # Main application component
│   ├── app.component.html     # Template
│   └── app.component.css      # Styles
├── environments/
│   └── environment.ts         # Environment configuration
└── main.ts                    # Application bootstrap
```
