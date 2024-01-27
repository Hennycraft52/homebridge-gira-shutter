let Service, Characteristic;
const Shutter = require('./lib/shutter');

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory('homebridge-gira-shutter', 'Shutter', ShutterAccessory);
};

function ShutterAccessory(log, config) {
    this.log = log;
    this.shutter = new Shutter(config.ip, config.shutterid, config.username, config.password);
}

ShutterAccessory.prototype = {
    getServices: function() {
        let windowCoveringService = new Service.WindowCovering(this.name);

        windowCoveringService
            .getCharacteristic(Characteristic.CurrentPosition)
            .on('get', this.getPosition.bind(this));

        windowCoveringService
            .getCharacteristic(Characteristic.TargetPosition)
            .on('get', this.getPosition.bind(this))
            .on('set', this.setPosition.bind(this));

        return [windowCoveringService];
    },

    getPosition: function(callback) {
        this.shutter.getStatus().then(status => {
            callback(null, status ? 0 : 100); // 0 = geschlossen, 100 = geöffnet
        }).catch(err => {
            callback(err);
        });
    },

    setPosition: function(value, callback) {
        this.shutter.setStatus(value === 0 ? 1 : 0).then(() => { // 1 = geschlossen, 0 = geöffnet
            callback(null);
        }).catch(err => {
            callback(err);
        });
    }
};
