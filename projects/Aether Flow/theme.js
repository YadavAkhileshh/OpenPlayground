const AetherTheme = {
  modes: {
    zen: {
      primary: "#ffcc00",
      bg: "#050507",
      accent: "rgba(255, 204, 0, 0.2)",
    },
    void: {
      primary: "#00d4ff",
      bg: "#0a0a0f",
      accent: "rgba(0, 212, 255, 0.2)",
    },
  },
  setMode(modeName) {
    const theme = this.modes[modeName];
    document.documentElement.style.setProperty("--gold", theme.primary);
    document.documentElement.style.setProperty("--dark", theme.bg);
    console.log(`System: Theme shifted to ${modeName}`);
  },
};
