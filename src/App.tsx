import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import TravelRecapApp from "./components/travel-recap/TravelRecapApp";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
          <Route path="/" element={<TravelRecapApp />} />
          <Route path="/travel-recap" element={<Navigate to="/" replace />} />
        </Routes>
      </>
    </Suspense>
  );
}

export default App;
