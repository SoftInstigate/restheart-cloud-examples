# Plain JavaScript Contact Form

A simple contact form that submits data directly to RESTHeart Cloud using native HTML form submission with optional JavaScript enhancements for better error handling and user experience.

## Features

- **Works without JavaScript** - Uses native HTML form submission
- **Progressive Enhancement** - Optional JavaScript for better UX
- HTML5 form validation
- RESTHeart Cloud integration
- `application/x-www-form-urlencoded` content type
- Responsive design
- AJAX submission when JavaScript is enabled
- Success/error notifications (with JavaScript)
- Loading states (with JavaScript)

## Prerequisites

- A RESTHeart Cloud instance (get started at [cloud.restheart.com](https://cloud.restheart.com))
- A web server to serve the HTML file (or use the included dev server)

## RESTHeart Cloud Setup

### Automated Setup (Recommended)

1. **Register at RESTHeart Cloud**
   - Go to [cloud.restheart.com](https://cloud.restheart.com) and create an account
   
2. **Create a Free Service**
   - Create a new free service instance
   - You'll receive a URL like: `https://acac36.eu-central-1-free-1.restheart.com`
   
3. **Configure the Service URL**
   - Open `config.js` in your code editor
   - Replace the empty string with your RESTHeart Cloud service URL:
   ```javascript
   const RESTHEART_SERVICE_URL = "https://your-instance.eu-central-1-free-1.restheart.com";
   ```
   
4. **Generate Admin JWT**
   - From the RESTHeart Cloud admin webapp, generate an admin JWT token
   
5. **Run the Setup Page**
   - Open `setup.html` in your browser
   - The page will display your configured service URL
   - Enter your admin JWT token
   - Click "Setup Backend" to automatically configure:
     - `/_schemas` collection
     - Contact schema with email validation
     - `/contacts` collection with JSON Schema validation
     - Permission for unauthenticated POST requests with automatic timestamps

### Option 2: Manual Setup

If you prefer to set up manually or need to customize the configuration:

#### 1. Create the Schemas Collection

Create a `_schemas` collection to store JSON schemas.

#### 2. Add the Contact Schema

Create a document in `/_schemas` with `_id: "contact"`:

```json
{
  "_id": "contact",
  "type": "object",
  "properties": {
    "_id": {
      "_$oid": "string"
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "message": {
      "type": "string"
    },
    "timestamp": {
      "type": "object",
      "properties": {
        "_$date": {
          "type": "number"
        }
      },
      "required": ["$date"],
      "additionalProperties": false
    },
    "_etag": {
      "_$oid": "string"
    }
  },
  "required": ["email", "message", "timestamp"],
  "additionalProperties": false
}
```

#### 3. Create the Contacts Collection

Create a `/contacts` collection with JSON Schema validation:

```bash
PUT /contacts
{
  "jsonSchema": {
    "schemaId": "contact"
  }
}
```

#### 4. Configure Permissions

Create a permission document in `/acl` to allow unauthenticated POST requests:

```json
{
  "_id": "allow-contact-form-post",
  "predicate": "path(/contacts) and method(post)",
  "priority": 20,
  "roles": ["$unauthenticated"],
  "mongo": {
    "mergeRequest": {
      "timestamp": "@now"
    }
  }
}
```

This permission:
- Allows unauthenticated users to POST to `/contacts`
- Automatically adds a server-side timestamp using `@now`

## Quick Start

### 1. Configure the Form Action

Edit `index.html` and update the form's `action` attribute with your RESTHeart Cloud URL:

```html
<form action="https://your-instance.restheart.cloud/contact" method="POST" enctype="application/x-www-form-urlencoded">
```

Replace `https://your-instance.restheart.cloud/contact` with your actual endpoint.

### 2. Serve the Application

You can use any static file server. The simplest option:

```bash
# Using the built-in script (uses npx serve)
npm run dev
```

Or use any other static server:

```bash
# Using Python
python -m http.server 8080

# Using Node.js http-server
npx http-server

# Using PHP
php -S localhost:8080
```

Or simply open `index.html` directly in your browser (though a web server is recommended for testing).

### 3. Test the Form

Navigate to `http://localhost:8080` (or the appropriate port) and submit the form.

## Project Structure

```
plain-js-contact-form/
├── index.html           # Main HTML file with form
├── assets/
│   ├── styles.css      # Styling
│   └── app.js          # Optional JavaScript enhancements
├── package.json        # Project metadata and scripts
└── README.md          # This file
```

## How It Works

### Progressive Enhancement Approach

This application follows the progressive enhancement principle:

1. **Base Layer (HTML)**: Form works with just HTML
   - Native form submission to RESTHeart Cloud
   - HTML5 validation
   - Works even if JavaScript is disabled or fails to load

2. **Enhancement Layer (JavaScript)**: When JavaScript is available:
   - AJAX submission (no page reload)
   - Better error handling with user-friendly messages
   - Success notifications
   - Loading indicators
   - Form stays on the same page

### Without JavaScript

The form uses standard HTML form submission:

```html
<form action="https://your-instance.restheart.cloud/contact" 
      method="POST" 
      enctype="application/x-www-form-urlencoded">
    <input type="email" name="email" required>
    <textarea name="message" required></textarea>
    <button type="submit">Send Message</button>
</form>
```

When submitted, the browser:
- Validates fields using HTML5 validation
- Sends data as `application/x-www-form-urlencoded`
- Navigates to the server's response page

### With JavaScript

When `assets/app.js` loads, it:
- Intercepts form submission with `preventDefault()`
- Sends data via AJAX (fetch API)
- Displays success/error messages on the same page
- Shows loading indicators
- Clears the form on success
- No page reload required

### Data Structure

The client sends:
- `email`: Email address (validated as email format)
- `message`: The message text

The server adds:
- `_id`: Auto-generated MongoDB ObjectId
- `timestamp`: Server-side timestamp with `$date` field

## Error Handling

### With JavaScript Enabled
- Network errors: Displayed in error alert
- Server errors: Error message extracted from response
- Validation errors: Caught before submission
- User-friendly error messages

### Without JavaScript
- HTML5 validation before submission
- Browser handles network errors
- Server response determines what user sees

## Customization

### Styling

Modify `assets/styles.css` to customize the appearance. CSS variables are defined at the top:

```css
:root {
    --primary-color: #4a90e2;
    --primary-hover: #357abd;
    --success-color: #27ae60;
    --error-color: #e74c3c;
    /* ... more variables */
}
```

### Form Endpoint

Update the `action` attribute in the form tag in `index.html`:

```html
<form action="https://your-custom-endpoint.com/contact" method="POST" enctype="application/x-www-form-urlencoded">
```

### Disable JavaScript Enhancements

To test or use the form without JavaScript, simply remove or comment out the script tag in `index.html`:

```html
<!-- <script src="assets/app.js"></script> -->
```

## API Reference

### POST /contact

Submits a contact form message.

**Request:**
- Content-Type: `application/x-www-form-urlencoded`
- Body parameters:
  - `email` (string, email format): Email address
  - `message` (string): Message text

**Response:**
- `200 OK`: Message successfully saved
- `400 Bad Request`: Validation error
- `500 Internal Server Error`: Server error

## Browser Support

### Base Functionality (HTML/CSS)
- All modern browsers and older browsers
- Works with JavaScript disabled
- HTML5 form validation
- CSS3 for styling

### Enhanced Functionality (JavaScript)
- Modern browsers supporting:
  - `async`/`await`
  - `fetch` API
  - ES6+ features
- Chrome, Firefox, Safari, Edge (recent versions)

## Why Progressive Enhancement?

This example demonstrates progressive enhancement:
- **Accessibility**: Works for users with JavaScript disabled
- **Resilience**: Gracefully degrades if JavaScript fails
- **Performance**: Core functionality works immediately
- **User Experience**: Enhanced features when available
- **Best Practice**: Follows web standards

## Learn More

- [RESTHeart Cloud Documentation](https://restheart.org/docs/cloud)
- [RESTHeart Cloud Examples](https://restheart.org/docs/cloud/examples)
- [API Reference](https://restheart.org/docs/v7/mongodb-rest)
- [Progressive Enhancement](https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement)

## License

MIT License - feel free to use this code for your own projects!
