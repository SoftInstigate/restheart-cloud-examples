# RESTHeart Cloud Examples

This monorepo contains example frontend applications that demonstrate how to build web applications using RESTHeart Cloud as a backend.

<img width="842" height="677" alt="immagine" src="https://github.com/user-attachments/assets/737bef3d-6801-4aff-b89c-c3458ade3495" />

## Examples

### Contact Form Application

- **Plain JavaScript Contact Form** - Vanilla JavaScript form without framework dependencies

A simple contact form that demonstrates:
- Form submission with validation
- /setup page to setup the backend
- POST requests to RESTHeart Cloud
- Using `application/x-www-form-urlencoded` content type
- Email validation
- Success/error handling

TIP: you can also define a Webhook to receive notifications when the contact form is submitted.

### Product Search Applications

This repository includes three implementations of a Product Search application, each using a different frontend framework:

- **[Vue.js](./vue-product-search)** - Modern progressive framework
- **[React](./react-product-search)** - Popular component-based library  
- **[Angular](./angular-product-search)** - Full-featured framework

All three implementations connect to the same RESTHeart Cloud backend and demonstrate:
- Product search functionality
- Real-time filtering by name
- Price range filtering
- Category-based filtering
- Responsive design

## Prerequisites

- npm or yarn
- A RESTHeart Cloud instance (get started at [cloud.restheart.com](https://cloud.restheart.com))

## Quick Start

### 1. Set up your RESTHeart Cloud Backend

Follow the setup instructions in the [RESTHeart Cloud Examples documentation](https://restheart.org/docs/cloud/examples#e-commerce-product-catalog) to:

1. Create the `products` collection
2. Add sample product data
3. Configure permissions for unauthenticated read access

### 2. Clone and Configure

```bash
# Clone this repository
git clone https://github.com/SoftInstigate/restheart-cloud-examples.git
cd restheart-cloud-examples

# Choose your framework and navigate to its directory
cd vue-product-search    # For Vue.js
# OR
cd react-product-search  # For React
# OR
cd angular-product-search # For Angular
```

### 3. Configure Environment Variables

**For Vue.js and React:**
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and set your RESTHeart Cloud URL
# VITE_RESTHEART_URL=https://your-instance.restheart.cloud
```

**For Angular:**
```bash
# Edit src/environments/environment.ts and set restHeartUrl
```

### 4. Install and Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev    # For Vue.js and React
# OR
npm start      # For Angular
```

## Project Structure

```
restheart-cloud-examples/
├── vue-product-search/       # Vue.js implementation
│   ├── src/
│   │   └── App.vue          # Main component
│   ├── .env.example
│   └── README.md
├── react-product-search/     # React implementation
│   ├── src/
│   │   ├── App.jsx          # Main component
│   │   └── App.css
│   ├── .env.example
│   └── README.md
├── angular-product-search/   # Angular implementation
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.component.ts
│   │   │   ├── app.component.html
│   │   │   └── app.component.css
│   │   └── environments/
│   ├── .env.example
│   └── README.md
├── plain-js-contact-form/    # Plain JavaScript contact form
│   ├── src/
│   │   ├── config.js        # Endpoint configuration
│   │   ├── app.js           # Form logic
│   │   └── styles.css       # Styling
│   ├── index.html
│   └── README.md
└── README.md                 # This file
```

## Application-Specific Documentation

Each application directory contains its own README with specific instructions:

### Product Search Examples
- [Vue.js Product Search](./vue-product-search/README.md)
- [React Product Search](./react-product-search/README.md)
- [Angular Product Search](./angular-product-search/README.md)

### Contact Form Example
- [Plain JavaScript Contact Form](./plain-js-contact-form/README.md)

## Features

### Product Search
- Search products by name with instant filtering
- Filter by price range (min/max)
- Filter by category
- Sort by price
- Responsive grid layout
- Real-time updates

### RESTHeart Integration
- Direct API calls using native fetch/HttpClient
- MongoDB query filters with `$regex`, `$gte`, `$lte`
- Sorting capabilities
- Error handling
- Loading states

## API Examples

All three apps use the same RESTHeart Cloud API endpoints:

```javascript
// Search by name
GET /products?filter={"name":{"$regex":"headphones","$options":"i"}}

// Filter by price range
GET /products?filter={"price":{"$gte":50,"$lte":150}}

// Filter by category
GET /products?filter={"category":"electronics"}

// Combined filters with sorting
GET /products?filter={"category":"electronics","price":{"$lte":200}}&sort={"price":1}
```

## Learn More

- [RESTHeart Cloud Documentation](https://restheart.org/docs/cloud)
- [RESTHeart Cloud Examples](https://restheart.org/docs/cloud/examples)
- [API Reference](https://restheart.org/docs/mongodb-rest/)

## License

MIT License - feel free to use this code for your own projects!

## Support

- Issues: [GitHub Issues](https://github.com/SoftInstigate/restheart-cloud-examples/issues)
- Documentation: [restheart.org](https://restheart.org)
- Community: [GitHub Discussions](https://github.com/SoftInstigate/restheart/discussions)
