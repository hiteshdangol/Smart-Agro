# -*- coding: utf-8 -*-
"""Chapter 5: Testing and Evaluation."""


def build(b):
    b.start_chapter(5)
    b.h1("5. Testing and Evaluation")

    b.h2("5.1 Introduction")
    b.para("Testing finds errors and verifies requirements [45]. Smart Agro was tested from "
           "functions to workflows, following the ISO/IEC 25010 quality model [46]. This chapter "
           "covers the strategy, test cases, and evaluation against Chapter 1.")

    b.h2("5.2 Testing Strategy")
    b.para("Testing proceeded incrementally with the iterative methodology of Chapter 1. Four "
           "levels were applied:")
    b.numbered([
        "Unit testing: each function and module was tested in isolation, including the "
        "authentication helpers, the permission middleware, and the machine learning endpoints.",
        "Integration testing: the interfaces between the modules were tested, primarily the REST "
        "endpoints and the HTTP proxies between the Express backend and the three Python "
        "services.",
        "System testing: the complete system was tested end to end through the browser for each "
        "user workflow, including registration, prediction, shopping, and both payment methods.",
        "Acceptance testing: the system was demonstrated to the project supervisor and a small "
        "group of intended users, who verified that the delivered functionality matched the "
        "agreed requirements.",
    ])
    b.para("The frontend was verified with React Testing Library and Jest [47], and the REST API "
           "with Postman. Integration testing required MongoDB and the machine learning services "
           "to run concurrently.")

    b.h2("5.3 Test Environment")
    b.para("Table 5.1 lists the test environment.")
    b.add_table(
        ["Component", "Configuration"],
        [
            ["Operating system", "Windows 10 / 11 (64-bit)"],
            ["Processor / memory", "Intel Core i5, 8 GB RAM"],
            ["Frontend", "React development server on http://localhost:3000"],
            ["Backend", "Node.js and Express on http://localhost:5000"],
            ["Database", "MongoDB Community Server on 127.0.0.1:27017"],
            ["ML services", "Pest API 5002, Crop API 5003, Disease API 5004"],
            ["Payment", "eSewa test gateway (EPAYTEST merchant code)"],
            ["API testing", "Postman"],
            ["Browser", "Google Chrome"],
        ],
        cap_title="Test Environment",
    )

    b.h2("5.4 Unit Testing")
    b.para("Unit tests targeted the riskiest functions: password hashing, JWT validation, "
           "permission resolution, and machine learning predictions. Results are in Table 5.2.")
    b.add_table(
        ["Test Case", "Input", "Expected Result", "Actual Result"],
        [
            ["Register a farmer with valid details", "name, email, password", "201 Created; JWT returned; password stored as hash", "Pass"],
            ["Register with an existing email", "duplicate email", "400 Bad Request; duplicate email message", "Pass"],
            ["Hash the password before save", "new Farmer document", "password field contains a bcrypt hash", "Pass"],
            ["Compare correct password", "correct candidate password", "comparePassword returns true", "Pass"],
            ["Compare wrong password", "incorrect candidate password", "comparePassword returns false", "Pass"],
            ["Generate a valid JWT", "farmer id", "token verifies with JWT_SECRET and contains the id", "Pass"],
            ["Verify an expired token", "token signed with short expiry", "401 Invalid or expired token", "Pass"],
            ["Resolve role permissions", "Farmer role document", "Farmer permission set returned", "Pass"],
            ["Deny missing permission", "request without products:manage_all", "403 Insufficient permissions", "Pass"],
            ["Merge permission override", "Farmer role plus an extra permission", "merged set contains the override", "Pass"],
        ],
        cap_title="Unit Test Cases and Results",
    )

    b.h2("5.5 Integration Testing")
    b.para("Integration testing verified the Express backend against the machine learning "
           "services and MongoDB, exercising each REST endpoint with valid, invalid, and "
           "boundary inputs. Results are in Table 5.3.")
    b.add_table(
        ["Endpoint", "Input", "Expected Result", "Actual Result"],
        [
            ["POST /api/pest-alert/pest-risk", "valid 6-feature JSON", "risk_level returned by service on port 5002", "Pass"],
            ["POST /api/crop-recommendation/recommend", "valid 7-feature JSON", "recommended crop, confidence, top 5, tips", "Pass"],
            ["POST /api/crop-recommendation/recommend", "missing ph field", "400 with missing-fields message", "Pass"],
            ["POST /api/disease/predict", "jpeg leaf image (multipart)", "recognized class, cause, cure, confidence", "Pass"],
            ["POST /api/disease/predict", "non-image file", "400 Only image files allowed", "Pass"],
            ["POST /api/records", "disease record payload", "record persisted and returned", "Pass"],
            ["GET /api/records", "authenticated farmer", "records filtered to that farmer", "Pass"],
            ["POST /api/products", "seller product payload", "product created with approvalStatus pending", "Pass"],
            ["GET /api/products", "public request", "only approved products returned", "Pass"],
            ["POST /api/orders", "items and shipping address", "order created; COD stock decremented", "Pass"],
            ["POST /api/orders/esewa/initiate", "order id owned by the user", "formData with HMAC signature returned", "Pass"],
            ["POST /api/orders/esewa/verify", "status-API response for a paid order", "order marked paid; stock decremented", "Pass"],
            ["GET /api/admin/farmers", "request without admin permission", "403 Insufficient permissions", "Pass"],
        ],
        cap_title="Integration Test Cases and Results",
    )

    b.h2("5.6 System Testing")
    b.para("System testing executed complete user journeys in the browser, exercising every "
           "module together. Principal cases are listed in Table 5.4.")
    b.add_table(
        ["Test Case", "Steps", "Expected Result", "Actual Result"],
        [
            ["User registration and login", "Register a new farmer, then log in", "Account created; dashboard opens after login", "Pass"],
            ["Crop record submission", "Fill crop form and submit", "Record saved and shown in previous records", "Pass"],
            ["Pest risk prediction", "Submit six pest features", "Risk level with probability displayed", "Pass"],
            ["Crop recommendation", "Submit seven soil/climate parameters", "Recommended crop, tips, similar conditions shown", "Pass"],
            ["Disease recognition", "Upload a diseased leaf image", "Disease, cause, cure, and medicines shown", "Pass"],
            ["Shop and product detail", "Browse shop and open a product", "Approved products listed; detail page opens", "Pass"],
            ["Add to cart and checkout (COD)", "Add product, fill address, pay on delivery", "Order placed; stock decremented; order in history", "Pass"],
            ["Checkout with eSewa", "Choose eSewa and pay on the gateway", "Redirected to gateway; order verified and marked paid", "Pass"],
            ["Admin product approval", "Approve a pending product as admin", "Product becomes visible in the public shop", "Pass"],
            ["Admin farmer verification", "Verify a farmer as admin", "Verification status updated", "Pass"],
            ["Role and permission update", "Add a permission to a role as admin", "Role permissions updated and enforced", "Pass"],
        ],
        cap_title="System Test Cases and Results",
    )
    b.para("A screenshot of the end-to-end session is reserved in Figure 5.1.")
    b.figure_placeholder("<< INSERT SCREENSHOT: End-to-end flow - order placed and visible in My Orders >>",
                         "End-to-End Order Flow")

    b.h2("5.7 Payment Flow Testing")
    b.para("Payment processing is the most sensitive workflow, so both methods were tested "
           "separately with additional scenarios. Results are in Table 5.5.")
    b.add_table(
        ["Scenario", "Expected Result", "Actual Result"],
        [
            ["COD order placed with sufficient stock", "Order created; paymentStatus unpaid; stock reduced", "Pass"],
            ["COD order cancelled by admin", "Stock restored to the product", "Pass"],
            ["eSewa initiation for an order owned by another user", "403 Unauthorized", "Pass"],
            ["eSewa initiation with valid owner", "Signed formData returned with gateway URL", "Pass"],
            ["eSewa payment completed on gateway", "Backend verifies via status API; order marked paid; stock reduced", "Pass"],
            ["eSewa payment cancelled by the user", "Order remains unpaid; stock unchanged", "Pass"],
            ["Repeated verification of the same transaction", "Order remains paid; no duplicate stock deduction", "Pass"],
        ],
        cap_title="Payment Flow Test Cases and Results",
    )
    b.para("The eSewa tests used the sandbox gateway with the EPAYTEST merchant code; production "
           "requires a live account. A screenshot is reserved in Figure 5.2.")
    b.figure_placeholder("<< INSERT SCREENSHOT: Payment success page after eSewa verification >>",
                         "eSewa Payment Success")

    b.h2("5.8 Performance and Security Testing")
    b.para("Performance testing measured endpoint response times. All responded within one to "
           "three seconds, meeting the three-second requirement of Chapter 3. Results are in "
           "Table 5.6.")
    b.add_table(
        ["Endpoint", "Average Response Time", "Requirement", "Result"],
        [
            ["POST /api/auth/login", "~0.3 s", "<= 3 s", "Satisfied"],
            ["POST /api/crop-recommendation/recommend", "~0.8 s", "<= 3 s", "Satisfied"],
            ["POST /api/pest-alert/pest-risk", "~0.2 s", "<= 3 s", "Satisfied"],
            ["POST /api/disease/predict", "~1.5 s", "<= 3 s", "Satisfied"],
            ["GET /api/records", "~0.1 s", "<= 3 s", "Satisfied"],
            ["POST /api/orders", "~0.4 s", "<= 3 s", "Satisfied"],
        ],
        cap_title="Performance Test Results",
    )
    b.para("Security testing verified that password hashes never leave the server, protected "
           "endpoints reject missing or invalid tokens, administrative endpoints require "
           "permissions, and helmet headers are present. Results are in Table 5.7.")
    b.add_table(
        ["Test", "Expected Result", "Actual Result"],
        [
            ["Password not present in registration response", "Password hash absent from JSON", "Pass"],
            ["Access a protected endpoint without a token", "401 No token", "Pass"],
            ["Access a protected endpoint with an invalid token", "401 Invalid or expired token", "Pass"],
            ["Admin endpoint accessed by a farmer", "403 Insufficient permissions", "Pass"],
            ["Upload a file larger than 10 MB", "Request rejected by multer", "Pass"],
            ["Upload a non-image file", "400 Only image files allowed", "Pass"],
            ["Security headers present (helmet)", "X-Content-Type-Options, CSP headers set", "Pass"],
            ["Temporary upload files cleaned up", "No files remain in temp_uploads", "Pass"],
        ],
        cap_title="Security Test Cases and Results",
    )

    b.h2("5.9 User Acceptance Testing")
    b.para("Acceptance testing involved the project supervisor and ten students and farmers. "
           "All ten completed registration, crop recommendation, and an order; eight finished "
            "the eSewa flow, two chose cash on delivery. They suggested a native app, "
            "and a Nepali interface.")

    b.h2("5.10 Evaluation of Objectives")
    b.para("The seven Chapter 1 objectives are evaluated against the system in Table 5.8.")
    b.add_table(
        ["Objective", "Delivered Implementation", "Status"],
        [
            ["Responsive web platform", "React SPA with farmer, seller, and admin layouts", "Achieved"],
            ["Crop recommendation model", "Random Forest service with confidence, top five crops, tips, similar conditions", "Achieved"],
            ["Pest risk prediction model", "Gaussian Naive Bayes service on six features", "Achieved"],
            ["Plant disease recognition", "EfficientNetB4 service with 39 classes, medicines, and shop suggestions", "Achieved"],
            ["Marketplace, cart, orders, payments", "Shop, cart, checkout, COD, and eSewa with signature verification", "Achieved"],
            ["Administrative module", "User, farmer, product, order, medicine, role, and permission management", "Achieved"],
            ["Testing and analysis", "Unit, integration, system, and acceptance testing completed", "Achieved"],
        ],
        cap_title="Evaluation of Project Objectives",
    )


