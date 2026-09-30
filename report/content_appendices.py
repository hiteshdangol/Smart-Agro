# -*- coding: utf-8 -*-
"""Appendices A-D."""


def build(b):
    b.chapter = None  # appendices are not part of the numbered chapters

    b.h1("Appendix A: System Screenshots")
    b.para("This appendix lists the screen captures of the running system that are to be inserted "
            "during the final proofreading of the report. Each screenshot should be placed in the "
            "corresponding figure placeholder in Chapter 4 (Figures 4.1 to 4.9) and in Chapter 5 "
            "(Figures 5.1 and 5.2), using the suggested captions below. Additional screenshots may "
            "be inserted here with captions continuing from Figure A.1.")
    b.add_table(
        ["No.", "Screenshot", "Suggested Caption"],
        [
            ["A.1", "Login and registration pages", "Login and Registration Pages"],
            ["A.2", "Crop record submission form", "Crop Record Form"],
            ["A.3", "Pest risk prediction result", "Pest Risk Prediction"],
            ["A.4", "Crop recommendation result with tips", "Crop Recommendation"],
            ["A.5", "Disease recognition result with medicines", "Disease Recognition"],
            ["A.6", "Shop page and product detail", "Agricultural Marketplace"],
            ["A.7", "Cart and checkout page", "Cart and Checkout"],
            ["A.8", "My orders page", "My Orders"],
            ["A.9", "Admin dashboard", "Admin Dashboard"],
            ["A.10", "Admin product approval", "Admin Product Approval"],
            ["A.11", "Admin user and role management", "Admin User and Role Management"],
            ["A.12", "Previous records page", "Previous Records"],
        ],
        cap_title="Table A.1: Intended System Screenshots",
    )

    b.h1("Appendix B: Source Code Structure")
    b.para("The complete source code of the project is organized as follows. Only the most "
           "important files are listed; the full listing is available in the project "
           "repository.")
    b.code(
        "smart-agro/\n"
        "|-- backend/\n"
        "|   |-- index.js                 # Express app\n"
        "|   |-- config/db.js             # MongoDB connection\n"
        "|   |-- models/                  # Farmer, Role, Record, Product, Order,\n"
        "|   |                            #   Medicine, pestAlert\n"
        "|   |-- controllers/             # auth, record, product, order, role,\n"
        "|   |                            #   user, admin, medicine\n"
        "|   |-- routes/                  # Express routers for all resources\n"
        "|   `-- utils/                   # authMiddleware, permissionMiddleware,\n"
        "|                                #   requireActive, permissions\n"
        "|-- frontend/\n"
        "|   `-- src/\n"
        "|       |-- App.js               # Route definitions\n"
        "|       |-- pages/               # All page components\n"
        "|       |-- components/          # Sidebar, Navbar, Cart, etc.\n"
        "|       |-- styles/              # Per-page CSS and global design tokens\n"
        "|       `-- utils/               # axiosInstance, permissions\n"
        "|-- pythonmodel/\n"
        "|   |-- api_nb.py                # Pest risk FastAPI service (port 5002)\n"
        "|   |-- crop_recommendataion_knn.py  # Crop FastAPI service (port 5003)\n"
        "|   |-- disease_api.py           # Disease FastAPI service (port 5004)\n"
        "|   |-- train_nb.py              # Naive Bayes training script\n"
        "|   |-- pest_data.csv / Crop_recommendation copy.csv\n"
        "|   `-- *.pkl / *.joblib         # Serialized models\n"
        "|-- Plant-Disease-Recognition-System-main/\n"
        "|   |-- models/plant_disease_recog_model_pwp.keras\n"
        "|   `-- plant_disease.json       # Disease cause/cure database\n"
        "`-- package.json                 # Root scripts (concurrently)"
    )

    b.h1("Appendix C: Database Schema Summary")
    b.para("The MongoDB database smart_agro stores the following collections. For each "
           "collection, the principal fields are summarized.")
    b.add_table(
        ["Collection", "Key Fields"],
        [
            ["farmers", "name, email (unique), password (bcrypt hash), role, permissionsOverride[], profilePicture, isBlocked, farmName, location, verificationStatus, timestamps"],
            ["roles", "name, description, permissions[], isDefault"],
            ["records", "farmerId (ref), type (crop/disease/recommendation), crop fields, diseaseName/diseaseCause/diseaseCure/confidence/top3/imageBase64/medicines/purchasedProducts[], soilParams, climateParams, recommendedCrop, recommendationConfidence"],
            ["products", "name, description, price, category, image, stock, seller (ref), approvalStatus (pending/approved/rejected)"],
            ["orders", "buyer (ref), items[{product, name, price, quantity}], totalAmount, shippingAddress{fullName, address, city, phone}, status, paymentMethod (cod/esewa), paymentStatus, transactionId"],
            ["medicines", "diseaseName, medicines[{type, productName, description, applicationInstructions, suggestedProductNames[]}]"],
            ["pestalerts", "location (GeoJSON, 2dsphere index), crop, riskLevel, description"],
        ],
        cap_title="Table C.1: MongoDB Collections and Principal Fields",
    )
    b.para("Indexes are defined on the farmers email field (unique), the pestalerts location "
           "field (2dsphere), and compound indexes on records and orders for recency-ordered "
           "listing queries.")

    b.h1("Appendix D: API Endpoints")
    b.para("The table below lists the principal REST endpoints exposed by the backend. Routes "
           "marked [auth] require a valid JSON Web Token, and routes marked [perm] additionally "
           "require the stated permission.")
    b.add_table(
        ["Method", "Endpoint", "Access", "Purpose"],
        [
            ["POST", "/api/auth/register", "Public", "Register a new farmer"],
            ["POST", "/api/auth/login", "Public", "Log in and obtain a JWT"],
            ["GET", "/api/auth/profile", "auth", "Fetch the current profile"],
            ["PUT", "/api/auth/profile", "auth", "Update the current profile"],
            ["GET", "/api/records", "auth", "List the farmer's records"],
            ["POST", "/api/records", "auth", "Add a crop, disease, or recommendation record"],
            ["POST", "/api/records/:id/purchase", "auth", "Attach a purchased product to a disease record"],
            ["POST", "/api/pest-alert/pest-risk", "auth", "Proxy to pest risk service (port 5002)"],
            ["POST", "/api/crop-recommendation/recommend", "auth", "Proxy to crop service (port 5003)"],
            ["POST", "/api/crop-recommendation/retrain", "auth", "Retrain the crop model"],
            ["POST", "/api/disease/predict", "auth", "Proxy to disease service (port 5004), multipart upload"],
            ["GET", "/api/products", "Public", "List approved products"],
            ["POST", "/api/products", "auth", "Create a product listing (pending approval)"],
            ["PUT", "/api/products/:id", "auth", "Update an own product"],
            ["DELETE", "/api/products/:id", "auth", "Delete an own product"],
            ["POST", "/api/orders", "auth", "Place an order (COD or eSewa)"],
            ["GET", "/api/orders/mine", "auth", "List the buyer's orders"],
            ["POST", "/api/orders/esewa/initiate", "auth", "Generate eSewa signed form data"],
            ["POST", "/api/orders/esewa/verify", "auth", "Verify an eSewa transaction via the status API"],
            ["GET", "/api/roles", "perm admin:access", "List roles"],
            ["POST/PUT/DELETE", "/api/roles/:id", "perm admin:access", "Create, update, or delete a role"],
            ["GET", "/api/users", "perm users:view", "List users"],
            ["PUT", "/api/users/:id/role", "perm users:manage_role", "Change a user's role"],
            ["GET", "/api/admin/farmers", "perm admin:access", "List farmers with product counts"],
            ["PUT", "/api/admin/farmers/:id/verify", "perm admin:access", "Verify or suspend a farmer"],
            ["PUT", "/api/admin/products/:id/approve", "perm products:manage_all", "Approve or reject a product"],
            ["GET", "/api/admin/orders", "perm orders:manage_all", "List all orders"],
            ["GET/POST/PUT/DELETE", "/api/medicines", "perm medicines:manage", "Manage the medicine database"],
        ],
        cap_title="Table D.1: Principal REST API Endpoints",
    )
