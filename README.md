# AirGuard

AirGuard is an air quality monitoring and prediction app. A FastAPI backend serves a machine-learning model (trained with scikit-learn) to score or forecast air quality, and a React frontend visualizes the results on an interactive map heatmap and charts.

> This README is based on the project's dependencies and folder structure (`backend/`, `frontend/`, `airguard.ipynb`). Update the sections below with specifics — exact endpoints, data sources, and model details — as needed.

## Features

- **Air quality predictions** served via a FastAPI backend using a trained scikit-learn model (loaded with `joblib`)
- **Interactive map** with heatmap overlays (Leaflet + `leaflet.heat` + `react-leaflet`) to visualize air quality across locations
- **Charts and trends** for historical/predicted data (Recharts)
- **Contact/feedback form** (Formspree integration)
- Clean, responsive UI built with Tailwind CSS and Lucide icons

## Tech Stack

**Backend**
- [FastAPI](https://fastapi.tiangolo.com/) — API framework
- [Uvicorn](https://www.uvicorn.org/) — ASGI server
- [pandas](https://pandas.pydata.org/) — data processing
- [scikit-learn](https://scikit-learn.org/) — machine learning model
- [joblib](https://joblib.readthedocs.io/) — model serialization/loading

**Frontend**
- [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [React Leaflet](https://react-leaflet.js.org/) + [Leaflet.heat](https://github.com/Leaflet/Leaflet.heat) — map & heatmap visualization
- [Recharts](https://recharts.org/) — charts
- [Lucide React](https://lucide.dev/) — icons
- [Formspree](https://formspree.io/) — contact form handling
- [oxlint](https://oxc.rs/docs/guide/usage/linter.html) — linting

**Modeling**
- `airguard.ipynb` — Jupyter notebook used for data exploration and/or model training

## Project Structure

```
airguard/
├── backend/          # FastAPI application, ML model serving
├── frontend/          # React + Vite web app
└── airguard.ipynb     # Notebook for data analysis / model training
```

## Getting Started

### Prerequisites

- Python 3.9+ and pip
- Node.js 18+ and npm

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

> Adjust `main:app` to match the actual module/app object name in the `backend/` directory if different.

The API will be available at `http://localhost:8000` by default. Interactive API docs are available at `http://localhost:8000/docs`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173` by default.

### Building for Production

```bash
cd frontend
npm run build
npm run preview
```

## Notebook

`airguard.ipynb` contains the data analysis and/or model training workflow used to produce the model consumed by the backend. Open it with Jupyter:

```bash
pip install notebook
jupyter notebook airguard.ipynb
```

## Environment Variables

If the backend or frontend require configuration (API keys, data source URLs, Formspree form ID, etc.), document them here, e.g.:

```
# frontend/.env
VITE_API_BASE_URL=http://localhost:8000
VITE_FORMSPREE_FORM_ID=your_form_id
```

## Contributing

Contributions are welcome. Please open an issue or submit a pull request.

## License

Specify a license for this project (e.g. MIT) — none is currently declared in the repository.
