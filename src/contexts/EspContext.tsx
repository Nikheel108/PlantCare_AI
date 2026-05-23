import React, { createContext, useContext, useEffect, useRef, useState } from "react";

type EspData = {
  temperature?: number;
  aqi?: number;
  soilDry?: number; // 1 dry, 0 moist
  pumpActive?: number; // 1 on, 0 off
  mistActive?: number; // 1 on, 0 off
  [key: string]: any;
};

type EspContextValue = {
  espIp: string;
  setEspIp: (ip: string) => void;
  data: EspData;
  online: boolean;
  togglePump: (on: boolean) => Promise<boolean>;
  toggleMist: (on: boolean) => Promise<boolean>;
};

const EspContext = createContext<EspContextValue | undefined>(undefined);

export const EspProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [espIp, setEspIpState] = useState<string>(() => {
    try {
      return localStorage.getItem("espIp") || "192.168.1.185";
    } catch {
      return "192.168.1.185";
    }
  });
  const [data, setData] = useState<EspData>({});
  const [online, setOnline] = useState<boolean>(false);
  const BACKEND = (import.meta.env.VITE_BACKEND_URL || "").toString().trim();
  const intervalRef = useRef<number | null>(null);
  const oneOffTimeoutRef = useRef<number | null>(null);

  const setEspIp = (ip: string) => {
    setEspIpState(ip);
    try {
      localStorage.setItem("espIp", ip);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    // polling function (uses a reusable one-off fetch)
    let mounted = true;

    const fetchDataOnce = async () => {
      if (!espIp) {
        setOnline(false);
        return null;
      }

      // If a backend URL is configured and we're on an HTTPS page, prefer fetching from backend
      const useBackend = Boolean(BACKEND) && window.location.protocol === 'https:';
      try {
        if (useBackend) {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 3000);
          // Treat espIp as deviceId when using backend (set espIp to your device id in Navbar)
          const res = await fetch(`${BACKEND}/api/sensors/latest/${encodeURIComponent(espIp)}`, { signal: controller.signal, cache: 'no-store' });
          clearTimeout(timeout);
          if (!res.ok) throw new Error('non-ok');
          const json = await res.json();
          if (!mounted) return null;
          setData(json || {});
          setOnline(true);
          return json;
        }

        // Fallback: direct local ESP fetch (HTTP). Only used when page is not HTTPS or no backend configured.
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2500);
        const res = await fetch(`http://${espIp}/api/data`, { signal: controller.signal, cache: "no-store" });
        clearTimeout(timeout);
        if (!res.ok) throw new Error("non-ok");
        const json = await res.json();
        if (!mounted) return null;
        setData(json || {});
        setOnline(true);
        return json;
      } catch (err) {
        if (mounted) setOnline(false);
        return null;
      }
    };

    // initial fetch
    fetchDataOnce();
    // poll every 3s
    intervalRef.current = window.setInterval(fetchDataOnce, 3000);

    return () => {
      mounted = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (oneOffTimeoutRef.current) {
        clearTimeout(oneOffTimeoutRef.current);
      }
    };
  }, [espIp]);

  const safeFetch = async (path: string) => {
    if (!espIp) return false;
    const BACKEND = (import.meta.env.VITE_BACKEND_URL || "").toString().trim();
    const useBackend = Boolean(BACKEND) && window.location.protocol === 'https:';
    if (useBackend) {
      // No remote control implemented via backend; return false to indicate action not available
      console.warn('Remote control via backend not available');
      return false;
    }
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`http://${espIp}${path}`, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) throw new Error("non-ok");
      return res;
    } catch (e) {
      setOnline(false);
      return false;
    }
  };

  const togglePump = async (on: boolean) => {
    const res = await safeFetch(`/api/pump/${on ? "on" : "off"}`);
    if (res) {
      setData(prev => ({ ...prev, pumpActive: on ? 1 : 0 }));
      setOnline(true);
      return true;
    }
    return false;
  };

  const toggleMist = async (on: boolean) => {
    const res = await safeFetch(`/api/mist/${on ? "on" : "off"}`);
    if (res) {
      setData(prev => ({ ...prev, mistActive: on ? 1 : 0 }));
      setOnline(true);
      return true;
    }
    return false;
  };

  // When the device reports dry soil or when a pump cycle starts,
  // schedule an extra one-off fetch after the pump run time so UI updates reflect the changed state.
  useEffect(() => {
    // If no espIp or offline, skip
    if (!espIp) return;

    // If soil is dry (binary) and pump is not yet active, the ESP may start an automatic pump.
    // Schedule a single fetch ~6s later (ESP pump run is 5s in device code) to refresh state.
    const shouldSchedule = (data?.soilDry === 1 && data?.pumpActive !== 1) || (data?.pumpActive === 1);
    if (shouldSchedule) {
      if (oneOffTimeoutRef.current) clearTimeout(oneOffTimeoutRef.current);
      oneOffTimeoutRef.current = window.setTimeout(async () => {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 3000);
          const res = await fetch(`http://${espIp}/api/data`, { signal: controller.signal, cache: 'no-store' });
          clearTimeout(timeout);
          if (res && res.ok) {
            const json = await res.json();
            setData(json || {});
            setOnline(true);
          }
        } catch (e) {
          setOnline(false);
        }
      }, 6000);
      return () => {
        if (oneOffTimeoutRef.current) clearTimeout(oneOffTimeoutRef.current);
      };
    }
  }, [data?.soilDry, data?.pumpActive, espIp]);

  return (
    <EspContext.Provider value={{ espIp, setEspIp, data, online, togglePump, toggleMist }}>
      {children}
    </EspContext.Provider>
  );
};

export const useEsp = () => {
  const ctx = useContext(EspContext);
  if (!ctx) throw new Error("useEsp must be used within EspProvider");
  return ctx;
};

export default EspContext;
