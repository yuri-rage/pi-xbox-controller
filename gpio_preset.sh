#!/bin/bash

# Node's onoff module sometimes doesn't capture GPIO properly unless pinctrl is used first.
# Here, all pins are set to input with no pull-up or pull-down resistors.
# This should allow for normal controller interaction until a macro takes over.

echo -en "\nPresetting GPIO pins..."

pinctrl set 4 ip pn # X
pinctrl set 5 ip pn # A
pinctrl set 6 ip pn # View
pinctrl set 12 ip pn # TriggerR
pinctrl set 13 ip pn # Menu
pinctrl set 16 ip pn # DpadR
pinctrl set 17 ip pn # DpadL
pinctrl set 19 ip pn # DpadU
pinctrl set 22 ip pn # DpadD
pinctrl set 23 ip pn # LB
pinctrl set 24 ip pn # RB
pinctrl set 25 ip pn # TriggerL
pinctrl set 26 ip pn # Y
pinctrl set 27 ip pn # B

echo -e "done.\n"
