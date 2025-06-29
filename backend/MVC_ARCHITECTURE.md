# ClarityAI Backend - MVC Architecture

## 🏗️ Architecture Overview

The ClarityAI backend now follows the **Model-View-Controller (MVC)** pattern for better organization, maintainability, and scalability.

### 📁 Directory Structure

```
src/
├── controllers/           # Handle HTTP requests and responses
│   ├── ContentController.ts
│   ├── HealthController.ts
│   └── SummaryController.ts
├── models/               # Data structures and interfaces
│   └── SummaryModel.ts
├── services/             # Business logic
│   ├── ContentExtractionService.ts
│   └── SummarizationService.ts
├── routes/               # API route definitions
│   ├── contentRoutes.ts
│   ├── healthRoutes.ts
│   ├── summaryRoutes.ts
│   └── index.ts
├── middleware/           # Custom middleware
│   └── index.ts
├── utils/                # Helper functions
│   └── TextUtils.ts
├── server.ts            # Main application entry point
└── server-original.ts   # Backup of original monolithic server
```

## 🔄 MVC Components

### **Models** (`/models`)

- Define data structures and interfaces
- Type definitions for requests and responses
- No business logic, just data contracts

### **Views** (Implicit)

- JSON responses sent to clients
- Error responses and success messages
- API documentation

### **Controllers** (`/controllers`)

- Handle HTTP requests and responses
- Input validation
- Call appropriate services
- Return formatted responses

### **Services** (`/services`)

- Core business logic
- AI integration and fallback systems
- Content extraction and processing
- Independent of HTTP layer

### **Routes** (`/routes`)

- Define API endpoints
- Connect URLs to controller methods
- Organize routes by feature

### **Middleware** (`/middleware`)

- CORS handling
- Request logging
- Error handling
- Authentication (future)

### **Utils** (`/utils`)

- Helper functions
- Text processing utilities
- Reusable components

## 🛠️ Key Features

### ✅ **Separation of Concerns**

- Each component has a single responsibility
- Business logic separated from HTTP handling
- Easy to test and maintain

### ✅ **Dependency Injection**

- Services are injected into controllers
- Easy to mock for testing
- Flexible architecture

### ✅ **Error Handling**

- Centralized error handling middleware
- Graceful error responses
- Logging for debugging

### ✅ **Type Safety**

- Full TypeScript support
- Interface definitions for all data
- Compile-time error checking

### ✅ **Scalability**

- Easy to add new features
- Modular structure
- Can be extended with additional services

## 🚀 API Endpoints

### Health Check

- `GET /health` - System health status
- `GET /` - Welcome message

### Content Processing

- `POST /api/summarize` - Generate content summary
- `POST /api/extract` - Extract content from URL

## 🔧 Configuration

### Environment Variables

- `SERVER_PORT` - Server port (default: 3000)
- `GEMINI_API_KEY` - Google Gemini AI API key (optional)
- `NODE_ENV` - Environment (development/production)

### Startup Logging

```
ClarityAI server running at http://localhost:3000
Environment: development
Gemini AI: Enabled/Disabled (using local summarization)
```

## 🧪 Testing

### Unit Testing Structure

```bash
tests/
├── controllers/
├── services/
├── models/
└── utils/
```

### Integration Testing

- API endpoint testing
- Service integration testing
- End-to-end workflow testing

## 📦 Dependencies

### Core

- `express` - Web framework
- `typescript` - Type safety
- `dotenv` - Environment variables

### AI & Content

- `@google/generative-ai` - Gemini AI integration
- `@mozilla/readability` - Content extraction
- `jsdom` - HTML parsing
- `axios` - HTTP requests

### Development

- `ts-node-dev` - Development server
- `nodemon` - Auto-restart

## 🔄 Migration from Monolithic

### What Changed

1. **Single file** → **Modular structure**
2. **Inline functions** → **Service classes**
3. **No types** → **Strong typing**
4. **Mixed concerns** → **Separated responsibilities**

### Backward Compatibility

- ✅ All API endpoints remain the same
- ✅ Same request/response formats
- ✅ Same environment variables
- ✅ Same functionality

### Benefits

- **Maintainability**: Easier to update and debug
- **Testability**: Individual components can be tested
- **Scalability**: Easy to add new features
- **Readability**: Clear code organization
- **Reusability**: Services can be reused

## 🛡️ Best Practices

### Controller Guidelines

- Keep controllers thin
- Only handle HTTP concerns
- Delegate business logic to services
- Always validate input

### Service Guidelines

- Focus on business logic
- Return data, not HTTP responses
- Handle errors gracefully
- Make services testable

### Error Handling

- Use try-catch blocks
- Log errors for debugging
- Return meaningful error messages
- Use appropriate HTTP status codes

## 🚦 Running the Application

```bash
# Development
npm run dev

# Production
npm start

# Type checking
npm run build
```

## 🔍 Debugging

### Request Logging

All requests are logged with timestamp and method:

```
2025-06-29T21:21:34.655Z - POST /api/summarize
```

### Error Logging

Detailed error information in development mode:

```
AI summarization failed, falling back to local: [Error details]
```

### Service Status

Clear indication of which summarization method is being used:

```
Using Gemini AI for summarization
No Gemini API key found, using local summarization
```

This MVC architecture provides a solid foundation for future enhancements while maintaining all existing functionality! 🎯
