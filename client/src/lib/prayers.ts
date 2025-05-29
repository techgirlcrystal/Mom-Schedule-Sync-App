export interface Prayer {
  text: string;
  theme: string;
}

// Daily prayers for Christian mothers
export const prayers: Prayer[] = [
  {
    text: "Heavenly Father, as I begin this day, help me to walk in Your strength and wisdom. Guide my steps and help me serve my family with love and patience. Amen.",
    theme: "daily"
  },
  {
    text: "Lord, grant me patience as I care for my children today. Help me to see them through Your eyes and to love them with Your love. Fill me with Your peace when I feel overwhelmed. Amen.",
    theme: "patience"
  },
  {
    text: "Dear God, help me to prioritize what truly matters today. Give me wisdom to balance my responsibilities and grace to let go of what I cannot control. Amen.",
    theme: "priorities"
  },
  {
    text: "Father, I surrender my worries and anxieties to You. Help me to trust in Your perfect timing and provision for my family. Fill my heart with Your peace. Amen.",
    theme: "anxiety"
  },
  {
    text: "Lord, help me to find moments of joy and gratitude throughout this busy day. Open my eyes to see Your blessings all around me. Amen.",
    theme: "gratitude"
  },
  {
    text: "Heavenly Father, give me the energy and motivation I need for today's tasks. Help me to work with excellence and to find purpose in even the smallest duties. Amen.",
    theme: "energy"
  },
  {
    text: "God, help me to be a good example to my children today. May my words and actions reflect Your love and grace. Guide me in teaching them Your ways. Amen.",
    theme: "example"
  },
  {
    text: "Lord, when I feel inadequate or overwhelmed, remind me that I can do all things through Christ who strengthens me. Fill me with Your confidence. Amen.",
    theme: "strength"
  },
  {
    text: "Father, help me to create a peaceful and loving atmosphere in our home today. Let Your presence fill our family with harmony and understanding. Amen.",
    theme: "home"
  },
  {
    text: "Dear God, help me to take care of myself today so that I can better care for others. Remind me that rest is not selfish but necessary. Amen.",
    theme: "self-care"
  }
];

export function getDailyPrayer(): Prayer {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const prayerIndex = dayOfYear % prayers.length;
  return prayers[prayerIndex];
}

export function getPrayerByTheme(theme: string): Prayer {
  const filteredPrayers = prayers.filter(p => p.theme === theme);
  if (filteredPrayers.length === 0) {
    return getDailyPrayer();
  }
  const randomIndex = Math.floor(Math.random() * filteredPrayers.length);
  return filteredPrayers[randomIndex];
}
