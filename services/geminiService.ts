import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GeneratedMetadata } from "../types";

// Helper to convert file to base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const generateArtworkMetadata = async (base64Image: string, mimeType: string): Promise<GeneratedMetadata> => {
  // Initialize on demand to ensure environment is ready and avoid top-level crashes
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-2.5-flash";
  
  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Ein kreativer, evokativer Titel für das Gemälde." },
      description: { type: Type.STRING, description: "Eine anspruchsvolle kuratorische Beschreibung auf Deutsch, die sich auf Pinselstrich, Farbpalette und emotionale Resonanz konzentriert." },
      medium: { type: Type.STRING, description: "Das Malmedium (z. B. Öl auf Leinwand, Acryl auf Holz, Aquarell, Gouache)." },
      tags: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "5 relevante Schlagworte auf Deutsch, die den künstlerischen Stil, die Technik und das Motiv beschreiben." 
      }
    },
    required: ["title", "description", "medium", "tags"],
  };

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          },
          {
            text: "Du bist ein erfahrener Kunstkritiker und Kurator, der sich auf Malerei spezialisiert hat. Analysiere dieses Kunstwerk und erstelle Metadaten für die Portfolio-Website auf Deutsch."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "Du bist ein professioneller Kunstkurator. Dein Ton ist elegant, einfühlsam und auf die malerischen Qualitäten des Werks fokussiert. Besprich Textur, Licht und Komposition. Vermeide generische Phrasen wie 'Dieses Bild zeigt'. Antworte ausschließlich auf Deutsch.",
      }
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("Kein Text von Gemini erhalten");
    }

    return JSON.parse(jsonText) as GeneratedMetadata;
  } catch (error) {
    console.error("Fehler bei der Metadaten-Generierung:", error);
    throw error;
  }
};