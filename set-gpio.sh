#!/bin/sh

#
# Example setup script for homebridge-gpio-wpi
#
# Make sure that the user you're running homebridge as
# is a member of the 'gpio' group.
#

GPIO=/usr/local/bin/gpio

# These are the BCM_GPIO Pin Numbers!
PINS='22 23 24'

for i in $PINS
do
	$GPIO -g mode $i out
	$GPIO -g mode $i down

	$GPIO export $i out
done
