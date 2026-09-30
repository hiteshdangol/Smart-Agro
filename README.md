# Smart Agro

An IoT-enabled smart agriculture platform. Combines field sensor telemetry, three
machine-learning microservices, a role-based web application, and a marketplace
with eSewa payment integration.

## Features

- **Real-time telemetry** — Socket.IO stream of temperature, humidity, soil
  moisture, and light intensity, plus manual pump automation.
- **Crop recommendation** — Random Forest / Gaussian Naive Bayes / SVM ensemble
  over soil and climate features (`pythonmodel/crop_recommendataion_knn.py`).
- **Pest prediction** — scikit-learn Naive Bayes pipeline (`pythonmodel/api_nb.py`).
- **Plant disease recognition** — TensorFlow/Keras CNN image classifier
  (`pythonmodel/disease_api.py`).
- **Web application** — React SPA with authentication, role-based permissions,
  farmer records, admin dashboards, and history views.
- **Marketplace** — products, cart, wishlist, and orders with eSewa checkout.
- **IoT firmware** — Arduino sketch for DHT11 / AHT20 / BH1750 sensors with a
  20x4 LCD and fan control.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router 6, Chart.js, Socket.IO client, Axios (Create React App) |
| Backend | Node.js, Express 4, Mongoose 8 (MongoDB), JWT, bcryptjs, Socket.IO, Multer, Helmet |
| ML services | Python, FastAPI, scikit-learn, TensorFlow/Keras, pandas, joblib |
| Firmware | Arduino C++ |
| Orchestration | npm scripts + `concurrently` |

## Repository layout

```
.
├── backend/                  Express API, Socket.IO server, Mongoose models
│   ├── config/               Database connection
│   ├── controllers/          Request handlers
│   ├── models/               Mongoose schemas
│   ├── routes/               Express routers
│   ├── utils/                Permissions / role definitions
│   ├── index.js              Entry point
│   ├── seed.js               Sample data seeder
│   └── createAdmin.js        Admin account bootstrap
├── frontend/                 React SPA (Create React App)
│   ├── public/               Static assets and images
│   └── src/
│       ├── components/       Layout, sidebar, shared UI
│       ├── pages/            Route components
│       ├── styles/           Stylesheets
│       └── utils/            API helpers
├── pythonmodel/              FastAPI ML microservices and training scripts
│   ├── api_nb.py             Pest prediction      (port 5002)
│   ├── crop_recommendataion_knn.py  Crop recommendation (port 5003)
│   ├── disease_api.py        Disease recognition  (port 5004)
│   ├── train_nb.py           Pest model training
│   └── train_cnn.py          Disease model training
├── Plant-Disease-Recognition-System-main/   Disease model assets and label data
├── report/                   Project report sources, diagrams, and rendered output
├── UjanProject.ino           Arduino sensor/actuator firmware
└── package.json              Root scripts to run every service
```

## Prerequisites

- Node.js 18+
- Python 3.9+
- MongoDB running locally or a reachable `MONGO_URI`

## Setup

### 1. Install Node dependencies

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

### 2. Create the backend environment file

`backend/.env` is gitignored and **must be created manually** — no example file
is provided.

```ini
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smart_agro
JWT_SECRET=replace-with-a-long-random-string
JWT_EXPIRE=7d

# eSewa payment gateway
ESEWA_MERCHANT_ID=
ESEWA_SECRET_KEY=
ESEWA_SUCCESS_URL=http://localhost:3000/payment-success
ESEWA_FAILURE_URL=http://localhost:3000/payment-failure
```

Roles are seeded automatically on first boot from `backend/utils/permissions.js`.

### 3. Set up the Python environment

```bash
python -m venv pythonmodel/.venv
pythonmodel\.venv\Scripts\activate      # Windows
pip install fastapi uvicorn scikit-learn pandas joblib tensorflow python-multipart
```

### 4. Place the disease recognition model

The trained Keras model is **not committed** (it exceeds GitHub's 100 MB file
limit). Download or retrain it, then place it at:

```
Plant-Disease-Recognition-System-main/models/plant_disease_recog_model_pwp.keras
```

Without it the disease service starts but `/predict` returns
`503 Model not loaded`, and `/health` reports `"model_loaded": false`. All other
services use the `.pkl` / `.joblib` artifacts committed in `pythonmodel/` and
need no extra setup.

### 5. Seed sample data (optional)

```bash
npm --prefix backend run seed
```

## Running

Start all five services together:

```bash
npm start
```

Or run them individually:

| Service | Port | Command |
|---|---|---|
| Backend API | 5000 | `npm run backend` |
| Frontend | 3000 | `npm run frontend` |
| Pest API | 5002 | `npm run pest-api` |
| Crop recommendation API | 5003 | `npm run crop-api` |
| Disease recognition API | 5004 | `npm run disease-api` |

Open <http://localhost:3000>.

The ML services expose interactive docs at `/docs` (for example
<http://localhost:5003/docs>).

### Backend environment variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `MONGO_URI` | yes | — | MongoDB connection string |
| `JWT_SECRET` | yes | — | Token signing key |
| `JWT_EXPIRE` | no | — | Token lifetime |
| `PORT` | no | `5000` | Express listen port |
| `ESEWA_MERCHANT_ID` | for checkout | — | eSewa merchant ID |
| `ESEWA_SECRET_KEY` | for checkout | — | eSewa signing key |
| `ESEWA_SUCCESS_URL` | for checkout | — | Redirect after payment |
| `ESEWA_FAILURE_URL` | for checkout | — | Redirect on payment failure |

### Frontend environment variables

| Variable | Purpose |
|---|---|
| `REACT_APP_BACKEND_URL` | Backend origin for the Socket.IO client; defaults to `http://localhost:5000` |

## Backend API surface

All routes are mounted under `/api`:

`auth`, `records`, `manual`, `pest-alert`, `crop-recommendation`, `products`,
`orders`, `roles`, `users`, `admin`, `disease`, `medicines`, `wishlist`.

A `GET /api/sensor-data` endpoint returns a sample telemetry reading.

## IoT firmware

`UjanProject.ino` reads field sensors and drives an actuator:

- DHT11 on pin 4 (humidity)
- AHT20 (temperature / humidity, I2C)
- BH1750 (ambient light, I2C)
- 20x4 LCD at address `0x27`
- Fan on pin 8, triggered above a `HUMIDITY_THRESHOLD` of `70.0`

Required libraries: `dht11`, `Wire`, `BH1750`, `AHT20`, `LiquidCrystal_I2C`.

## Sample data

CSV exports of MongoDB collections are included for reference:

| File | Contents |
|---|---|
| `smart_agro.farmers.csv` | Farmer records, with base64-encoded avatar images |
| `smart_agro.pestalerts.csv` | Pest alerts with GeoJSON point coordinates |
| `smart_agro.records.csv` | Cultivation records |

## Known caveats

- **Root npm scripts are Windows-specific.** `pest-api` and `crop-api` invoke
  `.venv\Scripts\...` paths, and `disease-api` hardcodes an absolute interpreter
  path (`C:\Users\<user>\AppData\Local\Programs\Python\Python39\python.exe`).
  Replace these with portable invocations — e.g. `.venv/Scripts/uvicorn` on
  Windows, `.venv/bin/uvicorn` on macOS/Linux — before running on another
  machine.
- **`report/` is roughly 64 MB** of documentation artifacts (`.drawio` sources,
  rendered PNGs, generated `.docx` and `.pdf`). It is not needed to run the
  application; consider `git rm -r --cached report` if you want a leaner clone.
- **`__pycache__` directories are committed** under `pythonmodel/` and `report/`.
  These are build artifacts and can be ignored.
- **The disease CNN weights** (`extracted_model/model.weights.h5`) are also
  excluded and must be supplied separately if you use the extracted-model
  variant.

## License

ISC