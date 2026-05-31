export const HEALTH_PROTOCOLS = {
  Cattle: {
    gestation: 283,
    weaningAge: 210, // days (approx 7 months)
    vaccines: [
      { name: "Brucellosis", age: 120, mandatory: true, type: "Once" }, // 4 months
      { name: "Anthrax/Blackleg", age: 180, mandatory: true, type: "Annual" }, // 6 months
      { name: "Lumpy Skin Disease", age: 210, mandatory: true, type: "Annual" },
      { name: "FMD Vaccine", age: 180, mandatory: true, type: "Bi-Annual" }
    ]
  },
  Goat: {
    gestation: 150,
    weaningAge: 90, // days (3 months)
    vaccines: [
      { name: "Pulpy Kidney", age: 60, mandatory: true, type: "Annual" },
      { name: "Pasteurella", age: 45, mandatory: true, type: "Annual" },
      { name: "Deworming", age: 30, mandatory: false, type: "Quarterly" }
    ]
  },
  Sheep: {
    gestation: 152,
    weaningAge: 100,
    vaccines: [
      { name: "Blue Tongue", age: 120, mandatory: true, type: "Annual" },
      { name: "Anthrax", age: 150, mandatory: true, type: "Annual" }
    ]
  },
  Pig: {
    gestation: 114,
    weaningAge: 28, // 4 weeks
    vaccines: [
      { name: "Swine Fever", age: 60, mandatory: true, type: "Annual" },
      { name: "Iron Injection", age: 3, mandatory: true, type: "Once" }
    ]
  }
};
