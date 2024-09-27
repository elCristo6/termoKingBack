// models/deviceData.js

class DeviceData {
  constructor(data) {
    this.deviceID = data.deviceID
    this.RunTime = data.RunTime;
    this.Temperature = data.Temperature;
    this.SetPoint = data.SetPoint;
    this.GPS = data.GPS;
  }
}

module.exports = DeviceData;
