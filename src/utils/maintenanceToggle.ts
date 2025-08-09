// Quick utility functions for maintenance mode
// These can be used in browser console or scripts for quick deployment

export const enableMaintenanceMode = (
  scenario: "upgrade" | "maintenance" | "reconstruction" = "upgrade"
) => {
  console.log(`🔧 Enabling maintenance mode with scenario: ${scenario}`);
  console.log("To enable maintenance mode:");
  console.log("1. Set MAINTENANCE_MODE = true in src/config/maintenance.ts");
  console.log(
    `2. Change the scenario in App.tsx getMaintenanceConfig('${scenario}')`
  );
  console.log("3. Deploy the changes");

  return {
    scenario,
    instructions: "Update maintenance.ts and redeploy",
  };
};

export const disableMaintenanceMode = () => {
  console.log("✅ Disabling maintenance mode");
  console.log("To disable maintenance mode:");
  console.log("1. Set MAINTENANCE_MODE = false in src/config/maintenance.ts");
  console.log("2. Deploy the changes");

  return {
    instructions: "Update maintenance.ts and redeploy",
  };
};

// Quick maintenance mode scenarios
export const maintenanceScenarios = {
  quickUpgrade: () => enableMaintenanceMode("upgrade"),
  routineMaintenance: () => enableMaintenanceMode("maintenance"),
  majorReconstruction: () => enableMaintenanceMode("reconstruction"),
  disable: () => disableMaintenanceMode(),
};

// Instructions for deployment
export const deploymentInstructions = {
  enable: `
🔧 ENABLE MAINTENANCE MODE:
1. Open src/config/maintenance.ts
2. Change: export const MAINTENANCE_MODE = true;
3. In src/App.tsx, change scenario: getMaintenanceConfig('your_scenario')
4. Deploy to production

Available scenarios: 'upgrade', 'maintenance', 'reconstruction'
  `,
  disable: `
✅ DISABLE MAINTENANCE MODE:
1. Open src/config/maintenance.ts  
2. Change: export const MAINTENANCE_MODE = false;
3. Deploy to production
  `,
};

// Console helper - run this in browser console for quick access
if (typeof window !== "undefined") {
  (window as any).maintenance = {
    enable: enableMaintenanceMode,
    disable: disableMaintenanceMode,
    scenarios: maintenanceScenarios,
    help: () => {
      console.log("🛠️ Maintenance Mode Helper");
      console.log('maintenance.enable("scenario") - Enable with scenario');
      console.log("maintenance.disable() - Disable maintenance mode");
      console.log("maintenance.scenarios - Quick scenario functions");
      console.log("maintenance.help() - Show this help");
      console.log(
        "\nAvailable scenarios: upgrade, maintenance, reconstruction"
      );
    },
  };
}
