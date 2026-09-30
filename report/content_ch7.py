# -*- coding: utf-8 -*-
"""Chapter 7: Conclusion and Future Work."""


def build(b):
    b.start_chapter(7)
    b.h1("7. Conclusion and Future Work")

    b.h2("7.1 Conclusion")
    b.para("The Smart Agro project shows that advisory services, a marketplace, "
           "and digital payments can be integrated into one platform. All seven objectives were "
           "achieved, workflows passed every test level, and payments were verified against the "
           "eSewa gateway, meeting all functional and non-functional requirements.")

    b.h2("7.2 Advantages of the System")
    b.bullets([
        "The system integrates advisory services and digital commerce in a "
        "single platform, so a farmer no longer needs to switch between disconnected tools.",
        "The machine learning services return confidence scores, top candidates, growing tips, "
        "and similar-condition matches, which helps farmers interpret and trust the advice.",
        "The permission-based role model protects administrative functions and supports product "
        "approval and farmer verification workflows that build trust in the marketplace.",
        "The eSewa integration with HMAC-SHA256 signatures and server-side verification provides "
        "a secure digital payment channel in addition to cash on delivery.",
        "The layered, service-oriented architecture allows each machine learning model to be "
        "retrained or replaced independently.",
        "All technologies used are free and open source, keeping the system affordable for an "
        "academic project and reproducible by future students.",
    ])

    b.h2("7.3 Limitations of the System")
    b.para("The limitations observed during testing, consistent with Chapter 1, are restated "
           "briefly:")
    b.bullets([
        "The machine learning services run locally and are not containerized or deployed to a "
        "cloud server.",
        "The eSewa integration operates with test credentials and requires production merchant "
        "credentials for live transactions.",
        "The pest dataset contains only seventeen records and the crop dataset about 2,200 "
        "records, so predictions may not generalize to regions outside the training "
        "distribution.",
        "The application is web-based only; no native mobile application exists.",
    ])

    b.h2("7.4 Future Enhancements")
    b.numbered([
        "Deploy the machine learning services as containers with a reverse proxy and HTTPS, and "
        "host the database on a managed cloud service.",
        "Integrate a live eSewa merchant account and add additional payment options such as "
        "Khalti and bank transfer.",
        "Expand the training datasets and add an active-learning loop that retrains the models "
        "as new field data is collected.",
        "Add a native or progressive web application for farmers, with offline support and "
        "Nepali-language localization.",
        "Add SMS or in-app push notifications for pest alerts and order updates, and a "
        "geo-spatial pest alert map based on the pest alert collection.",
    ])
