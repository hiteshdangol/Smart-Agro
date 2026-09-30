const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

dotenv.config();

const Farmer = require('./models/Farmer');
const Record = require('./models/Record');
const PestAlert = require('./models/pestAlert');
const Product = require('./models/Product');
const Medicine = require('./models/Medicine');

const csvDir = path.join(__dirname, '..');

const CSV_FILES = {
  records: path.join(csvDir, 'smart_agro.records.csv'),
  pestalerts: path.join(csvDir, 'smart_agro.pestalerts.csv'),
};

function readCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return parse(content, { columns: true, skip_empty_lines: true, trim: true });
}

async function seedFarmers() {
  const farmers = [
    { name: 'Admin', email: 'admin@admin.com', password: 'admin123', role: 'Admin' },
    { name: 'Farmer', email: 'farmer@farmer.com', password: 'farmer123', role: 'Farmer' },
  ];
  for (const f of farmers) {
    await Farmer.create(f);
  }
  console.log(`  ✓ ${farmers.length} farmers`);
  console.log('  Admin:  admin@admin.com / admin123');
  console.log('  Farmer: farmer@farmer.com / farmer123');
}

async function seedRecords() {
  const rows = readCSV(CSV_FILES.records);
  const docs = rows.map(r => ({
    _id: new mongoose.Types.ObjectId(r._id),
    farmerId: new mongoose.Types.ObjectId(r.farmerId),
    crop: r.crop,
    cultivationDate: new Date(r.cultivationDate),
    quantity: Number(r.quantity),
    description: r.description || '',
  }));
  await Record.insertMany(docs);
  console.log(`  ✓ ${docs.length} records`);
}

async function seedPestAlerts() {
  const rows = readCSV(CSV_FILES.pestalerts);
  const docs = rows.map(r => ({
    _id: new mongoose.Types.ObjectId(r._id),
    type: r.type,
    crop: r.crop,
    severity: r.severity,
    description: r.description,
    location: {
      type: r['location.type'] || 'Point',
      coordinates: [
        Number(r['location.coordinates[0]']),
        Number(r['location.coordinates[1]']),
      ],
    },
    createdAt: new Date(r.createdAt),
  }));
  await PestAlert.insertMany(docs);
  console.log(`  ✓ ${docs.length} pest alerts`);
}

async function seedProducts() {
  const products = [
    { name: 'DHT11 Temperature & Humidity Sensor', description: 'Measures temperature and humidity. Ideal for environmental monitoring.', price: 450, category: 'Sensor', image: '/image/sensor_dht11.jpeg', stock: 50, approvalStatus: 'approved' },
    { name: 'Soil Moisture Sensor', description: 'Capacitive soil moisture sensor for measuring water content in soil.', price: 350, category: 'Sensor', image: '/image/sensor_soil_moisture.jpeg', stock: 40, approvalStatus: 'approved' },
    { name: 'BH1750 Light Intensity Sensor', description: 'Digital light sensor for measuring ambient light intensity.', price: 280, category: 'Sensor', image: '/image/sensor_light_intensity.jpeg', stock: 35, approvalStatus: 'approved' },
    { name: '2-Channel Relay Module', description: 'Relay module for switching high-power devices with low-power signals.', price: 320, category: 'Sensor', image: '/image/relay_module.jpeg', stock: 30, approvalStatus: 'approved' },
    { name: 'Multi Clear Pesticide', description: 'Broad-spectrum pesticide for controlling a wide range of crop pests.', price: 680, category: 'Pesticide', image: '/image/pest1.png', stock: 100, approvalStatus: 'approved' },
    { name: 'Googly Insecticide', description: 'Effective insecticide for hard-to-kill pests on vegetables and fruits.', price: 550, category: 'Pesticide', image: '/image/pest2.png', stock: 80, approvalStatus: 'approved' },
    { name: 'Fenny Fungicide', description: 'Fungicide for preventing and treating fungal diseases in crops.', price: 490, category: 'Pesticide', image: '/image/pest3.png', stock: 75, approvalStatus: 'approved' },
    { name: 'ObiFert Organic Fertilizer', description: 'Organic fertilizer that enhances crop growth and soil health.', price: 720, category: 'Fertilizer', image: '/image/pest4.png', stock: 60, approvalStatus: 'approved' },
    { name: 'Garden Trowel', description: 'Hand trowel for planting, transplanting, and soil work.', price: 250, category: 'Tool', stock: 45, approvalStatus: 'approved' },
    { name: 'Pruning Shears', description: 'Sharp pruning shears for trimming branches and harvesting.', price: 380, category: 'Tool', stock: 35, approvalStatus: 'approved' },
    { name: 'Hybrid Maize Seeds (1kg)', description: 'High-yield hybrid maize seeds suitable for various climates.', price: 420, category: 'Seed', stock: 90, approvalStatus: 'approved' },
    { name: 'Organic Rice Seeds (1kg)', description: 'Premium quality organic rice seeds for monsoon season planting.', price: 360, category: 'Seed', stock: 85, approvalStatus: 'approved' },
  ];
  await Product.insertMany(products);
  console.log(`  ✓ ${products.length} products`);
}

async function seedMedicines() {
  const medicines = [
    {
      diseaseName: "Apple___Apple_scab",
      medicines: [
        { type: "chemical", productName: "Captan 75% WP", description: "Broad-spectrum fungicide preventing apple scab", applicationInstructions: "Mix 2g/L water. Apply at green tip through cover sprays.", suggestedProductNames: ["Fenny Fungicide"] },
        { type: "chemical", productName: "Myclobutanil 40% WP", description: "Systemic fungicide effective against scab", applicationInstructions: "Mix 0.5g/L water. Apply at 7-14 day intervals.", suggestedProductNames: [] },
        { type: "organic", productName: "Sulfur 80% WDG", description: "Natural mineral fungicide for organic orchards", applicationInstructions: "Mix 3g/L water. Apply before rain events. Do not use above 30°C.", suggestedProductNames: [] },
      ],
    },
    {
      diseaseName: "Apple___Black_rot",
      medicines: [
        { type: "chemical", productName: "Thiophanate-methyl 70% WP", description: "Systemic fungicide for black rot control", applicationInstructions: "Mix 1g/L water. Apply from petal fall through season.", suggestedProductNames: ["Fenny Fungicide"] },
        { type: "chemical", productName: "Copper Oxychloride 50% WP", description: "Protectant fungicide for early season use", applicationInstructions: "Mix 3g/L water. Apply before infection periods.", suggestedProductNames: [] },
        { type: "organic", productName: "Copper Soap Fungicide", description: "Organic copper-based fungicide", applicationInstructions: "Mix 15ml/L water. Apply every 7-10 days.", suggestedProductNames: [] },
      ],
    },
    {
      diseaseName: "Apple___Cedar_apple_rust",
      medicines: [
        { type: "chemical", productName: "Myclobutanil 40% WP", description: "Systemic fungicide that controls rust diseases", applicationInstructions: "Mix 0.5g/L water. Apply from pink bud through petal fall.", suggestedProductNames: [] },
        { type: "chemical", productName: "Mancozeb 75% WP", description: "Protectant fungicide for rust management", applicationInstructions: "Mix 2g/L water. Apply every 7-10 days during high risk.", suggestedProductNames: ["Fenny Fungicide"] },
        { type: "organic", productName: "Sulfur 80% WDG", description: "Organic prevention for rust diseases", applicationInstructions: "Mix 3g/L water. Apply weekly during spore release.", suggestedProductNames: [] },
      ],
    },
    {
      diseaseName: "Apple___healthy",
      medicines: [
        { type: "organic", productName: "ObiFert Organic Fertilizer", description: "Organic fertilizer to maintain tree vigor", applicationInstructions: "Apply 2kg per tree annually. Split into spring and fall applications.", suggestedProductNames: ["ObiFert Organic Fertilizer"] },
      ],
    },
    {
      diseaseName: "Background_without_leaves",
      medicines: [],
    },
    {
      diseaseName: "Blueberry___healthy",
      medicines: [
        { type: "organic", productName: "ObiFert Organic Fertilizer", description: "Acid-loving plant fertilizer for blueberry health", applicationInstructions: "Apply 1kg per plant annually in early spring.", suggestedProductNames: ["ObiFert Organic Fertilizer"] },
      ],
    },
    {
      diseaseName: "Cherry___Powdery_mildew",
      medicines: [
        { type: "chemical", productName: "Sulfur 80% WDG", description: "Effective fungicide for powdery mildew", applicationInstructions: "Mix 3g/L water. Apply at first sign of disease.", suggestedProductNames: [] },
        { type: "chemical", productName: "Fenny Fungicide", description: "Broad-spectrum fungicide for mildew control", applicationInstructions: "Mix 2ml/L water. Apply every 7-14 days.", suggestedProductNames: ["Fenny Fungicide"] },
        { type: "organic", productName: "Baking Soda Solution", description: "Homemade organic remedy for powdery mildew", applicationInstructions: "Mix 1tbsp baking soda + 1tsp soap per liter water. Spray weekly.", suggestedProductNames: [] },
      ],
    },
    {
      diseaseName: "Cherry___healthy",
      medicines: [
        { type: "organic", productName: "ObiFert Organic Fertilizer", description: "Balanced nutrition for cherry trees", applicationInstructions: "Apply 1.5kg per tree annually in early spring.", suggestedProductNames: ["ObiFert Organic Fertilizer"] },
      ],
    },
    {
      diseaseName: "Corn___Cercospora_leaf_spot Gray_leaf_spot",
      medicines: [
        { type: "chemical", productName: "Azoxystrobin 23% SC", description: "Systemic fungicide for leaf spot control", applicationInstructions: "Mix 1ml/L water. Apply at tasseling stage.", suggestedProductNames: [] },
        { type: "chemical", productName: "Pyraclostrobin 20% WG", description: "Strobilurin fungicide for corn diseases", applicationInstructions: "Mix 0.8g/L water. Apply at first sign of disease.", suggestedProductNames: [] },
        { type: "chemical", productName: "Fenny Fungicide", description: "General fungicide for corn leaf diseases", applicationInstructions: "Mix 2ml/L water. Apply every 10-14 days.", suggestedProductNames: ["Fenny Fungicide"] },
      ],
    },
    {
      diseaseName: "Corn___Common_rust",
      medicines: [
        { type: "chemical", productName: "Tebuconazole 25% EW", description: "Systemic triazole fungicide for rust", applicationInstructions: "Mix 1ml/L water. Apply at first pustule appearance.", suggestedProductNames: [] },
        { type: "chemical", productName: "Mancozeb 75% WP", description: "Protectant fungicide for rust prevention", applicationInstructions: "Mix 2g/L water. Apply before disease onset.", suggestedProductNames: ["Fenny Fungicide"] },
        { type: "organic", productName: "Sulfur Dust", description: "Organic sulfur treatment for rust", applicationInstructions: "Dust lightly on affected leaves. Reapply after rain.", suggestedProductNames: [] },
      ],
    },
    {
      diseaseName: "Corn___Northern_Leaf_Blight",
      medicines: [
        { type: "chemical", productName: "Propiconazole 25% EC", description: "Systemic fungicide for northern leaf blight", applicationInstructions: "Mix 1ml/L water. Apply at first symptom detection.", suggestedProductNames: [] },
        { type: "chemical", productName: "Azoxystrobin 23% SC", description: "Strobilurin fungicide for blight management", applicationInstructions: "Mix 1ml/L water. Apply preventatively at V10 stage.", suggestedProductNames: [] },
        { type: "chemical", productName: "Multi Clear Pesticide", description: "Multi-purpose crop protection spray", applicationInstructions: "Mix 3ml/L water. Apply every 7-10 days.", suggestedProductNames: ["Multi Clear Pesticide"] },
      ],
    },
    {
      diseaseName: "Corn___healthy",
      medicines: [
        { type: "organic", productName: "ObiFert Organic Fertilizer", description: "Nitrogen-rich fertilizer for corn growth", applicationInstructions: "Apply 200kg per hectare before planting.", suggestedProductNames: ["ObiFert Organic Fertilizer"] },
      ],
    },
    {
      diseaseName: "Grape___Black_rot",
      medicines: [
        { type: "chemical", productName: "Mancozeb 75% WP", description: "Protectant fungicide for black rot", applicationInstructions: "Mix 2g/L water. Apply from shoot growth through veraison.", suggestedProductNames: ["Fenny Fungicide"] },
        { type: "chemical", productName: "Myclobutanil 40% WP", description: "Systemic fungicide for grape diseases", applicationInstructions: "Mix 0.5g/L water. Apply at 7-10 day intervals.", suggestedProductNames: [] },
        { type: "organic", productName: "Copper Oxychloride 50% WP", description: "Copper-based organic fungicide", applicationInstructions: "Mix 3g/L water. Apply before rain events.", suggestedProductNames: [] },
      ],
    },
    {
      diseaseName: "Grape___Esca_(Black_Measles)",
      medicines: [
        { type: "chemical", productName: "Sodium Arsenite Solution", description: "Traditional treatment for Esca (restricted use)", applicationInstructions: "Professional application only. Paint onto pruning wounds.", suggestedProductNames: ["Fenny Fungicide"] },
        { type: "organic", productName: "Trichoderma Harzianum", description: "Beneficial fungus that suppresses Esca pathogens", applicationInstructions: "Apply 5g/L as trunk spray. Apply after pruning.", suggestedProductNames: ["ObiFert Organic Fertilizer"] },
      ],
    },
    {
      diseaseName: "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
      medicines: [
        { type: "chemical", productName: "Fenny Fungicide", description: "Broad-spectrum fungicide for leaf blight", applicationInstructions: "Mix 2ml/L water. Apply at first leaf spot appearance.", suggestedProductNames: ["Fenny Fungicide"] },
        { type: "chemical", productName: "Copper Oxychloride 50% WP", description: "Copper-based protectant fungicide", applicationInstructions: "Mix 3g/L water. Apply every 7-10 days.", suggestedProductNames: [] },
      ],
    },
    {
      diseaseName: "Grape___healthy",
      medicines: [
        { type: "organic", productName: "ObiFert Organic Fertilizer", description: "Balanced fertilizer for vine health", applicationInstructions: "Apply 1.5kg per vine annually in early spring.", suggestedProductNames: ["ObiFert Organic Fertilizer"] },
      ],
    },
    {
      diseaseName: "Orange___Haunglongbing_(Citrus_greening)",
      medicines: [
        { type: "chemical", productName: "Imidacloprid 17.8% SL", description: "Systemic insecticide to control psyllid vectors", applicationInstructions: "Mix 1ml/L water. Apply as soil drench or foliar spray.", suggestedProductNames: ["Googly Insecticide"] },
        { type: "chemical", productName: "Streptomycin Sulfate 90% SP", description: "Antibiotic treatment for citrus greening", applicationInstructions: "Mix 0.5g/L water. Apply as trunk injection by professionals.", suggestedProductNames: [] },
        { type: "organic", productName: "Neem Oil 0.3% EC", description: "Natural insecticide repelling psyllids", applicationInstructions: "Mix 5ml/L water with soap. Apply every 14 days.", suggestedProductNames: [] },
      ],
    },
    {
      diseaseName: "Peach___Bacterial_spot",
      medicines: [
        { type: "chemical", productName: "Copper Oxychloride 50% WP", description: "Copper-based bactericide for bacterial spot", applicationInstructions: "Mix 3g/L water. Apply at dormant through post-bloom.", suggestedProductNames: ["Fenny Fungicide"] },
        { type: "chemical", productName: "Oxytetracycline 20% WP", description: "Antibiotic for bacterial disease control", applicationInstructions: "Mix 0.5g/L water. Apply during bloom and petal fall.", suggestedProductNames: ["Multi Clear Pesticide"] },
        { type: "organic", productName: "Copper Soap Fungicide", description: "Organic copper bactericide", applicationInstructions: "Mix 15ml/L water. Apply weekly during wet weather.", suggestedProductNames: ["ObiFert Organic Fertilizer"] },
      ],
    },
    {
      diseaseName: "Peach___healthy",
      medicines: [
        { type: "organic", productName: "ObiFert Organic Fertilizer", description: "Nutrition for peach tree health", applicationInstructions: "Apply 1.5kg per tree annually in early spring.", suggestedProductNames: ["ObiFert Organic Fertilizer"] },
      ],
    },
    {
      diseaseName: "Pepper,_bell___Bacterial_spot",
      medicines: [
        { type: "chemical", productName: "Copper Hydroxide 77% WP", description: "Effective bactericide for pepper bacterial spot", applicationInstructions: "Mix 1.5g/L water. Apply at first symptom appearance.", suggestedProductNames: ["Fenny Fungicide"] },
        { type: "chemical", productName: "Acibenzolar-S-Methyl 50% WG", description: "Plant activator that boosts natural defenses", applicationInstructions: "Mix 0.3g/L water. Apply preventatively every 14 days.", suggestedProductNames: ["Multi Clear Pesticide"] },
        { type: "organic", productName: "Copper Soap Fungicide", description: "Organic copper bactericide for peppers", applicationInstructions: "Mix 15ml/L water. Apply every 5-7 days in wet weather.", suggestedProductNames: ["ObiFert Organic Fertilizer"] },
      ],
    },
    {
      diseaseName: "Pepper,_bell___healthy",
      medicines: [
        { type: "organic", productName: "ObiFert Organic Fertilizer", description: "Balanced nutrition for pepper plants", applicationInstructions: "Apply 50g per plant monthly during growing season.", suggestedProductNames: ["ObiFert Organic Fertilizer"] },
      ],
    },
    {
      diseaseName: "Potato___Early_blight",
      medicines: [
        { type: "chemical", productName: "Mancozeb 75% WP", description: "Protectant fungicide for early blight", applicationInstructions: "Mix 2g/L water. Apply at 7-10 day intervals.", suggestedProductNames: ["Fenny Fungicide"] },
        { type: "chemical", productName: "Chlorothalonil 75% WP", description: "Broad-spectrum contact fungicide", applicationInstructions: "Mix 1.5g/L water. Start spraying when plants are 15cm tall.", suggestedProductNames: [] },
        { type: "organic", productName: "Neem Oil 0.3% EC", description: "Natural fungicide for organic potato farming", applicationInstructions: "Mix 5ml/L water with soap. Apply weekly.", suggestedProductNames: [] },
      ],
    },
    {
      diseaseName: "Potato___Late_blight",
      medicines: [
        { type: "chemical", productName: "Metalaxyl-M 4% + Mancozeb 64% WP", description: "Systemic + contact fungicide for late blight", applicationInstructions: "Mix 2.5g/L water. Apply at 7 day intervals in wet weather.", suggestedProductNames: ["Fenny Fungicide"] },
        { type: "chemical", productName: "Cymoxanil 8% + Mancozeb 64% WP", description: "Curative fungicide for active late blight", applicationInstructions: "Mix 2g/L water. Apply immediately upon disease detection.", suggestedProductNames: [] },
        { type: "organic", productName: "Copper Oxychloride 50% WP", description: "Copper fungicide for blight prevention", applicationInstructions: "Mix 3g/L water. Apply preventatively before rain.", suggestedProductNames: [] },
      ],
    },
    {
      diseaseName: "Potato___healthy",
      medicines: [
        { type: "organic", productName: "ObiFert Organic Fertilizer", description: "Potato-specific organic fertilizer", applicationInstructions: "Apply 150g per sq meter before planting.", suggestedProductNames: ["ObiFert Organic Fertilizer"] },
      ],
    },
    {
      diseaseName: "Raspberry___healthy",
      medicines: [
        { type: "organic", productName: "ObiFert Organic Fertilizer", description: "Nutrient support for raspberry canes", applicationInstructions: "Apply 1kg per 10m row annually in early spring.", suggestedProductNames: ["ObiFert Organic Fertilizer"] },
      ],
    },
    {
      diseaseName: "Soybean___healthy",
      medicines: [
        { type: "organic", productName: "ObiFert Organic Fertilizer", description: "Nitrogen-fixing support for soybeans", applicationInstructions: "Apply 150kg per hectare before planting.", suggestedProductNames: ["ObiFert Organic Fertilizer"] },
      ],
    },
    {
      diseaseName: "Squash___Powdery_mildew",
      medicines: [
        { type: "chemical", productName: "Sulfur 80% WDG", description: "Fungicide effective against powdery mildew", applicationInstructions: "Mix 3g/L water. Apply at first sign of white powder.", suggestedProductNames: [] },
        { type: "chemical", productName: "Fenny Fungicide", description: "General fungicide for cucurbit diseases", applicationInstructions: "Mix 2ml/L water. Apply every 7-14 days.", suggestedProductNames: ["Fenny Fungicide"] },
        { type: "organic", productName: "Baking Soda Solution", description: "Homemade organic mildew treatment", applicationInstructions: "Mix 1tbsp baking soda + 1tsp soap per liter water.", suggestedProductNames: [] },
      ],
    },
    {
      diseaseName: "Strawberry___Leaf_scorch",
      medicines: [
        { type: "chemical", productName: "Captan 75% WP", description: "Fungicide for strawberry leaf scorch", applicationInstructions: "Mix 2g/L water. Apply after harvest and renovate.", suggestedProductNames: ["Fenny Fungicide"] },
        { type: "chemical", productName: "Thiophanate-methyl 70% WP", description: "Systemic fungicide for leaf diseases", applicationInstructions: "Mix 1g/L water. Apply at 10-14 day intervals.", suggestedProductNames: [] },
        { type: "organic", productName: "Copper Soap Fungicide", description: "Organic fungicide for strawberries", applicationInstructions: "Mix 15ml/L water. Apply weekly during wet periods.", suggestedProductNames: [] },
      ],
    },
    {
      diseaseName: "Strawberry___healthy",
      medicines: [
        { type: "organic", productName: "ObiFert Organic Fertilizer", description: "Berry-specific organic nutrition", applicationInstructions: "Apply 100g per plant annually after harvest.", suggestedProductNames: ["ObiFert Organic Fertilizer"] },
      ],
    },
    {
      diseaseName: "Tomato___Bacterial_spot",
      medicines: [
        { type: "chemical", productName: "Copper Hydroxide 77% WP", description: "Bactericide for bacterial spot on tomatoes", applicationInstructions: "Mix 1.5g/L water. Apply at first symptom appearance.", suggestedProductNames: ["Fenny Fungicide"] },
        { type: "chemical", productName: "Streptomycin Sulfate 90% SP", description: "Antibiotic for bacterial disease control", applicationInstructions: "Mix 0.3g/L water. Apply during early growth stages.", suggestedProductNames: ["Multi Clear Pesticide"] },
        { type: "organic", productName: "Copper Soap Fungicide", description: "Organic copper bactericide", applicationInstructions: "Mix 15ml/L water. Apply every 5-7 days.", suggestedProductNames: ["ObiFert Organic Fertilizer"] },
      ],
    },
    {
      diseaseName: "Tomato___Early_blight",
      medicines: [
        { type: "chemical", productName: "Mancozeb 75% WP", description: "Broad-spectrum fungicide for early blight", applicationInstructions: "Mix 2g/L water. Apply at 7-10 day intervals.", suggestedProductNames: ["Fenny Fungicide"] },
        { type: "chemical", productName: "Chlorothalonil 75% WP", description: "Protectant fungicide for early blight", applicationInstructions: "Mix 1.5g/L water. Apply when symptoms first appear.", suggestedProductNames: [] },
        { type: "organic", productName: "Neem Oil 0.3% EC", description: "Natural fungicide from neem seeds", applicationInstructions: "Mix 5ml/L water with few drops of soap. Apply weekly.", suggestedProductNames: [] },
      ],
    },
    {
      diseaseName: "Tomato___Late_blight",
      medicines: [
        { type: "chemical", productName: "Metalaxyl-M 4% + Mancozeb 64% WP", description: "Systemic fungicide for late blight control", applicationInstructions: "Mix 2.5g/L water. Apply every 5-7 days in wet weather.", suggestedProductNames: ["Fenny Fungicide"] },
        { type: "chemical", productName: "Cymoxanil 8% + Mancozeb 64% WP", description: "Curative treatment for active late blight", applicationInstructions: "Mix 2g/L water. Apply immediately upon detection.", suggestedProductNames: [] },
        { type: "organic", productName: "Copper Oxychloride 50% WP", description: "Copper-based preventive fungicide", applicationInstructions: "Mix 3g/L water. Apply before wet weather periods.", suggestedProductNames: [] },
      ],
    },
    {
      diseaseName: "Tomato___Leaf_Mold",
      medicines: [
        { type: "chemical", productName: "Fenny Fungicide", description: "Fungicide for tomato leaf mold control", applicationInstructions: "Mix 2ml/L water. Apply at first signs of yellowing.", suggestedProductNames: ["Fenny Fungicide"] },
        { type: "chemical", productName: "Sulfur 80% WDG", description: "Fungicide for mold prevention", applicationInstructions: "Mix 3g/L water. Apply in well-ventilated conditions.", suggestedProductNames: [] },
        { type: "organic", productName: "Baking Soda Solution", description: "Organic mold treatment", applicationInstructions: "Mix 1tbsp baking soda + 1tsp soap per liter water.", suggestedProductNames: [] },
      ],
    },
    {
      diseaseName: "Tomato___Septoria_leaf_spot",
      medicines: [
        { type: "chemical", productName: "Mancozeb 75% WP", description: "Protectant fungicide for Septoria leaf spot", applicationInstructions: "Mix 2g/L water. Apply at 7-10 day intervals.", suggestedProductNames: ["Fenny Fungicide"] },
        { type: "chemical", productName: "Chlorothalonil 75% WP", description: "Broad-spectrum fungicide for leaf spots", applicationInstructions: "Mix 1.5g/L water. Start at first fruit set.", suggestedProductNames: [] },
        { type: "organic", productName: "Copper Soap Fungicide", description: "Organic fungicide for leaf spot control", applicationInstructions: "Mix 15ml/L water. Apply weekly.", suggestedProductNames: [] },
      ],
    },
    {
      diseaseName: "Tomato___Spider_mites Two-spotted_spider_mite",
      medicines: [
        { type: "chemical", productName: "Googly Insecticide", description: "Acaricide effective against spider mites", applicationInstructions: "Mix 2ml/L water. Spray thoroughly on leaf undersides.", suggestedProductNames: ["Googly Insecticide"] },
        { type: "chemical", productName: "Abamectin 1.8% EC", description: "Selective miticide for spider mite control", applicationInstructions: "Mix 1ml/L water. Apply at first mite detection.", suggestedProductNames: [] },
        { type: "organic", productName: "Neem Oil 0.3% EC", description: "Natural miticide and insect repellent", applicationInstructions: "Mix 5ml/L water with soap. Apply every 5-7 days.", suggestedProductNames: [] },
      ],
    },
    {
      diseaseName: "Tomato___Target_Spot",
      medicines: [
        { type: "chemical", productName: "Azoxystrobin 23% SC", description: "Systemic fungicide for target spot", applicationInstructions: "Mix 1ml/L water. Apply at first symptom detection.", suggestedProductNames: [] },
        { type: "chemical", productName: "Mancozeb 75% WP", description: "Contact fungicide for target spot prevention", applicationInstructions: "Mix 2g/L water. Apply every 7-10 days.", suggestedProductNames: ["Fenny Fungicide"] },
      ],
    },
    {
      diseaseName: "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
      medicines: [
        { type: "chemical", productName: "Imidacloprid 17.8% SL", description: "Systemic insecticide controlling whitefly vectors", applicationInstructions: "Mix 1ml/L water. Apply at seedling stage.", suggestedProductNames: ["Googly Insecticide"] },
        { type: "chemical", productName: "Pyriproxyfen 10% EC", description: "Insect growth regulator for whitefly control", applicationInstructions: "Mix 1ml/L water. Apply at 14 day intervals.", suggestedProductNames: [] },
        { type: "organic", productName: "Neem Oil 0.3% EC", description: "Natural whitefly repellent", applicationInstructions: "Mix 5ml/L water with soap. Apply twice weekly.", suggestedProductNames: [] },
      ],
    },
    {
      diseaseName: "Tomato___Tomato_mosaic_virus",
      medicines: [
        { type: "organic", productName: "Milk Solution 10%", description: "Milk spray can reduce virus transmission", applicationInstructions: "Mix 100ml milk per liter water. Spray weekly.", suggestedProductNames: ["ObiFert Organic Fertilizer"] },
        { type: "organic", productName: "Neem Oil 0.3% EC", description: "Natural antiviral support for plants", applicationInstructions: "Mix 5ml/L water. Apply as foliar spray weekly.", suggestedProductNames: ["Multi Clear Pesticide"] },
      ],
    },
    {
      diseaseName: "Tomato___healthy",
      medicines: [
        { type: "organic", productName: "ObiFert Organic Fertilizer", description: "Complete nutrition for healthy tomato growth", applicationInstructions: "Apply 100g per plant every 2 weeks during growing season.", suggestedProductNames: ["ObiFert Organic Fertilizer"] },
      ],
    },
  ];

  await Medicine.insertMany(medicines);
  console.log(`  ✓ ${medicines.length} disease medicine entries`);
}

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.\n');

    console.log('Clearing existing collections...');
    await Promise.all([
      Farmer.deleteMany({}),
      Record.deleteMany({}),
      PestAlert.deleteMany({}),
      Product.deleteMany({}),
      Medicine.deleteMany({}),
    ]);
    console.log('Done.\n');

    console.log('Seeding farmers...');
    await seedFarmers();
    console.log('Seeding records...');
    await seedRecords();
    console.log('Seeding pest alerts...');
    await seedPestAlerts();
    console.log('Seeding products...');
    await seedProducts();
    console.log('Seeding medicines...');
    await seedMedicines();

    console.log('\nSeeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
