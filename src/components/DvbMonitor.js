import React, { useState, useEffect, useCallback} from "react";
import { Typography, CircularProgress, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";

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
          isarrival: false
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

  // Helper to parse RealTime and show minutes from now
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

  const getTime = (realTimeStr) => {
    if (!realTimeStr) return "N/A";
    const match = realTimeStr.match(/\/Date\((\d+)([-+]\d+)?\)/);
    if (!match) return "N/A";

    const timestamp = parseInt(match[1], 10);
    const date = new Date(timestamp);
    const formatter = new Intl.DateTimeFormat("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Europe/Berlin", // ensure proper local time
    });

    return `${formatter.format(date)} Uhr`;
  };

  const getDelay = (realTimeStr, scheduledTimeStr) => {
    if (!realTimeStr || !scheduledTimeStr) return "N/A";
    const matchRealTimeString = realTimeStr.match(/\/Date\((\d+)([-+]\d+)?\)/);
    const matchScheduledTimeString = scheduledTimeStr.match(/\/Date\((\d+)([-+]\d+)?\)/);
    if (!matchRealTimeString || !matchScheduledTimeString) return "N/A";

    const timestampRealTime = parseInt(matchRealTimeString[1], 10);
    const timestampScheduledTime = parseInt(matchScheduledTimeString[1], 10);

    const delayInMs = timestampRealTime - timestampScheduledTime
    const delayInMinutes = Math.round(delayInMs / 60000)

    return delayInMinutes
  }

  return (
    <>
      <Typography variant="h6" gutterBottom>
        {stopName}
      </Typography>

      {loading ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CircularProgress size={20} />
            <Typography variant="body2">Loading...</Typography>
          </span>
        ) : departures.length === 0 ? (
          <Typography variant="body2">No departures found.</Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Line</TableCell>
                <TableCell>Direction</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Arrival In</TableCell>
                <TableCell>Delay</TableCell>
                <TableCell>Occupancy</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {departures.map((dep, index) => {
                const delay = getDelay(dep.RealTime, dep.ScheduledTime);
                return (
                  <TableRow key={index}>
                    <TableCell>{dep.LineName}</TableCell>
                    <TableCell>{dep.Direction}</TableCell>
                    <TableCell>{getTime(dep.RealTime)}</TableCell>
                    <TableCell>{getMinutesFromNow(dep.RealTime)} min</TableCell>
                    <TableCell>
                      {delay !== 0 ? `${delay} min` : 'On Time'}
                    </TableCell>
                    <TableCell>
                      {dep.Occupancy.replace(/([A-Z])/g, ' $1').trim()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
      )}
    </>
  )
/*   return (
    <div>
      <h2>{stopName}</h2>
      {loading ? 
        (
          <p>Loading...</p>
        ) : 
          departures.length === 0 ? 
            (
              <p>No departures found.</p>
            ) : 
              (
                <table>
                  <thead>
                    <tr>
                      <th>Line</th>
                      <th>Direction</th>
                      <th>Time</th>
                      <th>Arival In</th>
                      <th>Delay</th>
                      <th>Occupancy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departures.map((dep, index) => {
                      const delay = getDelay(dep.RealTime, dep.ScheduledTime);
                      return (
                        <tr key={index}>
                          <td>{dep.LineName}</td>
                          <td>{dep.Direction}</td>
                          <td>{getTime(dep.RealTime)}</td>
                          <td>{getMinutesFromNow(dep.RealTime) + " min"}</td>
                          <td>{delay !== 0 ? delay + " min" : "On Time"}</td>
                          <td>{dep.Occupancy.replace(/([A-Z])/g, ' $1').trim()}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )
      }
    </div>
  ); */
}

export default DvbMonitor;