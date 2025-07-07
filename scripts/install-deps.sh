#!/bin/bash
# @Author: Iheb Soula
# @Date:   2025-06-02 14:49:02
# @Last Modified by:   Your name
# @Last Modified time: 2025-06-02 14:51:10
#!/bin/bash
set -e

# Define targets array
targets=("TrajectoryHandler" "barakuda_speed_panel" "control_sensors" "sensors_status_barakuda" "RobotPositionPlugin" "LisierePanel" "BatteryLevelPanel")

# Save the current directory
orig_dir=$(pwd)

# Loop through each target
for t in "${targets[@]}"; do
    echo "Installing dependencies for $t..."
    cd ../src/$t
    npm install
    cd $orig_dir
done
