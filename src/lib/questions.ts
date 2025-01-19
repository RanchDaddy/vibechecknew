interface Question {
  question: string;
  type: "image" | "text";
  options: Array<string | { image: string; text: string }>;
}

export const questions: Question[] = [
  {
    question: "Which house would you most want to live in together?",
    type: "image",
    options: [
      {
        image: "/placeholder.svg",
        text: "Modern Minimalist Glass House"
      },
      {
        image: "/placeholder.svg",
        text: "Cozy Cottage in the Woods"
      },
      {
        image: "/placeholder.svg",
        text: "Beach House with Ocean Views"
      },
      {
        image: "/placeholder.svg",
        text: "Urban Penthouse Apartment"
      }
    ]
  },
  {
    question: "What color smells the best?",
    type: "image",
    options: [
      {
        image: "/placeholder.svg",
        text: "Deep Purple (like lavender)"
      },
      {
        image: "/placeholder.svg",
        text: "Bright Yellow (like lemons)"
      },
      {
        image: "/placeholder.svg",
        text: "Forest Green (like pine)"
      },
      {
        image: "/placeholder.svg",
        text: "Ocean Blue (like sea breeze)"
      }
    ]
  },
  {
    question: "If you were both reincarnated as kitchen appliances, what would you be?",
    type: "text",
    options: [
      "Toaster and Coffee Maker - Hot and Essential",
      "Blender and Food Processor - Versatile and Powerful",
      "Fridge and Oven - Opposites Attract",
      "Microwave and Dishwasher - Quick and Practical"
    ]
  },
  {
    question: "What's your ideal apocalypse survival plan as a couple?",
    type: "text",
    options: [
      "Convert a bunker into a cozy love nest",
      "Start a sustainable farm in the wilderness",
      "Join a nomadic group of survivors",
      "Take over an abandoned theme park"
    ]
  },
  {
    question: "If your relationship was a weird internet meme, which would it be?",
    type: "text",
    options: [
      "Dancing Baby - Old school but gold",
      "Nyan Cat - Colorful and unstoppable",
      "Doge - Much love, very relationship",
      "This Is Fine Dog - Chaos but still happy"
    ]
  }
];