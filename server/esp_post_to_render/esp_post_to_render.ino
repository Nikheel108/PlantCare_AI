// ============================================================
// PlantCare AI — ESP32 DEVKIT V1 FIRMWARE
// ============================================================
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <DHT.h>

// ─── Pin Definitions (ESP32) ────────────────────────────────
// Sensors
#define DHTPIN        4       // GPIO4
#define SOIL_PIN      5       // GPIO5
#define MQ135_PIN     34      // GPIO34 (ADC1 - Must use ADC1 with Wi-Fi)

// Relays
#define RELAY_PUMP    12      // GPIO12
#define RELAY_MIST    14      // GPIO14

// LEDs
#define LED_GREEN     18      // GPIO18
#define LED_YELLOW    19      // GPIO19
#define LED_BLUE      21      // GPIO21
#define LED_RED       22      // GPIO22

#define DHTTYPE       DHT11

// ─── Wi-Fi & Server ─────────────────────────────────────────
const char* ssid = "APEX";
const char* pass = "apex@403";

const char* SERVER_HOST = "plantcare-ai-mms1.onrender.com";
const uint16_t SERVER_PORT = 443;
const char* SERVER_PATH  = "/api/sensors";
const char* API_KEY      = "HR8PLSCgN/FtzbNTNUo+rJyq0zr5xKKZE/fK7DhzoTE=";
const char* DEVICE_ID    = "esp-balcony-1";

// ─── Timing ─────────────────────────────────────────────────
const unsigned long SENSOR_INTERVAL = 2000UL;
const unsigned long PUSH_INTERVAL   = 5000UL;

const unsigned long RUN_TIME      = 5000UL;  // Start motor for 5 seconds
const unsigned long COOLDOWN_TIME = 3000UL;  // Stop motor for 3 seconds

// ESP32 ADC is 12-bit (0-4095), so thresholds are scaled up from ESP8266 (0-1023)
const int AQI_BAD_THRESHOLD = 1600;
const int AQI_OK_THRESHOLD  = 1200;

// ─── State ──────────────────────────────────────────────────
DHT dht(DHTPIN, DHTTYPE);
WiFiClientSecure secureClient;

unsigned long lastPush       = 0;
unsigned long lastSensorRead = 0;

float lastTemp     = 0.0;
float lastHumidity = 0.0;
int   lastAqi      = 0;
bool  soilIsDry    = false; 

enum State { IDLE, RUNNING, COOLDOWN };

State pumpState = IDLE;
unsigned long pumpStateTime = 0;

State mistState = IDLE;
unsigned long mistStateTime = 0;

// ─── Relays ─────────────────────────────────────────────────
void setPump(bool turnOn) {
  digitalWrite(RELAY_PUMP, turnOn ? HIGH : LOW);
  digitalWrite(LED_RED, turnOn ? HIGH : LOW);
  if (turnOn) Serial.println("\n[PUMP] 🟢 ON (Watering for 5s)");
  else Serial.println("\n[PUMP] 🔴 OFF (Paused or Finished)");
}

void setMist(bool turnOn) {
  digitalWrite(RELAY_MIST, turnOn ? HIGH : LOW);
  digitalWrite(LED_BLUE, turnOn ? HIGH : LOW); 
  if (turnOn) Serial.println("\n[MIST] 🟢 ON (Misting for 5s)");
  else Serial.println("\n[MIST] 🔴 OFF (Paused or Finished)");
}

// ─── Sensors ────────────────────────────────────────────────
void readSensors() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();
  if (!isnan(t)) lastTemp = t;
  if (!isnan(h)) lastHumidity = h;

  lastAqi = analogRead(MQ135_PIN);
  
  // High = Dry, Low = Wet
  soilIsDry = (digitalRead(SOIL_PIN) == HIGH);
  
  Serial.print("[SENSOR] Soil Status: ");
  Serial.println(soilIsDry ? "DRY" : "WET");
}

// ─── Auto Logic ─────────────────────────────────────────────
void autoControl() {
  unsigned long now = millis();

  // --- PUMP LOGIC ---
  if (pumpState == IDLE) {
    if (soilIsDry) {
      pumpState = RUNNING;
      pumpStateTime = now;
      setPump(true);
    }
  } 
  else if (pumpState == RUNNING) {
    if (!soilIsDry) {
      pumpState = IDLE;
      setPump(false);
      Serial.println("[LOGIC] Soil is wet! Stopping pump.");
    }
    else if (now - pumpStateTime >= RUN_TIME) {
      pumpState = COOLDOWN;
      pumpStateTime = now;
      setPump(false);
      Serial.println("[LOGIC] 5s finished. Cooling down for 3s.");
    }
  } 
  else if (pumpState == COOLDOWN) {
    if (now - pumpStateTime >= COOLDOWN_TIME) {
      pumpState = IDLE; 
    }
  }

  // --- MIST LOGIC ---
  bool aqiIsBad = (lastAqi > AQI_BAD_THRESHOLD);

  if (mistState == IDLE) {
    if (aqiIsBad) {
      mistState = RUNNING;
      mistStateTime = now;
      setMist(true);
    }
  } 
  else if (mistState == RUNNING) {
    if (!aqiIsBad) {
      mistState = IDLE;
      setMist(false);
    }
    else if (now - mistStateTime >= RUN_TIME) {
      mistState = COOLDOWN;
      mistStateTime = now;
      setMist(false);
    }
  } 
  else if (mistState == COOLDOWN) {
    if (now - mistStateTime >= COOLDOWN_TIME) {
      mistState = IDLE; 
    }
  }

  digitalWrite(LED_YELLOW, aqiIsBad ? HIGH : LOW); 
}

// ─── Cloud ──────────────────────────────────────────────────
void pushToServer() {
  if (!WiFi.isConnected()) return;
  int fakePercentage = soilIsDry ? 20 : 76;
  bool pActive = (pumpState == RUNNING);
  bool mActive = (mistState == RUNNING);

  String payload = "{\"userId\":\"" + String(DEVICE_ID) + "\",\"moisture\":" + String(fakePercentage) + ",\"isPumpActive\":" + String(pActive ? "true" : "false") + ",\"mistActive\":" + String(mActive ? "true" : "false") + ",\"pumpDuration\":0,\"trigger\":\"esp_auto\",\"plantZone\":\"balcony\",\"status\":\"ok\",\"temperature\":" + String(lastTemp, 1) + ",\"aqi\":" + String(lastAqi) + "}";

  secureClient.setInsecure();
  if (secureClient.connect(SERVER_HOST, SERVER_PORT)) {
    String req = String("POST ") + SERVER_PATH + " HTTP/1.1\r\nHost: " + SERVER_HOST + "\r\nContent-Type: application/json\r\nContent-Length: " + String(payload.length()) + "\r\nx-api-key: " + API_KEY + "\r\nConnection: close\r\n\r\n" + payload;
    secureClient.print(req);
    unsigned long timeout = millis() + 1000;
    while (secureClient.connected() && millis() < timeout) {
      while (secureClient.available()) secureClient.read();
    }
    secureClient.stop();
  }
}

// ─── SETUP ──────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);

  pinMode(SOIL_PIN, INPUT);
  pinMode(RELAY_PUMP, OUTPUT);
  pinMode(RELAY_MIST, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_YELLOW, OUTPUT);
  pinMode(LED_BLUE, OUTPUT);
  pinMode(LED_RED, OUTPUT);

  digitalWrite(RELAY_PUMP, LOW);
  digitalWrite(RELAY_MIST, LOW);
  digitalWrite(LED_GREEN, LOW);
  digitalWrite(LED_YELLOW, LOW);
  digitalWrite(LED_BLUE, LOW);
  digitalWrite(LED_RED, LOW);

  dht.begin();
  readSensors();

  WiFi.begin(ssid, pass);
  while (WiFi.status() != WL_CONNECTED) delay(300);
  digitalWrite(LED_GREEN, HIGH);
}

// ─── LOOP ───────────────────────────────────────────────────
void loop() {
  unsigned long now = millis();
  if (now - lastSensorRead >= SENSOR_INTERVAL) {
    lastSensorRead = now;
    readSensors();
  }
  autoControl();
  if (now - lastPush >= PUSH_INTERVAL) {
    lastPush = now;
    pushToServer();
  }
  delay(50); 
}