import React, { Component } from 'react';
import * as d3 from "d3";

class FileUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
      jsonData: null,  // New state to store the parsed JSON data
    };
  }
  
  handleFileSubmit = (event) => {
    event.preventDefault();
    const { file } = this.state;

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const json = this.csvToJson(text);
        this.setState({ jsonData: json });  // Set JSON to state
        this.props.set_data(json)
      };
      reader.readAsText(file);
    }
  };

  csvToJson = (csv) => {
    const lines = csv.split("\n"); // Split by new line to get rows
    const headers = lines[0].split(","); // Get headers
    const result = [];
  
    const parseDate = d3.timeParse("%Y-%m-%d"); // Correct date format
  
    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i].split(","); // Split each line by comma
      const obj = {};
  
      // Map each column value to the corresponding header
      headers.forEach((header, index) => {
        obj[header.trim()] = currentLine[index]?.trim(); // Trim to clean data
      });
  
      const rawDate = obj.Date?.trim(); // Safely trim raw date
      const parsedDate = parseDate(rawDate);
  
      // Add object to result
      const parsedObj = {
        Date: parsedDate, // Use the parsed date explicitly
        "GPT-4": parseInt(obj["GPT-4"]),
        Gemini: parseInt(obj.Gemini),
        "PaLM-2": parseInt(obj["PaLM-2"]),
        Claude: parseInt(obj.Claude),
        "LLaMA-3.1": parseFloat(obj["LLaMA-3.1"]),
      };
  
      result.push(parsedObj);
    }
  
    return result;
  };
  

  render() {
    return (
      <div style={{ backgroundColor: "#f0f0f0", padding: 20 }}>
        <h2>Upload a CSV File</h2>
        <form onSubmit={this.handleFileSubmit}>
          <input type="file" accept=".csv" onChange={(event) => this.setState({ file: event.target.files[0] })} />
          <button type="submit">Upload</button>
        </form>
      </div>
    );
  }
}

export default FileUpload;
