const { app, BrowserWindow, Menu, shell, dialog } = require("electron");
const path = require("path");

/* ===========================================================================
   SET THIS to where your app is hosted.
   - While developing (npm run dev in the krossover-studio folder): http://localhost:3000
   - For the real installable app: your deployed URL, e.g. https://imprint.yourdomain.com
   You can also override without editing: set an IMPRINT_URL environment variable.
   =========================================================================== */
const APP_URL = process.env.IMPRINT_URL || "https://imprint-studio-alpha.vercel.app/welcome.html";

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1000,
    minHeight: 640,
    title: "Imprint Studio",
    backgroundColor: "#0a1320",
    icon: path.join(__dirname, "icon.ico"),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js")
    }
  });

  win.loadURL(APP_URL).catch(() => showOffline());

  // If the page fails to load (server down / wrong URL), show a friendly notice.
  win.webContents.on("did-fail-load", (_e, code, desc, url) => {
    if (code === -3) return; // aborted (normal on redirects)
    showOffline(desc, url);
  });

  // Keep app navigation inside the window; open external links in the system browser.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(APP_URL)) return { action: "allow" };
    shell.openExternal(url);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (e, url) => {
    if (!url.startsWith(APP_URL) && !url.startsWith("about:")) {
      e.preventDefault();
      shell.openExternal(url);
    }
  });
}

function showOffline(desc, url) {
  const html =
    "data:text/html;charset=utf-8," +
    encodeURIComponent(`<!doctype html><html><head><meta charset="utf-8">
    <style>html,body{height:100%;margin:0;font-family:Segoe UI,system-ui,sans-serif;
    background:#0a1320;color:#e8eef8;display:flex;align-items:center;justify-content:center;text-align:center}
    .b{max-width:520px;padding:32px}h1{font-size:20px;margin:0 0 10px}p{color:#9fb0c7;line-height:1.5}
    code{background:#152338;padding:2px 6px;border-radius:5px;color:#8fb6ff}
    button{margin-top:18px;padding:9px 18px;border:0;border-radius:8px;background:#2f6fed;color:#fff;font-weight:600;cursor:pointer}</style></head>
    <body><div class="b"><h1>Can't reach Imprint Studio</h1>
    <p>The app couldn't load <code>${(url || APP_URL)}</code>.</p>
    <p>Start your app first (run <code>npm run dev</code> in the krossover-studio folder), or set the app URL to your live site in <code>main.js</code>.</p>
    <button onclick="location.reload()">Try again</button></div></body></html>`);
  if (win) win.loadURL(html);
}

function buildMenu() {
  const template = [
    {
      label: "App",
      submenu: [
        { label: "Home", accelerator: "CmdOrCtrl+H", click: () => win && win.loadURL(APP_URL) },
        { label: "Reload", accelerator: "CmdOrCtrl+R", click: () => win && win.reload() },
        { label: "Back", accelerator: "Alt+Left", click: () => win && win.webContents.canGoBack() && win.webContents.goBack() },
        { label: "Forward", accelerator: "Alt+Right", click: () => win && win.webContents.canGoForward() && win.webContents.goForward() },
        { type: "separator" },
        { label: "Developer Tools", accelerator: "F12", click: () => win && win.webContents.toggleDevTools() },
        { type: "separator" },
        { role: "quit" }
      ]
    },
    { label: "Edit", submenu: [ { role: "undo" }, { role: "redo" }, { type: "separator" }, { role: "cut" }, { role: "copy" }, { role: "paste" }, { role: "selectAll" } ] },
    { label: "View", submenu: [ { role: "zoomIn" }, { role: "zoomOut" }, { role: "resetZoom" }, { type: "separator" }, { role: "togglefullscreen" } ] },
    {
      label: "Help",
      submenu: [{
        label: "About",
        click: () => dialog.showMessageBox(win, {
          type: "info", title: "Imprint Studio",
          message: "Imprint Studio — Desktop",
          detail: "Admin app for preparing products for customization.\nLoading: " + APP_URL
        })
      }]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => { buildMenu(); createWindow(); });
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
