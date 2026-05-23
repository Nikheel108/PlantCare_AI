// ESP8266 -> POST sensor data to your Render-deployed server
// Fill Wi-Fi SSID and password, then upload via Arduino IDE

#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <DHT.h>
#include <WiFiClientSecure.h>

#define DHTPIN 5
#define SOIL_PIN 4
#define MQ135_PIN A0
#define RELAY_PUMP 12
#define RELAY_MIST 14
#define DHTTYPE DHT11

// WIFI - set to your Wi‑Fi network
const char* ssid = "APEX";
const char* pass = "apex@403";

// Server config (Render host)
const char* SERVER_HOST = "plantcare-ai-mms1.onrender.com"; // provided Render URL
const uint16_t SERVER_PORT = 443;             // 443 for HTTPS
const char* SERVER_PATH = "/api/sensors";

// SECRET API KEY (from your server/.env)
const char* API_KEY = "HR8PLSCgN/FtzbNTNUo+rJyq0zr5xKKZE/fK7DhzoTE=";

// unique device id used as userId in DB
const char* DEVICE_ID = "esp-balcony-1";

DHT dht(DHTPIN, DHTTYPE);
ESP8266WebServer server(80);
WiFiClientSecure secureClient;

unsigned long lastPush = 0;
const unsigned long PUSH_INTERVAL = 5000UL; // push every 5s

void pushToServer(int soilDry, int soilPercent, float temp, int aqi, int pumpActive, int mistActive) {
  if (!WiFi.isConnected()) return;

  String payload = "{";
  payload += "\"userId\":\"" + String(DEVICE_ID) + "\",";
  payload += "\"moisture\":" + String(soilPercent) + ",";
  payload += "\"isPumpActive\":" + String(pumpActive ? "true" : "false") + ",";
  payload += "\"pumpDuration\":0,";
  payload += "\"trigger\":\"esp_auto\",";
  payload += "\"plantZone\":\"balcony\",";
  payload += "\"status\":\"ok\",";
  payload += "\"temperature\":" + String(temp,1) + ",";
  payload += "\"aqi\":" + String(aqi);
  payload += "}";

  secureClient.setInsecure(); // OK for quick testing; replace with cert verification for production
  if (!secureClient.connect(SERVER_HOST, SERVER_PORT)) {
    Serial.println("[CLOUD] connect failed");
    return;
  }

  String req = String("POST ") + SERVER_PATH + " HTTP/1.1\r\n" +
               "Host: " + SERVER_HOST + "\r\n" +
               "Content-Type: application/json\r\n" +
               "Content-Length: " + String(payload.length()) + "\r\n" +
               "x-api-key: " + API_KEY + "\r\n" +
               "Connection: close\r\n\r\n" +
               payload;

  secureClient.print(req);

  unsigned long timeout = millis() + 1500;
  while (secureClient.connected() && millis() < timeout) {
    while (secureClient.available()) {
      String line = secureClient.readStringUntil('\n');
    }
  }
  secureClient.stop();
  Serial.println("[CLOUD] posted sensor data");
}

void setup() {
  Serial.begin(115200);
  pinMode(SOIL_PIN, INPUT);
  pinMode(RELAY_PUMP, OUTPUT);
  pinMode(RELAY_MIST, OUTPUT);
  digitalWrite(RELAY_PUMP, HIGH);
  digitalWrite(RELAY_MIST, HIGH);

  dht.begin();
  WiFi.begin(ssid, pass);
  Serial.print("Connecting WiFi");
  while (WiFi.status() != WL_CONNECTED) { delay(300); Serial.print("."); }
  Serial.println();
  Serial.print("IP: "); Serial.println(WiFi.localIP());

  server.on("/", [](){ server.send(200,"text/plain","ESP online"); });
  server.begin();
}

void loop() {
  server.handleClient();

  float t = dht.readTemperature();
  if (isnan(t)) t = 0.0;
  int raw_aqi = analogRead(MQ135_PIN);
  int soilDry = digitalRead(SOIL_PIN); // HIGH==dry
  int soilPercent = (soilDry == HIGH) ? 20 : 76; // fallback mapping
  int pumpActive = (digitalRead(RELAY_PUMP) == LOW) ? 1 : 0;
  int mistActive = (digitalRead(RELAY_MIST) == LOW) ? 1 : 0;

  unsigned long now = millis();
  if (now - lastPush >= PUSH_INTERVAL) {
    lastPush = now;
    pushToServer(soilDry, soilPercent, t, raw_aqi, pumpActive, mistActive);
  }

  delay(50);
}
