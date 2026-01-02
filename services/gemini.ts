import { GoogleGenAI } from "@google/genai";
import { AgentConfig, Screenshot } from "../types";

const getSystemInstruction = (tone: string, screenshots: Screenshot[]) => {
  const screenshotContext = screenshots.length > 0
    ? `You have access to the following captured screenshots of the website. 
    You MUST embed them in the guide where appropriate using standard Markdown image syntax: ![Alt Text](screenshot_id).
    
    Available Screenshots:
    ${screenshots.map(s => `- ID: ${s.id} (Description: ${s.description})`).join('\n')}
    
    IMPORTANT: Use the exact 'ID' from the list above as the image URL in the markdown.
    Example: If ID is 'screenshot_home', write ![Home Page](screenshot_home).
    
    If a relevant screenshot is not in this list for a specific section, use the text placeholder: *[SCREENSHOT: Description]*`
    : `Where a screenshot would be helpful, insert a placeholder text like: *[SCREENSHOT: Description of what should be seen here]*`;

  return `
You are an expert Enterprise Technical Writer and Agentic Workflow Architect. 
Your task is to generate a comprehensive User Guide for a specific website based on its URL.
You should act as if you have just crawled the website using a headless browser (like Playwright).
Since you cannot physically view the site, use your internal knowledge and Google Search to infer the functionality, layout, and core user flows.

Tone: ${tone}.
Format: Markdown.

Structure the guide as follows:
1. **Title Page** (H1)
2. **Introduction**: What is this website/app?
3. **Getting Started**: How to sign up/login.
4. **Core Features**: Detailed breakdown of main functionalities.
5. **Step-by-Step Instructions**: For common tasks.
6. **FAQ / Troubleshooting**.

${screenshotContext}
`;
};

export const generateUserGuide = async (
  url: string, 
  config: AgentConfig,
  screenshots: Screenshot[],
  onStream: (chunk: string) => void
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // We use the flash model for speed and search capabilities
    const modelId = 'gemini-3-flash-preview'; 

    const result = await ai.models.generateContentStream({
      model: modelId,
      contents: `Generate a detailed user guide for the website: ${url}. 
      The guide should be suitable for a ${config.tone} audience.
      Focus on the core value proposition and key workflows.`,
      config: {
        systemInstruction: getSystemInstruction(config.tone, screenshots),
        tools: [{ googleSearch: {} }], // Use grounding to get real info about the URL
        temperature: 0.4,
      }
    });

    let fullText = '';
    for await (const chunk of result) {
      const text = chunk.text;
      if (text) {
        fullText += text;
        onStream(text);
      }
    }
    
    return fullText;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};