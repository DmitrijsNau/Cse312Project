const config = {
  backendApiUrl: "/api",
  wsUrl: `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/ws`,
};

export default config;
