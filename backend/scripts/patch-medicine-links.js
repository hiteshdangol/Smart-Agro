const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Medicine = require('../models/Medicine');

const patches = [
  {
    diseaseName: 'Grape___Esca_(Black_Measles)',
    medicines: [
      { type: 'chemical', productName: 'Sodium Arsenite Solution', description: 'Traditional treatment for Esca (restricted use)', applicationInstructions: 'Professional application only. Paint onto pruning wounds.', suggestedProductNames: ['Fenny Fungicide'] },
      { type: 'organic', productName: 'Trichoderma Harzianum', description: 'Beneficial fungus that suppresses Esca pathogens', applicationInstructions: 'Apply 5g/L as trunk spray. Apply after pruning.', suggestedProductNames: ['ObiFert Organic Fertilizer'] },
    ],
  },
  {
    diseaseName: 'Peach___Bacterial_spot',
    medicines: [
      { type: 'chemical', productName: 'Copper Oxychloride 50% WP', description: 'Copper-based bactericide for bacterial spot', applicationInstructions: 'Mix 3g/L water. Apply at dormant through post-bloom.', suggestedProductNames: ['Fenny Fungicide'] },
      { type: 'chemical', productName: 'Oxytetracycline 20% WP', description: 'Antibiotic for bacterial disease control', applicationInstructions: 'Mix 0.5g/L water. Apply during bloom and petal fall.', suggestedProductNames: ['Multi Clear Pesticide'] },
      { type: 'organic', productName: 'Copper Soap Fungicide', description: 'Organic copper bactericide', applicationInstructions: 'Mix 15ml/L water. Apply weekly during wet weather.', suggestedProductNames: ['ObiFert Organic Fertilizer'] },
    ],
  },
  {
    diseaseName: 'Pepper,_bell___Bacterial_spot',
    medicines: [
      { type: 'chemical', productName: 'Copper Hydroxide 77% WP', description: 'Effective bactericide for pepper bacterial spot', applicationInstructions: 'Mix 1.5g/L water. Apply at first symptom appearance.', suggestedProductNames: ['Fenny Fungicide'] },
      { type: 'chemical', productName: 'Acibenzolar-S-Methyl 50% WG', description: 'Plant activator that boosts natural defenses', applicationInstructions: 'Mix 0.3g/L water. Apply preventatively every 14 days.', suggestedProductNames: ['Multi Clear Pesticide'] },
      { type: 'organic', productName: 'Copper Soap Fungicide', description: 'Organic copper bactericide for peppers', applicationInstructions: 'Mix 15ml/L water. Apply every 5-7 days in wet weather.', suggestedProductNames: ['ObiFert Organic Fertilizer'] },
    ],
  },
  {
    diseaseName: 'Tomato___Bacterial_spot',
    medicines: [
      { type: 'chemical', productName: 'Copper Hydroxide 77% WP', description: 'Bactericide for bacterial spot on tomatoes', applicationInstructions: 'Mix 1.5g/L water. Apply at first symptom appearance.', suggestedProductNames: ['Fenny Fungicide'] },
      { type: 'chemical', productName: 'Streptomycin Sulfate 90% SP', description: 'Antibiotic for bacterial disease control', applicationInstructions: 'Mix 0.3g/L water. Apply during early growth stages.', suggestedProductNames: ['Multi Clear Pesticide'] },
      { type: 'organic', productName: 'Copper Soap Fungicide', description: 'Organic copper bactericide', applicationInstructions: 'Mix 15ml/L water. Apply every 5-7 days.', suggestedProductNames: ['ObiFert Organic Fertilizer'] },
    ],
  },
  {
    diseaseName: 'Tomato___Tomato_mosaic_virus',
    medicines: [
      { type: 'organic', productName: 'Milk Solution 10%', description: 'Milk spray can reduce virus transmission', applicationInstructions: 'Mix 100ml milk per liter water. Spray weekly.', suggestedProductNames: ['ObiFert Organic Fertilizer'] },
      { type: 'organic', productName: 'Neem Oil 0.3% EC', description: 'Natural antiviral support for plants', applicationInstructions: 'Mix 5ml/L water. Apply as foliar spray weekly.', suggestedProductNames: ['Multi Clear Pesticide'] },
    ],
  },
];

async function patch() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.\n');

    for (const patch of patches) {
      const existing = await Medicine.findOne({ diseaseName: patch.diseaseName });
      if (!existing) {
        console.log(`  ✗ Not found: ${patch.diseaseName}`);
        continue;
      }
      existing.medicines = patch.medicines;
      await existing.save();
      console.log(`  ✓ Updated: ${patch.diseaseName}`);
    }

    console.log('\nDone!');
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err);
    process.exit(1);
  }
}

patch();
