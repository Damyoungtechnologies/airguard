import React, { useState, useEffect } from 'react'
import LandingPage from './components/LandingPage'
import MapView from './components/MapView'
import HealthTips from './components/HealthTips'
import 'leaflet/dist/leaflet.css'
import './index.css'

function App() {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  let View = LandingPage;
  if (hash === '#map') View = MapView;
  if (hash === '#tips') View = HealthTips;

  return (
    <>
      <View />
    </>
  )
}

export default App
