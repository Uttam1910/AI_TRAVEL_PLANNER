require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Additional packages for image processing integration
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const upload = multer();

// Initialize Google Generative AI
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is missing in the environment.");
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

// Revised prompt template with explicit instructions
const createPrompt = (params) => {
  // Ensure tripType is a comma-separated string if it comes as an array
  const tripTypeStr = Array.isArray(params.tripType)
    ? params.tripType.join(", ")
    : params.tripType;

  return `Generate a detailed Travel Plan with the following parameters:
Location: ${params.location}
Start Date: ${params.date}
Trip Type(s): ${tripTypeStr}
Duration: ${params.duration} days
Budget: ${params.budget}
Travelers: ${params.travelCompanion}
Interests: ${params.interests.join(", ")}
Preferred Activities: ${params.activities.join(", ")}
Dietary Preferences: ${params.dietaryPreferences}
Transportation: ${params.transportation}
Accommodation Type: ${params.accommodationType}
Special Requirements: ${params.specialRequirements}

Include:
- Multiple hotel options with detailed information (including price estimates, ratings, and addresses)
- A daily itinerary that for each day includes:
    - A title or theme for the day
    - A plan array with each activity containing: activity name, detailed description, recommended time allocation, cost, and duration
- Transportation options between locations with cost and estimated durations
- Dining suggestions matching dietary preferences (including estimated costs)
- If the trip type includes Culinary, provide top local dining recommendations and food tours.
- If the trip type includes Festival & Events, include local festival schedules and events information.
- If the trip type includes Nature Retreat, provide options for eco-friendly accommodations and nature reserve visits.
- A budget breakdown with estimated costs for accommodation, transportation, food, and activities
- Additional safety tips and local customs

Format the response in JSON exactly using this structure:
{
  "tripId": "generated-id-here",
  "tripDetails": { 
      "location": "string",
      "startDate": "string",
      "tripType": "string",
      "duration": "number",
      "budget": "string",
      "travelCompanion": "string",
      "interests": [ "string" ],
      "activities": [ "string" ],
      "dietaryPreferences": "string",
      "transportation": "string",
      "accommodationType": "string",
      "specialRequirements": "string"
  },
  "hotelOptions": [ /* accommodation options */ ],
  "itinerary": { /* daily plans */ },
  "transportationOptions": [ /* between locations */ ],
  "diningSuggestions": [ /* meal recommendations */ ],
  "budgetEstimate": { /* cost breakdown */ },
  "additionalTips": [ /* safety, customs, etc. */ ]
}`;
};


async function run(prompt) {
  try {
    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [{ text: "Generate Travel Plan for..." }],
        },
        {
          role: "model",
          parts: [{ text: "Okay, here's a detailed travel plan..." }],
        },
      ],
    });
    const result = await chatSession.sendMessage(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error generating AI response:", error);
    throw error;
  }
}


// Initialize Express server
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// POST route to generate a travel plan
app.post("/plans", async (req, res) => {
  try {
    const {
      location,
      date,
      tripType,
      duration,
      budget,
      travelCompanion,
      interests = [],
      activities = [],
      dietaryPreferences = "None",
      transportation = "Mixed",
      accommodationType = "Hotel",
      specialRequirements = "None",
    } = req.body;

    // Validate required fields
    if (!location || !date || !duration) {
      return res.status(400).json({
        error: "Missing required fields: location, date, and duration are required.",
      });
    }

    const tripId = uuidv4();
    const prompt = createPrompt({
      location,
      date,
      tripType,
      duration,
      budget,
      travelCompanion,
      interests,
      activities,
      dietaryPreferences,
      transportation,
      accommodationType,
      specialRequirements,
    });

    let responseText = await run(prompt);
    // Clean response text (remove markdown formatting if present)
    responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

    // Log raw AI response for debugging
    console.log("Raw AI response:", responseText);

    try {
      const responseData = JSON.parse(responseText);
      // Assign the generated tripId to the response
      responseData.tripId = tripId;

      // Log each output field for verification
      console.log("Parsed AI Generated Travel Plan Output:");
      Object.entries(responseData).forEach(([key, value]) => {
        console.log(`${key}:`, value);
      });

      res.json(responseData);
    } catch (jsonError) {
      console.error("JSON Parsing Error:", jsonError);
      res.status(500).json({
        error: "AI Response Formatting Error",
        rawResponse: responseText,
      });
    }
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Failed to generate travel plan" });
  }
});


// ==============================
// NEW: Image Recognition Route
// ==============================

// This route will receive an image upload from the client, then forward it to your Flask image processing service.
// Make sure your Flask service is running (e.g., on http://localhost:5001/analyze)
app.post('/api/landmark', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  try {
    const formData = new FormData();
    formData.append('image', req.file.buffer, {
      filename: req.file.originalname,
    });


    const response = await axios.post('http://127.0.0.1:5001/analyze', formData, {
      headers: formData.getHeaders(),
      timeout: 20000, // 20 seconds timeout
    });
    

    res.json(response.data);
  } catch (error) {
    // Log detailed error information
    if (error.response) {
      console.error('Flask service responded with error:', error.response.data);
    } else {
      console.error('Error forwarding image:', error.message);
    }
    res.status(500).json({ error: 'Error processing image' });
  }
});



// Stub routes for future enhancements
app.get("/plans/:id", (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

app.post("/plans/save", (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

// Fallback for undefined endpoints
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


