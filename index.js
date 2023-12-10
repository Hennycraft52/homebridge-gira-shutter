
const { toggleShutter, getShutterStatus } = require('./lib/shutter');

module.exports = (homebridge) => {
    const Accessory = homebridge.hap.Accessory;
    const Service = homebridge.hap.Service;
    const Characteristic = homebridge.hap.Characteristic;

    class ShutterAccessory {
        constructor(log, config) {
            this.log = log;
            this.name = config.name;
            this.ip = config.ip;
            this.shutterId = config.shutterId;
            this.username = config.username;
            this.password = config.password;

            this.service = new Service.WindowCovering(this.name);
            this.lastKnownPosition = 0; // Speichern Sie die letzte bekannte Position

            this.service
                .getCharacteristic(Characteristic.CurrentPosition)
                .on('get', this.getCurrentPosition.bind(this));

            this.service
                .getCharacteristic(Characteristic.TargetPosition)
                .on('set', this.setTargetPosition.bind(this));

            // Abrufen des aktuellen Status beim Start
            this.getCurrentPosition((err, position) => {
                if (!err) {
                    this.service
                        .getCharacteristic(Characteristic.CurrentPosition)
                        .updateValue(position);
                    this.lastKnownPosition = position;
                }
            });

            // Aktualisieren Sie den Status alle 5 Sekunden
            this.statusUpdateInterval = setInterval(() => {
                this.getCurrentPosition((err, position) => {
                    if (!err && this.lastKnownPosition !== position) {
                        this.service
                            .getCharacteristic(Characteristic.CurrentPosition)
                            .updateValue(position);
                        this.lastKnownPosition = position;
                    }
                });
            }, 5000);
        }

        getCurrentPosition(callback) {
            getShutterStatus(this.ip, this.shutterId, this.username, this.password)
                .then((status) => {
                    const position = status === 1 ? 100 : 0;
                    callback(null, position);
                })
                .catch((error) => {
                    this.log('Error getting shutter status:', error);
                    callback(error);
                });
        }

        setTargetPosition(value, callback) {
            if (value !== this.lastKnownPosition) {
                toggleShutter(this.ip, this.shutterId, this.username, this.password)
                    .then(() => {
                        setTimeout(() => {
                            this.getCurrentPosition((err, newPosition) => {
                                if (!err) {
                                    this.service
                                        .getCharacteristic(Characteristic.CurrentPosition)
                                        .updateValue(newPosition);
                                    this.service
                                        .getCharacteristic(Characteristic.TargetPosition)
                                        .updateValue(newPosition);
                                    this.lastKnownPosition = newPosition;
                                }
                            });
                        }, 1000);
                        callback(null);
                    })
                    .catch((error) => {
                        this.log('Error setting shutter position:', error);
                        callback(error);
                    });
            } else {
                callback(null);
            }
        }

        getServices() {
            return [this.service];
        }
    }

    homebridge.registerAccessory('homebridge-shutter', 'ShutterV1', ShutterAccessory);
};









