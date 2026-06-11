let cart = [];

/* =========================
   SESSION MANAGEMENT
========================= */

function getSessionId() {

    let sessionId = localStorage.getItem("session_id");

    if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem("session_id", sessionId);
    }

    return sessionId;
}

/* =========================
   UTM PARAMETERS
========================= */

function getUTMParameters() {

    const params = new URLSearchParams(window.location.search);

    return {
        utm_source: params.get("utm_source") || "direct",
        utm_campaign: params.get("utm_campaign") || "organic"
    };
}

/* =========================
   EVENT TRACKING
========================= */

function trackEvent
