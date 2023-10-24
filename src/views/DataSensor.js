import React from "react";
import "../styles/datasensor.css";
import { getSSDataFromBackend } from "../services/apiService";
import {formatDate} from "../utils/format";

class DataSensor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sensorData: [],
      filteredData: [],
      currentPage: 1,
      itemsPerPage: 10,
      startDate: "",
      endDate: "",
      searchHour: "",
      searchMinute: "",
      searchSecond: "",
      searchTemperature: "",
      searchHumidity: "",
      searchLight: "",
      sortOrder: "asc",
      sortCriteria: "date",
      lastItemIndex: 0,
    };
  }

  componentDidMount() {
    this.fetchSensorData();
  }

  handleStartDateChange = (e) => {
    this.setState({ startDate: e.target.value }, () => {
      console.log("startDate: ", this.state.startDate);
    });
  };
  
  handleEndDateChange = (e) => {
    this.setState({ endDate: e.target.value }, () => {
      console.log("endDate: ", this.state.endDate);
    });
  };

  handleSearchHourChange = (e) => {
    this.setState({ searchHour: e.target.value });
  };
  
  handleSearchMinuteChange = (e) => {
    this.setState({ searchMinute: e.target.value });
  };
  
  handleSearchSecondChange = (e) => {
    this.setState({ searchSecond: e.target.value });
  };
  
  handleSearchTemperatureChange = (e) => {
    this.setState({ searchTemperature: e.target.value });
  };
  
  handleSearchHumidityChange = (e) => {
    this.setState({ searchHumidity: e.target.value });
  };
  
  handleSearchLightChange = (e) => {
    this.setState({ searchLight: e.target.value });
  };  

  handleDateSearch = () => {
    this.setState({ startDate: "", endDate: "", currentPage: 1, lastItemIndex: 0 }, () => {
      this.fetchSensorData();
    });
  };

  handleSearchTime = () => {
    const { searchHour, searchMinute, searchSecond } = this.state;
    this.fetchSensorData(searchHour, searchMinute, searchSecond);
  };

  handleSensorSearch = () => {
    const { searchTemperature, searchHumidity, searchLight } = this.state;
    this.fetchSensorData(searchTemperature, searchHumidity, searchLight);
  }
  
  //lấy dữ liệu 1 phút
  handleGetLatestData = () => {
    const currentDate = new Date();
    const oneMinuteAgo = new Date(currentDate.getTime() - 60000);
    this.setState({startDate : formatDate(oneMinuteAgo), endDate : formatDate(currentDate)}, () => {
      this.fetchSensorData(this.state.startDate, this.state.endDate);
    });
  };

  sortData = (criteria) => {
    const { sortOrder, sensorData, sortCriteria } = this.state;
    const sortedData = [...sensorData];
  
    sortedData.sort((a, b) => {
      let compareA, compareB;
  
      switch (criteria) {
        case "temperature":
          compareA = parseFloat(a.temperature);
          compareB = parseFloat(b.temperature);
          break;
        case "humidity":
          compareA = parseFloat(a.humidity);
          compareB = parseFloat(b.humidity);
          break;
        case "light":
          compareA = parseFloat(a.light);
          compareB = parseFloat(b.light);
          break;
        default:
          compareA = new Date(a.date);
          compareB = new Date(b.date);
      }
  
      if (sortOrder === "asc") {
        return compareA - compareB;
      } else {
        return compareB - compareA;
      }
    });
  
    this.setState((prevState) => ({
      sensorData: sortedData,
      sortOrder: prevState.sortOrder === "asc" ? "desc" : "asc",
      sortCriteria: criteria,
    }));
  };  

  // Gọi API khi tìm kiếm
  fetchSensorData = () => {
    const { startDate, endDate, itemsPerPage, lastItemIndex, searchHour, searchMinute, searchSecond, searchTemperature, searchHumidity, searchLight } = this.state;
    const offset = lastItemIndex || 0;
    getSSDataFromBackend(startDate, endDate, itemsPerPage, offset, searchHour, searchMinute, searchSecond, searchTemperature, searchHumidity, searchLight)
      .then((data) => {
        if (Array.isArray(data)) {
          this.setState((prevState) => ({
            sensorData: data,
          }));
        } else {
          console.error("Invalid data format:", data);
        }
      })
      .catch((error) => {
        console.error("Error fetching MQTT data from backend:", error);
      });
  };

  handleNextPage = (currentPage) => {
    const { itemsPerPage, lastItemIndex } = this.state;
    const nextPage = currentPage + 1;
    const offset = lastItemIndex + itemsPerPage;
    const { startDate, endDate } = this.state;
    this.setState({
      currentPage: nextPage,
      lastItemIndex: offset,
    }, () => {
      this.fetchSensorData(startDate, endDate, itemsPerPage, offset);
    });
  };
  
  handlePreviousPage = () => {
    const { currentPage, itemsPerPage, lastItemIndex } = this.state;
    if (currentPage > 1) {
      const nextPage = currentPage - 1;
      const offset = lastItemIndex - itemsPerPage;
      const { startDate, endDate } = this.state;
  
      this.setState({
        currentPage: nextPage,
        lastItemIndex: offset,
      }, () => {
        this.fetchSensorData(startDate, endDate, itemsPerPage, offset);
      });
    }
  };

  render() {
    const {
      startDate,
      endDate,
      sortOrder,
      searchTemperature,
      searchHumidity,
      searchLight,
      filteredData,
      sensorData,
    } = this.state;
    const { firstIndexItem, lastIndexItem } = this.state;
    const currentSensorData = sensorData ? sensorData.slice(firstIndexItem, lastIndexItem) : [];
    return (
      <div>
        <div id="datasensor">
          <div className="search-container">
          <label htmlFor="searchHour"> Hour (0-23): </label>
            <input
              type="number"
              id="searchHour"
              name="searchHour"
              min="0"
              max="23"
              onChange={(e) => this.setState({ searchHour: e.target.value })}
              value={this.state.searchHour}
            />

            <label htmlFor="searchMinute"> Minute (0-59): </label>
            <input
              type="number"
              id="searchMinute"
              name="searchMinute"
              min="0"
              max="59"
              onChange={(e) => this.setState({ searchMinute: e.target.value })}
              value={this.state.searchMinute}
            />

            <label htmlFor="searchSecond"> Second (0-59): </label>
            <input
              type="number"
              id="searchSecond"
              name="searchSecond"
              min="0"
              max="59"
              onChange={(e) => this.setState({ searchSecond: e.target.value })}
              value={this.state.searchSecond}
            />

            <button onClick={this.handleSearchTime}>Search by Time</button>
            <label htmlFor="startDate"> Start Date: </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              onChange={this.handleStartDateChange}
              value={startDate}
            />
            <label htmlFor="endDate"> End Date: </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              onChange={this.handleEndDateChange}
              value={endDate}
            />
            <button onClick={this.handleDateSearch}>Search</button>
          </div>
          <div className="filter-container">
            <label htmlFor="searchTemperature"> Temperature (°C): </label>
            <input
              type="number"
              id="searchTemperature"
              name="searchTemperature"
              onChange={this.handleSearchTemperatureChange}
              value={searchTemperature}
            />
            <label htmlFor="searchHumidity"> Humidity (%): </label>
            <input
              type="number"
              id="searchHumidity"
              name="searchHumidity"
              onChange={this.handleSearchHumidityChange}
              value={searchHumidity}
            />
            <label htmlFor="searchLight"> Light (Lux): </label>
            <input
              type="number"
              id="searchLight"
              name="searchLight"
              onChange={this.handleSearchLightChange}
              value={searchLight}
            />
            <button onClick={this.handleSensorSearch}>Search</button>
            <button onClick={this.handleGetLatestData}>One Minute</button>
            <div className="sort-buttons">
              <button onClick={() => this.sortData("temperature")}>
                Sort by Temperature
              </button>
              <button onClick={() => this.sortData("humidity")}>
                Sort by Humidity
              </button>
              <button onClick={() => this.sortData("light")}>
                Sort by Light
              </button>
              <button onClick={() => this.sortData("date")}>
                Sort by Date
              </button>
            </div>
          </div>
          
          <table className="sensor-data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Sensor Name</th>
                <th>Temperature</th>
                <th>Humidity</th>
                <th>Light</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {currentSensorData.map((item, index) => (
                <tr key={index}>
                  <td>{item.id}</td>
                  <td>{item.idss}</td>
                  <td>{item.temperature}°C</td>
                  <td>{item.humidity}%</td>
                  <td>{item.light} Lux</td>
                  <td>{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <button
            onClick={this.handlePreviousPage}
            disabled={this.state.currentPage === 1}
          >
            Previous
          </button>
          <span className="current-page">{this.state.currentPage}</span>
          <button
            onClick={() => this.handleNextPage(this.state.currentPage)}
            disabled={10 > currentSensorData.length}
          >
            Next
          </button>
        </div>
      </div>
    );
  }
}

export default DataSensor;
