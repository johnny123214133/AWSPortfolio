import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.utils import secure_filename

from extract_bids import extract_bids_json

app = Flask(__name__)

port = os.getenv("API_PORT", "8082")

CORS(app, resources={r"/api/*": {"origins": "*"}})


# @app.route('/api/items', methods=['POST'])
# def create_item():
# 	if not request.is_json:
# 		return jsonify({"error": "Request must be JSON"}), 400
	
# 	data = request.get_json()
# 	if "name" not in data or "price" not in data:
# 		return jsonify({"error": "Missing 'name' or 'price'"}), 400

# 	new_item = {
# 		"id": len(items) + 1,
# 		"name": data["name"],
# 		"price": data["price"]
# 	}
# 	items.append(new_item)
# 	return jsonify(new_item), 201


# Configure upload folder and restrictions
# UPLOAD_FOLDER = './uploads'
ALLOWED_EXTENSIONS = {'pdf'}
# app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
# Limit maximum file size to 16MB
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024 
app.config["JSON_SORT_KEYS"] = False
if hasattr(app, "json"):
    app.json.sort_keys = False

# Ensure the upload directory exists
# os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/ocr', methods=['POST'])
def extract_bid_data():
    # Check if the file part is present in the request
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    
    file = request.files['file']
    
    # Check if the user selected an empty file
    if file.filename == '':
        return jsonify({'error': 'No file uploaded'}), 400
    
    # Validate file type and save safely
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)

        # extract file and send jsonified dataframes
        bid_data_json = extract_bids_json(file.read(), filename)
        # print(bid_data_json)

        # file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        # file.save(file_path)
        return jsonify(bid_data_json), 200
    
    return jsonify({'error': 'Invalid file type. Only PDFs are allowed.'}), 400

@app.route('/api', methods=['GET'])
def ping():
    return jsonify({'message': "Hello there!"}), 200

if __name__ == '__main__':
	# Run server in debug mode for auto-reloading during development
	app.run(port=int(port), debug=True)


