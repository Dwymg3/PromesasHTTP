# node-basic-rest-api

## How to create a express app

- mkdir [app-name]
- cd [app-name]
- npm init -y
- npm install express
- create an index.js file

In an Express.js application, a common middleware stack typically consists of multiple middleware functions that process incoming HTTP requests and outgoing responses. Here's an example of a 5-layer middleware stack in an Express.js application:

1 - Built-in Middleware (Express.json, Express.urlencoded, Express.static, etc.):

Express comes with built-in middleware functions that handle common tasks. For example, express.json() parses incoming JSON data, express.urlencoded() parses incoming form data, and express.static() serves static files. These built-in middlewares are often used as the first layer in the stack.

const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

2 - Custom Application-Level Middleware:

This layer includes custom middleware functions that are specific to your application. These can perform tasks such as authentication, session management, and request validation.

app.use(customAuthMiddleware);
app.use(sessionMiddleware);
app.use(requestValidationMiddleware);

3 - Route-Level Middleware:

Middleware can also be applied to specific routes. This layer includes middleware functions that are executed only for certain routes. For example, you might want to log requests for specific routes.

app.use('/admin', adminMiddleware);
app.use('/api', apiMiddleware);

4 - Error Handling Middleware:

This middleware layer is responsible for handling errors that occur during request processing. It typically comes after other middleware to catch and respond to errors that might occur in the application.

app.use((err, req, res, next) => {
// Handle errors and send an appropriate response
});

5 - Response Middleware:

After the core request processing is complete, response middleware functions can be used to modify the response. For example, you might set response headers or apply post-processing to the response data.

app.use(responseHeadersMiddleware);
app.use(responseFormattingMiddleware);

Notes: The actual middleware layers and their order may vary depending on the specific requirements of your application. Keep in mind that middleware in Express is executed in the order they are added using app.use(), so the order matters.
