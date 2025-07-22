import React, { useState, useEffect, useCallback} from "react";
import { Typography, CircularProgress, Table, TableHead, TableRow, TableCell, TableBody, Box } from "@mui/material";
import CircleIcon from '@mui/icons-material/Circle';

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
    if (!realTimeStr) return "Cancelled";
    const match = realTimeStr.match(/\/Date\((\d+)([-+]\d+)?\)\//);
    if (!match) return "N/A";

    const timestamp = parseInt(match[1], 10);
    const now = Date.now();
    const diffMs = timestamp - now;
    const diffMinutes = Math.round(diffMs / 60000);
    return diffMinutes >= 0 ? diffMinutes : 0;
  };

  const getTime = (realTimeStr) => {
    if (!realTimeStr) return "Cancelled";
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
    if (!realTimeStr || !scheduledTimeStr) return "Cancelled";
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
      <Typography variant="h5" gutterBottom align="center">
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
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="medium" sx={{ '& td, & th': { fontSize: '1rem' } }}>
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
                      <TableCell>
                        <Typography
                          color={
                            typeof getMinutesFromNow(dep.RealTime) === 'number'
                              ? 'textPrimary'
                              : 'secondary'
                          }
                        >
                          {getTime(dep.RealTime)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          color={
                            typeof getMinutesFromNow(dep.RealTime) === 'number'
                              ? 'textPrimary'
                              : 'secondary'
                          }
                        >
                          {typeof getMinutesFromNow(dep.RealTime) === 'number'
                            ? `${getMinutesFromNow(dep.RealTime)} min`
                              : getMinutesFromNow(dep.RealTime)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          color={
                            typeof delay === 'number'
                              ? delay > 0
                                ? 'secondary'
                                : delay < 0
                                ? 'primary'
                                : 'textPrimary'
                              : 'secondary'
                          }
                        >
                          {typeof delay === 'number'
                            ? `${delay > 0 ? '+' : ''}${delay} min`
                            : delay}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" justifyContent="center">
                          <CircleIcon
                            fontSize="small"
                            sx={{
                              color:
                                dep.Occupancy === 'ManySeats'
                                  ? 'green'
                                  : dep.Occupancy === 'StandingOnly'
                                    ? 'red'
                                    : 'goldenrod', // for Unknown
                            }}
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>    
          </Box>
          
      )}
    </>
  )
}

export default DvbMonitor;