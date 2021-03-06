var fs = require('fs');

const MAX_GPIO = 64;
const SYSFS_GPIO = '/sys/class/gpio/gpio';

module.exports = function() {
    var gpioexports = [];
    for(var i=0; i < MAX_GPIO; ++i){
      try {
          fs.accessSync(SYSFS_GPIO + i, fs.F_OK);

          var direction = fs.readFileSync(SYSFS_GPIO + i + '/direction', 'utf8');
          var value = fs.readFileSync(SYSFS_GPIO + i + '/value', 'utf8');

          var gpio = {
            'pin': i,
            'direction': direction.trim(),
            'value': value.trim()
          };

          gpioexports.push(gpio);

      } catch (e) {
          var gpio = { 'pin': i, 'error': e.code };
          gpioexports.push(gpio);
      }
    }

    return(gpioexports);
}
