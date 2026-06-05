from flask import Flask, jsonify, request
from flask_cors import CORS
import pymysql

app = Flask(__name__)
CORS(app)

def get_db():
    return pymysql.connect(
        host='localhost',
        user='root',
        password='',
        database='zunde',
        cursorclass=pymysql.cursors.DictCursor
    )

# ── HEALTH CHECK ──────────────────────────────────────────────
@app.route('/')
def home():
    return jsonify({"message": "ZUNDE API is running ✅", "version": "2.0"})

# ── USERS ─────────────────────────────────────────────────────
@app.route('/users', methods=['GET'])
def get_users():
    db = get_db()
    c = db.cursor()
    role = request.args.get('role')
    province = request.args.get('province')
    q = request.args.get('q', '')
    sql = "SELECT id,full_name,phone,email,role,org_name,province,district,license_number,speciality,supply_categories,trading_areas FROM users WHERE 1=1"
    params = []
    if role:
        sql += " AND role = %s"; params.append(role)
    if province:
        sql += " AND province = %s"; params.append(province)
    if q:
        sql += " AND (full_name LIKE %s OR org_name LIKE %s OR province LIKE %s)"
        params += [f'%{q}%', f'%{q}%', f'%{q}%']
    c.execute(sql, params)
    users = c.fetchall()
    db.close()
    return jsonify(users)

@app.route('/users', methods=['POST'])
def create_user():
    d = request.json
    db = get_db()
    c = db.cursor()
    c.execute("""
        INSERT INTO users (full_name, phone, email, role, org_name, province, district, address,
            farm_size_ha, species_farmed, license_number, speciality, business_reg, supply_categories, trading_areas, avatar_seed)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """, (
        d.get('full_name') or d.get('name',''),
        d.get('phone',''), d.get('email',''), d.get('role','Farmer'),
        d.get('org_name') or d.get('org',''),
        d.get('province',''), d.get('district',''), d.get('address',''),
        d.get('farm_size_ha') or d.get('farmSize') or None,
        ','.join(d.get('species', [])) if isinstance(d.get('species'), list) else d.get('species',''),
        d.get('license_number') or d.get('licenseNumber',''),
        d.get('speciality',''),
        d.get('business_reg') or d.get('businessReg',''),
        ','.join(d.get('supply_categories',[])) if isinstance(d.get('supply_categories'), list) else d.get('supplyCategories',''),
        d.get('trading_areas') or d.get('tradingAreas',''),
        d.get('name','')
    ))
    db.commit()
    user_id = c.lastrowid
    db.close()
    return jsonify({"id": user_id, "message": "User registered ✅"})

@app.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    db = get_db()
    c = db.cursor()
    c.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    user = c.fetchone()
    db.close()
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user)

# ── ANIMALS ───────────────────────────────────────────────────
@app.route('/animals', methods=['GET'])
def get_animals():
    db = get_db()
    c = db.cursor()
    owner = request.args.get('owner_id')
    for_sale = request.args.get('for_sale')
    sql = """
        SELECT a.*, u.full_name as owner_name, u.phone as owner_phone, u.province as owner_province
        FROM animals a JOIN users u ON a.owner_id = u.id WHERE 1=1
    """
    params = []
    if owner:
        sql += " AND a.owner_id = %s"; params.append(owner)
    if for_sale is not None:
        sql += " AND a.for_sale = %s"; params.append(1 if for_sale == 'true' else 0)
    sql += " ORDER BY a.created_at DESC"
    c.execute(sql, params)
    animals = c.fetchall()
    # attach weight history
    for a in animals:
        c.execute("SELECT month_label, weight_kg FROM weight_history WHERE animal_id = %s ORDER BY id", (a['id'],))
        a['weight_history'] = c.fetchall()
    db.close()
    return jsonify(animals)

@app.route('/animals', methods=['POST'])
def add_animal():
    d = request.json
    db = get_db()
    c = db.cursor()
    c.execute("""
        INSERT INTO animals (owner_id, name, species, breed, birth_date, tag_id, brand_id,
            sire_id, dam_id, birth_weight, current_weight, image_url, for_sale)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """, (
        d['owner_id'], d['name'], d['species'], d.get('breed',''),
        d.get('birth_date') or d.get('birthDate'), d.get('tag_id') or d.get('tagId',''),
        d.get('brand_id') or d.get('brandId',''), d.get('sire_id') or d.get('sireId',''),
        d.get('dam_id') or d.get('damId',''),
        d.get('birth_weight') or d.get('birthWeight',0),
        d.get('current_weight') or d.get('currentWeight',0),
        d.get('image_url') or d.get('imageUrl',''), d.get('for_sale', False)
    ))
    animal_id = c.lastrowid
    # initial weight history entry
    bw = d.get('birth_weight') or d.get('birthWeight', 0)
    if bw:
        c.execute("INSERT INTO weight_history (animal_id, month_label, weight_kg) VALUES (%s,'Initial',%s)", (animal_id, bw))
    db.commit()
    db.close()
    return jsonify({"id": animal_id, "message": "Animal registered ✅"})

@app.route('/animals/<int:animal_id>/sale', methods=['PATCH'])
def toggle_sale(animal_id):
    db = get_db()
    c = db.cursor()
    c.execute("UPDATE animals SET for_sale = NOT for_sale WHERE id = %s", (animal_id,))
    db.commit()
    c.execute("SELECT for_sale FROM animals WHERE id = %s", (animal_id,))
    row = c.fetchone()
    db.close()
    return jsonify({"for_sale": bool(row['for_sale']), "message": "Listing status updated ✅"})

# ── HEALTH EVENTS ─────────────────────────────────────────────
@app.route('/animals/<int:animal_id>/health', methods=['GET'])
def get_health(animal_id):
    db = get_db()
    c = db.cursor()
    c.execute("SELECT * FROM health_events WHERE animal_id = %s ORDER BY event_date DESC", (animal_id,))
    events = c.fetchall()
    db.close()
    return jsonify(events)

@app.route('/health-events', methods=['POST'])
def add_health_event():
    d = request.json
    db = get_db()
    c = db.cursor()
    c.execute("""
        INSERT INTO health_events (animal_id, animal_name, event_type, notes, performed_by)
        VALUES (%s,%s,%s,%s,%s)
    """, (d['animal_id'], d.get('animal_name',''), d['event_type'], d.get('notes',''), d.get('performed_by')))
    db.commit()
    event_id = c.lastrowid
    db.close()
    return jsonify({"id": event_id, "message": "Health event logged ✅"})

# ── MEDICINE INVENTORY ────────────────────────────────────────
@app.route('/inventory/<int:owner_id>', methods=['GET'])
def get_inventory(owner_id):
    db = get_db()
    c = db.cursor()
    c.execute("SELECT * FROM medicine_inventory WHERE owner_id = %s", (owner_id,))
    items = c.fetchall()
    db.close()
    return jsonify(items)

@app.route('/inventory/<int:item_id>/deduct', methods=['PATCH'])
def deduct_inventory(item_id):
    d = request.json
    dose = float(d.get('dose', 0))
    db = get_db()
    c = db.cursor()
    c.execute("SELECT stock FROM medicine_inventory WHERE id = %s", (item_id,))
    row = c.fetchone()
    if not row:
        db.close(); return jsonify({"error": "Item not found"}), 404
    new_stock = max(0, float(row['stock']) - dose)
    c.execute("UPDATE medicine_inventory SET stock = %s WHERE id = %s", (new_stock, item_id))
    db.commit()
    db.close()
    return jsonify({"new_stock": new_stock, "message": f"{dose}ml deducted ✅"})

# ── MARKETPLACE ───────────────────────────────────────────────
@app.route('/listings', methods=['GET'])
def get_listings():
    db = get_db()
    c = db.cursor()
    category = request.args.get('category')
    q = request.args.get('q', '')
    sql = """
        SELECT ml.*, u.full_name as seller_name, u.phone, u.province as seller_province
        FROM marketplace_listings ml JOIN users u ON ml.user_id = u.id
        WHERE ml.status = 'available'
    """
    params = []
    if category:
        sql += " AND ml.category = %s"; params.append(category)
    if q:
        sql += " AND ml.product_name LIKE %s"; params.append(f'%{q}%')
    sql += " ORDER BY ml.created_at DESC"
    c.execute(sql, params)
    listings = c.fetchall()
    db.close()
    return jsonify(listings)

@app.route('/listings', methods=['POST'])
def add_listing():
    d = request.json
    db = get_db()
    c = db.cursor()
    c.execute("""
        INSERT INTO marketplace_listings
            (user_id, animal_id, product_name, category, price, unit, quantity, location, description)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """, (
        d['user_id'], d.get('animal_id'), d['product_name'],
        d.get('category','livestock'), d['price'], d.get('unit','head'),
        d.get('quantity',1), d.get('location',''), d.get('description','')
    ))
    db.commit()
    db.close()
    return jsonify({"message": "Listing added ✅"})

# ── FEED ANALYZER ─────────────────────────────────────────────
@app.route('/feed', methods=['GET'])
def get_all_feeds():
    db = get_db()
    c = db.cursor()
    c.execute("SELECT * FROM feed_types")
    feeds = c.fetchall()
    db.close()
    return jsonify(feeds)

@app.route('/feed/search', methods=['GET'])
def search_feed():
    q = request.args.get('q', '')
    db = get_db()
    c = db.cursor()
    c.execute("SELECT * FROM feed_types WHERE name LIKE %s OR suitable_for LIKE %s", (f'%{q}%', f'%{q}%'))
    results = c.fetchall()
    db.close()
    return jsonify(results)

# ── DASHBOARD ─────────────────────────────────────────────────
@app.route('/dashboard/<int:user_id>', methods=['GET'])
def get_dashboard(user_id):
    db = get_db()
    c = db.cursor()
    c.execute("SELECT COUNT(*) as total FROM animals WHERE owner_id = %s", (user_id,))
    animals_count = c.fetchone()['total']
    c.execute("SELECT COUNT(*) as total FROM marketplace_listings WHERE user_id = %s AND status = 'available'", (user_id,))
    listings_count = c.fetchone()['total']
    c.execute("SELECT COUNT(*) as total FROM messages WHERE case_id IN (SELECT id FROM vet_cases WHERE farmer_id = %s)", (user_id,))
    messages_count = c.fetchone()['total']
    c.execute("SELECT SUM(current_weight * 1.5 + 500) as total_value FROM animals WHERE owner_id = %s", (user_id,))
    row = c.fetchone()
    total_value = float(row['total_value'] or 0)
    db.close()
    return jsonify({
        "animals":      animals_count,
        "listings":     listings_count,
        "messages":     messages_count,
        "total_value":  total_value
    })

# ── VET CASES ─────────────────────────────────────────────────
@app.route('/cases', methods=['GET'])
def get_cases():
    db = get_db()
    c = db.cursor()
    farmer = request.args.get('farmer_id')
    vet = request.args.get('vet_id')
    sql = """
        SELECT vc.*, u.full_name as farmer_name, u.phone as farmer_phone,
               a.name as animal_name
        FROM vet_cases vc
        JOIN users u ON vc.farmer_id = u.id
        LEFT JOIN animals a ON vc.animal_id = a.id
        WHERE 1=1
    """
    params = []
    if farmer: sql += " AND vc.farmer_id = %s"; params.append(farmer)
    if vet:    sql += " AND vc.vet_id = %s"; params.append(vet)
    c.execute(sql, params)
    cases = c.fetchall()
    db.close()
    return jsonify(cases)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
