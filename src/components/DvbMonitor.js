import React, { useState, useEffect, useCallback} from "react";

function DvbMonitor({ stopId, stopName }) {
  const [departures, setDepartures] = useState([]);
  const [loading, setLoading] = useState(false);
  

  const fetchDepartures = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch( "https://webapi.vvo-online.de/dm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
   
        body: JSON.stringify({
          stopid: stopId,
          limit: 10,
          isarrival: true
        }),
      });

      if (!response.ok) {
        console.error("HTTP error", response.status);
        setDepartures([]);
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      setDepartures(data.Departures || []);
    } catch (error) {
        console.error("API error:", error);
    }
    setLoading(false);
  }, [stopId]);

  useEffect(() => {
    fetchDepartures();
    const interval = setInterval(fetchDepartures, 10000);
    return () => clearInterval(interval);
  }, [fetchDepartures]);
  
  if (stopId == null || stopName == null) return null; //prevent useless mounts

  // Helper to parse RealTime and show minutes from now (optional but recommended)
  const getMinutesFromNow = (realTimeStr) => {
    if (!realTimeStr) return "N/A";
    const match = realTimeStr.match(/\/Date\((\d+)([-+]\d+)?\)\//);
    if (!match) return "N/A";

    const timestamp = parseInt(match[1], 10);
    const now = Date.now();
    const diffMs = timestamp - now;
    const diffMinutes = Math.round(diffMs / 60000);
    return diffMinutes >= 0 ? diffMinutes : 0;
  };

  return (
    <div>
      <h1>{stopName}</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {departures.length === 0 ? (
            <li>No departures found.</li>
          ) : (
            departures.map((dep, index) => (
              <li key={index}>
                {dep.LineName} → {dep.Direction} in {getMinutesFromNow(dep.RealTime)} min
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export default DvbMonitor;