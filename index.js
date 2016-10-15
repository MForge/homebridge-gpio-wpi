var wpi = require("wiring-pi");
var Service, Characteristic;

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    homebridge.registerAccessory('homebridge-gpio-wpi', 'GPIO', GPIOAccessory);
}

function GPIOAccessory(log, config) {
    this.log = log;
    this.name = config['name'];
    this.pin = config['pin'];
    this.duration = config['duration'];

    //Config option to invert behaviour of GPIO output - i.e. 0 = On, 1 = Off.
    this.inverted = ( config['inverted'] === "true" );

    this.service = new Service.Switch(this.name);

    if (!this.pin) throw new Error('You must provide a config value for pin.');

    //Use pin numbering based on /sys/class/gpio exports (non-root)
    wpi.setup('sys');

    this.service
        .getCharacteristic(Characteristic.On)
        .on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));

}

GPIOAccessory.prototype.getServices = function() {
    return [this.service];
}

GPIOAccessory.prototype.getOn = function(callback) {
    // inverted XOR pin_value
    var on = ( this.inverted != wpi.digitalRead(this.pin) );
    callback(null, on);
}

GPIOAccessory.prototype.setOn = function(on, callback) {
    // Handle inverted configurations by evaluating the
    //  inverse of the inverted config bool, multipled by 1 to
    //  give a 1 or 0 result for pinAction
    if (on) {
        this.pinAction(!this.inverted * 1);
        if (is_defined(this.duration) && is_int(this.duration)) {
            this.pinTimer()
        }
        callback(null);
    } else {
        this.pinAction(this.inverted * 1);
        callback(null);
    }
}

GPIOAccessory.prototype.pinAction = function(action) {
    this.log('Turning ' + (action == (!this.inverted * 1) ? 'on' : 'off') + ' pin #' + this.pin);

    var self = this;
    wpi.digitalWrite(self.pin, action);
    var success = (wpi.digitalRead(self.pin) == action);
    return success;
}

GPIOAccessory.prototype.pinTimer = function() {
    var self = this;
    setTimeout(function() {
        self.pinAction(this.inverted * 1);
    }, this.duration);
}

var is_int = function(n) {
    return n % 1 === 0;
}

var is_defined = function(v) {
    return typeof v !== 'undefined';
}
