from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import os

app = Flask(__name__)
CORS(app)

# Load the AI detector model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "ai_detector_model")
tokenizer = AutoTokenizer.from_pretrained(os.path.join(os.path.dirname(__file__), "ai_detector_tokenizer"))
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
model.eval()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"})

@app.route('/detect-ai', methods=['POST'])
def detect_ai():
    try:
        # Get text from request
        data = request.json
        text = data.get('text', '')
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
            
        # Tokenize and predict
        inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
        with torch.no_grad():
            outputs = model(**inputs)
            probabilities = torch.nn.functional.softmax(outputs.logits, dim=-1)
            
        # Get AI probability (assuming binary classification with AI=1, Human=0)
        ai_probability = probabilities[0][1].item()
        human_probability = probabilities[0][0].item()
        
        return jsonify({
            "ai_probability": round(ai_probability * 100, 2),
            "human_probability": round(human_probability * 100, 2),
            "is_ai_generated": ai_probability > human_probability
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)