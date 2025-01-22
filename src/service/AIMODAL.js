const express = require('express');
const cors = require('cors')

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const apiKey = "AIzaSyAnJgbu6tpLoHRCaq6_yhlJAL_mDtH-MLg";
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

async function run(inp) {
  const chatSession = model.startChat({
    generationConfig,
    history: [
      {
        role: "user",
        parts: [
          {text: "Generate Travel Plan for Location: Las Vegas, of date 2 april of trip type romantic  for 3 Days with a Cheap budget for Couple. Give me a Hotels options list with HotelName, Hotel address, Price, hotel image url, geo coordinates, rating, descriptions and suggest Itinerary with placeName, Place Details, Place image URL, Geo Coordinates, ticket Pricing, rating. Time travel each of the location for 3 days with each day plan with best time to visit in JSON format.  "},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "Okay, here's a romantic, budget-friendly 3-day Las Vegas itinerary for a couple, along with hotel options and details, all formatted in JSON as you requested.\n\n```json\n{\n  \"tripDetails\": {\n    \"location\": \"Las Vegas, Nevada\",\n    \"startDate\": \"2024-04-02\",\n    \"tripType\": \"Romantic\",\n    \"duration\": \"3 Days\",\n    \"budget\": \"Cheap\",\n    \"travelers\": \"Couple\"\n  },\n  \"hotelOptions\": [\n    {\n      \"hotelName\": \"Circus Circus Hotel & Casino\",\n      \"hotelAddress\": \"2880 S Las Vegas Blvd, Las Vegas, NV 89109\",\n      \"price\": \"$40-80/night\",\n      \"hotelImageURL\": \"https://www.circuscircus.com/wp-content/uploads/2023/07/circus-circus-hotel-las-vegas-exterior.jpg\",\n       \"geoCoordinates\": {\n        \"latitude\": 36.1434,\n        \"longitude\": -115.1686\n      },\n      \"rating\": 3.5,\n      \"description\": \"A classic Vegas experience with affordable rooms, a circus theme, and a variety of dining options. It's a bit further from the center of the Strip but has a monorail station.\"\n    },\n     {\n       \"hotelName\": \"Excalibur Hotel & Casino\",\n        \"hotelAddress\": \"3850 S Las Vegas Blvd, Las Vegas, NV 89109\",\n       \"price\": \"$50-90/night\",\n      \"hotelImageURL\": \"https://www.vegas.com/images/content/700x500/hotel-excalibur.jpg\",\n        \"geoCoordinates\": {\n           \"latitude\": 36.0994,\n           \"longitude\": -115.1739\n      },\n       \"rating\": 4.0,\n      \"description\": \"A medieval-themed hotel at the south end of the Strip, offering budget-friendly rooms and good entertainment options. Ideal for a fun atmosphere.\"\n    },\n    {\n      \"hotelName\": \"Strat Hotel, Casino & Skypod\",\n       \"hotelAddress\": \"2000 S Las Vegas Blvd, Las Vegas, NV 89104\",\n      \"price\": \"$60-100/night\",\n      \"hotelImageURL\": \"https://media.cntraveler.com/photos/5d231998c481480009655924/16:9/w_2560%2Cc_limit/STRAT-Hotel-Night.jpg\",\n       \"geoCoordinates\": {\n        \"latitude\": 36.1516,\n        \"longitude\": -115.1562\n      },\n      \"rating\": 4.1,\n      \"description\": \"Located at the northern end of the Strip, offering great city views from the Skypod. Rooms are often affordable, and the views make it feel special.\"\n    }\n  ],\n    \"itinerary\": {\n    \"day1\": {\n      \"theme\": \"Exploring the Strip & Fountain Magic\",\n      \"bestTimeToVisit\": \"Late Afternoon/Evening\",\n       \"plan\": [\n          {\n            \"placeName\": \"The Bellagio Conservatory & Botanical Garden\",\n            \"placeDetails\": \"A stunning indoor garden that changes with the seasons. It's free to enter and offers a peaceful romantic start to your trip.\",\n             \"placeImageURL\": \"https://www.bellagio.com/content/dam/MGM/bellagio/amenities/conservatory/bellagio-conservatory-2023-spring-2760x1540.jpg\",\n            \"geoCoordinates\": {\n              \"latitude\": 36.1125,\n              \"longitude\": -115.1742\n            },\n            \"ticketPricing\": \"Free\",\n            \"rating\": 4.7,\n             \"travelTime\": \"Hotel to location: 10-20 minutes, depending on hotel\"\n          },\n         {\n            \"placeName\": \"Bellagio Fountains\",\n            \"placeDetails\": \"Watch a breathtaking free water show with music. Performances occur every 30 minutes in the afternoon and every 15 minutes in the evening.\",\n            \"placeImageURL\": \"https://www.bellagio.com/content/dam/MGM/bellagio/amenities/fountains/bellagio-fountains-2023-1140x640.jpg\",\n             \"geoCoordinates\": {\n              \"latitude\": 36.1127,\n              \"longitude\": -115.1743\n            },\n            \"ticketPricing\": \"Free\",\n            \"rating\": 4.8,\n             \"travelTime\": \"Adjacent to Botanical Garden\"\n          },\n          {\n            \"placeName\": \"Walk the Las Vegas Strip\",\n            \"placeDetails\": \"Enjoy the vibrant atmosphere of the Strip. window shopping, people watching, and taking in the themed hotels. Stroll hand in hand for a romantic evening.\",\n            \"placeImageURL\": \"https://www.planetware.com/wpimages/2023/05/las-vegas-usa-best-things-to-do-walking-the-strip.jpg\",\n             \"geoCoordinates\": {\n              \"latitude\": 36.1162,\n              \"longitude\": -115.1727\n            },\n            \"ticketPricing\": \"Free\",\n            \"rating\": 4.5,\n             \"travelTime\": \"Walking distance from Bellagio Fountains\"\n           }\n      ]\n    },\n     \"day2\": {\n      \"theme\": \"Old Vegas Charm & Scenic Views\",\n         \"bestTimeToVisit\": \"Morning/Afternoon\",\n      \"plan\": [\n         {\n            \"placeName\": \"Fremont Street Experience\",\n            \"placeDetails\": \"Explore the pedestrian mall with its dazzling light show on the Viva Vision canopy. It's a unique Las Vegas experience.\",\n             \"placeImageURL\":\"https://assets.simpleviewinc.com/simpleview/image/upload/c_fit,w_1024,h_682/crm/lasvegas/Fremont-St_600x400_01-1c6b83a84f09ebf_1c6b8444-5056-b3a8-4c4987591b31c210.jpg\",\n             \"geoCoordinates\": {\n              \"latitude\": 36.1702,\n              \"longitude\": -115.1401\n            },\n             \"ticketPricing\": \"Free\",\n            \"rating\": 4.3,\n             \"travelTime\":\"Hotel to Fremont Street: 20-30 mins by car or rideshare\"\n         },\n          {\n            \"placeName\": \"The STRAT Skypod\",\n             \"placeDetails\": \"Enjoy breathtaking panoramic views of the city and surrounding desert. It's especially romantic at sunset.\",\n            \"placeImageURL\": \"https://media.cntraveler.com/photos/5d231998c481480009655924/16:9/w_2560%2Cc_limit/STRAT-Hotel-Night.jpg\",\n            \"geoCoordinates\": {\n               \"latitude\": 36.1516,\n                \"longitude\": -115.1562\n            },\n            \"ticketPricing\": \"$25-$30 per person\",\n             \"rating\": 4.4,\n             \"travelTime\": \"From Fremont St: 15 mins car/rideshare. May be walkable from Strat Hotel\"\n          },\n         {\n            \"placeName\": \"High Roller Observation Wheel at LINQ\",\n             \"placeDetails\": \"Take a spin on the giant Ferris wheel for stunning views of the Las Vegas Valley. Consider a daytime ride for different perspectives.\",\n             \"placeImageURL\": \"https://www.caesars.com/content/dam/linq/amenities/high-roller/the-high-roller-at-night-1140x640.jpg.cqimg.1140.640.jpeg\",\n             \"geoCoordinates\": {\n              \"latitude\": 36.1172,\n              \"longitude\": -115.1698\n            },\n             \"ticketPricing\": \"$30-$40 per person\",\n            \"rating\": 4.6,\n             \"travelTime\": \"From Skypod: 15-20 mins car/rideshare\"\n          }\n      ]\n    },\n    \"day3\": {\n      \"theme\": \"Relaxation & Departure\",\n        \"bestTimeToVisit\": \"Morning/Afternoon\",\n       \"plan\": [\n        {\n            \"placeName\": \"Pool Day (at your hotel or a public pool)\",\n           \"placeDetails\": \"Enjoy some downtime relaxing by the pool. Many hotels allow non-guests with a small fee, or relax at your hotel pool, If included\",\n            \"placeImageURL\": \"https://www.travelandleisure.com/thmb/k3x91W-Z9QY6oQdJv40L48V1-k8=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/pool-at-mgm-grand-las-vegas-POOLS0623-9106209d1528468b8b0d37c7b864bf0d.jpg\",\n           \"geoCoordinates\": {\n                \"latitude\": \"varies\",\n               \"longitude\": \"varies\"\n            },\n           \"ticketPricing\": \"varies, hotel pool may be free\",\n            \"rating\": 4.2,\n             \"travelTime\": \"Located at your hotel\"\n\n         },\n        {\n          \"placeName\": \"Shopping for Souvenirs (Optional)\",\n          \"placeDetails\":\"If you're interested, stroll through souvenir shops on the strip or at the airport for affordable gifts and reminders of your trip.\",\n          \"placeImageURL\":\"https://media.cntraveler.com/photos/5f612df561419e0a925618f1/16:9/w_2560%2Cc_limit/LasVegas-GettyImages-157641110.jpg\",\n          \"geoCoordinates\":{\n            \"latitude\":\"Varies\",\n            \"longitude\":\"Varies\"\n          },\n           \"ticketPricing\":\"Free to browse\",\n            \"rating\":3.8,\n             \"travelTime\":\"Walking distance from your hotel or near airport\"\n        }\n      ]\n    }\n  }\n}\n```\n**Notes for Your Trip:**\n\n*   **Transportation:** Walking is great for the Strip, but consider ride-sharing (Uber/Lyft) or the monorail for longer distances to save time and energy.\n*   **Food:** To save on food costs, look for affordable options outside the main hotels like chain restaurants or food court at the malls.\n*   **Hydration:** Las Vegas is dry, especially in April, so be sure to stay hydrated.\n*   **Flexibility:** This itinerary is a suggestion. Feel free to customize it to your preferences and energy levels.\n*   **Book in Advance:** Try to book hotels and any paid attractions in advance, especially if traveling during a busy season or event to get better rates.\n*   **Free Entertainment:** Las Vegas is full of free entertainment. Be sure to take advantage of the many free sights, sounds and shows.\n*   **Check for Deals:** Search for deals and discounts from your hotel and other service providers.\n\nHave a romantic and memorable trip to Las Vegas!\n"},
        ],
      },
    ],
  });

  const result = await chatSession.sendMessage(inp);
  console.log(result.response.text());  //printing
  return result.response.text()
}



const app = express();
app.use(cors())
const PORT = 3000;

app.use(express.json());

// POST route
app.post('/plans', (req, res) => {
  const { location, date, tripType, duration, budget } = req.body;
  async function wait (){
  prompt = `Generate Travel Plan for Location: ${location}, of date ${date} for ${tripType} trip for ${duration} with a ${budget} budget. Give me a list of hotels and an itinerary in JSON format. Give me a Hotels options list with HotelName, Hotel address, Price, hotel image url, geo coordinates, rating, descriptions and suggest Itinerary with placeName, Place Details, Place image URL, Geo Coordinates, ticket Pricing, rating. Time travel each of the location for difference in ${date} days with proper planand with each day plan with best time to visit in JSON format.`
  responced = await run(prompt)
  res.send(JSON.parse(responced));
  }
  wait();
});

// Catch-all for unmatched routes
app.use((req, res) => {
    res.status(404).send('Route not found');
});

app.listen(PORT, (err) => {
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});
