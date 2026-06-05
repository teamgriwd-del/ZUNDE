export const diseaseDatabase = [
  {
    id: 1,
    name: "Foot and Mouth Disease",
    severity: "Critical",
    quarantineRequired: true,
    affectedSpecies: ["Cattle", "Goat", "Sheep", "Pig"],
    symptoms: {
      primary: ["blisters", "lameness"],
      secondary: ["fever", "loss of appetite", "excessive salivation", "nasal discharge"]
    },
    actionPlan: [
      "Isolate the animal immediately in a secure pen.",
      "Notify local veterinary authorities within 24 hours — this is a notifiable disease.",
      "Disinfect all equipment, footwear, and vehicles that entered the affected area.",
      "Strictly limit movement of people and animals in and out of the farm.",
      "Do not move or sell any animals from the premises until cleared by DVS."
    ],
    preventionTips: [
      "Vaccinate all susceptible livestock bi-annually with the FMD approved vaccine.",
      "Maintain strict biosecurity — quarantine all new animals for 21 days before mixing.",
      "Report any suspected outbreak to the Divisional Veterinary Office immediately.",
      "Do not share equipment between farms without thorough disinfection.",
      "Control visitor access to livestock areas and provide foot dips at all entry points."
    ]
  },
  {
    id: 2,
    name: "Bovine Respiratory Disease (BRD)",
    severity: "Warning",
    quarantineRequired: true,
    affectedSpecies: ["Cattle"],
    symptoms: {
      primary: ["nasal discharge", "coughing", "labored breathing"],
      secondary: ["fever", "lethargy", "droopy ears", "loss of appetite"]
    },
    actionPlan: [
      "Isolate the affected animal to prevent spread through air and direct contact.",
      "Consult a licensed vet for appropriate antibiotic treatment (e.g., Oxytetracycline LA).",
      "Ensure the pen is dry, clean, and well-ventilated to reduce pathogen load.",
      "Monitor rectal temperature of pen-mates twice daily for 7 days.",
      "Provide supplementary Vitamin B-Complex for immune support during recovery."
    ],
    preventionTips: [
      "Minimize stress during transport and handling — stress suppresses immune response.",
      "Ensure adequate ventilation in housing — ammonia buildup predisposes to BRD.",
      "Vaccinate calves against Pasteurella and IBR at 3 months of age.",
      "Maintain proper nutritional status — malnourished animals are 3x more susceptible.",
      "Implement a 21-day quarantine for all purchased animals before herd introduction."
    ]
  },
  {
    id: 3,
    name: "Anthrax",
    severity: "Critical",
    quarantineRequired: true,
    affectedSpecies: ["Cattle", "Goat", "Sheep"],
    symptoms: {
      primary: ["sudden death", "bloody discharge from orifices"],
      secondary: ["bloating", "high fever", "tremors", "difficulty breathing"]
    },
    actionPlan: [
      "DO NOT perform a necropsy — opening the carcass releases billions of spores.",
      "Cordon off the area with a minimum 50m exclusion zone immediately.",
      "Report to the Ministry of Agriculture/Vet Services within 2 hours — this is notifiable.",
      "Burn or bury the carcass (minimum 2m depth) with lime under official supervision only.",
      "Administer prophylactic penicillin to all exposed animals as directed by the duty officer."
    ],
    preventionTips: [
      "Vaccinate annually with Anthrax Spore Vaccine before the rainy season (October).",
      "Do not graze animals in known anthrax-endemic zones, especially after heavy rains.",
      "Never allow animals to drink from pools formed after flooding in endemic areas.",
      "Properly dispose of all animal carcasses — never leave them in the open.",
      "Maintain vaccination records as proof of compliance for movement permits."
    ]
  },
  {
    id: 4,
    name: "Lumpy Skin Disease",
    severity: "Warning",
    quarantineRequired: true,
    affectedSpecies: ["Cattle"],
    symptoms: {
      primary: ["skin nodules", "enlarged lymph nodes"],
      secondary: ["fever", "loss of appetite", "nasal discharge", "excessive salivation"]
    },
    actionPlan: [
      "Isolate affected animals from the herd immediately.",
      "Implement aggressive vector control — destroy all fly and mosquito breeding sites.",
      "Keep skin nodules clean with antiseptic spray to prevent secondary bacterial infection.",
      "Vaccinate all healthy animals in the vicinity within 48 hours.",
      "Provide soft, easily digestible feed and ensure ad libitum water access."
    ],
    preventionTips: [
      "Vaccinate all cattle annually before the wet season when insect vectors are active.",
      "Implement rigorous fly and mosquito control (traps, pour-ons, premise spraying).",
      "Avoid purchasing animals from areas with known outbreaks.",
      "Install insect screens on cattle housing where possible.",
      "Report any suspicious skin nodules to your District Veterinarian immediately."
    ]
  },
  {
    id: 5,
    name: "Theileriosis (January Disease)",
    severity: "Critical",
    quarantineRequired: false,
    affectedSpecies: ["Cattle"],
    symptoms: {
      primary: ["swollen lymph nodes", "froth from mouth/nose"],
      secondary: ["fever", "loss of appetite", "cloudy eyes", "labored breathing", "lethargy"]
    },
    actionPlan: [
      "Apply intensive tick-greasing and dipping on the 5-5-4 schedule immediately.",
      "Treat with Buparvaquone (2.5mg/kg IM) under licensed veterinary guidance only.",
      "Provide shade and fresh water — heat stress accelerates disease progression.",
      "Check the entire herd for tick burden — treat all animals, not just the symptomatic ones.",
      "Restrict herd movement to prevent spreading infected brown ear ticks."
    ],
    preventionTips: [
      "Maintain strict dipping regime: every 5 days in summer, every 7 days in winter.",
      "Grease all hard-to-reach tick hiding spots (ears, groin, tail base) weekly.",
      "Do not mix local-adapted cattle with exotic breeds which lack acquired immunity.",
      "Immunize calves at 4-6 months using infection-and-treatment method (ITM) if in endemic areas.",
      "Monitor paddocks for heavy tick grass after rains — consider strategic pasture spelling."
    ]
  },
  {
    id: 6,
    name: "Blackleg (Clostridial Myositis)",
    severity: "Critical",
    quarantineRequired: false,
    affectedSpecies: ["Cattle", "Sheep"],
    symptoms: {
      primary: ["sudden lameness", "swollen leg muscle", "crackling skin"],
      secondary: ["fever", "loss of appetite", "lethargy", "sudden death"]
    },
    actionPlan: [
      "Isolate and immediately contact a licensed veterinarian — mortality is very high.",
      "Administer high-dose penicillin IV or IM as directed by the attending vet.",
      "Do not cut or lance the swollen area — this can worsen infection.",
      "Vaccinate all remaining herd members with Blanthax or equivalent immediately.",
      "Dispose of carcass by deep burial with lime to prevent soil contamination."
    ],
    preventionTips: [
      "Vaccinate all calves at 3-6 months with Blackleg/Anthrax combination vaccine.",
      "Booster annually before the rainy season when soil disturbance releases spores.",
      "Avoid grazing on recently cultivated or flooded land in endemic areas.",
      "Minimize wounds from rough handling, injections without proper technique, or fighting.",
      "Keep permanent vaccination records — required for provincial movement certificates."
    ]
  },
  {
    id: 7,
    name: "East Coast Fever (ECF)",
    severity: "Critical",
    quarantineRequired: true,
    affectedSpecies: ["Cattle"],
    symptoms: {
      primary: ["swollen lymph nodes", "high fever"],
      secondary: ["loss of appetite", "nasal discharge", "labored breathing", "cloudy eyes", "lethargy"]
    },
    actionPlan: [
      "Treat immediately with Parvaquone (20mg/kg) or Buparvaquone under vet supervision.",
      "Implement aggressive tick control — the brown ear tick (Rhipicephalus appendiculatus) is the vector.",
      "Provide full shade and reduce all forms of handling stress during treatment.",
      "Report confirmed cases to the DVS — ECF is a notifiable disease in Zimbabwe.",
      "Restrict movement of treated animals for at least 28 days post-recovery."
    ],
    preventionTips: [
      "Use tick grease consistently on ears and all tick predilection sites.",
      "Immunize susceptible cattle using ITM — consult DVS for scheduled immunization days.",
      "Avoid introducing exotic high-grade cattle into endemic zones without prior ITM.",
      "Strategic paddock resting can break the tick life cycle — spell pastures for 6+ months.",
      "Maintain accurate tick control and vaccination records for each animal."
    ]
  },
  {
    id: 8,
    name: "Brucellosis (Contagious Abortion)",
    severity: "Warning",
    quarantineRequired: true,
    affectedSpecies: ["Cattle", "Goat", "Sheep"],
    symptoms: {
      primary: ["abortion", "retained placenta"],
      secondary: ["swollen joints", "reduced milk production", "fever", "lethargy"]
    },
    actionPlan: [
      "Isolate the aborting animal and handle all birth materials with gloves (zoonotic risk).",
      "Collect and seal the aborted foetus for laboratory testing — do not discard.",
      "Report to the DVS within 24 hours — this is a notifiable zoonotic disease.",
      "Do not consume milk or dairy from suspected animals until cleared.",
      "Test the entire herd — use official Rose Bengal Plate Test (RBPT) via DVS lab."
    ],
    preventionTips: [
      "Vaccinate all female calves at 3-8 months with S19 vaccine (Brucella abortus).",
      "Never introduce an untested animal into your breeding herd.",
      "Test all purchased animals before farm entry — demand a brucellosis-free certificate.",
      "Wear gloves when handling births, placentas, and aborted materials.",
      "Report any unexplained abortions to your Divisional Veterinary Officer immediately."
    ]
  },
  {
    id: 9,
    name: "Mange (Sarcoptic/Demodectic)",
    severity: "Warning",
    quarantineRequired: false,
    affectedSpecies: ["Cattle", "Goat", "Sheep", "Pig"],
    symptoms: {
      primary: ["intense scratching", "hair loss", "thickened skin"],
      secondary: ["skin crusting", "loss of appetite", "restlessness", "weight loss"]
    },
    actionPlan: [
      "Treat with Ivermectin injection (0.2mg/kg SC) — repeat in 14 days for full efficacy.",
      "Apply topical acaricide (lime sulfur dip or amitraz pour-on) across the whole body.",
      "Quarantine affected animals and thoroughly disinfect all bedding and equipment.",
      "Improve nutrition — malnourished animals are far more susceptible to mange spread.",
      "Re-inspect all treated animals at 21 days to confirm resolution."
    ],
    preventionTips: [
      "Maintain regular dipping and pour-on acaricide schedules to prevent mite establishment.",
      "Quarantine all new animals for 21 days and inspect skin thoroughly before herd integration.",
      "Avoid overcrowding — direct contact is the primary transmission route.",
      "Keep housing clean, dry, and well-ventilated to limit mite survival in the environment.",
      "Ensure adequate nutrition — a strong immune system resists mange infestation naturally."
    ]
  },
  {
    id: 10,
    name: "Contagious Bovine Pleuropneumonia (CBPP)",
    severity: "Critical",
    quarantineRequired: true,
    affectedSpecies: ["Cattle"],
    symptoms: {
      primary: ["labored breathing", "coughing"],
      secondary: ["fever", "loss of appetite", "nasal discharge", "lethargy", "painful breathing"]
    },
    actionPlan: [
      "Report to the DVS immediately — CBPP is a Schedule 1 notifiable disease in Zimbabwe.",
      "Do NOT treat without official veterinary authorization as treatment can create carriers.",
      "Impose a complete standstill on all cattle movement from the premises.",
      "Cordon off affected animals — respiratory droplet transmission occurs within 2-3m.",
      "Cooperate fully with government stamping-out policy which may include compulsory culling."
    ],
    preventionTips: [
      "Vaccinate all cattle annually with T1sr CBPP vaccine where it is available.",
      "Never purchase cattle from CBPP-endemic areas without official health certification.",
      "Report all unexplained respiratory deaths to DVS — early detection saves herds.",
      "Maintain full 21-day quarantine for all imported or purchased cattle.",
      "Support national surveillance programs — mass testing is your community's protection."
    ]
  }
];

export const symptomCategories = [
  {
    name: "Physical Signs",
    symptoms: [
      "blisters", "lameness", "excessive salivation", "skin nodules",
      "enlarged lymph nodes", "bloody discharge from orifices", "swollen lymph nodes",
      "cloudy eyes", "crackling skin", "swollen leg muscle", "hair loss",
      "thickened skin", "skin crusting", "retained placenta", "abortion"
    ]
  },
  {
    name: "Respiratory",
    symptoms: [
      "coughing", "nasal discharge", "labored breathing", "froth from mouth/nose",
      "difficult breathing", "painful breathing"
    ]
  },
  {
    name: "Behavior & Vitals",
    symptoms: [
      "fever", "loss of appetite", "lethargy", "sudden death", "bloating",
      "tremors", "droopy ears", "restlessness", "weight loss",
      "reduced milk production", "sudden lameness", "high fever", "intense scratching"
    ]
  }
];
