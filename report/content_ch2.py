# -*- coding: utf-8 -*-
"""Chapter 2: Background Study and Literature Review."""


def build(b):
    b.start_chapter(2)
    b.h1("2. Background Study and Literature Review")

    b.h2("2.1 Background Study")
    b.para("Farming decisions have traditionally rested on experience and local custom. Under "
            "increasing production pressure, agriculture has adopted machine learning and digital "
            "commerce as its two main technological pillars [4].")

    b.para("Machine learning learns patterns from historical data and predicts new observations "
           "[10]. Gaussian Naive Bayes, K-Nearest Neighbors, and Random Forest map soil and climate "
           "to suitable crops, Bayesian classifiers estimate pest-outbreak probability, and "
           "EfficientNet and ResNet classify leaf images [5], [6], [11].")

    b.para("An online marketplace reduces intermediaries between producers and consumers of "
           "agricultural inputs [7]. Digital wallets such as eSewa pay merchants, who submit a "
           "signed message with an HMAC-SHA256 signature and verify transactions via the gateway "
           "status API [12].")

    b.para("Role-based access control assigns permissions to roles, such as Farmer and Admin, and "
           "checks them server-side before a privileged operation [13]. Smart Agro applies this "
           "model so only authorized users manage products, orders, medicines, and roles.")

    b.h2("2.2 Literature Review")
    b.para("Studies related to Smart Agro\u2019s components were reviewed and are summarized below.")

    b.h3("2.2.1 Smart Farming and Precision Agriculture")
    b.para("Precision agriculture emerged in the 1990s, guiding decisions with site-specific data "
            "before broadening into smart farming with sensors, cloud, and analytics [14]. "
            "Wolfert et al. found data-driven services improve farm management, though data ownership "
           "and interoperability remain unresolved [4]; Nepalese adoption is constrained by "
           "infrastructure, literacy, and farm scale [1], [2]. Smart Agro keeps requirements modest: "
           "commodity hardware, free software, a web browser.")

    b.h3("2.2.2 Crop Recommendation Systems")
    b.para("Veenadhari et al. applied decision-tree data mining to forecast crop yield [15]; Random "
           "Forest and KNN achieved the highest accuracy, often above 95% [16], [17]. "
           "Priyadharshini et al. combined soil nutrients and climate for crop recommendation [18]. "
           "These results guided Smart Agro\u2019s Random Forest service, which also returns "
           "confidence, top-five candidates, growing tips, and similar-condition matches.")

    b.h3("2.2.3 Pest Risk Prediction")
    b.para("Machine learning predicts pest outbreaks from weather and field data; Bayesian "
            "classifiers model outbreak probability given environmental conditions [19], and "
            "Domingues et al. surveyed ML for "
            "crop pest prediction [20]. Smart Agro applies Gaussian Naive Bayes to temperature, "
            "humidity, rainfall, crop, growth stage, and pest history, returning a risk level and "
            "probability.")

    b.h3("2.2.4 Plant Disease Detection using CNN")
    b.para("Mohanty et al. fine-tuned CNNs on PlantVillage, exceeding 99% accuracy [21]; Ferentinos "
           "confirmed that modern CNNs generalize across disease classes [22]. Kamilaris and "
           "Prenafeta-Bold\u00fa found CNNs most effective for image classification [5], and Too et "
           "al. recommended EfficientNet-style architectures as an accuracy-size trade-off [23]. "
           "Smart Agro follows this line with a pre-trained EfficientNetB4 fine-tuned for "
           "thirty-nine classes at 160x160 and a confidence threshold.")

    b.h3("2.2.5 Agricultural E-Commerce")
    b.para("E-commerce can reduce agricultural market fragmentation, but trust, logistics, and "
            "digital payment infrastructure are the principal barriers [24]. Agricultural "
            "marketplaces also face product-quality verification, seasonal availability, and "
            "perishability. Smart Agro addresses trust through administrator approval of every "
            "listed product and verified seller profiles.")

    b.h3("2.2.6 Digital Payment Systems")
    b.para("Digital payment systems transfer value electronically. The eSewa gateway (F1Soft "
           "International, Nepal) uses a signed form, an HMAC-SHA256 signature over amount, "
           "transaction UUID, and product code, and a status API for verification [12]. Smart Agro "
           "integrates this flow, with cash on delivery as fallback.")

    b.h3("2.2.7 Role-Based Access Control")
    b.para("Role-based access control (RBAC) assigns permissions to roles rather than users and has "
           "been the dominant enterprise authorization model since Sandhu et al. [13]. Smart Agro "
           "implements a permission-based variant in which roles such as Farmer and Admin hold "
           "permission sets, per-user overrides can extend or restrict them, and middleware verifies "
           "the required permission before privileged routes [25].")

    b.h3("2.2.8 Machine Learning Algorithms Used")
    b.para("Naive Bayes. Gaussian Naive Bayes applies Bayes\u2019 theorem, assuming conditional "
           "independence and modelling continuous features with Gaussians, then selecting the highest "
           "posterior class [19]. It trains fast, needs little data, and suits the small pest dataset.")
    b.para("Random Forest. Random Forest ensembles decision trees on bootstrap samples and random "
           "feature subsets, voting by majority [26]. It is robust to noise, handles non-linearity, "
           "and yields per-feature importance scores.")
    b.para("K-Nearest Neighbors. K-Nearest Neighbors classifies by the majority class among k "
           "nearest neighbours under Euclidean distance [27]. KNN was evaluated experimentally and "
           "powers the similar-conditions search.")
    b.para("EfficientNetB4. EfficientNet families arise from compound scaling of depth, width, and "
           "resolution [28]. Smart Agro fine-tunes an EfficientNetB4 backbone, pre-trained on "
           "ImageNet, for plant disease recognition [29].")

    b.h3("2.2.9 Transfer Learning")
    b.para("Transfer learning reuses knowledge from one task to improve a related one [29]; "
           "ImageNet pre-trained networks are fine-tuned on smaller datasets, cutting labelled-data "
           "and training requirements. Smart Agro adopts this for its disease model.")

    b.h3("2.2.10 Explainable AI")
    b.para("Explainable AI makes model decisions understandable; feature importance, probability "
           "outputs, and saliency maps are common tools [30]. Farmers must trust advice before "
           "acting. Smart Agro returns prediction confidence, top candidate probabilities, and "
           "disease cause and cure.")

    b.h3("2.2.11 Comparison of Existing Systems")
    b.para("Table 2.1 compares Smart Agro with representative existing systems.")
    b.add_table(
        ["System", "Crop Advice", "Disease Detection", "Marketplace", "Payments", "Admin Panel"],
        [
            ["Generic farming apps", "Basic tips", "No", "No", "No", "No"],
            ["Crop recommendation tools", "Yes", "No", "No", "No", "No"],
            ["Disease detection apps", "No", "Yes", "No", "No", "No"],
            ["Agricultural marketplaces", "No", "No", "Yes", "Yes", "Partial"],
            ["Smart Agro (this project)", "Yes", "Yes", "Yes", "Yes", "Yes"],
        ],
        cap_title="Comparison of Existing Systems",
    )

    b.h3("2.2.12 Research Gap")
    b.para("Most systems address a single problem; few combine advisory intelligence, commerce, "
            "and secure payment, and fewer add permission-based administration. "
            "Smart Agro closes this gap by integrating three ML services, a "
            "marketplace, eSewa payments, and a role-based admin panel, recording every analysis and "
            "transaction.")
