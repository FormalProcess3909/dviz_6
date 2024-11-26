import React, { Component } from "react";
import * as d3 from "d3";
import "./Child1.css";

class Child1 extends Component {
  state = {
    company: "Apple", // Default Company
    selectedMonth: "November", //Default Month
  };

  componentDidMount() {
    console.log(this.props.csv_data); // Use this data as default. When the user will upload data this props will provide you the updated data
    this.renderChart();
  }

  componentDidUpdate(prevProps, prevState) {
    // Check if relevant state or props changed
    if (
      prevState.company !== this.state.company ||
      prevState.selectedMonth !== this.state.selectedMonth ||
      prevProps.csv_data !== this.props.csv_data
    ) {
      this.renderChart(); // Redraw chart on state/props update
    }
  }

  // Adding handler for changing the selected company
  handleCompanyChange = (event) => {
    const selectedCompany = event.target.value;
    console.log("Selected Company: ", selectedCompany);
    this.setState({ company: selectedCompany }, this.renderChart);
  };

  // Handle changing selected month
  handleMonthChange = (event) => {
    const selectedMonth = event.target.value;
    console.log("Selected Month: ", selectedMonth);
    this.setState({ selectedMonth });
  };

  renderChart = () => {
    // Save data to variable
    let data = this.props.csv_data.filter(
      (d) =>
        d.Company === this.state.company &&
        new Date(d.Date).getMonth() ===
          new Date(`${this.state.selectedMonth} 1, 2024`).getMonth()
    );
    console.log("Filtered data:", data);

    data.forEach((d) => {
      d.Date = new Date(d.Date);
    });

    // Set the dimensions of the chart
    const margin = { top: 20, right: 30, bottom: 40, left: 40 },
      width = 550,
      height = 350,
      innerWidth = 500 - margin.left - margin.right,
      innerHeight = 300 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3
      .select("#mysvg")
      .attr("width", width)
      .attr("height", height)
      .select("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set the scales for the axes
    const x_Scale = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.Date))
      .range([0, innerWidth]);

    const y_Scale = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => Math.min(d.Open, d.Close)),
        d3.max(data, (d) => Math.max(d.Open, d.Close)),
      ])
      .range([innerHeight, 0]);

    // Create the line Generator for open
    const lineGeneratorOpen = d3
      .line()
      .curve(d3.curveCardinal)
      .x((d) => x_Scale(d.Date))
      .y((d) => y_Scale(d.Open));

    const lineGeneratorClose = d3
      .line()
      .curve(d3.curveCardinal)
      .x((d) => x_Scale(d.Date))
      .y((d) => y_Scale(d.Close));

    // Use join to handle the enter, update, and exit of the line path
    //Draw open line
    svg
      .selectAll(".line-path-open")
      .data([data])
      .join("path")
      .attr("class", "line-path-open")
      .attr("d", lineGeneratorOpen);

    // Draw Close line
    svg
      .selectAll(".line-path-close")
      .data([data])
      .join("path")
      .attr("class", "line-path-close")
      .attr("d", lineGeneratorClose);

    // Get colors from CSS
    const openColor = getComputedStyle(
      document.querySelector(".line-path-open")
    ).stroke;
    const closeColor = getComputedStyle(
      document.querySelector(".line-path-close")
    ).stroke;

    svg
      .selectAll(".x.axis")
      .data([null])
      .join("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0,${innerHeight + 5})`)
      .call(
        d3.axisBottom(x_Scale).tickFormat(d3.timeFormat("%a %d"))
      )
      .selectAll("text")
      .attr("transform", `translate(20 15) rotate(45)`)
      .style("font-size", "12px");

    // Add the Y axis using join
    svg
      .selectAll(".y.axis")
      .data([null])
      .join("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(y_Scale))
      .attr("transform", `translate(-5,0)`);

    // Add legend
    const legend = svg
      .selectAll(".legend")
      .data([
        { label: "Open", color: openColor },
        { label: "Close", color: closeColor },
      ])
      .join("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(${innerWidth + 10}, ${i * 20})`);

    // Add legend rectangles
    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", (d) => d.color);

    // Add legend text
    legend
      .append("text")
      .attr("x", 15)
      .attr("y", 10)
      .attr("dy", "0.35em")
      .text((d) => d.label)
      .style("font-size", "12px")
      .style("font-family", "Arial, sans-serif");

    // Select the tooltip div
    const tooltip = d3.select("#tooltip");

    // Draw circles for Open prices
    svg
      .selectAll(".circle-open")
      .data(data)
      .join("circle")
      .attr("class", "circle-open")
      .attr("cx", (d) => x_Scale(d.Date))
      .attr("cy", (d) => y_Scale(d.Open))
      .attr("r", 3)
      .on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(
            `<strong>Date:</strong> ${d3.timeFormat("%m/%d/%Y")(d.Date)}<br>
             <strong>Open:</strong> ${d.Open.toFixed(2)}<br>
             <strong>Close:</strong> ${d.Close.toFixed(2)}<br>
             <strong>Difference:</strong> ${(d.Close - d.Open).toFixed(2)}`
          )
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });

    // Draw circles for Close prices
    svg
      .selectAll(".circle-close")
      .data(data)
      .join("circle")
      .attr("class", "circle-close")
      .attr("cx", (d) => x_Scale(d.Date))
      .attr("cy", (d) => y_Scale(d.Close))
      .attr("r", 3)
      .on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(
            `<strong>Date:</strong> ${d3.timeFormat("%m/%d/%Y")(d.Date)}<br>
             <strong>Open:</strong> ${d.Open.toFixed(2)}<br>
             <strong>Close:</strong> ${d.Close.toFixed(2)}<br>
             <strong>Difference:</strong> ${(d.Close - d.Open).toFixed(2)}`
          )
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });
  };

  render() {
    const options = ["Apple", "Microsoft", "Amazon", "Google", "Meta"]; // Use this data to create radio button
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]; // Use this data to create dropdown

    return (
      <div className="child1">
        {/* Adding Radio button for company selection and learning to comment this way*/}
        <div>
          <label>Company:</label>
          {options.map((company) => (
            <label key={company} style={{ marginLeft: "10px" }}>
              <input
                type="radio"
                value={company}
                checked={this.state.company === company}
                onChange={this.handleCompanyChange}
              />
              {company}
            </label>
          ))}
        </div>

        {/* Dropdown for month selection */}
        <div style={{ marginTop: "20px" }}>
          <label>Month:</label>
          <select
            value={this.state.selectedMonth}
            onChange={this.handleMonthChange}
            style={{ marginLeft: "10px" }}
          >
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
        <div
          id="tooltip"
          className="tooltip"
          style={{ position: "absolute", opacity: 0 }}
        ></div>
        <svg id="mysvg" width="700" height="400">
          <g></g>
        </svg>
      </div>
    );
  }
}

export default Child1;
