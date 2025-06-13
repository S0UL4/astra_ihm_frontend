#!/bin/bash
# @Author: Iheb Soula
# @Date:   2025-06-02 14:49:02
# @Last Modified by:   Your name
# @Last Modified time: 2025-06-13 15:46:00
#!/bin/bash
set -e

# Define targets array
targets=("barakuda_speed_panel" "control_sensors" "sensors_status_barakuda" "RobotPositionPlugin" "LisierePanel" "BatteryLevelPanel" "SafetyModuleAssist")

# Save the current directory
orig_dir=$(pwd)

# Loop through each target
for t in "${targets[@]}"; do
    echo "Installing dependencies for $t..."
    cd ../src/$t
    npm install
    cd $orig_dir
done
