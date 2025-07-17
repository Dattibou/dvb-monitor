import React, { useState } from "react";
import DvbMonitor from "./DvbMonitor";

function DvbMonitorWrapper() {
  const [inputs, setInputs] = useState([""]);        // Array of stop ID strings
  const [submittedIds, setSubmittedIds] = useState([]); // Final stop IDs after submit

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const validIds = inputs
      .map((val) => parseInt(val.trim(), 10))
      .filter((id) => !isNaN(id));
    setSubmittedIds(validIds);
  };

  return (
    <div>
      <h1>DVB Monitor Setup</h1>
      <form onSubmit={handleSubmit}>
        {inputs.map((value, index) => (
          <div key={index}>
            <label>
              Stop ID #{index + 1}:{" "}
              <input
                type="text"
                value={value}
                onChange={(e) => handleInputChange(index, e.target.value)}
                placeholder="e.g., 33000131"
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
            <DvbMonitor key={index} stopId={stopId} stopName="BlaBlaBla"/>
          ))}
        </div>
      )}
    </div>
  );
}

export default DvbMonitorWrapper;