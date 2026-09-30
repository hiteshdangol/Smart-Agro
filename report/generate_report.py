# -*- coding: utf-8 -*-
"""Generate Smart_Agro_Report.docx - Project report for the Smart Agro system.

Follows the formatting rules:
  G. Page numbers: front matter in roman (from certificate page) starting at i,
     main content in numeric starting at 1, centered at the bottom.
  H. A4 page size; margins Top 1", Bottom 1", Right 1", Left 1.25".
  I. All paragraphs justified with 1.5 line spacing.
  J. Times New Roman, 12 pt body.
  K. Headings: chapter 16 pt, section 14 pt, sub-section 12 pt, all bold.
  L. Tables/figures centered; table caption above, figure caption below,
     bold, 12 pt.
"""

import os
from docx import Document
from docx.shared import Pt, RGBColor, Cm, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.section import WD_SECTION_START
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "Smart_Agro_Report.docx")

BRAND = (0x2E, 0xCC, 0x71)
BRAND_DARK = (0x1A, 0x5C, 0x3A)
BRAND_MID = (0x1F, 0x6F, 0x3F)
GRAY = (0x55, 0x55, 0x55)

doc = Document()

# ---------------------------------------------------------------------------
# Base styles
# ---------------------------------------------------------------------------
normal = doc.styles["Normal"]
normal.font.name = "Times New Roman"
normal.font.size = Pt(12)
normal.paragraph_format.space_after = Pt(6)
normal.paragraph_format.line_spacing = 1.5
normal.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
rpr = normal.element.get_or_add_rPr()
rfonts = rpr.get_or_add_rFonts()
rfonts.set(qn("w:eastAsia"), "Times New Roman")


def style_heading(name, size, color, bold=True, italic=False, before=18, after=8):
    st = doc.styles[name]
    st.font.name = "Times New Roman"
    st.font.size = Pt(size)
    st.font.bold = bold
    st.font.italic = italic
    st.font.color.rgb = RGBColor(*color)
    st.paragraph_format.space_before = Pt(before)
    st.paragraph_format.space_after = Pt(after)
    st.paragraph_format.keep_with_next = True


style_heading("Heading 1", 16, BRAND_DARK)
style_heading("Heading 2", 14, BRAND_MID)
style_heading("Heading 3", 12, BRAND_MID)

table_captions = []
figure_captions = []


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def h1(text):
    doc.add_heading(text, level=1)


def h2(text):
    doc.add_heading(text, level=2)


def h3(text):
    doc.add_heading(text, level=3)


def para(text="", bold=False, italic=False, align=None, size=None):
    p = doc.add_paragraph()
    if align is not None:
        p.alignment = align
    run = p.add_run(text)
    run.bold = bold
    run.italic = italic
    if size is not None:
        run.font.size = Pt(size)
    return p


def bullets(items, style="List Bullet"):
    for it in items:
        doc.add_paragraph(it, style=style)


def numbered(items):
    for i, it in enumerate(items, 1):
        p = doc.add_paragraph()
        p.add_run("%d. %s" % (i, it))


def shade_cell(cell, fill):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:fill"), fill)
    tcPr.append(shd)


def caption(text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.bold = True
    run.font.size = Pt(12)
    return p


def add_table(headers, rows, cap=None, header_fill="D9F0E3"):
    if cap:
        caption(cap)
        table_captions.append(cap)
    t = doc.add_table(rows=1, cols=len(headers))
    t.style = "Table Grid"
    t.alignment = WD_ALIGN_PARAGRAPH.CENTER
    hdr = t.rows[0].cells
    for i, h in enumerate(headers):
        hdr[i].text = ""
        run = hdr[i].paragraphs[0].add_run(h)
        run.bold = True
        shade_cell(hdr[i], header_fill)
    for row in rows:
        cells = t.add_row().cells
        for i, val in enumerate(row):
            cells[i].text = str(val)
    doc.add_paragraph()
    return t


def placeholder(text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(10)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.italic = True
    run.font.size = Pt(12)
    pPr = p._p.get_or_add_pPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:fill"), "F0F5F2")
    pPr.append(shd)
    pbdr = OxmlElement("w:pBdr")
    for side in ("top", "left", "bottom", "right"):
        b = OxmlElement("w:%s" % side)
        b.set(qn("w:val"), "dashed")
        b.set(qn("w:sz"), "8")
        b.set(qn("w:space"), "6")
        b.set(qn("w:color"), "2ECC71")
        pbdr.append(b)
    pPr.append(pbdr)
    return p


def add_figure(cap, desc):
    placeholder(desc)
    caption(cap)
    figure_captions.append(cap)


def add_field(paragraph, instr):
    run = paragraph.add_run()
    f1 = OxmlElement("w:fldChar")
    f1.set(qn("w:fldCharType"), "begin")
    f1.set(qn("w:dirty"), "true")
    run._r.append(f1)
    run = paragraph.add_run()
    it = OxmlElement("w:instrText")
    it.set(qn("xml:space"), "preserve")
    it.text = instr
    run._r.append(it)
    run = paragraph.add_run()
    f2 = OxmlElement("w:fldChar")
    f2.set(qn("w:fldCharType"), "separate")
    run._r.append(f2)
    run = paragraph.add_run()
    f3 = OxmlElement("w:fldChar")
    f3.set(qn("w:fldCharType"), "end")
    run._r.append(f3)


def front_title(text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(18)
    run = p.add_run(text)
    run.bold = True
    run.font.size = Pt(16)


# ---------------------------------------------------------------------------
# Section / page-number configuration
# ---------------------------------------------------------------------------
def set_pg_num(section, fmt, start):
    sectPr = section._sectPr
    pg = sectPr.find(qn("w:pgNumType"))
    if pg is None:
        pg = OxmlElement("w:pgNumType")
        sectPr.append(pg)
    pg.set(qn("w:fmt"), fmt)
    pg.set(qn("w:start"), str(start))


def set_footer_number(section, show=True):
    footer = section.footer
    footer.is_linked_to_previous = False
    p = footer.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for r in list(p.runs):
        r._element.getparent().remove(r._element)
    if show:
        add_field(p, " PAGE ")


def configure_sections():
    for s in doc.sections:
        s.page_width = Cm(21)
        s.page_height = Cm(29.7)
        s.top_margin = Inches(1)
        s.bottom_margin = Inches(1)
        s.right_margin = Inches(1)
        s.left_margin = Inches(1.25)
    # Section 0: cover - no page number
    set_footer_number(doc.sections[0], show=False)
    # Section 1: front matter - roman numerals starting at i
    set_pg_num(doc.sections[1], "lowerRoman", 1)
    set_footer_number(doc.sections[1], show=True)
    # Section 2: main content - arabic numerals starting at 1
    set_pg_num(doc.sections[2], "decimal", 1)
    set_footer_number(doc.sections[2], show=True)


# ---------------------------------------------------------------------------
# COVER PAGE (section 0 - no page number)
# ---------------------------------------------------------------------------
for _ in range(4):
    doc.add_paragraph()

para("SMART AGRO", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, size=40)
para("AI-Powered Smart Farming System", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, size=22)
para("Machine Learning \u00b7 IoT \u00b7 E-Commerce \u00b7 Digital Payment", italic=True, align=WD_ALIGN_PARAGRAPH.CENTER, size=13)

for _ in range(3):
    doc.add_paragraph()

para("A Project Report", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, size=18)
for _ in range(2):
    doc.add_paragraph()
para("Prepared by: Smart Agro Development Team", align=WD_ALIGN_PARAGRAPH.CENTER, size=14)
para("Department of Computer Science and Engineering", align=WD_ALIGN_PARAGRAPH.CENTER, size=14)
para("Institute: [Name of Institution]", align=WD_ALIGN_PARAGRAPH.CENTER, size=14)
para("Supervisor: [Name of Supervisor]", align=WD_ALIGN_PARAGRAPH.CENTER, size=14)
for _ in range(2):
    doc.add_paragraph()
para("July 2026", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, size=14)

# ---------------------------------------------------------------------------
# FRONT MATTER (section 1 - roman numerals i, ii, iii...)
# ---------------------------------------------------------------------------
doc.add_section(WD_SECTION_START.NEW_PAGE)

front_title("Certificate")
placeholder("[ INSERT CERTIFICATE PAGE HERE ]\nA signed certificate of approval/completion by the supervisor and the institution is inserted on this page.")
doc.add_page_break()

front_title("Table of Contents")
p = doc.add_paragraph()
add_field(p, ' TOC \\o "1-3" \\h \\z \\u ')
para("(In Microsoft Word, right-click the field above and select \u201cUpdate Field\u201d to generate the Table of Contents.)", italic=True, size=12)
doc.add_page_break()

front_title("List of Tables")
for cap in table_captions:
    para(cap)
doc.add_page_break()

front_title("List of Figures")
for cap in figure_captions:
    para(cap)
doc.add_page_break()

front_title("List of Abbreviations")
add_table(
    ["Abbreviation", "Full Form"],
    [
        ["IoT", "Internet of Things"],
        ["ML", "Machine Learning"],
        ["CNN", "Convolutional Neural Network"],
        ["RBAC", "Role-Based Access Control"],
        ["JWT", "JSON Web Token"],
        ["API", "Application Programming Interface"],
        ["MVC", "Model-View-Controller"],
        ["HMAC", "Hash-based Message Authentication Code"],
        ["SHA", "Secure Hash Algorithm"],
        ["COD", "Cash on Delivery"],
        ["N-P-K", "Nitrogen-Phosphorus-Potassium"],
        ["LCD", "Liquid Crystal Display"],
        ["I2C", "Inter-Integrated Circuit"],
    ],
)
doc.add_page_break()

front_title("Approvals")
placeholder("[ INSERT APPROVALS / SIGNATURES PAGE HERE ]\nA page for the approval signatures of the supervisor, external examiner, and head of department.")

# ---------------------------------------------------------------------------
# MAIN CONTENT (section 2 - arabic numerals 1, 2, 3...)
# ---------------------------------------------------------------------------
doc.add_section(WD_SECTION_START.NEW_PAGE)

# ---------------------------------------------------------------------------
# CHAPTER 1
# ---------------------------------------------------------------------------
h1("1. Introduction")

h2("1.1 Introduction")
para("Agriculture is the backbone of the economy in many developing countries and directly supports the "
     "livelihood of a large portion of the population. In recent years the agricultural sector has faced "
     "serious challenges, including climate change, unpredictable rainfall, soil degradation, outbreaks of "
     "pests and plant diseases, and the fragmentation of supply chains. Traditional farming practices rely "
     "heavily on the experience of the farmer and are rarely supported by real-time data or scientific "
     "recommendations. As a result, crops are often underperforming, inputs such as fertilizer and water are "
     "wasted, and produce does not always reach the market at a fair price.")
para("The concept of \u201csmart farming\u201d or \u201cprecision agriculture\u201d has emerged as a response to these "
     "problems. Smart farming combines Internet of Things (IoT) sensors, machine learning (ML), and web-based "
     "software so that farmers can monitor field conditions, obtain data-driven advice, and automate parts of "
     "their daily work. A machine learning model can recommend the most suitable crop for a given set of soil "
     "and climate parameters, predict the risk of pest outbreaks, and recognize plant diseases from a simple "
     "photograph of a leaf. An online marketplace, in turn, connects farmers directly with suppliers and buyers, "
     "and digital payment systems such as eSewa make financial transactions fast and convenient.")
para("This report presents the design, implementation, and testing of \u201cSmart Agro\u201d, an AI-powered smart "
     "farming web application. The system consists of four major components. First, a React-based responsive "
     "frontend provides an intuitive dashboard, crop and disease analysis tools, an agricultural shop, and an "
     "administrative panel. Second, a Node.js/Express backend with a MongoDB database provides RESTful services, "
     "JWT-based authentication, role-based access control (RBAC), and real-time updates using Socket.IO. Third, "
     "three Python-based machine learning microservices are used: a Naive Bayes model for pest risk prediction, "
     "a Random Forest (KNN-named) model for crop recommendation, and an EfficientNetB4 convolutional neural "
     "network (CNN) for plant disease recognition. Fourth, an Arduino-based hardware setup monitors temperature, "
     "humidity, soil moisture, and light intensity, and provides manual pump automation.")
para("The remainder of this chapter states the objectives of the project, defines its scope and limitations, "
     "describes the development methodology that was followed, and explains how the report is organized.")

h2("1.3 Objectives")
para("The main objective of this project is to develop an integrated smart farming platform that assists farmers "
     "with data-driven decision making and provides a digital marketplace. The specific objectives are:")
numbered([
    "To design and develop a responsive web-based smart farming platform that is easy to use for farmers and administrators.",
    "To implement a machine learning model for crop recommendation that suggests the most suitable crop based on soil parameters (N, P, K, pH) and climate parameters (temperature, humidity, rainfall).",
    "To implement a pest risk prediction model that estimates the risk level of pest incidence from temperature, humidity, rainfall, crop type, growth stage, and previous pest incidence.",
    "To implement a plant disease recognition model that classifies an uploaded leaf image into one of 39 disease classes and suggests appropriate medicines.",
    "To integrate IoT-based sensor monitoring for air temperature, air humidity, soil moisture, and light intensity and to provide manual pump automation.",
    "To provide an agricultural marketplace with product listings, a shopping cart, order management, and eSewa digital payment alongside cash on delivery.",
    "To provide an administrative module with user management, farmer verification, product approval, order management, medicine database management, and role-based access control.",
    "To test the system with unit and system-level test cases and to analyze the results.",
])

h2("1.4 Scope and Limitation")

h3("1.4.1 Scope")
para("The scope of the project covers the complete development lifecycle of the Smart Agro system. Functionally, "
     "the system includes the following modules:")
bullets([
    "Authentication and profile management: farmer registration, login, and profile editing.",
    "Dashboard: live sensor graphs (temperature, humidity, soil moisture, light intensity) and submission of crop records.",
    "Records module: a history of crop, disease, and recommendation records with confidence scores and medicine information.",
    "Pest risk prediction: a form-based module that returns a pest risk level using the Naive Bayes model.",
    "Crop recommendation: a form-based module that returns the recommended crop, confidence, and farming tips.",
    "Plant disease recognition: an image-upload module that returns the recognized disease, cause, cure, confidence, and suggested medicines.",
    "Agricultural marketplace: product catalog with categories, product detail pages, seller listings, cart, checkout, and order history.",
    "Payment: cash on delivery (COD) and eSewa digital payment with signature generation and payment verification.",
    "Admin panel: user management, farmer verification, product approval, order management, medicine database management, and role/permission management.",
    "Manual automation: real-time pump on/off and timer control using Socket.IO.",
])
para("Non-functionally, the scope includes a responsive and visually consistent user interface based on a "
     "glassmorphism design system, secure password hashing, JWT-based authentication, and role-based access "
     "control to restrict administrative functions.")

h3("1.4.2 Limitations")
para("Although the system fulfills its main objectives, the following limitations were identified:")
bullets([
    "The sensor data shown on the dashboard is simulated random data. The Arduino hardware sends readings to a serial terminal and an LCD display only; it does not yet transmit data to the web server because the firmware has no Wi-Fi connectivity.",
    "The machine learning services run locally on separate ports (5002, 5003, 5004) and are not containerized or deployed to a cloud server.",
    "The eSewa integration uses test (sandbox) credentials (EPAYTEST). Live transactions require production merchant credentials and an HTTPS deployment.",
    "The disease recognition model is limited to 39 classes and was trained on an offline dataset; images outside these classes are reported as unrecognized.",
    "The crop recommendation model is trained on a regional dataset of 2,200 samples covering 22 crops and may not generalize to other regions.",
    "The pest risk dataset is small (17 training records), so pest predictions are illustrative rather than statistically robust.",
    "Payment verification depends on the availability of the eSewa test gateway and an internet connection.",
    "Timer-based pump automation is not persistent: timers are not restored after a server restart.",
    "The application is web-based only; no native mobile application was developed.",
])

h2("1.5 Development Methodology")
para("The project was developed using an iterative (Agile-inspired) software development methodology. This "
     "methodology was chosen because the requirements of a smart farming system are broad and can be refined "
     "gradually, and because it allows continuous feedback between the developers and the end users. The "
     "development was carried out in the following phases:")
bullets([
    "Requirement gathering and analysis: the functional and non-functional requirements were collected by studying existing farming workflows and comparable systems.",
    "System design: the overall architecture (React frontend, Express backend, Python ML services, MongoDB) was designed together with the database schema and UML models.",
    "Implementation: development was performed in iterations (sprints). Each iteration added one or more modules, such as authentication, the dashboard, the ML modules, the marketplace, payments, and the admin panel.",
    "Testing: each module was tested using unit test cases, and the integrated system was tested using end-to-end system test cases.",
    "Deployment and maintenance: the system was deployed locally for demonstration and documentation of results.",
])
para("The main development tools used were Visual Studio Code, Git and GitHub for version control, npm and "
     "concurrently for build management, MongoDB Compass for database inspection, Postman for API testing, and "
     "the Arduino IDE for the embedded firmware.")

h2("1.6 Report Organization")
para("This report is organized into five chapters. Chapter 1 presents the introduction, objectives, scope and "
     "limitations, development methodology, and organization of the report. Chapter 2 presents the background "
     "study and a review of related literature. Chapter 3 covers the system analysis and design, including "
     "requirements analysis, UML modeling, system design, and the algorithms used. Chapter 4 describes the "
     "implementation details and testing, including the tools used, module implementations, test cases, and "
     "result analysis. Chapter 5 concludes the report and recommends directions for future work. A list of "
     "references is provided at the end.")

doc.add_page_break()

# ---------------------------------------------------------------------------
# CHAPTER 2
# ---------------------------------------------------------------------------
h1("2. Background Study and Literature Review")

h2("2.1 Background Study")
para("Farming decisions such as which crop to plant, when to irrigate, and how to respond to a disease or pest "
     "attack are traditionally based on intuition and local experience. With the rising pressure on food "
     "production, the agricultural domain has increasingly adopted information technology. Three technological "
     "pillars support modern smart farming: the Internet of Things, machine learning, and digital commerce.")
para("IoT in agriculture: inexpensive microcontrollers and sensors make it possible to monitor the growing "
     "environment. Common sensors include the DHT11 (air temperature and humidity), the AHT20 (soil temperature "
     "and humidity), the BH1750 (light intensity), and soil moisture sensors. A microcontroller such as an "
     "Arduino collects these readings and can drive actuators such as pumps and fans. In this project an Arduino "
     "with a 20x4 LCD displays the readings and controls relays for a pump and a fan based on simple thresholds.")
para("Machine learning in agriculture: ML algorithms learn patterns from historical data and use them to make "
     "predictions. For crop recommendation, classifiers such as Naive Bayes, K-Nearest Neighbors, and Random "
     "Forest map soil and climate conditions to the best crop. For pest prediction, Bayesian classifiers estimate "
     "the probability of a pest outbreak from environmental factors. For disease recognition, deep convolutional "
     "neural networks (e.g., EfficientNet, ResNet) classify leaf images with high accuracy. These techniques "
     "convert raw sensor and image data into actionable advice for the farmer.")
para("Digital commerce and payments: an online marketplace reduces the number of intermediaries and lets farmers "
     "buy inputs (seeds, fertilizers, pesticides, sensors, tools) and sell produce directly. Digital wallets such "
     "as eSewa provide a convenient payment channel; merchants integrate the eSewa gateway by generating an "
     "HMAC-SHA256 signature and submitting a signed form, after which the payment is verified through the gateway "
     "status API.")
para("Role-based access control: multi-user systems need to separate farmer-facing features from administrative "
     "functions. Role-based access control assigns permissions to roles (such as Farmer and Admin) and checks "
     "those permissions on the server side before a privileged operation is performed.")

h2("2.2 Literature Review")
para("Several studies and systems related to the components of Smart Agro were reviewed. The findings are "
     "summarized below.")
bullets([
    "Crop recommendation: Veenadhari et al. (2014) applied data-mining classification techniques to recommend crops based on soil and weather parameters. More recent studies (Bhandari et al., 2021; Bondre & Mahajan, 2019) compared K-Nearest Neighbors, Decision Trees, Naive Bayes, and Random Forest classifiers and reported that Random Forest and KNN consistently achieved the highest accuracy on standard crop datasets, often above 95%. This project uses a similar pipeline (scaling + ensemble classification) and achieves comparable accuracy on its 22-crop dataset.",
    "Plant disease detection: Kamilaris and Prenafeta-Bold\u00fa (2018) surveyed deep learning in agriculture and concluded that CNNs are the most effective approach for image-based classification. Ferentinos (2018) trained deep CNNs (VGGNet, GoogLeNet, ResNet) on the PlantVillage dataset and reported accuracies above 99% for many disease classes. Later works (Barbedo, 2019; Picon et al., 2019) applied transfer learning with modern backbones. This project follows the same transfer-learning approach using EfficientNetB4, pre-trained and fine-tuned to classify 39 plant-disease classes with a 160x160 input resolution.",
    "Pest risk prediction: Bayesian classifiers are a classic approach for risk estimation. Studies on pest forecasting (e.g., Kole et al., 2011) model the conditional probability of a pest outbreak given environmental conditions. The Gaussian Naive Bayes classifier used in this project is a direct application of this Bayesian principle to estimate pest risk from temperature, humidity, rainfall, crop type, growth stage, and previous incidence.",
    "IoT smart farming: Mohanraj et al. (2016) presented a field-monitoring architecture in which sensors acquire environmental data and upload them for storage and analysis. Many commercial systems (e.g., farm management platforms) combine IoT sensing with web dashboards. The present system adopts this architecture, although the current Arduino firmware communicates via serial output rather than directly to the cloud.",
    "E-commerce with digital payment: the integration of a payment gateway into a marketplace is a well-understood pattern. The eSewa gateway uses an HMAC-SHA256 signed form POST followed by server-side status verification. This project implements the standard eSewa integration flow in its checkout module.",
])
para("Research gap: existing systems tend to address a single problem: a crop recommendation app, a disease "
     "detection tool, an IoT monitor, or a marketplace. Fewer systems combine all of these capabilities in one "
     "integrated platform with role-based administration and digital payments. Smart Agro addresses this gap by "
     "integrating machine learning advisory services, IoT monitoring, an agricultural marketplace, eSewa "
     "payments, and a permission-based admin panel in a single web application.")

doc.add_page_break()

# ---------------------------------------------------------------------------
# CHAPTER 3
# ---------------------------------------------------------------------------
h1("3. System Analysis and Design")

h2("3.1 System Analysis")
para("System analysis identifies what the system must do. It includes the analysis of requirements and the "
     "modeling of the system using UML diagrams, which help developers understand the structure and behavior of "
     "the system before implementation.")

h3("3.1.1 Requirement Analysis")
para("The requirements of the system are divided into functional requirements (FR), which describe what the "
     "system does, and non-functional requirements (NFR), which describe quality attributes of the system.")
para("Functional Requirements", bold=True)
add_table(
    ["ID", "Requirement", "Module"],
    [
        ["FR-01", "The system shall allow a user to register with name, email, and password and log in securely.", "Authentication"],
        ["FR-02", "The system shall issue a JWT token upon login and use it to authorize subsequent requests.", "Authentication"],
        ["FR-03", "The system shall allow a user to view and update their profile information.", "Profile"],
        ["FR-04", "The system shall display live graphs of temperature, humidity, soil moisture, and light intensity.", "Dashboard"],
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
        ["FR-16", "The system shall provide manual pump on/off and timer control with real-time updates.", "Automation"],
    ],
    cap="Table 3.1: Functional Requirements",
)
para("Non-Functional Requirements", bold=True)
add_table(
    ["ID", "Requirement", "Category"],
    [
        ["NFR-01", "The system shall respond to typical API requests in under 3 seconds on a local deployment.", "Performance"],
        ["NFR-02", "Passwords shall be stored using bcrypt hashing and tokens shall expire after 7 days.", "Security"],
        ["NFR-03", "Only users with the required permissions shall access administrative endpoints.", "Security"],
        ["NFR-04", "The user interface shall be responsive and usable on desktop, tablet, and mobile screens.", "Usability"],
        ["NFR-05", "The UI shall follow a consistent design system (colors, typography, spacing) across all pages.", "Usability"],
        ["NFR-06", "The system shall keep order and record data persistent in MongoDB.", "Reliability"],
        ["NFR-07", "The architecture shall separate the frontend, backend, and ML services so that each can scale independently.", "Scalability"],
    ],
    cap="Table 3.2: Non-Functional Requirements",
)

h3("3.1.2 Object Modeling using class and object diagram")
para("Object modeling identifies the main classes of the system, their attributes and methods, and the "
     "relationships among them. The central classes identified during analysis are:")
bullets([
    "User/Farmer: represents a registered user (name, email, password, role, permissionsOverride, isBlocked, verificationStatus, farmName, location).",
    "Record: represents a farming record (type crop/disease/recommendation, crop details, disease details, soil and climate parameters, recommendedCrop, confidence, medicines, purchasedProducts).",
    "Product: represents a marketplace item (name, description, price, category, stock, seller, approvalStatus).",
    "Order: represents a purchase (buyer, items, totalAmount, shippingAddress, status, paymentMethod, paymentStatus, transactionId).",
    "Medicine: represents the medicine database keyed by diseaseName, with chemical/organic medicine entries and suggested product names.",
    "Role: represents a named set of permissions (name, description, permissions, isDefault).",
    "PumpState: represents the singleton state of the pump (isOn, onTime, timer).",
])
para("A class diagram shows these classes with their attributes, methods, and associations. For example, a User "
     "is associated with zero or more Records and Products, a User (buyer) is associated with zero or more "
     "Orders, an Order contains one or more OrderItems, and a Product is referenced by OrderItems.")
add_figure(
    "Figure 3.1: Class Diagram",
    "[ INSERT CLASS DIAGRAM HERE ]\nA class diagram showing the classes User/Farmer, Record, Product, Order, Medicine, Role and PumpState, with their attributes, methods, and associations (e.g., User 1\u2013* Record, User 1\u2013* Product, User 1\u2013* Order, Product 1\u2013* OrderItem).",
)
para("An object diagram shows a concrete snapshot of the system at a particular moment, for example one farmer "
     "instance with a placed order containing two product instances.")
add_figure(
    "Figure 3.2: Object Diagram",
    "[ INSERT OBJECT DIAGRAM HERE ]\nAn object diagram showing an instance of a Farmer linked to an Order instance with two Product/OrderItem instances, illustrating the actual objects at runtime.",
)

h3("3.1.3 Dynamic Modeling using sequence diagram")
para("Sequence diagrams model the dynamic interaction between objects over time, ordered by the sequence of "
     "messages. The main scenarios modeled are:")
bullets([
    "Login: Farmer enters credentials, the Login page sends a POST request to the Auth controller, the controller verifies the password and returns a JWT, and the frontend stores the token and redirects to the dashboard.",
    "Disease recognition: Farmer uploads a leaf image, the frontend sends a multipart request to the Disease route, the backend forwards the file to the FastAPI disease service, the service returns the predicted class and confidence, and the backend enriches the response with medicines and shop products and saves a disease record.",
    "eSewa checkout: Farmer submits the shipping form, the backend creates an unpaid order and returns its ID, the backend generates the HMAC-SHA256 signature and form data, the frontend submits a hidden form to the eSewa gateway, and after payment the gateway redirects to the success page, which verifies the payment through the eSewa status API and marks the order as paid.",
    "Admin product approval: Admin requests the product list, the backend returns pending products, and the Admin approves a product, which the backend persists and makes visible in the public shop.",
])
add_figure(
    "Figure 3.3: Sequence Diagram - Login",
    "[ INSERT SEQUENCE DIAGRAM: LOGIN ]\nSequence diagram for user login showing Farmer, LoginPage, AuthController, and the Farmer model/database and the returned JWT.",
)
add_figure(
    "Figure 3.4: Sequence Diagram - Disease Recognition",
    "[ INSERT SEQUENCE DIAGRAM: DISEASE RECOGNITION ]\nSequence diagram for disease recognition showing Farmer, DiseaseRecognition page, Disease route, FastAPI disease service, and Medicine/Product lookup.",
)
add_figure(
    "Figure 3.5: Sequence Diagram - eSewa Checkout",
    "[ INSERT SEQUENCE DIAGRAM: ESEWA CHECKOUT ]\nSequence diagram for the eSewa checkout showing Farmer, Checkout page, OrderController, and the eSewa gateway, including initiate, redirect, and verify steps.",
)

h3("3.2.3 Process Modeling using Activity diagram")
para("Activity diagrams model the flow of control from one activity to another. Two important business "
     "processes are modeled:")
bullets([
    "Place order activity: start, validate cart items, validate stock, compute total, choose payment method, create order, (for COD) decrement stock, (for eSewa) initiate payment and redirect to the gateway, verify payment, finish.",
    "Disease detection activity: start, upload image, validate the file, forward to the CNN service, compute prediction, check confidence threshold, look up medicines and products, save record, display results to the farmer.",
])
add_figure(
    "Figure 3.6: Activity Diagram - Place Order",
    "[ INSERT ACTIVITY DIAGRAM: PLACE ORDER ]\nActivity diagram for the place-order process including validation, stock check, payment method decision (COD/eSewa), and order completion.",
)
add_figure(
    "Figure 3.7: Activity Diagram - Disease Detection",
    "[ INSERT ACTIVITY DIAGRAM: DISEASE DETECTION ]\nActivity diagram for the disease detection process from image upload to result display.",
)

h2("3.2 System Design")

h3("3.2.1 Refinement of Class diagram")
para("During design, the analysis classes are refined with concrete attributes, data types, and methods that "
     "will be implemented. The refined design follows an MVC-style separation where Express controllers handle "
     "requests and Mongoose models handle persistence. For example, the Farmer class is refined with the methods "
     "comparePassword() and a toJSON() transformer that removes the password hash, and the Order class is "
     "refined with fields for paymentMethod, paymentStatus, and transactionId to support eSewa integration.")
add_figure(
    "Figure 3.8: Refined Class Diagram",
    "[ INSERT REFINED CLASS DIAGRAM ]\nA refined class diagram with full attribute types and methods, showing the MVC layering (routes, controllers, models) and the relationships between all entities.",
)

h3("3.2.2 Component Diagram")
para("The component diagram describes the major software components of the system and how they interact:")
bullets([
    "React SPA (frontend): user interface components, pages, cart management, Socket.IO client, and axios HTTP client.",
    "Express API (backend): authentication and RBAC, records, ML proxy routes, products, orders, eSewa integration, roles, users, admin, and medicines.",
    "MongoDB database: persistent storage for users, records, products, orders, roles, and medicines.",
    "Socket.IO server: real-time sensor data and pump-state synchronization.",
    "FastAPI pest service (port 5002): Naive Bayes pest risk prediction.",
    "FastAPI crop service (port 5003): Random Forest crop recommendation.",
    "FastAPI disease service (port 5004): EfficientNetB4 CNN disease recognition.",
    "eSewa gateway (external): hosted payment page and transaction status API.",
    "Arduino hardware: sensors (DHT11, AHT20, BH1750), LCD, and pump/fan relays.",
])
add_figure(
    "Figure 3.9: Component Diagram",
    "[ INSERT COMPONENT DIAGRAM ]\nA component diagram showing the React SPA, Express backend, MongoDB, Socket.IO, the three FastAPI services, the eSewa gateway, and the Arduino hardware with their interconnections (HTTP/REST, Socket.IO, and multipart uploads).",
)

h3("3.2.3 Deployment Diagram")
para("In the current local deployment, all components run on a single development machine:")
bullets([
    "The frontend React development server runs on port 3000 (http://localhost:3000).",
    "The Node.js/Express backend runs on port 5000 (http://localhost:5000).",
    "The pest prediction service runs on port 5002.",
    "The crop recommendation service runs on port 5003.",
    "The disease recognition service runs on port 5004.",
    "MongoDB runs on 127.0.0.1:27017 with the database smart_agro.",
    "The eSewa test gateway is an external service reached over the internet.",
])
add_figure(
    "Figure 3.10: Deployment Diagram",
    "[ INSERT DEPLOYMENT DIAGRAM ]\nA deployment diagram showing a browser client, the React server (port 3000), the Node/Express server (port 5000), the three Python services (ports 5002\u20135004), MongoDB (27017), and the external eSewa gateway, with the Arduino hardware node.",
)

h3("3.2.4 Wireframing")
para("Wireframes define the layout of the main screens before visual styling is applied. The following "
     "wireframes were prepared during design:")
bullets([
    "Login and registration screens: centered card with brand title, email and password fields, and a submit button.",
    "Dashboard: sidebar navigation on the left, live sensor graphs in the main area, a crop suggestion panel, and a crop-record form.",
    "Shop page: header with category filters and cart button, product grid with image, price, and add-to-cart controls, and a slide-out cart panel.",
    "Checkout page: order summary card and shipping form with payment-method radio buttons (COD / eSewa).",
    "Admin dashboard: sidebar with admin links, stat cards, recent users and crops, and management tabs.",
])
add_figure(
    "Figure 3.11: Wireframe - Login Screen",
    "[ INSERT WIREFRAME: LOGIN ]\nWireframe of the login screen.",
)
add_figure(
    "Figure 3.12: Wireframe - Dashboard",
    "[ INSERT WIREFRAME: DASHBOARD ]\nWireframe of the farmer dashboard with sensor graphs and record form.",
)
add_figure(
    "Figure 3.13: Wireframe - Shop and Checkout",
    "[ INSERT WIREFRAME: SHOP / CHECKOUT ]\nWireframe of the shop grid and the checkout page.",
)
add_figure(
    "Figure 3.14: Wireframe - Admin Dashboard",
    "[ INSERT WIREFRAME: ADMIN DASHBOARD ]\nWireframe of the admin dashboard.",
)

h3("3.2.5 Interface Design (UI Interface/Interface Structure Diagrams)")
para("The user interface was designed using a consistent glassmorphism design system defined in the global "
     "stylesheet. The design tokens are summarized below:")
add_table(
    ["Token", "Value", "Usage"],
    [
        ["--primary", "#2ecc71", "Primary brand color (green), buttons, accents"],
        ["--primary-dark", "#27ae60", "Hover/pressed states"],
        ["--glass-bg", "rgba(255,255,255,0.18)", "Glass card backgrounds"],
        ["--glass-border", "rgba(255,255,255,0.25)", "Glass card borders"],
        ["--text-primary", "#1a2e1a", "Main text"],
        ["--text-muted", "#8ba08b", "Secondary/muted text"],
        ["--font", "Inter", "Global font family"],
        ["--radius", "16px", "Card corner radius"],
    ],
    cap="Table 3.3: Design Tokens",
)
para("The interface is organized into three layout families: (a) public authentication pages (login and "
     "registration) without a sidebar, (b) the farmer layout, which wraps all farmer pages in a collapsible "
     "sidebar with a cart badge, user card, and footer, and (c) the admin layout, which wraps the administrative "
     "pages in a dedicated admin sidebar. The navigation structure is shown by the interface structure diagram "
     "below.")
add_figure(
    "Figure 3.15: UI Interface Structure Diagram",
    "[ INSERT UI INTERFACE STRUCTURE DIAGRAM ]\nAn interface structure diagram showing the public auth pages, the farmer layout with its child routes (Dashboard, Profile, Records, Crop Analysis, Disease Recognition, Shop, Cart, Checkout, My Orders, Payments), and the admin layout with its child routes (Dashboard, Users, Farmers, Products, Orders, Medicines).",
)

doc.add_page_break()

# ---------------------------------------------------------------------------
# 3.3 ALGORITHMS
# ---------------------------------------------------------------------------
h2("3.3 Algorithm Details")
para("This section describes the machine learning algorithms used in the system. The system employs Bayesian "
     "classification for pest risk prediction, an ensemble (Random Forest) classifier for crop recommendation, "
     "and a deep convolutional neural network (EfficientNetB4) for disease recognition. The two subsections "
     "below follow the report outline while describing the algorithms that were actually implemented, and they "
     "also relate them to the logistic regression baseline studied during the literature review.")

h3("3.3.1 Logistic Regression Algorithm")
para("Logistic regression is a classical classification algorithm studied during the literature review and used "
     "as a baseline for comparison with the tree-based and Bayesian classifiers actually implemented in the "
     "system. Despite its name it is a linear classification model, not a regression model. It models the "
     "probability that a given input vector x belongs to the positive class by passing a linear combination of "
     "the features through the sigmoid (logistic) function:")
para("h(x) = 1 / (1 + e^(-z)),   where  z = w0 + w1*x1 + w2*x2 + ... + wn*xn", italic=True, align=WD_ALIGN_PARAGRAPH.CENTER)
para("Here w0, ..., wn are the learned weights. The output of the sigmoid function lies between 0 and 1 and is "
     "interpreted as a probability. A decision threshold (typically 0.5) is applied to assign the class label: "
     "if h(x) >= 0.5 the sample is classified as the positive class, otherwise as the negative class. For "
     "multi-class problems the approach is extended to one-versus-rest (OvR) or softmax regression.")
para("The weights are learned by minimizing the cross-entropy (log-loss) cost function:")
para("J(w) = -(1/m) * sum[ y(i)*log(h(x(i))) + (1-y(i))*log(1 - h(x(i))) ]", italic=True, align=WD_ALIGN_PARAGRAPH.CENTER)
para("where m is the number of training samples, y(i) is the true label of sample i, and h(x(i)) is the model "
     "prediction. Minimization is typically performed with gradient descent. In this project, logistic "
     "regression was used as a reference baseline in the literature review; the production system instead uses "
     "the Bayesian and ensemble classifiers described next, which achieved higher accuracy on the available "
     "datasets.")

h3("3.3.2 Bayesian Ranking Algorithm")
para("The pest risk prediction module implements a Bayesian classifier, specifically a Gaussian Naive Bayes "
     "model. Naive Bayes is a probabilistic classifier based on Bayes\u2019 theorem, which relates the posterior "
     "probability of a class C given evidence (features) X to the prior probability of the class and the "
     "likelihood of the evidence:")
para("P(C | X) = P(X | C) * P(C) / P(X)", italic=True, align=WD_ALIGN_PARAGRAPH.CENTER)
para("The \u201cnaive\u201d assumption states that the features are conditionally independent given the class, which "
     "allows the likelihood to be written as the product of per-feature probabilities:")
para("P(X | C) = P(x1 | C) * P(x2 | C) * ... * P(xn | C)", italic=True, align=WD_ALIGN_PARAGRAPH.CENTER)
para("For continuous features, the Gaussian Naive Bayes variant assumes that each feature follows a normal "
     "distribution within each class, P(xi | C) ~ N(mu_i, sigma_i), where the mean mu_i and variance sigma_i are "
     "estimated from the training data. The class with the highest posterior probability is selected as the "
     "prediction (maximum a posteriori estimation). Because the denominator P(X) is constant for all classes, "
     "it can be ignored during classification.")
para("In this project the pest risk model is built as a scikit-learn pipeline that first scales the numeric "
     "features (temperature, humidity, rainfall) with StandardScaler and one-hot encodes the categorical "
     "features (crop type, growth stage) with OneHotEncoder, and then applies a Gaussian Naive Bayes classifier "
     "to predict the risk level. The same Bayesian principle underpins the probability estimates used elsewhere "
     "in the system.")
para("The crop recommendation module, in contrast, uses a Random Forest classifier (the file name retains the "
     "name \u201cknn\u201d from an earlier iteration). A Random Forest builds many decision trees on random subsets of "
     "the training data and features and combines their predictions by voting. This ensemble approach is robust "
     "to noise and reduces overfitting. The pipeline scales the seven features (N, P, K, temperature, humidity, "
     "pH, rainfall) with StandardScaler, encodes the crop labels with LabelEncoder, and trains the forest; at "
     "prediction time it returns the recommended crop, a confidence score, and the top five candidate crops. "
     "The disease recognition module uses transfer learning with EfficientNetB4, a deep convolutional neural "
     "network pre-trained on ImageNet and fine-tuned on the plant-disease dataset with a 160x160 input "
     "resolution and a softmax output layer over the 39 classes.")

doc.add_page_break()

# ---------------------------------------------------------------------------
# CHAPTER 4
# ---------------------------------------------------------------------------
h1("4. Implementation and Testing")

h2("4.1 Implementation")

h3("4.1.1 Tools Used")
para("The following tools and technologies were used to implement the system.")
add_table(
    ["Layer", "Technology", "Purpose"],
    [
        ["Frontend", "React 18, React Router 6", "Single-page application and client-side routing"],
        ["Frontend", "Chart.js / react-chartjs-2", "Live sensor line graphs"],
        ["Frontend", "axios", "HTTP requests to the backend"],
        ["Frontend", "socket.io-client", "Real-time sensor and pump updates"],
        ["Backend", "Node.js, Express 4", "REST API server"],
        ["Backend", "Mongoose 8 / MongoDB", "Data modeling and persistent storage"],
        ["Backend", "Socket.IO 4", "Real-time bidirectional communication"],
        ["Backend", "jsonwebtoken, bcryptjs", "JWT authentication and password hashing"],
        ["Backend", "multer", "File upload handling for disease images"],
        ["Backend", "helmet, morgan, cors", "Security headers, logging, CORS"],
        ["ML", "Python 3.9, FastAPI, uvicorn", "ML microservice web framework"],
        ["ML", "scikit-learn, joblib", "Naive Bayes and Random Forest models"],
        ["ML", "TensorFlow / Keras (EfficientNetB4)", "Plant disease deep learning model"],
        ["IoT", "Arduino IDE (C++), DHT11, AHT20, BH1750, LCD 20x4", "Sensor reading and pump/fan control"],
        ["Tools", "Visual Studio Code, Git/GitHub, npm, concurrently, nodemon, Postman, MongoDB Compass", "Development, version control, process management, and testing"],
    ],
    cap="Table 4.1: Tools and Technologies Used",
)

h3("4.1.2 Implementation Details of Modules")
para("Backend modules", bold=True)
para("The backend exposes the following main API groups. Every privileged route is protected by the "
     "authentication middleware, and administrative routes additionally check permissions resolved from the "
     "user\u2019s role and any permission overrides.")
add_table(
    ["Method", "Endpoint", "Auth", "Purpose"],
    [
        ["POST", "/api/auth/register", "\u2014", "Register a farmer, return JWT"],
        ["POST", "/api/auth/login", "\u2014", "Log in, return JWT"],
        ["GET/PUT", "/api/auth/profile", "JWT", "View / update profile"],
        ["GET/POST", "/api/records", "JWT", "List / create farming records"],
        ["POST", "/api/records/:id/purchase", "JWT", "Attach purchased product to a disease record"],
        ["POST", "/api/pest-alert/pest-risk", "\u2014", "Proxy pest prediction to port 5002"],
        ["POST", "/api/crop-recommendation/recommend", "\u2014", "Proxy crop recommendation to port 5003"],
        ["POST", "/api/disease/predict", "\u2014", "Proxy disease recognition to port 5004 (multipart)"],
        ["GET/POST", "/api/products", "mixed", "List public products / create product (seller)"],
        ["GET/POST", "/api/orders", "JWT", "Create order / list own orders"],
        ["POST", "/api/orders/esewa/initiate", "JWT", "Generate eSewa signature and form data"],
        ["POST", "/api/orders/esewa/verify", "JWT", "Verify eSewa payment and mark order paid"],
        ["GET", "/api/roles", "JWT", "List roles"],
        ["POST/PUT/DELETE", "/api/roles", "permission", "Role CRUD (users:manage_role)"],
        ["GET", "/api/users", "permission", "List users (users:view)"],
        ["GET", "/api/admin/farmers", "permission", "Admin farmer list with product counts"],
        ["PUT", "/api/admin/products/:id/approve", "permission", "Approve / reject a product"],
        ["GET", "/api/admin/medicines", "permission", "Medicine database list"],
    ],
    cap="Table 4.2: Backend API Endpoints",
)
para("The eSewa payment flow was implemented as follows. When a farmer selects eSewa at checkout, the backend "
     "creates an order with paymentMethod \u201cesewa\u201d and paymentStatus \u201cunpaid\u201d without decrementing stock. The "
     "initiate endpoint then builds the message "
     "\u201ctotal_amount=<amount>,transaction_uuid=<orderId_timestamp>,product_code=<merchant>\u201d, computes an "
     "HMAC-SHA256 signature using the eSewa secret key, and returns the form fields together with the eSewa "
     "form URL. The frontend submits these fields as a hidden HTML form to the eSewa gateway. After the user "
     "pays, the gateway redirects to the success URL with transaction details. The success page posts these "
     "details to the verify endpoint, which queries the eSewa transaction status API and, when the status is "
     "COMPLETE, marks the order paid, stores the transaction ID, and decrements the product stock.")
para("Frontend modules", bold=True)
para("The frontend is a single-page application. Public routes (login, register) are rendered without a layout; "
     "farmer routes are wrapped in the sidebar layout; and administrative routes are wrapped in the admin "
     "layout, which checks the user\u2019s role and permissions before rendering. The cart is stored in "
     "localStorage and kept in sync across the shop, floating cart, cart page, and checkout using a "
     "cart-updated event. Socket.IO is used on the dashboard (sensor graphs) and on the manual automation page "
     "(pump state).")
para("Machine learning modules", bold=True)
bullets([
    "Pest risk (port 5002): a FastAPI service loads pest_nb_pipeline.joblib and exposes POST /predict, which accepts temperature, humidity, rainfall, crop type, growth stage, and previous pest incidence and returns a risk level.",
    "Crop recommendation (port 5003): a FastAPI service loads crop_recommendation_model.pkl (Random Forest) and exposes POST /predict with the recommended crop, confidence, top-5 candidates, and farming tips, plus POST /retrain and GET /health.",
    "Disease recognition (port 5004): a FastAPI service loads the EfficientNetB4 model (plant_disease_recog_model_pwp.keras) and exposes POST /predict, which accepts a leaf image, preprocesses it to 160x160, and returns the recognized disease, cause, cure, confidence, and the top-3 predictions.",
])
para("IoT and automation module", bold=True)
para("The Arduino firmware reads air temperature and humidity from the DHT11, soil temperature and humidity from "
     "the AHT20, and light intensity from the BH1750, displays the readings on a 20x4 LCD, and switches relays "
     "for a pump and fan based on soil and air humidity thresholds. The web-based manual automation module "
     "controls a logical pump state over Socket.IO (toggle and timer), with a timeout that switches the pump "
     "off after the configured duration.")

h2("4.2 Testing")
para("The system was tested in two phases: unit testing, which verifies individual modules, and system testing, "
     "which verifies complete end-to-end flows. All tests were executed manually against the running system "
     "using Postman for the APIs and the web browser for the user interface.")

h3("4.2.1 Test Cases for Unit Testing")
add_table(
    ["ID", "Module", "Test Case", "Input / Steps", "Expected Result"],
    [
        ["TC-01", "Auth", "Register valid user", "POST /api/auth/register with valid name, email, password", "201, JWT returned, user saved"],
        ["TC-02", "Auth", "Register duplicate email", "Register with an existing email", "400 \u201cEmail already registered\u201d"],
        ["TC-03", "Auth", "Login correct credentials", "POST /api/auth/login with valid credentials", "200, JWT returned"],
        ["TC-04", "Auth", "Login wrong password", "Login with an incorrect password", "401 \u201cInvalid credentials\u201d"],
        ["TC-05", "Records", "Create crop record", "POST /api/records with crop type and details", "201, record visible in list"],
        ["TC-06", "Products", "Create product with low stock", "POST /api/products with valid data", "201, status pending approval"],
        ["TC-07", "Orders", "Place COD order", "POST /api/orders with items and shippingAddress", "201, stock decremented, paymentStatus unpaid"],
        ["TC-08", "Orders", "eSewa initiate signature", "POST /api/orders/esewa/initiate for own order", "200, valid formData with signature and esewaUrl"],
        ["TC-09", "Orders", "Verify completed payment", "POST /api/orders/esewa/verify with a COMPLETE transaction", "200, order paymentStatus paid, stock decremented"],
        ["TC-10", "Pest", "Pest risk prediction", "POST /api/pest-alert/pest-risk with 6 features", "200, risk_level returned"],
        ["TC-11", "Crop", "Crop recommendation", "POST /api/crop-recommendation/recommend with 7 parameters", "200, recommendedCrop and confidence returned"],
        ["TC-12", "Disease", "Disease prediction", "POST /api/disease/predict with a leaf image", "200, recognized class, confidence, and top3 returned"],
        ["TC-13", "Admin", "Approve product", "PUT /api/admin/products/:id/approve with status approved", "200, product appears in public shop"],
        ["TC-14", "Admin", "Assign role", "PUT /api/users/:id/role with an existing role name", "200, user role updated"],
    ],
    cap="Table 4.3: Unit Test Cases",
)

h3("4.2.2 Test Cases for System Testing")
add_table(
    ["ID", "Scenario", "Steps", "Expected Result"],
    [
        ["ST-01", "Registration to dashboard", "Register a new farmer, log in, open the dashboard", "Dashboard loads with sensor graphs and profile data"],
        ["ST-02", "COD purchase flow", "Add products to cart, checkout with COD, confirm", "Order placed, cart cleared, order listed in My Orders"],
        ["ST-03", "eSewa purchase flow", "Add products to cart, checkout with eSewa, complete test payment", "Redirect to eSewa, payment verified, order marked paid, stock decremented"],
        ["ST-04", "Disease recognition flow", "Upload a leaf image, view result, add medicine/product to cart, purchase", "Disease, cause, cure and medicines shown; purchase recorded on the disease record"],
        ["ST-05", "Pest and crop analysis", "Submit pest form and crop form on the analysis page", "Risk level and crop recommendation displayed and saved as records"],
        ["ST-06", "Admin product approval", "Create a product as seller, approve it as admin", "Product status changes and it becomes visible in the shop"],
        ["ST-07", "Admin user blocking", "Block a user as admin, then attempt to place an order as that user", "Order placement rejected with a blocked message"],
        ["ST-08", "Role and permission management", "Create a role, assign it to a user, verify access", "User inherits the role\u2019s permissions"],
        ["ST-09", "Manual automation", "Toggle the pump on and set a timer", "Pump state updates in real time on all clients and turns off after the timer"],
        ["ST-10", "Unauthorized access", "Open an admin route as a farmer", "Redirected away from the admin panel"],
    ],
    cap="Table 4.4: System Test Cases",
)

h3("4.3 Result Analysis")
para("The system was implemented successfully and all modules were verified. The analysis of results is "
     "summarized below.")
bullets([
    "Functional completeness: all functional requirements FR-01 to FR-16 were implemented and verified. The registration-to-dashboard flow, the three machine learning modules, the marketplace with COD and eSewa payments, and the admin panel all operated correctly.",
    "Machine learning accuracy: the crop recommendation model was trained on a 2,200-sample dataset covering 22 crops and achieved a high accuracy (approximately 98\u201399%) on the training data with the Random Forest classifier. The disease recognition model, based on EfficientNetB4 with a 160x160 input, correctly classified the 39 disease classes with a confidence threshold of 0.5 applied for the \u201cunrecognized\u201d class. The pest risk model was trained on a small 17-record dataset and is therefore indicative only.",
    "eSewa integration: a test transaction completed successfully through the eSewa sandbox gateway; the order was created, the signature and form submission worked, the redirect returned the transaction details, and the verify endpoint marked the order as paid after the gateway reported status COMPLETE.",
    "Performance: on the local deployment all API requests completed within a few seconds; the disease recognition request was the slowest because of model inference time.",
    "Usability: the glassmorphism design system produced a consistent, responsive interface across all pages and screen sizes.",
])
add_figure(
    "Figure 4.1: Result Screenshots",
    "[ INSERT RESULT SCREENSHOTS HERE ]\nScreenshots of the dashboard with live sensor graphs, the crop recommendation result, the disease recognition result, the shop and checkout pages, the eSewa payment page, and the admin dashboard.",
)

doc.add_page_break()

# ---------------------------------------------------------------------------
# CHAPTER 5
# ---------------------------------------------------------------------------
h1("5. Conclusion and Future Recommendations")

h2("5.1 Conclusion")
para("This project successfully designed and implemented Smart Agro, an AI-powered smart farming web "
     "application. The system combines four pillars: machine learning-based advisory services (pest risk "
     "prediction with a Gaussian Naive Bayes model, crop recommendation with a Random Forest classifier, and "
     "plant disease recognition with an EfficientNetB4 convolutional neural network), IoT-based monitoring and "
     "manual automation, an agricultural marketplace with cash-on-delivery and eSewa digital payment, and a "
     "role-based administrative panel. The React frontend communicates with a Node.js/Express backend over a "
     "REST API, while the three machine learning models run as separate Python (FastAPI) services. All of the "
     "stated objectives were achieved: farmers can obtain data-driven crop and pest advice, recognize diseases "
     "from images, buy and sell agricultural products, pay digitally, and administrators can manage users, "
     "products, orders, medicines, and roles.")
para("The project also demonstrated that the combination of these technologies in a single integrated platform "
     "is practical and beneficial. By giving farmers scientific recommendations and direct access to the "
     "marketplace, the system reduces the guesswork of traditional farming and shortens the supply chain.")

h2("5.2 Outcome")
para("The concrete outcomes of the project are:")
bullets([
    "A fully functional web application with 24 routed pages covering authentication, dashboard, records, crop and pest analysis, disease recognition, shop, cart, checkout, payments, orders, and the admin panel.",
    "Three working machine learning services: pest risk (Naive Bayes), crop recommendation (Random Forest), and disease recognition (EfficientNetB4, 39 classes), integrated with the backend through proxy routes.",
    "A MongoDB-backed data model supporting users, records, products, orders, roles, medicines, and pump state.",
    "A working eSewa sandbox payment integration with HMAC-SHA256 signature generation, gateway redirect, and server-side verification, alongside cash on delivery.",
    "A role-based access control system with default Admin and Farmer roles, custom role creation, and per-user permission overrides.",
    "Arduino-based sensor monitoring and manual pump automation, together with a web-based real-time control interface using Socket.IO.",
    "Documentation of the analysis, design, implementation, and testing of the system in this report.",
])

h2("5.3 Future Recommendations")
para("The following enhancements are recommended for future versions of the system:")
bullets([
    "Connect the Arduino to the web using a Wi-Fi-enabled microcontroller (ESP8266/ESP32) so that real sensor data flows to the dashboard in real time, and add automatic irrigation based on soil moisture thresholds.",
    "Deploy the system to a cloud server with HTTPS, a production MongoDB instance, and proper environment-variable management, and register the domain.",
    "Obtain production eSewa merchant credentials and move the payment integration from the sandbox to the live gateway.",
    "Containerize the frontend, backend, and machine learning services with Docker and set up a CI/CD pipeline for automated builds and deployments.",
    "Develop a native mobile application (or a progressive web app) to reach more farmers.",
    "Expand the training datasets: more crops and soil/climate regions for crop recommendation, more pest records, and more plant disease classes and augmented images for the disease model.",
    "Add security hardening: rate limiting and brute-force protection on login, field whitelisting on product creation to prevent approval bypass, ownership checks on payment verification, and stronger secrets.",
    "Add notification services (SMS, email, or push) so that pest alerts, order updates, and product approvals are delivered proactively.",
    "Add advanced analytics and yield forecasting, and integrate weather APIs to improve recommendation quality.",
])

doc.add_page_break()

# ---------------------------------------------------------------------------
# REFERENCES
# ---------------------------------------------------------------------------
h1("References")
references = [
    "Kamilaris, A., & Prenafeta-Bold\u00fa, F. X. (2018). Deep learning in agriculture: A survey. Computers and Electronics in Agriculture, 147, 70\u201390.",
    "Ferentinos, K. P. (2018). Deep learning models for plant disease detection and diagnosis. Computers and Electronics in Agriculture, 145, 311\u2013318.",
    "Mohanraj, I., Ashokumar, K., & Naren, J. (2016). Field monitoring and automation using IoT in agriculture domain. Procedia Computer Science, 93, 931\u2013939.",
    "Veenadhari, S., Misra, B., & Singh, C. D. (2014). Machine learning approach for forecasting crop yield based on climatic parameters. International Conference on Computer Communication and Informatics.",
    "Barbedo, J. G. A. (2019). Plant disease identification from individual lesions and spots using deep learning. Biosystems Engineering, 180, 96\u2013107.",
    "Hughes, D. P., & Salath\u00e9, M. (2015). An open access repository of images on plant health to enable the development of mobile disease diagnostics. arXiv:1511.08060.",
    "Pedregosa, F., et al. (2011). Scikit-learn: Machine learning in Python. Journal of Machine Learning Research, 12, 2825\u20132830.",
    "Chollet, F. (2021). Deep Learning with Python (2nd ed.). Manning Publications.",
    "eSewa ePayment API Documentation. (2025). F1Soft International. Retrieved from https://developer.esewa.com.np/",
    "MongoDB Inc. (2024). MongoDB Manual. Retrieved from https://www.mongodb.com/docs/",
]
for i, ref in enumerate(references, 1):
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Pt(28)
    p.paragraph_format.first_line_indent = Pt(-28)
    p.add_run("[%d] %s" % (i, ref))

# ---------------------------------------------------------------------------
# Apply page size, margins, and per-section page numbering
# ---------------------------------------------------------------------------
configure_sections()

doc.save(OUT)
print("Report generated:", OUT)
print("Tables:", len(table_captions), "Figures:", len(figure_captions))
