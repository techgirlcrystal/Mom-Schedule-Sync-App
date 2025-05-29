export interface Scripture {
  verse: string;
  reference: string;
  theme: string;
}

// KJV scriptures focused on motherhood, daily life, and encouragement
export const scriptures: Scripture[] = [
  {
    verse: "She is clothed with strength and dignity; she can laugh at the days to come.",
    reference: "Proverbs 31:25 (KJV)",
    theme: "strength"
  },
  {
    verse: "Her children arise up, and call her blessed; her husband also, and he praiseth her.",
    reference: "Proverbs 31:28 (KJV)",
    theme: "motherhood"
  },
  {
    verse: "And let us not be weary in well doing: for in due season we shall reap, if we faint not.",
    reference: "Galatians 6:9 (KJV)",
    theme: "perseverance"
  },
  {
    verse: "She looketh well to the ways of her household, and eateth not the bread of idleness.",
    reference: "Proverbs 31:27 (KJV)",
    theme: "diligence"
  },
  {
    verse: "But my God shall supply all your need according to his riches in glory by Christ Jesus.",
    reference: "Philippians 4:19 (KJV)",
    theme: "provision"
  },
  {
    verse: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.",
    reference: "Matthew 11:28 (KJV)",
    theme: "rest"
  },
  {
    verse: "Trust in the Lord with all thine heart; and lean not unto thine own understanding.",
    reference: "Proverbs 3:5 (KJV)",
    theme: "trust"
  },
  {
    verse: "She openeth her mouth with wisdom; and in her tongue is the law of kindness.",
    reference: "Proverbs 31:26 (KJV)",
    theme: "wisdom"
  },
  {
    verse: "I can do all things through Christ which strengtheneth me.",
    reference: "Philippians 4:13 (KJV)",
    theme: "strength"
  },
  {
    verse: "And we know that all things work together for good to them that love God.",
    reference: "Romans 8:28 (KJV)",
    theme: "hope"
  },
  {
    verse: "Train up a child in the way he should go: and when he is old, he will not depart from it.",
    reference: "Proverbs 22:6 (KJV)",
    theme: "parenting"
  },
  {
    verse: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.",
    reference: "Philippians 4:6 (KJV)",
    theme: "anxiety"
  },
  {
    verse: "The heart of her husband doth safely trust in her, so that he shall have no need of spoil.",
    reference: "Proverbs 31:11 (KJV)",
    theme: "marriage"
  },
  {
    verse: "She stretcheth out her hand to the poor; yea, she reacheth forth her hands to the needy.",
    reference: "Proverbs 31:20 (KJV)",
    theme: "generosity"
  },
  {
    verse: "And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.",
    reference: "Philippians 4:7 (KJV)",
    theme: "peace"
  },
  {
    verse: "She girdeth her loins with strength, and strengtheneth her arms.",
    reference: "Proverbs 31:17 (KJV)",
    theme: "strength"
  },
  {
    verse: "But they that wait upon the Lord shall renew their strength; they shall mount up with wings as eagles.",
    reference: "Isaiah 40:31 (KJV)",
    theme: "renewal"
  },
  {
    verse: "The Lord thy God in the midst of thee is mighty; he will save, he will rejoice over thee with joy.",
    reference: "Zephaniah 3:17 (KJV)",
    theme: "love"
  },
  {
    verse: "She considereth a field, and buyeth it: with the fruit of her hands she planteth a vineyard.",
    reference: "Proverbs 31:16 (KJV)",
    theme: "planning"
  },
  {
    verse: "Casting all your care upon him; for he careth for you.",
    reference: "1 Peter 5:7 (KJV)",
    theme: "care"
  }
];

export function getRandomScripture(): Scripture {
  const randomIndex = Math.floor(Math.random() * scriptures.length);
  return scriptures[randomIndex];
}

export function getScriptureByTheme(theme: string): Scripture {
  const filteredScriptures = scriptures.filter(s => s.theme === theme);
  if (filteredScriptures.length === 0) {
    return getRandomScripture();
  }
  const randomIndex = Math.floor(Math.random() * filteredScriptures.length);
  return filteredScriptures[randomIndex];
}
