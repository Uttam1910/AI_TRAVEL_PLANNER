from flask import Flask, request, jsonify
import os
import logging
import requests
from urllib.parse import quote
from google.cloud import vision
import requests_cache

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)

# Install caching for Wikipedia requests (cache expires in 1 hour)
requests_cache.install_cache('wikipedia_cache', backend='sqlite', expire_after=3600)

# Set your Google Cloud Vision credentials from environment variable if available
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "service-account.json")

@app.route('/analyze', methods=['POST'])
def analyze_image():
    # Verify that an image file is part of the request
    if 'image' not in request.files:
        logging.error("No image file provided in request")
        return jsonify({"error": "No image file provided"}), 400

    image_file = request.files['image']
    content = image_file.read()

    try:
        # Initialize the Google Cloud Vision client and detect landmarks
        client = vision.ImageAnnotatorClient()
        image = vision.Image(content=content)
        response = client.landmark_detection(image=image)
        landmarks = response.landmark_annotations
    except Exception as e:
        logging.exception("Error processing image")
        return jsonify({"error": f"Error processing image: {str(e)}"}), 500

    if not landmarks:
        logging.info("No landmarks detected")
        return jsonify({"error": "No landmarks detected"}), 404

    # Use the first detected landmark for further processing
    landmark = landmarks[0]
    landmark_name = landmark.description
    logging.info(f"Detected landmark: {landmark_name}")

    # Extract location details if available
    locations = [
        {"latitude": loc.lat_lng.latitude, "longitude": loc.lat_lng.longitude}
        for loc in landmark.locations if loc.lat_lng
    ]

    # URL-encode the landmark name for the Wikipedia API call
    landmark_name_encoded = quote(landmark_name)
    wiki_api_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{landmark_name_encoded}"
    
    try:
        wiki_response = requests.get(wiki_api_url, timeout=5)
        if wiki_response.status_code == 200:
            wiki_data = wiki_response.json()
            wiki_extract = wiki_data.get("extract", "No description available")
            wiki_page = wiki_data.get("content_urls", {}).get("desktop", {}).get("page", "")
        else:
            logging.warning(f"Wikipedia API returned status {wiki_response.status_code} for {landmark_name}")
            wiki_extract = "No description available"
            wiki_page = ""
    except Exception as e:
        logging.exception("Error querying Wikipedia")
        wiki_extract = "No description available"
        wiki_page = ""
    
    result = {
        "landmark": landmark_name,
        "locations": locations,
        "wikipedia": {
            "summary": wiki_extract,
            "page": wiki_page
        }
    }
    
    return jsonify(result)

if __name__ == '__main__':
    # Bind to all interfaces for easier testing; disable debug in production
    app.run(debug=True, host='0.0.0.0', port=5001)
