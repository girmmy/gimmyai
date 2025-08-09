// Maintenance Mode Configuration
// Set this to true when you need to show the maintenance page
export const MAINTENANCE_MODE = true;

// Maintenance page configuration
export const maintenanceConfig = {
  title: "GimmyAI is Getting Better!",
  message:
    "We're working hard to bring you amazing new features and improvements. Thank you for your patience!",
  estimatedTime: "We'll be back soon",
  showProgress: true,
  // Customize different messages for different scenarios
  scenarios: {
    upgrade: {
      title: "Upgrading GimmyAI!",
      message:
        "We're adding some exciting new features to make your experience even better. This won't take long!",
      estimatedTime: "Expected completion: within 2 hours",
      showProgress: true,
    },
    maintenance: {
      title: "Scheduled Maintenance",
      message:
        "We're performing routine maintenance to keep GimmyAI running smoothly.",
      estimatedTime: "Expected completion: within 30 minutes",
      showProgress: true,
    },
    reconstruction: {
      title: "GimmyAI is Being Reconstructed!",
      message:
        "We're rebuilding GimmyAI from the ground up to bring you an incredible new experience. This is going to be worth the wait!",
      estimatedTime: "Coming soon - stay tuned!",
      showProgress: false,
    },
  },
};

// Function to get current maintenance config
export const getMaintenanceConfig = (
  scenario: keyof typeof maintenanceConfig.scenarios = "upgrade"
) => {
  return maintenanceConfig.scenarios[scenario] || maintenanceConfig;
};
