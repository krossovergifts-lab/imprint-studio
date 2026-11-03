// Minimal, secure preload. The web app runs normally; this just marks that it's
// running inside the desktop shell, in case you ever want to branch on it.
const { contextBridge } = require("electron");
contextBridge.exposeInMainWorld("imprintDesktop", { isDesktop: true, version: "1.0.0" });
