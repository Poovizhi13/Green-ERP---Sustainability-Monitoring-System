
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import pandas as pd
import os

app = Flask(__name__)

# --- DATABASE CONFIG ---
# For your local project, use: 'postgresql://username:password@localhost/greenerp'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///greenerp.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# --- MODELS ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    role = db.Column(db.String(50), nullable=False)

class Supplier(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    sustainability_score = db.Column(db.Integer)
    carbon_efficiency = db.Column(db.Float)

class Material(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    carbon_factor = db.Column(db.Float)

class Procurement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    material_id = db.Column(db.String(50), db.ForeignKey('material.id'))
    supplier_id = db.Column(db.String(50), db.ForeignKey('supplier.id'))
    quantity = db.Column(db.Float)
    total_cost = db.Column(db.Float)

# --- API ENDPOINTS ---

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username'], role=data['role']).first()
    if user:
        return jsonify({"id": user.id, "username": user.username, "role": user.role})
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/api/dashboard/stats', methods=['GET'])
def get_stats():
    # Example using Pandas for KPI logic
    proc_df = pd.read_sql(db.session.query(Procurement).statement, db.session.bind)
    mat_df = pd.read_sql(db.session.query(Material).statement, db.session.bind)
    
    if proc_df.empty:
        return jsonify({"total_carbon": 0})
        
    df = proc_df.merge(mat_df, left_on='material_id', right_on='id')
    total_carbon = (df['quantity'] * df['carbon_factor']).sum()
    
    return jsonify({
        "total_carbon": round(total_carbon, 2),
        "total_spend": round(df['total_cost'].sum(), 2)
    })

@app.route('/api/suppliers', methods=['GET', 'POST'])
def handle_suppliers():
    if request.method == 'POST':
        data = request.json
        new_s = Supplier(id=data['id'], name=data['name'], sustainability_score=data['sustainabilityScore'])
        db.session.add(new_s)
        db.session.commit()
        return jsonify({"message": "Created"}), 201
    
    suppliers = Supplier.query.all()
    return jsonify([{"id": s.id, "name": s.name, "sustainabilityScore": s.sustainability_score} for s in suppliers])

if __name__ == '__main__':
    with app.app_context():
        db.create_all() # Initialize database
    app.run(debug=True, port=5000)
