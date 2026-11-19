# 🔌 Hardware Wiring & Pinout Guide

This guide details the complete hardware pin connections for the **Autonomous Garbage Collecting & Smart Monitoring Robot**, covering both the mobile chassis controller and the smart dustbin IoT monitoring system.

---

## 1. Mobile Robot Chassis Controller (Navigation & Avoidance)

### 📌 5-Channel IR Line Tracking Sensor Array
| Sensor Module Pin | Microcontroller Pin | Description |
|---|---|---|
| `VCC` | `5V` | Sensor Logic Power |
| `GND` | `GND` | System Ground |
| `IR_L2` (Far Left) | `GPIO 32` | Detects extreme left turn / cross-intersection |
| `IR_L1` (Left) | `GPIO 33` | Fine left line tracking correction |
| `IR_C` (Center) | `GPIO 35` | On-track center guidance |
| `IR_R1` (Right) | `GPIO 34` | Fine right line tracking correction |
| `IR_R2` (Far Right) | `GPIO 39` | Detects extreme right turn / cross-intersection |

---

### 📌 L298N Dual H-Bridge Motor Driver
| Motor Driver Pin | Microcontroller Pin | Description |
|---|---|---|
| `12V / VMS` | Battery `+` (7.4V - 11.1V) | Motor Drive Power |
| `GND` | Battery `-` & MCU `GND` | Common Ground Reference |
| `5V Logic` | `5V` (or via onboard regulator)| Logic Power |
| `ENA` (PWM Left) | `GPIO 25` | Left Motor Speed (PWM Channel) |
| `IN1` | `GPIO 27` (or `GPIO 26`) | Left Motor Direction A |
| `IN2` | `GPIO 14` (or `GPIO 27`) | Left Motor Direction B |
| `IN3` | `GPIO 12` (or `GPIO 14`) | Right Motor Direction A |
| `IN4` | `GPIO 13` (or `GPIO 12`) | Right Motor Direction B |
| `ENB` (PWM Right) | `GPIO 26` (or `GPIO 33`) | Right Motor Speed (PWM Channel) |

---

### 📌 Obstacle Avoidance Ultrasonic Sensor (Front HC-SR04)
| Sensor Pin | Microcontroller Pin | Description |
|---|---|---|
| `VCC` | `5V` | Sensor Power |
| `Trig` | `GPIO 5` | Ultrasonic Trigger Pulse (10 µs) |
| `Echo` | `GPIO 18` | Ultrasonic Echo Return Duration |
| `GND` | `GND` | System Ground |

---

## 2. Smart Dustbin System (Touchless Lid & Level Monitoring)

### 📌 Dual Ultrasonic Sensors (HC-SR04)
| Sensor Role | Sensor Pin | Microcontroller Pin | Description |
|---|---|---|---|
| **Hand Detection** | `VCC` | `5V` | Power |
| | `Trig` | `GPIO 25` (Nano: `D2`) | Trigger pulse |
| | `Echo` | `GPIO 26` (Nano: `D3`) | Echo duration (opens lid when distance ≤ 10-15 cm) |
| | `GND` | `GND` | Ground |
| **Garbage Level** | `VCC` | `5V` | Power |
| | `Trig` | `GPIO 27` (Nano: `D4`) | Trigger pulse |
| | `Echo` | `GPIO 14` (Nano: `D5`) | Echo duration (calculates % full) |
| | `GND` | `GND` | Ground |

---

### 📌 SG90 Micro Servo (Lid Actuator)
| Servo Wire | Microcontroller Pin | Description |
|---|---|---|
| Red (`VCC`) | `5V` (External 5V supply recommended) | Servo Power |
| Brown/Black (`GND`) | `GND` | Common Ground |
| Orange/Yellow (`Signal`) | `GPIO 13` (Nano: `D9`) | PWM Angle Control (0° = Closed, 180° = Open) |

---

### 📌 16x2 I2C LCD Display
| LCD Module Pin | Microcontroller Pin | Description |
|---|---|---|
| `VCC` | `5V` | Display Power |
| `GND` | `GND` | Common Ground |
| `SDA` | `GPIO 21` (Nano: `A4` / ESP8266: `D2`) | I2C Data Line |
| `SCL` | `GPIO 22` (Nano: `A5` / ESP8266: `D1`) | I2C Clock Line |

---

## 3. Power Distribution & Safety Notes
- **Common Ground (`GND`)**: All modules (battery, motor driver, microcontroller, sensors, LCD, and servo) MUST share a common ground reference.
- **Servo Motor Power**: The SG90 servo motor can draw peak currents up to ~500mA when moving. Powering it via an external 5V regulator (e.g., LM2596 buck converter or L298N 5V output) prevents MCU brownout resets.
