# -*- coding: utf-8 -*-
"""Chapter 3: System Analysis and Design."""
import os
from docx.enum.text import WD_ALIGN_PARAGRAPH
from report_builder import PNG_DIR


def build(b):
    b.start_chapter(3)
    b.h1("3. System Analysis and Design")

    b.h2("3.1 System Analysis")
    b.para("System analysis defines what the system must do before implementation through "
           "requirement analysis and UML modelling [31].")

    b.h3("3.1.1 Requirement Analysis")
    b.para("Requirements are split into functional and non-functional categories; the former, "
           "derived from the Chapter 1 objectives, are listed in Table 3.1.")
    b.add_table(
        ["ID", "Requirement", "Module"],
        [
            ["FR-01", "The system shall allow a user to register with name, email, and password, and to log in securely.", "Authentication"],
            ["FR-02", "The system shall issue a JWT upon login and use it to authorize subsequent requests.", "Authentication"],
            ["FR-03", "The system shall allow a user to view and update their profile information.", "Profile"],
            ["FR-04", "The system shall provide a dashboard with a crop record submission form and a summary of the farmer's recent records.", "Dashboard"],
            ["FR-05", "The system shall allow a farmer to create and view crop, disease, and recommendation records.", "Records"],
            ["FR-06", "The system shall predict pest risk level from six input features.", "Pest Prediction"],
            ["FR-07", "The system shall recommend the most suitable crop from soil and climate parameters.", "Crop Recommendation"],
            ["FR-08", "The system shall recognize a plant disease from an uploaded leaf image and return confidence.", "Disease Recognition"],
            ["FR-09", "The system shall suggest medicines and shop products for a recognized disease.", "Disease Recognition"],
            ["FR-10", "The system shall allow sellers to list, edit, and delete products pending admin approval.", "Marketplace"],
            ["FR-11", "The system shall maintain a shopping cart and allow placing orders with shipping details.", "Marketplace"],
            ["FR-12", "The system shall support cash on delivery and eSewa digital payment with verification.", "Payment"],
            ["FR-13", "The system shall allow admins to manage users, verify farmers, and approve products.", "Admin"],
            ["FR-14", "The system shall allow admins to manage orders and the medicine database.", "Admin"],
            ["FR-15", "The system shall support role creation and per-user permission overrides.", "Admin/RBAC"],
        ],
        cap_title="Functional Requirements",
    )
    b.para("Non-functional requirements cover performance, security, usability, reliability, and "
           "scalability (Table 3.2).")
    b.add_table(
        ["ID", "Requirement", "Category"],
        [
            ["NFR-01", "The system shall respond to typical API requests within three seconds on a local deployment.", "Performance"],
            ["NFR-02", "Passwords shall be stored using bcrypt hashing and tokens shall expire after a defined period.", "Security"],
            ["NFR-03", "Only users with the required permissions shall access administrative endpoints.", "Security"],
            ["NFR-04", "The user interface shall be responsive and usable on desktop, tablet, and mobile screens.", "Usability"],
            ["NFR-05", "The UI shall follow a consistent design system across all pages.", "Usability"],
            ["NFR-06", "The system shall keep order and record data persistent in MongoDB.", "Reliability"],
            ["NFR-07", "The architecture shall separate the frontend, backend, and ML services so that each can scale independently.", "Scalability"],
        ],
        cap_title="Non-Functional Requirements",
    )

    b.h3("3.1.2 Feasibility Study")
    b.para("All technologies are free and open source, and the models train on an ordinary computer "
            "[32], [33].")

    b.h3("3.1.3 Use Case Modeling")
    b.para("Use case modelling describes interactions between the system and its external actors: "
            "the Farmer, the Admin, and the eSewa gateway (Figure 3.1). The "
            "Farmer uses advisory and shopping features; the Admin manages users and products.")
    b.add_figure(os.path.join(PNG_DIR, "Use_Case_diagram.png"), "Use Case Diagram of Smart Agro",         width_inches=3.6)
    b.add_table(
        ["Actor", "Description", "Primary Use Cases"],
        [
            ["Farmer / Seller", "Registered user who uses advisory services and trades", "Register, login, dashboard, records, pest risk, crop recommendation, disease recognition, shop, cart, order, payment, product listing"],
            ["Admin", "System administrator with full permissions", "User and role management, farmer verification, product approval, order management, medicine management, analytics"],
            ["eSewa Gateway", "External payment service", "Process payments, return transaction status"],
        ],
        cap_title="Actors and Their Use Cases",
    )

    b.h3("3.1.4 Object Modeling using Class and Object Diagrams")
    b.para("Object modelling identifies the main classes, their attributes and methods, and "
           "their relationships:")
    b.bullets([
        "Farmer: represents a registered user with name, email, password, role, permissions "
        "override, profile picture, blocked status, farm name, location, and verification status.",
        "Record: represents a farming record of type crop, disease, or recommendation, storing the "
        "relevant parameters, the predicted outcome, the confidence, and associated medicines and "
        "purchased products.",
        "Product: represents a marketplace item with name, description, price, category, stock, "
        "seller, and approval status.",
        "Order: represents a purchase with buyer, items, total amount, shipping address, status, "
        "payment method, payment status, and transaction identifier.",
        "Medicine: represents the medicine database keyed by disease name, with chemical and "
        "organic medicine entries and suggested product names.",
        "Role: represents a named set of permissions with a description and a default flag.",
    ])
    b.para("Figure 3.2 shows the classes with their associations; Figure 3.3 shows a runtime "
           "snapshot of one Farmer linked to an Order with two product instances.")
    b.add_figure(os.path.join(PNG_DIR, "Class_diagram.png"), "Class Diagram of Smart Agro",         width_inches=3.6)
    b.add_figure(os.path.join(PNG_DIR, "Object_diagram.png"), "Object Diagram of Smart Agro",         width_inches=3.6)

    b.h3("3.1.5 Dynamic Modeling using Sequence Diagrams")
    b.para("Sequence diagrams model object interactions over time. Figure 3.4 covers login "
            "and disease recognition: the Auth controller returns a JWT, "
            "and the disease service returns class, "
            "cause, and confidence.")
    b.add_figure(os.path.join(PNG_DIR, "Sequence_User.png"), "Sequence Diagram for User Flows",         width_inches=3.6)
    b.para("The admin sequence diagram in Figure 3.5 models product management: the backend "
           "verifies the admin permission, returns the pending product list, and on approval "
           "makes the product visible in the public shop.")
    b.add_figure(os.path.join(PNG_DIR, "Sequence_Admin.png"), "Sequence Diagram for Admin Management",         width_inches=3.6)

    b.h3("3.1.6 Process Modeling using Activity Diagrams")
    b.para("Activity diagrams model the flow of control. Figure 3.6 models the order process: "
           "the farmer checks out with a shipping address, and with eSewa the success page "
           "verifies the transaction and marks the order paid.")
    b.add_figure(os.path.join(PNG_DIR, "Activity_User.png"), "Activity Diagram for Order and Payment",         width_inches=3.6)
    b.para("Figure 3.7 models the administrative flows: product approval, farmer verification, "
           "and role management.")
    b.add_figure(os.path.join(PNG_DIR, "Activity_Admin.png"), "Activity Diagram for Admin Management",         width_inches=3.6)

    b.h2("3.2 System Design")

    b.h3("3.2.1 System Architecture")
    b.para("The system uses a layered, client-server architecture. The React presentation layer "
            "communicates over HTTP; the Express layer exposes REST endpoints and "
           "proxies machine learning requests; the data layer is MongoDB via Mongoose [34].")

    b.h3("3.2.2 Microservice Architecture for Machine Learning")
    b.para("The three machine learning models run as independent FastAPI microservices, each "
           "owning a single capability [35], as summarized in Table 3.3.")
    b.add_table(
        ["Service", "Port", "Model", "Purpose", "Main Endpoint"],
        [
            ["Pest API", "5002", "Gaussian Naive Bayes pipeline", "Pest risk prediction", "POST /predict"],
            ["Crop API", "5003", "Random Forest classifier", "Crop recommendation", "POST /predict, POST /retrain, GET /health"],
            ["Disease API", "5004", "EfficientNetB4 CNN", "Plant disease recognition", "POST /predict, GET /health"],
        ],
        cap_title="Machine Learning Microservices",
    )
    b.para("The frontend never calls these services directly; the Express backend proxies "
           "prediction requests, keeping the client interface uniform and letting each model be "
           "retrained independently [35].")

    b.h3("3.2.3 Context Diagram")
    b.para("The context diagram shows the system as a single process with the Farmer, Admin, "
            "and eSewa gateway around it (Figure 3.8). Incoming flows include leaf "
            "images and request data; outgoing flows include recommendations and payment "
            "confirmations.")
    b.add_figure(os.path.join(PNG_DIR, "DFD_Level0.png"), "Context Diagram (DFD Level 0)",         width_inches=3.6)

    b.h3("3.2.4 Data Flow Diagram (Level 1)")
    b.para("The level-one data flow diagram in Figure 3.9 decomposes the system into processes "
            "covering authentication, prediction, disease recognition, "
            "marketplace, and orders, with stores for Farmers, Records, Products, Orders, "
            "Medicines, Roles, and Pest Alerts.")
    b.add_figure(os.path.join(PNG_DIR, "DFD_Level1.png"), "Data Flow Diagram (DFD Level 1)",         width_inches=3.6)

    b.h3("3.2.5 Entity Relationship Diagram")
    b.para("The entity relationship diagram in Figure 3.10 models the persistent data: a Role "
            "assigns one-to-many Farmers, and a Farmer has many Records, Products, and Orders.")
    b.add_figure(os.path.join(PNG_DIR, "ER_diagram.png"), "Entity Relationship Diagram",         width_inches=3.6)

    b.h3("3.2.6 Database Design")
    b.para("The system uses MongoDB, a document-oriented NoSQL database that accommodates "
           "records varying in shape by type without rigid schemas [36].")
    b.para("Collections. The smart_agro database contains seven collections (Table 3.4).")
    b.add_table(
        ["Collection", "Mongoose Model", "Purpose"],
        [
            ["farmers", "Farmer", "Registered users with roles and verification status"],
            ["roles", "Role", "Named sets of permissions"],
            ["records", "Record", "Crop, disease, and recommendation records"],
            ["medicines", "Medicine", "Medicine database keyed by disease name"],
            ["products", "Product", "Marketplace product listings"],
            ["orders", "Order", "Orders with items, shipping, and payment details"],
            ["pestalerts", "pestAlert", "Geo-referenced pest alerts"],
        ],
        cap_title="MongoDB Collections",
    )
    b.para("Schema design. Each collection is defined by a Mongoose schema of field types, "
           "validation rules, and defaults. The Farmer schema requires name, email, and a "
           "bcrypt-hashed password; the Record and Order schemas embed soil, climate, items, "
           "and shipping data.")
    b.para("Relationships. Collections are linked by references: a Record references its Farmer, "
           "an Order references its buyer, and each item references a Product. Since MongoDB "
           "does not enforce referential integrity, these are maintained through explicit "
           "population in the controllers [36].")
    b.para("Sample documents. Representative Farmer and Record documents are summarized in "
           "Appendix C.")
    b.para("Indexes. MongoDB indexes accelerate queries on frequently searched fields: email is "
           "uniquely indexed for authentication, pest alert location uses a 2dsphere index, and "
           "compound indexes on createdAt sort records and orders by recency (Table 3.5).")
    b.add_table(
        ["Collection", "Index", "Type", "Purpose"],
        [
            ["farmers", "email", "unique", "Fast and unique authentication lookup"],
            ["pestalerts", "location", "2dsphere", "Geo-spatial pest alert queries"],
            ["records", "farmerId + createdAt", "compound", "List records of a farmer by recency"],
            ["orders", "buyer + createdAt", "compound", "List orders of a buyer by recency"],
        ],
        cap_title="Database Indexes",
    )

    b.h3("3.2.7 Refinement of Class Diagram")
    b.para("During design the analysis classes are refined into concrete classes following an "
           "MVC separation: Express controllers handle requests, Mongoose models handle "
           "persistence. Figure 3.11 shows the refined diagram with comparePassword(), the "
           "authentication and permission middleware, and the ML service interfaces.")
    b.add_figure(os.path.join(PNG_DIR, "Refined_Class_diagram.png"), "Refined Class Diagram (MVC Layers)",         width_inches=3.6)

    b.h3("3.2.8 Component Diagram")
    b.para("The component diagram describes the major components and their interactions. "
           "Figure 3.12 shows the React SPA, the Express backend with RBAC, MongoDB, the "
           "FastAPI services, and the eSewa gateway; Figure 3.13 shows the admin side with its "
           "management functions.")
    b.add_figure(os.path.join(PNG_DIR, "Component_User.png"), "Component Diagram - User Side",         width_inches=3.6)
    b.add_figure(os.path.join(PNG_DIR, "Component_Admin.png"), "Component Diagram - Admin Side",         width_inches=3.6)

    b.h3("3.2.9 Deployment Diagram")
    b.para("In the local deployment all components run on one machine. Figure 3.14 shows the "
            "React dev server on port 3000, the Express backend on port 5000, the services on "
            "ports 5002-5004, and MongoDB.")
    b.add_figure(os.path.join(PNG_DIR, "Deployment_diagram.png"), "Deployment Diagram (Local Deployment)",         width_inches=3.6)

    b.h3("3.2.10 Wireframing")
    b.para("Wireframes define the layout of the main screens. Figure 3.15 shows low-fidelity "
           "wireframes for the login screen, the farmer dashboard, and the shop and checkout "
           "pages.")
    b.add_figure(os.path.join(PNG_DIR, "Wireframe.png"), "Wireframes of Key Screens",         width_inches=3.6)

    b.h3("3.2.11 Interface Design")
    b.para("The UI follows a consistent glassmorphism design system; its tokens are summarized "
           "in Table 3.6.")
    b.add_table(
        ["Token", "Value", "Usage"],
        [
            ["--primary", "#2ecc71", "Primary brand colour (green), buttons, accents"],
            ["--primary-dark", "#27ae60", "Hover and pressed states"],
            ["--glass-bg", "rgba(255,255,255,0.18)", "Glass card backgrounds"],
            ["--glass-border", "rgba(255,255,255,0.25)", "Glass card borders"],
            ["--text-primary", "#1a2e1a", "Main text colour"],
            ["--text-muted", "#8ba08b", "Secondary and muted text"],
            ["--font", "Inter", "Global font family"],
            ["--radius", "16px", "Card corner radius"],
        ],
        cap_title="Design Tokens",
    )
    b.para("The interface has three layouts: public authentication pages, a farmer layout with a "
           "collapsible sidebar, and an admin layout with a dedicated sidebar. Navigation "
           "follows the frontend routes listed in Chapter 4.")

    b.h3("3.2.12 API Architecture")
    b.para("The backend exposes RESTful endpoints protected by authentication and permission "
           "middleware, with machine learning requests proxied to the Python services. The "
           "complete API is listed in Appendix D; Table 3.7 summarizes the endpoint groups.")
    b.add_table(
        ["Prefix", "Purpose", "Example Endpoints"],
        [
            ["/api/auth", "Registration, login, profile", "POST /register, POST /login, GET/PUT /profile"],
            ["/api/records", "Crop, disease, recommendation records", "GET /, POST /, POST /:id/purchase"],
            ["/api/pest-alert", "Pest risk prediction proxy", "POST /pest-risk"],
            ["/api/crop-recommendation", "Crop recommendation proxy", "POST /recommend"],
            ["/api/disease", "Disease recognition proxy (multipart)", "POST /predict, GET /health"],
            ["/api/products", "Product catalogue and listings", "GET /, POST /, PUT /:id"],
            ["/api/orders", "Orders and payments", "GET /mine, POST /, POST /esewa/initiate, POST /esewa/verify"],
            ["/api/roles", "Role management", "GET /, POST /, PUT /:id, DELETE /:id"],
            ["/api/users", "User management", "GET /, PUT /:id/role"],
            ["/api/admin", "Admin management", "GET /farmers, GET /products, PUT /products/:id/approve, /medicines CRUD"],
        ],
        cap_title="API Endpoint Groups",
    )

    b.h3("3.2.13 Folder Structure")
    b.para("The project is a monorepo of frontend, backend, and machine learning services "
           "coordinated by the root package.json; the complete source tree is listed in "
           "Appendix B.")

    b.h3("3.2.14 Security Design")
    b.para("The system applies defence in depth. Passwords are bcrypt-hashed with twelve salt "
           "rounds [37]; a JWT expires after a configurable period and is verified on protected "
           "requests [38]. The permission middleware rejects unauthorized requests [13], and "
           "eSewa payments use HMAC-SHA256 signatures with server-side verification [12].")
    b.h2("3.3 Algorithm Details")
    b.para("This section describes the three machine learning algorithms: Gaussian Naive Bayes, "
           "Random Forest, and EfficientNetB4 for pest risk, crop recommendation, and disease "
           "recognition.")

    b.h3("3.3.1 Gaussian Naive Bayes Algorithm")
    b.para("The pest risk module implements a Gaussian Naive Bayes classifier, based on "
           "Bayes\u2019 theorem, which relates the posterior probability of class C given evidence "
           "X to the prior and likelihood [19]:")
    b.para("P(C | X) = P(X | C) * P(C) / P(X)", italic=True, align=WD_ALIGN_PARAGRAPH.CENTER)
    b.para("The naive assumption holds that features are conditionally independent given the "
           "class, so the likelihood is the product of per-feature probabilities:")
    b.para("P(X | C) = P(x1 | C) * P(x2 | C) * ... * P(xn | C)", italic=True, align=WD_ALIGN_PARAGRAPH.CENTER)
    b.para("For continuous features, each feature is assumed normally distributed within a class, "
           "P(xi | C) ~ N(\u00b5i, \u03c3i\u00b2), with parameters estimated from the data. The "
           "highest posterior class is selected, and P(X) is ignored as constant [19].")
    b.para("The model is a scikit-learn pipeline that scales numeric features with a "
           "StandardScaler, one-hot encodes categorical features, applies a Gaussian Naive "
           "Bayes classifier, and is served by the pest API on port 5002 [32].")

    b.h3("3.3.2 Random Forest Algorithm")
    b.para("The crop recommendation module uses a Random Forest of decision trees trained on "
           "bootstrap samples, combined by majority voting [26]. The ensemble is robust to noise "
           "and captures non-linear soil-climate relationships [16].")
    b.para("The pipeline loads about 2,200 samples covering twenty-two crops, scales the numeric "
           "features (N, P, K, temperature, humidity, pH, rainfall), and trains a Random Forest "
           "with one hundred trees, returning the recommended crop with a confidence score [32].")

    b.h3("3.3.3 EfficientNetB4 Convolutional Neural Network")
    b.para("The plant disease recognition module uses an EfficientNetB4 convolutional neural "
           "network. EfficientNet models, obtained by compound scaling of depth, width, and "
           "resolution, balance accuracy and computational cost [28].")
    b.para("The model is fine-tuned through transfer learning [29] with ImageNet pre-trained "
           "weights and a softmax head over thirty-nine classes, with inputs resized to 160x160 "
           "pixels. A confidence threshold of 0.5 reports images below it as unrecognized [21], "
           "[22], [23]; the service accepts uploads on port 5004.")
