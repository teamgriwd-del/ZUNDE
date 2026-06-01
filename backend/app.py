from flask import Flask, jsonify, request
from flask_cors import CORS
import pymysql

app = Flask(__name__)
CORS(app)

# Database connection
def get_db():
    return pymysql.connect(
        host='localhost',
        user='root',
        password='',
        database='zunde',
        cursorclass=pymysql.cursors.DictCursor
    )

# Test route
@app.route('/')
def home():
    return jsonify({"message": "Zunde API is running ✅"})

# --- FEED ANALYZER ---
@app.route('/feed', methods=['GET'])
def get_all_feeds():
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM feed_types")
    feeds = cursor.fetchall()
    db.close()
    return jsonify(feeds)

@app.route('/feed/search', methods=['GET'])
def search_feed():
    query = request.args.get('q', '')
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM feed_types WHERE name LIKE %s", (f'%{query}%',))
    results = cursor.fetchall()
    db.close()
    return jsonify(results)

# --- MARKETPLACE ---
@app.route('/listings', methods=['GET'])
def get_listings():
    db = get_db()
    cursor = db.cursor()
    cursor.execute("""
        SELECT ml.*, u.name as seller_name, u.phone, u.location as seller_location
        FROM marketplace_listings ml
        JOIN users u ON ml.user_id = u.id
        WHERE ml.status = 'available'
        ORDER BY ml.created_at DESC
    """)
    listings = cursor.fetchall()
    db.close()
    return jsonify(listings)

@app.route('/listings', methods=['POST'])
def add_listing():
    data = request.json
    db = get_db()
    cursor = db.cursor()
    cursor.execute("""
        INSERT INTO marketplace_listings
        (user_id, product_name, category, price, unit, quantity, location, description)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        data['user_id'], data['product_name'], data['category'],
        data['price'], data['unit'], data['quantity'],
        data['location'], data['description']
    ))
    db.commit()
    db.close()
    return jsonify({"message": "Listing added ✅"})

# --- DASHBOARD ---
@app.route('/dashboard/<int:user_id>', methods=['GET'])
def get_dashboard(user_id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT COUNT(*) as total FROM marketplace_listings WHERE user_id = %s", (user_id,))
    listings_count = cursor.fetchone()['total']
    cursor.execute("SELECT COUNT(*) as total FROM messages WHERE receiver_id = %s", (user_id,))
    messages_count = cursor.fetchone()['total']
    db.close()
    return jsonify({
        "listings": listings_count,
        "messages": messages_count
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
    