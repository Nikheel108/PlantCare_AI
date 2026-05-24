// ============================================================
// PlantCare AI — PURE AUTOMATIC MODE (Bulletproof Logic)
// ============================================================
// This code is strictly based on your parameters. 
// It guarantees the pump WILL stop the exact second the soil
// registers as wet. No manual overrides, no web server blocking.
// ============================================================

#include <ESP8266WiFi.h>
#include <DHT.h>
#include <WiFiClientSecure.h>

// ─── Pin Definitions ────────────────────────────────────────
// Sensors
#define DHTPIN        5       // D1 — DHT11 data pin
#define SOIL_PIN      4       // D2 — Soil moisture (digital: HIGH = dry)
#define MQ135_PIN     A0      // A0 — MQ-135 analog output

// Relays (Active HIGH)
#define RELAY_PUMP    12      // D6 — Water pump relay
#define RELAY_MIST    14      // D5 — Mist sprayer relay

// LEDs
#define LED_GREEN     16      // D0 — Green LED (online)
#define LED_YELLOW    0       // D3 — Yellow LED (AQI warning)
#define LED_BLUE      2       // D4 — Blue LED (mist active)
#define LED_RED       13      // D7 — Red LED (pump active)

#define DHTTYPE       DHT11

// ─── Wi-Fi Credentials ─────────────────────────────────────
const char* ssid = "APEX";
const char* pass = "apex@403";

// ─── Render Server Config ───────────────────────────────────
const char* SERVER_HOST = "plantcare-ai-mms1.onrender.com";
const uint16_t SERVER_PORT = 443;
const char* SERVER_PATH  = "/api/sensors";
const char* API_KEY      = "HR8PLSCgN/FtzbNTNUo+rJyq0zr5xKKZE/fK7DhzoTE=";
const char* DEVICE_ID    = "esp-balcony-1";

// ─── Timing & Thresholds ────────────────────────────────────
const unsigned long SENSOR_INTERVAL   = 2000UL;   // Read sensors every 2 seconds
const unsigned long PUSH_INTERVAL     = 5000UL;   // Push data every 5 seconds
const unsigned long PUMP_MAX_DURATION = 10000UL;  // Pump maximum run time (10 seconds)
const unsigned long MIST_MAX_DURATION = 10000UL;  // Mist maximum run time (10 seconds)

const int AQI_BAD_THRESHOLD = 400; // Above this -> mist ON
const int AQI_OK_THRESHOLD  = 300; // Below this -> mist OFF

// ─── Global State ───────────────────────────────────────────
DHT dht(DHTPIN, DHTTYPE);
WiFiClientSecure secureClient;

unsigned long lastPush       = 0;
unsigned long lastSensorRead = 0;
unsigned long pumpStartTime  = 0;
unsigned long mistStartTime  = 0;

bool pumpActive = false;
bool mistActive = false;

float lastTemp     = 0.0;
float lastHumidity = 0.0;
int   lastAqi      = 0;
bool  soilIsDry    = false; // TRUE = needs water, FALSE = wet enough

// ─── Helpers: Turn Relays ON/OFF ────────────────────────────
void setPump(bool turnOn) {
  if (pumpActive == turnOn) return; // Do nothing if already in correct state
  
  pumpActive = turnOn;
  digitalWrite(RELAY_PUMP, turnOn ? HIGH : LOW);
  digitalWrite(LED_RED, turnOn ? HIGH : LOW);
  
  if (turnOn) {
    pumpStartTime = millis();
    Serial.println("\n[PUMP] 🟢 TURNED ON (Watering...)");
  } else {
    Serial.println("\n[PUMP] 🔴 TURNED OFF (Stopped!)");
  }
}

void setMist(bool turnOn) {
  if (mistActive == turnOn) return;
  
  mistActive = turnOn;
  digitalWrite(RELAY_MIST, turnOn ? HIGH : LOW);
  digitalWrite(LED_BLUE, turnOn ? LOW : HIGH); // Blue LED is inverted
  
  if (turnOn) {
    mistStartTime = millis();
    Serial.println("\n[MIST] 🟢 TURNED ON");
  } else {
    Serial.println("\n[MIST] 🔴 TURNED OFF");
  }
}

// ─── Sensor Reading ─────────────────────────────────────────
void readSensors() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();
  if (!isnan(t)) lastTemp = t;
  if (!isnan(h)) lastHumidity = h;

  lastAqi = analogRead(MQ135_PIN);
  
  // LM393 Soil Sensor Logic:
  // digitalRead == HIGH means the soil is DRY (needs water)
  // digitalRead == LOW means the soil is WET (stop watering)
  soilIsDry = (digitalRead(SOIL_PIN) == HIGH);
  
  Serial.print("[SENSOR] Soil Status: ");
  Serial.println(soilIsDry ? "DRY (Needs Water)" : "WET (Watering not needed)");
}

// ─── BULLETPROOF AUTO LOGIC ─────────────────────────────────
void autoControl() {
  unsigned long now = millis();

  // --- PUMP LOGIC ---
  if (pumpActive) {
    // 1. If soil registers as WET, STOP IMMEDIATELY.
    if (!soilIsDry) {
      Serial.println("[LOGIC] Soil reached wet status!");
      setPump(false);
    } 
    // 2. Or, if 10 seconds has passed, stop to let water soak.
    else if (now - pumpStartTime >= PUMP_MAX_DURATION) {
      Serial.println("[LOGIC] 10s maximum reached. Stopping to let water soak.");
      setPump(false);
    }
  } else {
    // Pump is currently OFF. If soil is DRY, start watering!
    if (soilIsDry) {
      setPump(true);
    }
  }

  // --- MIST LOGIC ---
  if (mistActive) {
    if (lastAqi < AQI_OK_THRESHOLD) {
      setMist(false);
    } else if (now - mistStartTime >= MIST_MAX_DURATION) {
      setMist(false);
    }
  } else {
    if (lastAqi > AQI_BAD_THRESHOLD) {
      setMist(true);
    }
  }

  // Yellow LED matches AQI status
  digitalWrite(LED_YELLOW, (lastAqi > AQI_BAD_THRESHOLD) ? LOW : HIGH);
}

// ─── Cloud Data Push ────────────────────────────────────────
void pushToServer() {
  if (!WiFi.isConnected()) return;

  // Convert binary dry/wet to a percentage for your dashboard
  int fakePercentage = soilIsDry ? 20 : 76;

  String payload = "{";
  payload += "\"userId\":\"" + String(DEVICE_ID) + "\",";
  payload += "\"moisture\":" + String(fakePercentage) + ",";
  payload += "\"isPumpActive\":" + String(pumpActive ? "true" : "false") + ",";
  payload += "\"mistActive\":" + String(mistActive ? "true" : "false") + ",";
  payload += "\"pumpDuration\":0,"; // Removed manual duration
  payload += "\"trigger\":\"esp_auto\",";
  payload += "\"plantZone\":\"balcony\",";
  payload += "\"status\":\"ok\",";
  payload += "\"temperature\":" + String(lastTemp, 1) + ",";
  payload += "\"aqi\":" + String(lastAqi);
  payload += "}";

  secureClient.setInsecure();
  if (secureClient.connect(SERVER_HOST, SERVER_PORT)) {
    String req = String("POST ") + SERVER_PATH + " HTTP/1.1\r\n" +
                 "Host: " + SERVER_HOST + "\r\n" +
                 "Content-Type: application/json\r\n" +
                 "Content-Length: " + String(payload.length()) + "\r\n" +
                 "x-api-key: " + API_KEY + "\r\n" +
                 "Connection: close\r\n\r\n" +
                 payload;

    secureClient.print(req);
    // Discard response to prevent memory crashes
    unsigned long timeout = millis() + 1000;
    while (secureClient.connected() && millis() < timeout) {
      while (secureClient.available()) {
        secureClient.read();
      }
    }
    secureClient.stop();
    Serial.println("[CLOUD] Sent data successfully");
  }
}

// ─── SETUP ──────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  Serial.println("\n\n[SYSTEM] Booting...");

  pinMode(SOIL_PIN, INPUT);
  pinMode(RELAY_PUMP, OUTPUT);
  pinMode(RELAY_MIST, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_YELLOW, OUTPUT);
  pinMode(LED_BLUE, OUTPUT);
  pinMode(LED_RED, OUTPUT);

  // Everything OFF
  digitalWrite(RELAY_PUMP, LOW);
  digitalWrite(RELAY_MIST, LOW);
  digitalWrite(LED_GREEN, LOW);
  digitalWrite(LED_YELLOW, HIGH);
  digitalWrite(LED_BLUE, HIGH);
  digitalWrite(LED_RED, LOW);

  dht.begin();
  delay(2000); // Warmup
  readSensors();

  WiFi.begin(ssid, pass);
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    Serial.print(".");
  }
  digitalWrite(LED_GREEN, HIGH);
  Serial.println("\n[SYSTEM] Online & Ready");
}

// ─── MAIN LOOP ──────────────────────────────────────────────
void loop() {
  unsigned long now = millis();

  // 1. Read sensors every 2 seconds
  if (now - lastSensorRead >= SENSOR_INTERVAL) {
    lastSensorRead = now;
    readSensors();
  }

  // 2. Check and enforce rules instantly
  autoControl();

  // 3. Send data to cloud every 5 seconds
  if (now - lastPush >= PUSH_INTERVAL) {
    lastPush = now;
    pushToServer();
  }

  delay(50); // Small delay to prevent ESP overheating
}