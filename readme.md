# Milkman - Fresh Dairy Delivery System

Milkman is a comprehensive dairy delivery platform featuring multiple modern React frontends and a robust Django REST API backend. It provides a seamless experience for both customers and staff members.

## 🚀 Features

### **For Customers (Main Site)**
- **Home Page**: Premium UI with featured products, store locations, and business stats.
- **Product Catalog**: Browse and add fresh dairy items (Milk, Cheese, Curd, etc.) to your cart.
- **Smart Chatbot**: Live AI assistant synchronized with the product database to answer queries about prices, categories, and delivery.
- **Subscription Plans**: Flexible Daily, Weekly, and Monthly plans with 20% savings.
- **Secure Billing**: Integrated checkout with dummy Card and UPI payment simulations.

### **For Staff (Admin Portal)**
- **Unified Management**: Single-page dashboard for managing both products and employee activities.
- **Inline Product Editing**: Edit product names and prices directly in the inventory list with instant "Save" capability.
- **Real-time Synchronization**: All administrative changes (Edit/Delete/Add) are instantly reflected on the customer-facing website and chatbot.
- **Employee Activity Feed**: Live monitoring of team logins, signups, and logouts stored securely in the database.

## 🛠️ Tech Stack
- **Main Frontend**: React, Vite (Port 5173).
- **Admin Frontend**: React, Vite (Port 5175).
- **Backend**: Django, Django REST Framework (Port 8000).
- **Database**: SQLite3 with real-time synchronization across all services.

## 📂 Project Structure
- `frontend/`: The primary customer-facing website (Chatbot, Products, Payments).
- `adminpanel/`: The dedicated staff/admin portal (Inventory CRUD, Activity Monitoring).
- `backend/`: Django REST API project.
- `milkman/`: (Empty placeholder).
- `reactadmin/`: (Empty placeholder).

## 🏃 How to Run

### **1. Backend (Django)**
```bash
cd backend
.\env\Scripts\activate
python manage.py runserver 8000
```
- Access API at: `http://127.0.0.1:8000/`

### **2. Main Customer Site**
```bash
cd frontend
npm run dev -- --port 5173
```
- Access Site at: `http://localhost:5173/`

### **3. Admin/Staff Portal**
```bash
cd adminpanel
npm run dev -- --port 5175
```
- Access Portal at: `http://localhost:5175/`

## 🐞 Recent Improvements
- **UI Optimization**: Fixed overlapping buttons and improved responsiveness in the Admin Portal.
- **Dynamic Chatbot**: Upgraded chatbot to fetch live pricing and product data from the database.
- **Inline CRUD**: Enabled direct editing of name and price in the admin product list for faster management.
- **CORS Fixes**: Resolved cross-origin issues between the different frontend ports and the backend API.

---
© 2026 Milkman Team. Freshness delivered.
