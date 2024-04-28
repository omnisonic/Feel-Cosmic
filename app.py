import os
import requests
from flask import Flask, request, render_template, jsonify, send_file, Response, session
from datetime import datetime, timedelta
from openai import OpenAI
import io
import mimetypes
from flask import url_for
import uuid
from flask import abort



image_url_token_map = {}

app = Flask(__name__)
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True
app.secret_key = 'your_secret_key_here'

IMAGE_GENERATION_RATE_LIMIT = 1  # 1 image generation per day
IMAGE_GENERATION_RATE_LIMIT_WINDOW = timedelta(days=1)

image_generation_tokens = {}

client = OpenAI()  # Initialized with appropriate configuration



@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        ip_address = request.remote_addr
        now = datetime.now()
        token = ip_address + "_image_generation_token"

        if token in image_generation_tokens:
            last_request_time, request_count = image_generation_tokens[token]
            if now - last_request_time < IMAGE_GENERATION_RATE_LIMIT_WINDOW:
                if request_count >= IMAGE_GENERATION_RATE_LIMIT:
                    return jsonify({"error": "Image generation rate limit exceeded. Please try again tomorrow."}), 429
                image_generation_tokens[token] = (now, request_count + 1)
            else:
                image_generation_tokens[token] = (now, 1)
        else:
            image_generation_tokens[token] = (now, 1)

        # Generate image here
        prompt = request.form.get('prompt', '')
        full_prompt = f"Deep Cosmos of the Universe\n\n{prompt}"
        response = client.images.generate(
            model="dall-e-2",
            prompt=full_prompt,
            size="1024x1024",
            quality="standard"
        )

        if response.data:
            image_url = response.data[0].url
            return proxy_image(image_url)
        else:
            return "Failed to generate the image. Please try again."
    return render_template('index.html')



@app.route('/proxy-image')
def proxy_image(image_url):
    token = uuid.uuid4().hex
    image_url_token_map[token] = image_url
    file_name = os.path.basename(image_url)
    session['filename'] = file_name
    return jsonify({'imageUrl': url_for('proxy_image_file', token=token, filename=file_name)})

@app.route('/proxy-image-file/<token>/<filename>')
def proxy_image_file(token, filename):
    if not filename:
        abort(404)
    image_url = image_url_token_map.pop(token)
    if image_url is None:
        abort(404)
    response = requests.get(image_url, stream=True)
    response.raise_for_status()

    mime_type, _ = mimetypes.guess_type(filename)
    if mime_type is None:
        mime_type = 'application/octet-stream'

    # Set caching headers
    cache_control = 'public, max-age=31536000'  # Cache for 1 year

    rv = send_file(
        io.BytesIO(response.content),
        mimetype=mime_type,
        as_attachment=True,
        download_name=filename
    )
    rv.headers['Cache-Control'] = cache_control
    return rv







if __name__ == "__main__":
    app.run(debug=True)
