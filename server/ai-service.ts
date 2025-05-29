import OpenAI from "openai";
import { scriptures } from "@shared/../client/src/lib/scriptures";
import { prayers } from "@shared/../client/src/lib/prayers";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface PersonalizedDevotional {
  scripture: {
    verse: string;
    reference: string;
    theme: string;
  };
  prayer: {
    text: string;
    theme: string;
  };
  encouragement: string;
}

export async function getPersonalizedDevotional(dayThoughts: string): Promise<PersonalizedDevotional> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a compassionate Christian counselor helping mothers. Based on the mother's shared thoughts and feelings, select the most appropriate KJV scripture and prayer from the provided lists, and create a personalized encouragement message.

Available Scriptures: ${JSON.stringify(scriptures)}

Available Prayers: ${JSON.stringify(prayers)}

Please respond with JSON in this exact format:
{
  "scripture": {
    "verse": "exact verse text from the list",
    "reference": "exact reference from the list", 
    "theme": "theme from the list"
  },
  "prayer": {
    "text": "exact prayer text from the list",
    "theme": "theme from the list"
  },
  "encouragement": "A 2-3 sentence personalized message of encouragement that directly addresses her specific feelings and situation, written with warmth and biblical wisdom"
}`
        },
        {
          role: "user",
          content: `A Christian mother shared these thoughts about her day: "${dayThoughts}"\n\nPlease select the most fitting scripture and prayer from the provided lists, and create a personalized encouragement message that speaks directly to her heart and situation.`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate the response has all required fields
    if (!result.scripture || !result.prayer || !result.encouragement) {
      throw new Error("Invalid AI response format");
    }

    return result as PersonalizedDevotional;
  } catch (error) {
    console.error("Error getting personalized devotional:", error);
    
    // Fallback to random selection if AI fails
    const randomScripture = scriptures[Math.floor(Math.random() * scriptures.length)];
    const randomPrayer = prayers[Math.floor(Math.random() * prayers.length)];
    
    return {
      scripture: randomScripture,
      prayer: randomPrayer,
      encouragement: "God sees your heart and knows exactly what you need today. You are loved, you are strong, and He is with you in every moment."
    };
  }
}