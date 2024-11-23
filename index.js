// index.js
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

// Enable CORS and static file serving
app.use(cors({ optionsSuccessStatus: 200 }));
app.use(express.static("public"));

// Root endpoint serves the HTML file
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// API endpoint to handle date requests
app.get("/api/:date?", (req, res) => {
  let dateInput = req.params.date;
  let date;

  // If no date provided, use current time
  if (!dateInput) {
    date = new Date();
  } else {
    // Check if the input is a Unix timestamp (all digits)
    if (/^\d+$/.test(dateInput)) {
      date = new Date(parseInt(dateInput));
    } else {
      date = new Date(dateInput);
    }
  }

  // Check if date is valid
  if (date.toString() === "Invalid Date") {
    return res.json({ error: "Invalid Date" });
  }

  // Return the formatted response
  res.json({
    unix: date.getTime(),
    utc: date.toUTCString(),
  });
});

// Only start the server if this file is run directly
let server;
if (require.main === module) {
  server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

// Export both app and server for testing
module.exports = { app, server };
