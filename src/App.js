import React, { Component } from "react";
import "./App.css";
import FileUpload from "./FileUpload";


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data : []
    }
  }

  set_data = (csv_data) => {
    this.setState({ data: csv_data});
  }

  render() {
    return (
      <div>
        <FileUpload set_data={this.set_data}></FileUpload>
      </div>
    );
  }
}

export default App;