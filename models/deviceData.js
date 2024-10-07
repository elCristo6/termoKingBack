// lib/models/deviceData.js

const mongoose = require('mongoose');

const gpsSchema = new mongoose.Schema({
  Enabled: Boolean,
  Latitude: Number,
  Longitude: Number,
  Speed: Number,
  Altitude: Number,
  SatellitesVisible: Number,
  SatellitesUsed: Number,
  Accuracy: Number,
  MapLink: String,
}, { _id: false }); // Evitar la creación de un _id para subdocumentos

const deviceDataSchema = new mongoose.Schema({
  deviceID: { type: String, required: true }, // Asegúrate de que deviceID es un String si así está definido en User
  RunTime: Number,
  Temperature: Number,
  SetPoint: Number,
  GPS: gpsSchema,
  userId: { type: String, required: true }, // Asociar datos con un usuario específico
}, { timestamps: true });

class DeviceData {
  constructor(data) {
    this.deviceID = data.deviceID;
    this.RunTime = data.RunTime;
    this.Temperature = data.Temperature;
    this.SetPoint = data.SetPoint;
    this.GPS = data.GPS;
    this.userId = data.userId; // Asegurar que el campo userId está presente
  }
}

module.exports = mongoose.model('DeviceData', deviceDataSchema);
