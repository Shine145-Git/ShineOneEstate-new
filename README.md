# ShineOne Estate

A modern real estate web platform built with React and Express, designed to showcase residential projects, manage media content, and provide an intuitive admin dashboard for property management.

## Overview

ShineOne Estate is a full-stack web application that provides a comprehensive solution for real estate companies to showcase their projects, manage media assets, and communicate with potential clients. The platform features a responsive frontend for customers and a powerful admin panel for content management.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Dependencies](#dependencies)
- [Contributing](#contributing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Security](#security)
- [License](#license)

## Features

### Frontend Features
- **Hero Section**: Eye-catching carousel with rotating property images
- **Project Showcase**: Display multiple real estate projects with status tracking
  - Sector 4, Sector 9, Sector 42, Sector 46, Reliance Met City
  - Real-time project status (Completed, Ongoing)
  - Project details: area, progress, ETA
- **Gallery**: Before/after image galleries for project visualization
- **Responsive Design**: Mobile-optimized interface with smooth scrolling
- **Location Information**: Interactive location zone display with highlights
- **Contact Section**: Multiple contact channels (phone, WhatsApp, email)
- **Media Management**: Image and video playback with lightbox functionality

### Admin Dashboard Features
- **Secure Admin Panel**: Protected administrative interface for content management
- **Media Upload**: Single and batch file upload support (images and videos)
- **Sector Management**: Add, edit, and manage project sectors
- **Cloud Integration**: Cloudinary-based media storage and delivery
- **Media Gallery**: Browse, organize, and delete uploaded media
- **Statistics**: Dashboard overview with key metrics
- **Real-time Updates**: Changes reflect immediately in the frontend
- **Responsive Admin UI**: Professional dashboard layout with sidebar navigation

### Backend Features
- **RESTful API**: Complete API for content management and media operations
- **File Upload Handling**: Multer-based file processing and validation
- **Cloud Storage**: Cloudinary integration for scalable media hosting
- **Database**: MongoDB with Mongoose ORM for flexible data modeling
- **CORS Support**: Cross-origin resource sharing for frontend integration
- **Error Handling**: Comprehensive error handling and logging

## Tech Stack

### Frontend
- **React** (v19.2.0) - Modern UI library with hooks and concurrent features
- **React Router** (v7.13.1) - Client-side routing and navigation
- **Lucide React** (v0.553.0) - Beautiful, consistent icon library
- **React Scripts** (v5.0.1) - Create React App build tools

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** (v5.2.1) - Web framework and API server
- **Mongoose** (v8.23.0) - MongoDB object modeling
- **Multer** (v2.1.1) - File upload middleware
- **Cloudinary** (v2.9.0) - Cloud-based media management
- **CORS** (v2.8.6) - Cross-origin resource sharing
- **dotenv** (v17.3.1) - Environment variable management

### Database
- **MongoDB** - NoSQL database for flexible document storage

### Testing & QA
- **Jest** - Testing framework via React Scripts
- **React Testing Library** (v16.3.0) - Component testing utilities
- **Web Vitals** (v2.1.4) - Performance monitoring

## Project Structure

```
ShineOneEstate-new/
├── src/
│   ├── components/
│   │   ├── idea1.jsx              # Main public website component
│   │   └── admin.jsx              # Admin dashboard component
│   ├── data/
│   │   ├── sec 42/                # Sector 42 project images
│   │   ├── sec 9/                 # Sector 9 project images
│   │   ├── sec 46/                # Sector 46 project images
│   │   ├── sec 4/                 # Sector 4 project images
│   │   ├── Reliance Met City/     # Reliance Met City images
│   │   ├── beforeafter/           # Before/after comparison images
│   │   ├── Profile/               # Profile/company images
│   │   └── Caraousel/             # Hero carousel images
│   ├── App.js                     # Main app component with routing
│   ├── App.css                    # App styles
│   ├── index.js                   # React entry point
│   ├── index.css                  # Global styles
│   ├── reportWebVitals.js         # Performance monitoring
│   └── setupTests.js              # Test configuration
├── public/
│   ├── manifest.json              # PWA manifest
│   ├── favicon.ico                # Site favicon
│   └── index.html                 # HTML template
├── uploads/                       # Temporary file upload directory
├── server.js                      # Express server and API routes
├── schema.js                      # MongoDB schema definitions
├── .env                           # Environment variables (template)
├── package.json                   # Node.js dependencies
├── package-lock.json              # Dependency lock file
└── README.md                      # Project documentation
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (Atlas or local instance)
- Cloudinary account for media hosting
- npm or yarn package manager

### Setup Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Shine145-Git/ShineOneEstate-new.git
   cd ShineOneEstate-new
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   - Copy `.env.example` to `.env` (if available) or create a new `.env` file:
   ```bash
   cp .env.example .env
   ```
   - Configure the following variables:
   ```env
   CLOUD_NAME=your_cloudinary_cloud_name
   API_KEY=your_cloudinary_api_key
   API_SECRET=your_cloudinary_api_secret
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   ```

4. **Database Setup**
   - Ensure MongoDB is running
   - Database will be automatically initialized on first server run
   - Collections are created via Mongoose schemas

5. **Start Development Servers**

   **Terminal 1 - Backend Server:**
   ```bash
   node server.js
   ```
   Server runs on `http://localhost:1000` (or PORT from .env)

   **Terminal 2 - Frontend Development:**
   ```bash
   npm start
   ```
   Frontend runs on `http://localhost:3000`

## Usage

### Public Website
1. Navigate to `http://localhost:3000` in your browser
2. Browse projects and view project details
3. Explore gallery with images and videos
4. Contact the company using contact information

### Admin Dashboard
1. Navigate to `http://localhost:3000/#/admin`
2. Use the sidebar to navigate between sections
3. Upload media files using the upload interface
4. Manage sectors and update project information
5. View statistics and media galleries

### Common Tasks

#### Upload Media
1. Go to Admin Panel
2. Select sector from dropdown
3. Click upload area or drag files
4. Select single or multiple files
5. Files are uploaded to Cloudinary and saved to MongoDB

#### Add New Sector
1. Navigate to Admin Dashboard
2. Use the sector management section
3. Fill in sector details (name, area, status, etc.)
4. Upload sector-specific media

#### Update Project Status
1. Access admin panel
2. Select the project sector
3. Update status (Completed/Ongoing)
4. Changes sync with frontend

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Cloudinary Configuration
CLOUD_NAME=dz4k2icvs
API_KEY=your_api_key
API_SECRET=your_api_secret

# MongoDB Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/shineone?retryWrites=true&w=majority

# Server Configuration
PORT=1000
NODE_ENV=development
```

### Cloudinary Setup
1. Create account at [Cloudinary](https://cloudinary.com)
2. Get your Cloud Name, API Key, and API Secret from Dashboard
3. Add credentials to `.env` file
4. Platform automatically creates `ShineOne` folder for organized storage

### MongoDB Setup
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get connection string
4. Update `MONGO_URI` in `.env`

## API Documentation

### Core Endpoints

#### Health Check
- **GET** `/ping`
- Returns: `"working"`

#### Upload Single File
- **POST** `/upload`
- Body: `FormData` with `file` and optional `folder`
- Returns: 
  ```json
  {
    "success": true,
    "url": "https://cloudinary-url",
    "public_id": "ShineOne/folder/filename",
    "resource_type": "image|video"
  }
  ```

#### Upload Multiple Files
- **POST** `/upload-multiple`
- Body: `FormData` with `files[]` array and optional `folder`
- Returns:
  ```json
  {
    "success": true,
    "files": [
      {
        "url": "https://cloudinary-url",
        "public_id": "ShineOne/folder/filename",
        "resource_type": "image|video"
      }
    ]
  }
  ```

#### Get Media by Sector
- **GET** `/media/:folder`
- Parameters: `folder` - sector name (e.g., "sec 42")
- Returns:
  ```json
  {
    "success": true,
    "resources": [
      {
        "url": "https://url",
        "public_id": "ShineOne/sector/filename",
        "type": "image|video",
        "source": "cloud"
      }
    ]
  }
  ```

#### Delete Media
- **DELETE** `/delete/:public_id`
- Parameters: `public_id` - Cloudinary public ID
- Returns: Cloudinary deletion confirmation

### Database Schema

#### Sector Schema
```javascript
{
  name: String,              // e.g., "sec 42"
  displayName: String,       // e.g., "Sector 42"
  status: String,            // "completed" | "ongoing"
  area: String,              // Property area
  progress: Number,          // Completion percentage (0-100)
  eta: String,               // Estimated completion date
  stage: String,             // Construction stage
  description: String,       // Detailed description
  subtitle: String,          // Short subtitle
  media: [MediaSchema],      // Associated images/videos
  isFeatured: Boolean,       // Featured project flag
  isNew: Boolean             // New project flag
}
```

#### Media Schema
```javascript
{
  url: String,               // Asset URL
  public_id: String,         // Cloudinary ID
  source: String,            // "cloud" | "local"
  type: String               // "image" | "video"
}
```

## Dependencies

### Production Dependencies
- **react** (19.2.0) - UI library
- **react-dom** (19.2.0) - React DOM rendering
- **react-router-dom** (7.13.1) - Routing
- **express** (5.2.1) - Web server
- **mongoose** (8.23.0) - Database ODM
- **cloudinary** (2.9.0) - Media management
- **multer** (2.1.1) - File upload handling
- **cors** (2.8.6) - CORS middleware
- **dotenv** (17.3.1) - Environment management
- **lucide-react** (0.553.0) - Icons
- **web-vitals** (2.1.4) - Performance metrics

### Development Dependencies
- **react-scripts** (5.0.1) - Build tools
- **@testing-library/react** (16.3.0) - Testing
- **@testing-library/jest-dom** (6.9.1) - Testing utilities

## Contributing

### Getting Started
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Commit: `git commit -am 'Add feature: description'`
5. Push: `git push origin feature/your-feature`
6. Submit a Pull Request

### Code Style
- Follow React best practices
- Use functional components with hooks
- Maintain consistent naming conventions
- Add comments for complex logic
- Test components before submission

### Reporting Issues
- Check existing issues first
- Provide detailed description
- Include steps to reproduce
- Add screenshots if relevant
- Mention your environment (OS, Node version, etc.)

## Deployment

### Deploy to Render (Current Setup)
The project is configured for deployment on Render.

**Steps:**
1. Push to GitHub
2. Connect repository to Render
3. Set environment variables in Render dashboard
4. Deploy - the platform will run `npm start`

### Deploy to Heroku
1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set env vars: `heroku config:set CLOUD_NAME=...`
5. Deploy: `git push heroku main`

### Deploy to Vercel (Frontend Only)
1. Push to GitHub
2. Import project in Vercel dashboard
3. Set environment variables
4. Deploy

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Update API base URLs
- [ ] Configure CORS for production domain
- [ ] Enable HTTPS
- [ ] Set up monitoring/logging
- [ ] Configure backups for MongoDB
- [ ] Test all functionality
- [ ] Optimize images and assets

## Troubleshooting

### Common Issues

#### MongoDB Connection Error
```
Error: MongoDB Error: [connection error message]
```
**Solution:**
- Verify `MONGO_URI` in `.env`
- Check MongoDB cluster is active
- Ensure IP whitelist includes your server
- Verify connection string format

#### Cloudinary Upload Fails
```
Error: Failed to upload to Cloudinary
```
**Solution:**
- Verify `CLOUD_NAME`, `API_KEY`, `API_SECRET` in `.env`
- Check Cloudinary account is active
- Ensure file size is under limits
- Check network connectivity

#### CORS Errors
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
- Verify CORS is enabled in server.js
- Check origin configuration
- Ensure frontend and backend URLs are correct
- Clear browser cache

#### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::1000
```
**Solution:**
```bash
# Kill process using port 1000
lsof -ti:1000 | xargs kill -9
# Or change PORT in .env
```

#### Node Modules Issues
```
Error: Cannot find module 'express'
```
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Performance Optimization

1. **Enable Compression**
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

2. **Image Optimization**
   - Use Cloudinary transformations
   - Specify width/height in URLs
   - Use responsive images

3. **Database Indexing**
   - Create indexes on frequently queried fields
   - Monitor query performance

4. **Frontend Optimization**
   - Code splitting with React.lazy()
   - Lazy load images
   - Minimize bundle size

## Security

### Security Best Practices

1. **Environment Variables**
   - Never commit `.env` to repository
   - Use `.env.example` for template
   - Rotate credentials regularly
   - Use strong API keys

2. **Authentication**
   - Implement admin authentication
   - Add password hashing (bcrypt recommended)
   - Implement rate limiting
   - Use secure session management

3. **API Security**
   - Validate and sanitize inputs
   - Implement request size limits
   - Add request rate limiting
   - Use HTTPS in production

4. **Data Protection**
   - Enable MongoDB encryption at rest
   - Use encrypted connections (SSL/TLS)
   - Regular backups
   - Implement audit logging

5. **File Upload Security**
   - Validate file types
   - Limit file sizes
   - Scan for malware
   - Store files securely

### Recommended Security Enhancements

```javascript
// Add rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Add helmet for security headers
const helmet = require('helmet');
app.use(helmet());

// Add input validation
const { body, validationResult } = require('express-validator');
```

## License

ISC License - See LICENSE file for details

## Contact & Support

- **GitHub Issues**: Report bugs and request features
- **Email**: Contact via email provided in admin panel
- **Phone**: Use contact information on website
- **WhatsApp**: Quick support via WhatsApp

## Project Status

- **Version**: 0.1.0
- **Status**: Active Development
- **Last Updated**: 2024-2025

## Acknowledgments

- Built with Create React App
- Hosted on Render
- Media storage powered by Cloudinary
- Database by MongoDB Atlas
- Icons from Lucide React

---

**For more information, visit:** https://github.com/Shine145-Git/ShineOneEstate-new
