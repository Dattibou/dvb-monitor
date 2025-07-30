import React, { useCallback, useState } from "react";
import DvbMonitor from "./DvbMonitor";
import { Box, Typography, TextField, IconButton, Paper, Grid, Card, CardContent, Stack, Collapse } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DepartureBoardIcon from '@mui/icons-material/DepartureBoard';

function DvbMonitorWrapper() {
  const [inputs, setInputs] = useState([""]);        // Array of stop ID strings
  const [submittedIds, setSubmittedIds] = useState([]); // Final stop IDs after submit
  const [submittedStopNames, setSubmittedStopNames] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [expanded, setExpanded] = useState(true);


  const handleInputChange = (index, value) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const addInputField = () => {
    setInputs([...inputs, ""]);
  };

  const handleDeleteInput = (indexToDelete) => {
    const newInputs = inputs.filter((_, index) => index !== indexToDelete);
    setInputs(newInputs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Check if there's at least one non-empty input
    const hasValidInput = inputs.some(input => input.trim() !== "");
    if (!hasValidInput) {
      alert("Please enter at least one valid stop.");
      return; // stop submission if no valid input
    }
    await fetchStopIds();
  };

  const fetchStopIds = useCallback(async () => {
    const cleanedInputs = inputs.filter(input => input.trim() !== "");
    setInputs(cleanedInputs); // update state to remove empty input fields from UI
    
    let stopIds = [];
    let stopNames = [];
    let newWarnings = [];
    for (const input of cleanedInputs) {
      try {
        const response = await fetch("https://webapi.vvo-online.de/tr/pointfinder", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: input,
            stopsOnly: true,
            regionalOnly: true
          }),
        });
        const data = await response.json()
        
        if (data.Points && data.Points.length > 0) {
          const stopId = data.Points[0].split("|")[0];
          const stopName = data.Points[0].split("|")[3];
          stopIds.push(stopId);
          stopNames.push(stopName)
        }
        else {
          newWarnings.push(`No stop found for input: "${input}"`);
        }

      }
      catch (error) {
        console.error("API error:", error);
      }
    }
    setSubmittedIds(stopIds)
    setSubmittedStopNames(stopNames)
    setWarnings(newWarnings)
  }, [inputs]);

  const handleToggle = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <Paper sx={{ p: 2, minHeight: "100vh"}} elevation={0}>

      <Paper sx={{ p: 2, mb: 1}} elevation={3}>
        <Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"}>
          <Typography variant="h4" gutterBottom>
            DVB Monitor Settings
          </Typography>
          <IconButton
            onClick={handleToggle}
            size="small"
            color="primary"
            sx={{ 
              ml: 1,
              '&:hover': {
                color: (theme) => theme.palette.secondary.main, // use secondary color on hover
              }, 
            }}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Stack>
        
      
        {/* Submitting form */}
        <Collapse in={expanded}>
          <Box component="form" onSubmit={handleSubmit}>
            {inputs.map((value, index) => (
              <Box key={index} sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <TextField
                  variant="outlined"
                  value={value}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  placeholder="z.B. HBF"
                  size="small"
                  sx={{flexGrow: 1, mr: 2}}
                />
                <IconButton
                  type="submit"
                  aria-label="show monitors"
                  color="primary"
                  sx={{
                    '&:hover': {
                      color: (theme) => theme.palette.secondary.main,
                    }
                  }}
                >
                  <DepartureBoardIcon />
                </IconButton>
                <IconButton
                  aria-label="delete"
                  color="primary"
                  onClick={() => handleDeleteInput(index)}
                  sx={{ 
                    ml: 1,
                    '&:hover': {
                      color: (theme) => theme.palette.secondary.main, // use secondary color on hover
                    }, 
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}

            <IconButton
              onClick={addInputField}
              aria-label="add stop"
              color="primary"
              sx={{ 
                mr: 2,
                "&:hover": {
                  color: (theme) => theme.palette.secondary.main,
                } 
              }}
            >
              <AddIcon />
            </IconButton>
          </Box>
        </Collapse>
        
      </Paper>

      {warnings.length > 0 && (
        <Paper sx={{ p: 2, mb: 1 }} elevation={3}>
          {warnings.map((warning, idx) => (
            <Typography key={idx} color="warning.main" variant="body2">
              {warning}
            </Typography>
          ))}
        </Paper>
      )}

      {submittedIds.filter(Boolean).length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }} elevation={3}>
          <Grid container spacing={2}>
            {submittedIds.map((stopId, index) => (
              <Grid item xs={12} sm={6} md={4} key={stopId}>
                <Card>
                  <CardContent>
                    <DvbMonitor stopId={stopId} stopName={submittedStopNames[index]} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Paper>
  );
}

export default DvbMonitorWrapper;