import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import mixpanel from "mixpanel-browser";

export const tenantID = import.meta.env.VITE_TENANT_ID || "unknown";

export const mixPanelInitConfig: object = {
  autocapture: false,
  record_sessions_percent: 0,
  persistence: "localStorage",
  track_pageview: false,
};

let isInitialized = false;
let initializationError: string | null = null;

export function initMixpanel() {
  if (typeof window === "undefined" || isInitialized) return;
  try {
    const mixpanelToken = import.meta.env.VITE_MIXPANEL_TOKEN;
    if (!mixpanelToken) {
      const error = "Mixpanel token missing - set VITE_MIXPANEL_TOKEN in .env file";
      initializationError = error;
      throw new Error(error);
    }
    mixpanel.init(mixpanelToken, mixPanelInitConfig);
    isInitialized = true;
    console.log("Mixpanel initialized successfully");
  } catch (err) {
    initializationError = err instanceof Error ? err.message : "Unknown error";
    console.error("Failed to initialize Mixpanel", err);
  }
}

export function trackEvent(eventName: string, properties: Record<string, unknown> = {}): void {
  try {
    if (!isInitialized) {
      console.warn("Mixpanel not initialized. Event not tracked:", eventName);
      return;
    }
    properties["tenant_id"] = tenantID;
    mixpanel.track(eventName, properties);
  } catch (err) {
    console.error("Failed to track event", err);
  }
}

export function usePageViewTracker(eventName = "Page View") {
  const location = useLocation();
  const page = location.pathname + (location.searchStr ?? "");
  useEffect(() => {
    initMixpanel();
    trackEvent(eventName, { page });
  }, [page, eventName]);
}

export function getMixpanelStatus() {
  return { isInitialized, initializationError, tenantID };
}
