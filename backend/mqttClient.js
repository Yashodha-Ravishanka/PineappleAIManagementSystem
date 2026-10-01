const mqtt = require('mqtt');
const GPSData = require('./models/GPSData');

const client = mqtt.connect('mqtt://broker.hivemq.com');

client.on('connect', () => {
    console.log('MQTT Connected');
    client.subscribe('pineapple/gps');
});

client.on('message', async (topic, message) => {
    const data = JSON.parse(message.toString());

    await GPSData.create(data);

    console.log('GPS Data Received via MQTT');
});

module.exports = client;