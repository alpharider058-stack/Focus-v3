/** @type {import('@bacons/apple-targets/app.plugin').Config} */
module.exports = {
  type: "widget",
  name: "FocusWidgets",
  displayName: "Focus",
  deploymentTarget: "16.1",
  frameworks: ["ActivityKit", "WidgetKit", "SwiftUI"],
  colors: {
    $accent: "#FF5A1F",
    $widgetBackground: "#08080C",
  },
  entitlements: {
    "com.apple.security.application-groups": ["group.com.focus.discipline"],
  },
};
