# -*- coding: utf-8 -*-
"""Chapter 4: Implementation."""


def build(b):
    b.start_chapter(4)
    b.h1("4. Implementation")

    b.h2("4.1 Introduction")
    b.para("This chapter describes the Smart Agro implementation following the design in Chapter 3 "
            "across three layers: the React frontend, the Express backend, and the Python ML services. "
            "Code snippets are presented with screenshot placeholders for "
            "later insertion.")

    b.h2("4.2 Development Tools and Technologies")
    b.para("Table 4.1 lists the technologies used, all free and open source to keep costs low "
           "[32], [39].")
    b.add_table(
        ["Layer", "Technology", "Version", "Purpose"],
        [
            ["Frontend", "React", "18.x", "User interface as a single-page application"],
            ["Frontend", "React Router", "6.x", "Client-side routing"],
            ["Frontend", "axios", "1.x", "HTTP client for the REST API"],
            ["Backend", "Node.js / Express", "20.x / 4.x", "REST API server"],
            ["Backend", "Mongoose", "8.x", "MongoDB object data modelling"],
            ["Backend", "jsonwebtoken", "9.x", "JWT generation and verification"],
            ["Backend", "bcryptjs", "2.x", "Password hashing"],
            ["Backend", "multer", "1.x", "Image upload handling"],
            ["Backend", "helmet / cors / morgan", "7.x", "Security headers, CORS, logging"],
            ["Database", "MongoDB Community Server", "7.x", "Document database"],
            ["ML", "Python 3.9 / FastAPI / uvicorn", "-", "Machine learning microservices"],
            ["ML", "scikit-learn", "1.x", "Naive Bayes and Random Forest models"],
            ["ML", "TensorFlow / Keras", "2.x", "EfficientNetB4 disease model"],
        ],
        cap_title="Development Tools and Technologies",
    )
    b.para("Development used Visual Studio Code and Git. A single concurrently command starts the "
           "frontend on port 3000, the backend on port 5000, and the Python services on ports "
           "5002-5004.")

    b.h2("4.3 Backend Implementation (Node.js and Express)")

    b.h3("4.3.1 Server Setup and Middleware")
    b.para("The entry point index.js configures Express, connects MongoDB, and registers routes, "
            "hardened via helmet, cors, and morgan [40] (Listing 4.1).")
    b.code(
        "const express = require('express');\n"
        "const connectDb = require('./config/db');\n"
        "\n"
        "const app = express();\n"
        "\n"
        "app.use(helmet());\n"
        "app.use(morgan('dev'));\n"
        "app.use(express.json({ limit: '10mb' }));\n"
        "app.use(cors({ origin: true, methods: ['GET','POST','PUT','DELETE','OPTIONS'] }));\n"
        "\n"
        "app.use('/api/auth', authRoutes);\n"
        "app.use('/api/records', recordRoutes);\n"
        "app.use('/api/products', productRoutes);\n"
        "app.use('/api/orders', orderRoutes);\n"
        "app.use('/api/pest-alert', pestAlertRoute);\n"
        "app.use('/api/crop-recommendation', cropRecommendationRoute);\n"
        "app.use('/api/disease', diseaseRoute);\n"
        "\n"
        "const startServer = async () => {\n"
        "  await connectDb();\n"
        "  app.listen(process.env.PORT || 5000);\n"
        "};\n"
        "startServer();",
        cap_title="Express Server Setup (Listing 4.1)",
    )
    b.para("Middleware order matters: security headers are applied first, then logging, JSON "
            "parsing, and CORS, followed by the route registration that maps each resource to its "
            "controllers.")

    b.h3("4.3.2 Authentication and Password Security")
    b.para("Authentication uses JWT with bcrypt hashing [37], [38]. The Farmer model hashes "
           "modified passwords with a salt factor of twelve and strips the hash from serialized "
           "documents; login verifies via comparePassword() and returns a seven-day token. The "
           "auth middleware validates the Bearer token, loads the farmer, and rejects invalid or "
           "expired tokens with 401 (Listing 4.2).")
    b.code(
        "const authMiddleware = async (req, res, next) => {\n"
        "  const token = req.header('Authorization')?.split(' ')[1];\n"
        "  if (!token) {\n"
        "    return res.status(401).json({ message: 'No token, authorization denied.' });\n"
        "  }\n"
        "  try {\n"
        "    const decoded = jwt.verify(token, process.env.JWT_SECRET);\n"
        "    const farmer = await Farmer.findById(decoded.id).select('-password');\n"
        "    if (!farmer) {\n"
        "      return res.status(401).json({ message: 'User not found.' });\n"
        "    }\n"
        "    req.user = farmer;\n"
        "    next();\n"
        "  } catch (err) {\n"
        "    res.status(401).json({ message: 'Invalid or expired token.' });\n"
        "  }\n"
        "};",
        cap_title="Authentication Middleware (Listing 4.2)",
    )

    b.h3("4.3.3 Role-Based Access Control")
    b.para("Authorization follows the permission-based RBAC model of Chapter 2 [13], [25]. "
           "Permission strings are defined centrally, and each role holds a subset. The "
           "requirePermission middleware merges role permissions with per-user overrides and "
           "rejects missing permissions with 403 (Listing 4.3).")
    b.code(
        "const requirePermission = (...requiredPerms) => {\n"
        "  return async (req, res, next) => {\n"
        "    const role = await Role.findOne({ name: req.user.role });\n"
        "    const rolePerms = role ? role.permissions : [];\n"
        "    const merged = new Set([...rolePerms, ...(req.user.permissionsOverride || [])]);\n"
        "    req.permissions = [...merged];\n"
        "    const hasAll = requiredPerms.every(p => merged.has(p));\n"
        "    if (!hasAll) {\n"
        "      return res.status(403).json({ success: false, message: 'Insufficient permissions' });\n"
        "    }\n"
        "    next();\n"
        "  };\n"
        "};\n"
        "\n"
        "// example permission definitions\n"
        "'products:manage_all':   'CRUD any product',\n"
        "'orders:manage_all':     'View/update any order',\n"
        "'admin:access':          'Access admin dashboard',",
        cap_title="Permission Middleware (Listing 4.3)",
    )
    b.para("A route such as product approval is declared as router.put('/:id/approve', auth, "
           "requirePermission('products:manage_all'), approveProduct). Server-side checks prevent "
           "clients from accessing administrative functions.")

    b.h3("4.3.4 Crop, Pest, and Disease Proxy Routes")
    b.para("The backend never exposes the ML services directly; thin proxy routes validate "
           "requests, forward them over HTTP, and relay the responses. The pest proxy posts six "
           "features to port 5002; the crop proxy validates the seven required fields and returns "
           "503 when the service is offline; the disease route handles multipart uploads via "
           "multer [43].")

    b.h2("4.4 Marketplace, Cart, Orders, and Payment")

    b.h3("4.4.1 Product Catalogue and Cart")
    b.para("Products carry an approvalStatus field; the public shop returns only approved "
           "products from non-blocked sellers, while my-listings shows the seller's own items. "
           "The cart lives in local storage, synced via a cart-updated event and a floating "
           "badge, and is submitted as an items array at checkout.")

    b.h3("4.4.2 Order Placement and Stock Management")
    b.para("The order controller validates stock, computes the total, and creates an order "
           "embedding item snapshots, shipping address, and payment method. Stock is decremented "
           "immediately for cash-on-delivery, but for eSewa only after payment verification.")

    b.h3("4.4.3 eSewa Digital Payment Integration")
    b.para("The eSewa gateway uses the merchant payment flow [12]. The initiation endpoint "
           "builds the message with total amount, transaction UUID, and product code, computes "
           "the HMAC-SHA256 signature with the shared secret, and returns the form fields and "
           "gateway URL [42] (Listing 4.4).")
    b.code(
        "const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},`\n"
        "                + `product_code=${productCode}`;\n"
        "const hmac = crypto.createHmac('sha256', secretKey);\n"
        "hmac.update(message);\n"
        "const signature = hmac.digest('base64');\n"
        "\n"
        "const formData = {\n"
        "  amount, tax_amount: '0', total_amount: totalAmount,\n"
        "  transaction_uuid: transactionUuid, product_code: productCode,\n"
        "  product_service_charge: '0', product_delivery_charge: '0',\n"
        "  success_url: process.env.ESEWA_SUCCESS_URL,\n"
        "  failure_url: process.env.ESEWA_FAILURE_URL,\n"
        "  signed_field_names: 'total_amount,transaction_uuid,product_code',\n"
        "  signature,\n"
        "};",
        cap_title="eSewa HMAC-SHA256 Signature Generation (Listing 4.4)",
    )
    b.para("The checkout page posts the order, requests initiation, and dynamically submits a "
           "hidden-field form to the gateway URL. For cash on delivery it clears the cart and "
           "redirects to my-orders.")
    b.para("After payment, eSewa redirects to the success URL, where the verify endpoint queries "
           "the transaction status API. On COMPLETE state the order is marked paid and stock is "
           "finally decremented (Listing 4.5).")
    b.code(
        "const url = `https://rc-epay.esewa.com.np/api/epay/transaction/status/`\n"
        "  + `?product_code=${productCode}&total_amount=${totalAmount}`\n"
        "  + `&transaction_uuid=${transactionUuid}`;\n"
        "\n"
        "const response = await new Promise((resolve, reject) => {\n"
        "  https.get(url, (resp) => {\n"
        "    let data = '';\n"
        "    resp.on('data', chunk => data += chunk);\n"
        "    resp.on('end', () => {\n"
        "      try { resolve(JSON.parse(data)); } catch { resolve(data); }\n"
        "    });\n"
        "  }).on('error', reject);\n"
        "});\n"
        "\n"
        "if (response.status === 'COMPLETE' || response?.state === 'completed') {\n"
        "  order.paymentStatus = 'paid';\n"
        "  order.transactionId = transaction_code || response.transaction_code;\n"
        "  await order.save();\n"
        "  for (const item of order.items) {\n"
        "    await Product.findByIdAndUpdate(item.product,\n"
        "      { $inc: { stock: -item.quantity } });\n"
        "  }\n"
        "}",
        cap_title="eSewa Payment Verification (Listing 4.5)",
    )

    b.h2("4.5 Frontend Implementation (React)")

    b.h3("4.5.1 Routing and Layout")
    b.para("App.js assembles the SPA with React Router [39]: authentication pages render without "
           "a sidebar, farmer pages use a collapsible sidebar layout with the cart badge, and "
           "admin pages use a dedicated layout.")


    b.h3("4.5.2 Dashboard")
    b.para("The dashboard is the farmer's landing page. A crop record form collects the crop "
            "name, date, quantity, and description; on submission the record is saved via the "
            "records API and appears on the previous records page.")
    b.figure_placeholder("<< INSERT SCREENSHOT: Farmer Dashboard >>",
                         "Farmer Dashboard")

    b.h3("4.5.3 Disease Recognition Page")
    b.para("The disease page posts an uploaded image as multipart data to the proxy, returning "
           "class, cause, cure, confidence, top three predictions, and matching medicines. The "
           "farmer can save the record or purchase related products (Figure 4.2).")
    b.figure_placeholder("<< INSERT SCREENSHOT: Disease recognition result with cause, cure, and confidence >>",
                         "Disease Recognition Result")

    b.h3("4.5.4 Crop Recommendation and Pest Risk Pages")
    b.para("The crop recommendation form collects seven soil and climate parameters and displays "
           "the recommended crop, confidence, top five candidates, growing tips, and "
           "similar-condition crops. The pest form displays the six-feature risk level and "
           "probability; both pages save records (Figure 4.3 and Figure 4.4).")
    b.figure_placeholder("<< INSERT SCREENSHOT: Crop recommendation result with top five crops and tips >>",
                         "Crop Recommendation Result")
    b.figure_placeholder("<< INSERT SCREENSHOT: Pest risk prediction result >>",
                         "Pest Risk Prediction Result")

    b.h3("4.5.5 Shop, Cart, Checkout, and Orders")
    b.para("The shop lists approved products by category with search and a cart badge, and each "
           "card opens a detail page. Checkout collects the address, chooses cash-on-delivery or "
           "eSewa, and submits the order (Section 4.4); my-orders shows status and payment state "
           "(Figure 4.5, Figure 4.6, Figure 4.7).")
    b.figure_placeholder("<< INSERT SCREENSHOT: Shop page with product catalogue >>",
                         "Agricultural Marketplace (Shop)")
    b.figure_placeholder("<< INSERT SCREENSHOT: Checkout page with shipping form and payment methods >>",
                         "Checkout Page with Payment Options")
    b.figure_placeholder("<< INSERT SCREENSHOT: eSewa payment gateway page >>",
                         "eSewa Payment Gateway")

    b.h2("4.6 Machine Learning Services")

    b.h3("4.6.1 Pest Risk Service (FastAPI, Port 5002)")
    b.para("The pest service loads the serialized Gaussian Naive Bayes pipeline at startup, "
           "validates the six inputs with Pydantic, and exposes POST /predict and GET /health, "
           "converting the JSON into a one-row DataFrame for the pipeline [32].")

    b.h3("4.6.2 Crop Recommendation Service (Port 5003)")
    b.para("The crop service loads a trained model or retrains a Random Forest with one hundred "
           "trees on roughly 2,200 samples of twenty-two crops. It scales the input, predicts, "
           "ranks probabilities, and returns confidence, top five recommendations, growing tips, "
           "and similar-condition matches via Euclidean distance (Listing 4.6).")
    b.code(
        "input_scaled = self.scaler.transform(input_df)\n"
        "prediction_encoded = self.model.predict(input_scaled)[0]\n"
        "predicted_crop = self.label_encoder.inverse_transform(\n"
        "    [prediction_encoded])[0]\n"
        "\n"
        "prediction_proba = self.model.predict_proba(input_scaled)[0]\n"
        "confidence = max(prediction_proba) * 100\n"
        "\n"
        "# rank all crops by probability\n"
        "for i, crop in enumerate(self.crop_names):\n"
        "    crop_probabilities.append(CropProbability(\n"
        "        crop=crop,\n"
        "        probability=round(prediction_proba[i] * 100, 2)))\n"
        "crop_probabilities.sort(key=lambda x: x.probability, reverse=True)\n"
        "top_recommendations = crop_probabilities[:5]",
        cap_title="Crop Prediction and Ranking (Listing 4.6)",
    )
    b.para("It also exposes POST /retrain to retrain with random forest, naive Bayes, or SVM "
           "without changing the client interface, plus GET /health.")

    b.h3("4.6.3 Disease Recognition Service (Port 5004)")
    b.para("The disease service loads the fine-tuned EfficientNetB4 model and disease database. "
           "It pads the image to a square, resizes to 160x160, and reports the top three "
           "classes; a 0.5 confidence threshold returns Unrecognized [28], [41] (Listing 4.7).")
    b.code(
        "probs = predictions[0]\n"
        "top3_idx = np.argsort(probs)[-3:][::-1]\n"
        "top3 = [{'label': LABELS[int(i)],\n"
        "         'probability': float(round(probs[int(i)] * 100, 2))}\n"
        "        for i in top3_idx]\n"
        "\n"
        "max_idx = int(predictions.argmax())\n"
        "confidence = float(probs[max_idx])\n"
        "if confidence < 0.5:\n"
        "    return {'success': True, 'recognized': False,\n"
        "            'name': 'Unrecognized', 'confidence': confidence * 100,\n"
        "            'top3': top3}\n"
        "\n"
        "label_name = LABELS[max_idx]\n"
        "disease_info = next((d for d in disease_db if d['name'] == label_name), {})\n"
        "return {'success': True, 'recognized': True, 'name': label_name,\n"
        "        'cause': disease_info.get('cause'),\n"
        "        'cure': disease_info.get('cure'),\n"
        "        'confidence': confidence * 100, 'top3': top3}",
        cap_title="Disease Inference and Confidence Threshold (Listing 4.7)",
    )

    b.h2("4.7 Admin Panel")
    b.para("The admin panel groups six functions under an admin layout: dashboard, user "
            "management, farmer verification, product approval, order management, and medicines, "
            "each route protected by auth and permission middleware. The farmer list aggregates "
            "the products collection to compute counts while excluding password and permissions "
            "(Figure 4.8 and Figure 4.9).")
    b.figure_placeholder("<< INSERT SCREENSHOT: Admin dashboard with summary statistics >>",
                         "Admin Dashboard")
    b.figure_placeholder("<< INSERT SCREENSHOT: Product approval list with approve/reject actions >>",
                         "Admin Product Approval")

    b.h2("4.8 Summary")
    b.para("This chapter presented the implementation across the frontend, backend, and ML services. "
            "Key decisions include stateless JWT with bcrypt, RBAC middleware, the "
            "proxy pattern isolating the ML services, and the HMAC-signed eSewa flow. The next "
            "chapter covers testing.")
