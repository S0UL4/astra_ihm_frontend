#!/bin/bash
# @Author: Iheb Soula
# @Date:   2025-06-02 14:49:02
# @Last Modified by:   Your name
# @Last Modified time: 2025-06-13 15:45:46
#!/bin/bash
set -e

# Define targets array
targets=("barakuda_speed_panel" "control_sensors" "sensors_status_barakuda" "RobotPositionPlugin" "LisierePanel" "BatteryLevelPanel" "SafetyModuleAssist")

# Save the current directory
orig_dir=$(pwd)

# Loop through each target
for t in "${targets[@]}"; do
    echo "Building $t..."
    cd ../src/$t
    npm run local-install
    cd $orig_dir
done
