#!/bin/bash

# Trap Ctrl+C and kill all background jobs
trap "echo 'Stopping all topics...'; kill 0" SIGINT

# Function to continuously publish random speed between 3.0 and 5.0
publish_random_speed() {
  while true; do
    speed=$(awk -v min=3 -v max=5 'BEGIN{srand(); printf "%.1f", min + rand() * (max - min)}')
    ros2 topic pub --once /speed_km std_msgs/msg/String "data: '$speed'"
    sleep 0.5
  done
}

# Start publishing random speed
publish_random_speed &

# Publish battery_perc in background
ros2 topic pub /battery_perc sensor_msgs/msg/BatteryState "header:
  stamp:
    sec: 0
    nanosec: 0
  frame_id: ''
voltage: 0.0
temperature: 0.0
current: 0.0
charge: 0.0
capacity: 0.0
design_capacity: 0.0
percentage: 0.82
power_supply_status: 0
power_supply_health: 0
power_supply_technology: 0
present: false
cell_voltage: []
cell_temperature: []
location: ''
serial_number: ''" &

# Publish mode_auto in background
ros2 topic pub /mode_auto std_msgs/msg/Bool "data: true" &

# Wait for all background jobs
wait


