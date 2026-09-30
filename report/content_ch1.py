# -*- coding: utf-8 -*-
"""Chapter 1: Introduction."""
import os
from docx.enum.text import WD_ALIGN_PARAGRAPH
from report_builder import PNG_DIR


def build(b):
    b.start_chapter(1)
    b.h1("1. Introduction")

    b.h2("1.1 Introduction")
    b.para("Agriculture is Nepal's economic backbone, engaging most of the working population and "
           "supplying the food that sustains daily life. Yet it faces persistent pressures: erratic "
           "rainfall and shifting temperatures from climate change, declining soil fertility, pest and "
           "disease outbreaks, and fragmented supply chains reaching consumers through many "
           "intermediaries [1], [2]. Farmers make planting and input decisions from habit, folklore, "
           "and personal experience rather than measured field data, causing underperforming crops, "
           "wasted inputs, and delayed responses [3].")
    b.para("Modern information technology offers a credible response. Smart farming, or precision "
            "agriculture, combines machine learning and web software to monitor growing conditions and "
            "ground decisions in evidence [4]. One model examines "
           "soil and climate parameters to recommend the most suitable crop; another estimates pest "
           "outbreak probability from environmental conditions and warns the farmer early; a third "
           "recognizes plant disease from a leaf photograph and suggests treatment [5], [6]. Coupled "
           "with an online marketplace, farmers can buy seeds, fertilizers, pesticides, and equipment "
           "directly from verified sellers and pay digitally, shortening the supply chain and "
           "improving transaction fairness [7].")
    b.para("This report documents the design, implementation, and testing of Smart Agro, an integrated "
            "smart farming web application built on three pillars. A React-based responsive frontend "
            "offers a dashboard, crop and pest analysis tools, disease recognition, a shop with a "
            "shopping cart, and an admin panel. A Node.js and Express backend provides a RESTful API, "
            "JWT-based authentication, and role-based access control, "
            "backed by MongoDB. Three independent Python machine learning services provide pest risk "
            "prediction (Gaussian Naive Bayes), crop recommendation (Random Forest), and plant disease "
            "recognition (EfficientNetB4 CNN).")
    b.para("The remainder of this chapter states the problem that motivated the project, defines its "
           "objectives, scope, and limitations, describes the development methodology, and outlines "
           "the organization of the remaining chapters.")

    b.h2("1.2 Problem Statement")
    b.para("Smallholder farmers face a series of interrelated problems that conventional practice does "
           "not resolve. Crop selection is rarely based on a scientific assessment of soil and climate; "
           "instead, farmers often repeat the crops grown by their neighbours, even when those crops "
           "are ill-suited to the local conditions. Pest damage arrives with little or no warning, and "
           "by the time the problem is visible the crop has already suffered significant loss. Plant "
           "diseases are frequently misidentified, and the remedies applied are either ineffective or "
           "harmful. At the same time, the agricultural input market is fragmented: farmers must travel "
           "to distant markets to buy seeds and agro-chemicals, pay inflated prices, and have few "
           "options for digital payment or home delivery [8].")
    b.para("Existing software solutions address only part of this picture. Some mobile applications "
            "offer generic agricultural advice; others provide disease identification; still others "
            "operate as conventional marketplaces. Very few systems bring advisory intelligence "
            "and digital commerce together under one platform with proper "
           "role separation between farmers, sellers, and administrators [9]. As a consequence, a "
           "farmer must switch between several disconnected tools, none of which holds the complete "
           "record of his or her farming activity. This fragmentation reduces the usefulness of each "
           "individual tool and prevents the accumulation of a consistent history of crop, disease, and "
           "recommendation records that could support better long-term decisions.")
    b.para("Smart Agro addresses this problem by integrating the full decision-support and commerce "
           "workflow into a single system. It provides scientifically grounded crop and pest advice, "
            "automated plant disease recognition, a curated marketplace, "
           "and secure digital payments, while maintaining a persistent record of every analysis and "
           "transaction for each farmer. In doing so, the project attempts to reduce the guesswork "
           "inherent in traditional farming and to give smallholder farmers tools that are affordable, "
           "accessible through a normal web browser, and responsive to their actual working conditions.")

    b.h2("1.3 Objectives")
    b.para("The main objective of this project is to design and develop an integrated smart farming "
           "platform that assists farmers with data-driven decision making and provides a digital "
           "marketplace. The specific objectives are:")
    b.numbered([
        "To develop a responsive, web-based smart farming platform that is easy to use for farmers, "
        "sellers, and administrators.",
        "To implement a machine learning model that recommends the most suitable crop on the basis of "
        "soil parameters (nitrogen, phosphorus, potassium, and pH) and climatic parameters "
        "(temperature, humidity, and rainfall), together with a confidence score and cultivation tips.",
        "To implement a pest risk prediction model that estimates the risk level of pest incidence "
        "from temperature, humidity, rainfall, crop type, growth stage, and previous pest incidence.",
        "To implement a plant disease recognition model that classifies an uploaded leaf image into "
        "one of thirty-nine disease classes and suggests appropriate chemical and organic medicines "
        "as well as related shop products.",
        "To provide an agricultural marketplace with product listings, a shopping cart, order "
        "management, cash on delivery, and eSewa digital payment with signature verification.",
        "To provide an administrative module with user management, farmer verification, product "
        "approval, order management, medicine database management, and role-based access control.",
        "To test the system with unit-level and system-level test cases and to analyze the results.",
    ])

    b.h2("1.4 Scope and Limitation")

    b.h3("1.4.1 Scope")
    b.para("The scope of the project covers the complete development lifecycle of the Smart Agro "
           "system, from requirements analysis through design, implementation, and testing. "
           "Functionally, the system includes the following modules:")
    b.bullets([
        "Authentication and profile management: farmer registration, login, profile viewing, and "
        "profile editing, with JWT-based session management.",
        "Dashboard: a crop record submission form and a summary of the farmer's recent advisory "
        "records.",
        "Records module: a persistent history of crop, disease, and recommendation records, each "
        "storing the input parameters, the predicted outcome, the confidence, and any associated "
        "medicines or purchased products.",
        "Pest risk prediction: a form-based module that returns a low, medium, or high pest risk "
        "level using the Gaussian Naive Bayes model.",
        "Crop recommendation: a form-based module that returns the recommended crop, a confidence "
        "score, the top five candidate crops, growing tips, and crops that grow under similar "
        "conditions.",
        "Plant disease recognition: an image-upload module that returns the recognized disease, its "
        "cause and cure, the prediction confidence, the top three predictions, and suggested "
        "medicines and shop products.",
        "Agricultural marketplace: a product catalogue with categories, product detail pages, seller "
        "listings, a shopping cart, checkout, and order history.",
        "Payment: cash on delivery and eSewa digital payment with HMAC-SHA256 signature generation "
        "and server-side payment verification.",
        "Admin panel: user management, farmer verification, product approval, order management, "
        "medicine database management, and role and permission management.",
    ])
    b.para("Non-functionally, the scope includes a responsive and visually consistent user interface "
           "based on a glassmorphism design system, secure password storage using bcrypt, JWT-based "
           "authentication, and role-based access control that restricts administrative functions to "
           "authorized users.")

    b.h3("1.4.2 Limitations")
    b.para("Although the system fulfils its principal objectives, a number of limitations were "
           "identified during development and testing:")
    b.bullets([
        "The machine learning services run locally on ports 5002, 5003, and 5004 and are neither "
        "containerized nor deployed to a cloud server, so availability is limited to the machine on "
        "which they execute.",
        "The eSewa integration uses test (sandbox) credentials with the merchant code EPAYTEST; live "
        "transactions would require production merchant credentials and a secure HTTPS deployment.",
        "The disease recognition model is trained on an offline dataset of thirty-nine classes and "
        "reports images outside these classes as unrecognized.",
        "The crop recommendation model is trained on a dataset of approximately 2,200 samples "
        "covering twenty-two crops and may not generalize reliably to regions whose soil and climate "
        "characteristics differ markedly from the training distribution.",
        "The pest risk dataset contains only seventeen training records, so the pest predictions are "
        "illustrative rather than statistically robust.",
        "The application is web-based only; no native mobile application was developed.",
    ])

    b.h2("1.5 Development Methodology")
    b.para("The project was developed using an iterative, Agile-inspired methodology. This approach "
           "was chosen because the requirements of a smart farming platform are broad and can be "
           "refined progressively, and because an iterative cycle allows continuous feedback between "
           "the developers and the intended users. The development proceeded in the following "
           "phases:")
    b.numbered([
        "Requirement gathering and analysis: functional and non-functional requirements were "
        "collected by studying existing farming workflows, reviewing comparable systems, and "
        "consulting the available datasets that would drive the machine learning models.",
        "System design: the overall architecture, comprising a React frontend, an Express backend, "
        "three Python machine learning services, and MongoDB, was designed together with the "
        "database schema and UML models.",
        "Implementation: development was performed in iterations or sprints, each delivering one or "
        "more modules, such as authentication, the dashboard, the machine learning modules, the "
        "marketplace, payments, and the admin panel.",
        "Testing: each module was verified with unit test cases, and the integrated system was "
        "verified with end-to-end system test cases, covering both cash-on-delivery and eSewa "
        "payment flows.",
        "Deployment and maintenance: the system was deployed locally for demonstration, and the "
        "results were documented in this report.",
    ])
    b.add_figure(
        os.path.join(PNG_DIR, "Agile_Methodology.png"),
        "Iterative Software Development Methodology",
        width_inches=3.6,
    )
    b.para("The main development tools used were Visual Studio Code for code editing, Git and GitHub "
            "for version control, npm and concurrently for dependency and process management, MongoDB "
            "Compass for database inspection, and Postman for API testing. The frontend, backend, and "
            "machine learning services were run "
            "concurrently during development, with the backend proxying prediction requests to the "
            "three Python services.")

    b.h2("1.6 Report Organization")
    b.para("This report is organized into seven chapters. Chapter 1 introduces the project, states its "
           "objectives, scope, and limitations, and describes the development methodology. Chapter 2 "
           "presents the background study and a review of the related literature, covering smart "
           "farming, machine learning in agriculture, and the technical foundations of the system. "
           "Chapter 3 describes the system analysis and design, including requirements analysis, UML "
           "modeling, database design, system architecture, and the algorithms used by the machine "
           "learning models. Chapter 4 presents the implementation details of each module and the "
           "tools used. Chapter 5 describes the testing strategy and the evaluation of the project "
           "objectives. Chapter 6 analyses the results of the machine learning models. Chapter 7 "
           "concludes the report and recommends directions for future enhancement. A list of "
           "references and appendices follow the main chapters.")
