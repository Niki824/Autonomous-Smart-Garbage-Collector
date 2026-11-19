#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <Servo.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);
Servo myServo;

// -------- Pins --------
#define TRIG1 2   // Hand sensor
#define ECHO1 3

#define TRIG2 4   // Distance sensor
#define ECHO2 5

#define SERVO_PIN 9

// -------- Variables --------
bool servoDone = false;
int servoHome = 90;
int servoActive = 180;

// -------- Function to read distance --------
long readDistanceCM(int trigPin, int echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH, 30000);
  if (duration == 0) return 999;

  return duration * 0.034 / 2;
}

void setup() {
  pinMode(TRIG1, OUTPUT);
  pinMode(ECHO1, INPUT);
  pinMode(TRIG2, OUTPUT);
  pinMode(ECHO2, INPUT);

  myServo.attach(SERVO_PIN);
  myServo.write(servoHome);

  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("System Ready");

  delay(2000);
  lcd.clear();
}

void loop() {

  // -------- HAND DETECTION --------
  if (!servoDone) {
    long handDist = readDistanceCM(TRIG1, ECHO1);

    if (handDist <= 10) {
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Hand Detected");

      myServo.write(servoActive);
      delay(10000);               // wait 10 sec

      myServo.write(servoHome);
      delay(1000);

      servoDone = true;
      lcd.clear();
    }
  }

  // -------- DISTANCE TO % --------
  if (servoDone) {
    long dist = readDistanceCM(TRIG2, ECHO2);

    if (dist < 1) dist = 1;
    if (dist > 10) dist = 10;

    int percent = map(dist, 10, 1, 0, 100);

    lcd.setCursor(0, 0);
    lcd.print("Distance:");
    lcd.setCursor(10, 0);
    lcd.print(dist);
    lcd.print("cm ");

    lcd.setCursor(0, 1);
    lcd.print("Level: ");
    lcd.print(percent);
    lcd.print("%   ");

    delay(500);  // refresh rate
  }
}
