require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Additional packages for image processing integration
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
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

// Revised prompt template for generating travel plans
const createPrompt = (params) => {
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

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// -------------------------
// Travel Plan Generation Route
// -------------------------
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
    responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

    console.log("Raw AI response:", responseText);

    try {
      const responseData = JSON.parse(responseText);
      responseData.tripId = tripId;

      console.log("Parsed AI Generated Travel Plan Output:");
      Object.entries(responseData).forEach(([key, value]) => {
        console.log(`${key}:`, value);
      });

      res.json(responseData);
    } catch (jsonError) {
      console.error("JSON Parsing Error:", jsonError);
      // Provide a graceful fallback so the client can still receive a usable trip object
      const fallback = {
        tripId,
        tripDetails: {
          location: location || "",
          startDate: date || "",
          tripType: Array.isArray(tripType) ? tripType : (tripType ? [tripType] : []),
          duration: Number(duration) || 0,
          budget: budget || "",
          travelCompanion: travelCompanion || "",
          interests: Array.isArray(interests) ? interests : (interests ? [interests] : []),
          activities: Array.isArray(activities) ? activities : (activities ? [activities] : []),
          dietaryPreferences: dietaryPreferences || "None",
          transportation: transportation || "Mixed",
          accommodationType: accommodationType || "Hotel",
          specialRequirements: specialRequirements || "",
        },
        hotelOptions: [],
        itinerary: [],
        transportationOptions: [],
        diningSuggestions: [],
        budgetEstimate: {},
        additionalTips: [],
        // include rawResponse for debugging and to show the AI output to the user if needed
        rawResponse: responseText,
      };

      console.warn("Returning fallback plan due to parse error, sending fallback object to client.");
      res.json(fallback);
    }
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Failed to generate travel plan" });
  }
});

// -------------------------
// AI Recommendations Route
// -------------------------
app.post("/api/ai-recommendations", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "No prompt provided" });
    }
    let responseText = await run(prompt);
    responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

    // Attempt to parse as JSON; if that fails, split by lines.
    let recommendations;
    try {
      recommendations = JSON.parse(responseText);
      // If the parsed object has a 'recommendations' field, use it.
      if (recommendations.recommendations) {
        recommendations = recommendations.recommendations;
      }
    } catch (err) {
      recommendations = responseText.split("\n").filter(line => line.trim() !== "");
    }
    
    res.json({ recommendations });
  } catch (error) {
    console.error("Error in AI recommendations endpoint:", error);
    res.status(500).json({ error: "Failed to generate AI recommendations" });
  }
});

// -------------------------
// Image Recognition Route
// -------------------------
app.post("/api/landmark", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image file provided" });
  }

  try {
    const formData = new FormData();
    formData.append("image", req.file.buffer, {
      filename: req.file.originalname,
    });

    const response = await axios.post("http://127.0.0.1:5001/analyze", formData, {
      headers: formData.getHeaders(),
      timeout: 20000,
    });

    res.json(response.data);
  } catch (error) {
    if (error.response) {
      console.error("Flask service responded with error:", error.response.data);
    } else {
      console.error("Error forwarding image:", error.message);
    }
    res.status(500).json({ error: "Error processing image" });
  }
});

// -------------------------
// Landmarks Data Endpoint for Interactive Maps
// -------------------------
app.get("/api/landmarks", (req, res) => {
  const landmarks = [
    { id: 1, name: "Golden Gate Bridge", position: { lat: 37.8199, lng: -122.4783 }, description: "A famous suspension bridge in San Francisco." },
    { id: 2, name: "Alcatraz Island", position: { lat: 37.8267, lng: -122.4230 }, description: "Historic island prison turned museum." },
    { id: 3, name: "Fisherman's Wharf", position: { lat: 37.8080, lng: -122.4177 }, description: "Popular tourist area with seafood and shops." },
  ];
  res.json(landmarks);
});

// -------------------------
// Hotel Booking Endpoints
// -------------------------
const hotelsRoutes = require("./routes/hotelsRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
app.use("/api", hotelsRoutes);
app.use("/api", bookingRoutes);

// -------------------------
// Dummy Payment Endpoint
// -------------------------
const paymentRoutes = require("./routes/paymentRoutes");
app.use("/api/payment", paymentRoutes);

// Stub routes for future enhancements
app.get("/plans/:id", (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});
app.post("/plans/save", (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});











// Add near other routes but before fallback handler
app.post('/api/feedback', async (req, res) => {
  try {
    const { tripId, rating, userId, comment = '', emoji = '😐', tags = [] } = req.body;

    // Validation
    if (!tripId || !userId || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Save to Firestore
    const docRef = await admin.firestore().collection('feedback').add({
      tripId,
      userId,
      rating: Number(rating),
      comment: comment.substring(0, 500),
      emoji,
      tags: tags.slice(0, 5),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({
      id: docRef.id,
      success: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Feedback Error:', error);
    res.status(500).json({ 
      error: 'Failed to save feedback',
      code: 'FEEDBACK_SAVE_ERROR'
    });
  }
});
















// Fallback for undefined endpoints
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
