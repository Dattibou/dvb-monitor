import React, { useCallback, useState } from "react";
import DvbMonitor from "./DvbMonitor";

function DvbMonitorWrapper() {
  const [inputs, setInputs] = useState([""]);        // Array of stop ID strings
  const [submittedIds, setSubmittedIds] = useState([]); // Final stop IDs after submit
  const [submittedStopNames, setSubmittedStopNames] = useState([]);

  const handleInputChange = (index, value) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const addInputField = () => {
    setInputs([...inputs, ""]);
  };

  const handleDeleteInput = (indexToDelete) => {
    if (inputs.length <= 1) return; // Don't delete the last input
    const newInputs = inputs.filter((_, index) => index !== indexToDelete);
    setInputs(newInputs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetchStopIds();
  };

  const fetchStopIds = useCallback(async () => {
    let stopIds = [];
    let stopNames = [];
    for (const input of inputs) {
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
          stopIds.push(null)
          stopNames.push(null)
          console.warn(`No stop found for input: ${input}`);
          continue;
        }

      }
      catch (error) {
        stopIds.push(null)

        console.error("API error:", error);
      }
    }
    setSubmittedIds(stopIds)
    setSubmittedStopNames(stopNames)
  }, [inputs]);

  return (
    <div>
      <h1>DVB Monitor Setup</h1>
      <form onSubmit={handleSubmit}>
        {inputs.map((value, index) => (
          <div key={index}>
            <label>
              Stop #{index + 1}:{" "}
              <input
                type="text"
                value={value}
                onChange={(e) => handleInputChange(index, e.target.value)}
                placeholder="z.B. HBF"
              />
            </label>
            {" "}
            <button type="button" onClick={() => handleDeleteInput(index)}>
              Delete
            </button>
          </div>
        ))}
        <button type="button" onClick={addInputField}>+ Add Stop</button>
        <br />
        <button type="submit">Show Monitors</button>
      </form>

      <hr />

      {submittedIds.length > 0 && (
        <div>
          <h2>Monitors</h2>
          {submittedIds.map((stopId, index) => (
            <DvbMonitor key={index} stopId={stopId} stopName={submittedStopNames[index]}/>
          ))}
        </div>
      )}
    </div>
  );
}

export default DvbMonitorWrapper;