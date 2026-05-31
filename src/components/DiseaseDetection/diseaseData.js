export const diseaseDatabase = [
  {
    id: 1,
    name: "Foot and Mouth Disease",
    severity: "Critical",
    quarantineRequired: true,
    symptoms: {
      primary: ["blisters", "lameness"],
      secondary: ["fever", "loss of appetite", "excessive salivation"]
    },
    actionPlan: [
      "Isolate the animal immediately in a secure pen.",
      "Notify local veterinary authorities within 24 hours.",
      "Disinfect all equipment and footwear that entered the area.",
      "Strictly limit movement of people and vehicles in and out of the farm."
    ]
  },
  {
    id: 2,
    name: "Bovine Respiratory Disease (BRD)",
    severity: "Warning",
    quarantineRequired: true,
    symptoms: {
      primary: ["nasal discharge", "coughing", "labored breathing"],
      secondary: ["fever", "lethargy", "droopy ears"]
    },
    actionPlan: [
      "Isolate the affected animal to prevent spread through air/contact.",
      "Consult a vet for appropriate antibiotic treatment.",
      "Ensure the pen is dry and well-ventilated.",
      "Monitor temperature of pen-mates for early detection."
    ]
  },
  {
    id: 3,
    name: "Anthrax",
    severity: "Critical",
    quarantineRequired: true,
    symptoms: {
      primary: ["sudden death", "bloody discharge from orifices"],
      secondary: ["bloating", "high fever", "tremors"]
    },
    actionPlan: [
      "DO NOT perform a necropsy or open the carcass.",
      "Cordon off the area immediately.",
      "Report to the Ministry of Agriculture/Vet Services instantly.",
      "Burn or bury the carcass deep (at least 2m) with lime under official supervision."
    ]
  },
  {
    id: 4,
    name: "Lumpy Skin Disease",
    severity: "Warning",
    quarantineRequired: true,
    symptoms: {
      primary: ["skin nodules", "enlarged lymph nodes"],
      secondary: ["fever", "loss of appetite", "nasal discharge"]
    },
    actionPlan: [
      "Isolate affected animals from the rest of the herd.",
      "Implement aggressive vector control (fly and mosquito traps/sprays).",
      "Supportive care: keep nodules clean and provide easy-to-digest feed.",
      "Vaccinate all healthy animals in the vicinity immediately."
    ]
  },
  {
    id: 5,
    name: "Theileriosis (January Disease)",
    severity: "Critical",
    quarantineRequired: false,
    symptoms: {
      primary: ["swollen lymph nodes", "froth from mouth/nose"],
      secondary: ["fever", "loss of appetite", "cloudy eyes"]
    },
    actionPlan: [
      "Immediately apply intensive tick-greasing and dipping (5-5-4 schedule).",
      "Treat with specific anti-theilerial drugs (e.g., Buparvaquone) under vet guidance.",
      "Check the whole herd for tick infestation.",
      "Restrict herd movement to prevent spreading infected ticks."
    ]
  }
];

export const symptomCategories = [
  {
    name: "Physical Signs",
    symptoms: ["blisters", "lameness", "excessive salivation", "skin nodules", "enlarged lymph nodes", "bloody discharge from orifices", "swollen lymph nodes", "cloudy eyes"]
  },
  {
    name: "Respiratory",
    symptoms: ["coughing", "nasal discharge", "labored breathing", "froth from mouth/nose"]
  },
  {
    name: "Behavior & Vitals",
    symptoms: ["fever", "loss of appetite", "lethargy", "sudden death", "bloating", "tremors", "droopy ears"]
  }
];
