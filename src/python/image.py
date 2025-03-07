from flask import Flask, request, jsonify
import os
from google.cloud import vision
import requests
from urllib.parse import quote

app = Flask(__name__)

# Set your Google Cloud Vision credentials file path
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "service-account.json"

@app.route('/analyze', methods=['POST'])
def analyze_image():
    # Check for image file in the request
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    image_file = request.files['image']
    content = image_file.read()

    try:
        # Initialize the Google Cloud Vision client and process the image
        client = vision.ImageAnnotatorClient()
        image = vision.Image(content=content)
        response = client.landmark_detection(image=image)
        landmarks = response.landmark_annotations
    except Exception as e:
        return jsonify({"error": f"Error processing image: {str(e)}"}), 500

    if not landmarks:
        return jsonify({"error": "No landmarks detected"}), 404

    # Use the first detected landmark
    landmark = landmarks[0]
    landmark_name = landmark.description

    # Extract locations (latitude and longitude)
    locations = [
        {"latitude": loc.lat_lng.latitude, "longitude": loc.lat_lng.longitude}
        for loc in landmark.locations
    ]

    # URL-encode the landmark name for Wikipedia API
    landmark_name_encoded = quote(landmark_name)
    wiki_api_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{landmark_name_encoded}"
    
    try:
        wiki_response = requests.get(wiki_api_url)
        if wiki_response.status_code == 200:
            wiki_data = wiki_response.json()
            wiki_extract = wiki_data.get("extract", "No description available")
            wiki_page = wiki_data.get("content_urls", {}).get("desktop", {}).get("page", "")
        else:
            wiki_extract = "No description available"
            wiki_page = ""
    except Exception as e:
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
    # Explicitly run on IPv4 and port 5001 for clarity
    app.run(debug=True, host='127.0.0.1', port=5001)
