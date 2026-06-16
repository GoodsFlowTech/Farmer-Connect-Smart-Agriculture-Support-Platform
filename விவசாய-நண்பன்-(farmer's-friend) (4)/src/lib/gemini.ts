import { GoogleGenAI, Modality } from "@google/genai";

export async function askChatBot(prompt: string, history: any[] = []) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `You are "AgriBot", a wise yet humble fellow farmer and a close friend (உற்ற நண்பன்). 
  You don't just give advice; you share the journey of farming with the user.

  TONE & STYLE:
  - Use spoken, colloquial Tamil (பேச்சுத் தமிழ்). Avoid formal, written-style Tamil (இலக்கியத் தமிழ்).
  - Talk like you are sitting with them under a neem tree, having a chat.
  - Use friendly connectives like "சரிங்களா?", "அப்புறம்...", "அப்பிடிக் கேளுங்க!".
  - Use terms of endearment and respect: "அண்ணா", "தம்பி", "நண்பா", "ஐயா".
  - Always use "நாம" (we) instead of "நான்" (I) when talking about solutions, to show solidarity (e.g., "நாம சேர்ந்து இதச் சரி பண்ணிடலாம்").

  CONVERSATIONAL CUES:
  - Start with a quick friendly check-in if appropriate, like "வீட்ல எல்லாரும் சௌக்கியமா?" or "இந்த மழை உங்க பக்கம் எப்படி இருக்கு?".
  - If a farmer is worried about loss, be deeply empathetic: "ஐயோ, கஷ்டம்தான் அண்ணா. ஆனா மனச தளரவிடாதீங்க, இதுக்கு ஒரு வழி கண்டுபிடிச்சிடலாம்."
  - When giving technical advice (like pesticides or fertilizers), explain it as something "you've seen work on other farms" or "general farmer wisdom".

  PRACTICALITY:
  - Keep it simple. Don't use heavy scientific terms unless you explain them simply.
  - Your responses are converted to speech, so avoid bullet points unless necessary. Use natural transitions.`;

  try {
    const chat = ai.chats.create({
      model,
      config: {
        systemInstruction,
      },
      history: history.length > 0 ? history : []
    });

    const response = await chat.sendMessage({
      message: prompt
    });

    return response.text;
  } catch (error: any) {
    console.error("ChatBot Error:", error);
    if (error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
      return "மன்னிக்கவும் நண்பா, இன்றைய விவசாய உதவியாளர் சேவைக்கான அளவு முடிந்துவிட்டது. சிறிது நேரம் கழித்து முயற்சி செய்யவும். (Sorry friend, the agricultural assistant quota for today is exhausted. Please try again after some time.)";
    }
    return "மன்னிக்கவும், என்னால் இப்போது பதிலளிக்க முடியவில்லை. (Sorry, I cannot respond right now.)";
  }
}

export async function textToSpeech(text: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  const model = "gemini-3.1-flash-tts-preview";
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return { data: addWavHeader(base64Audio) };
    }
    return { error: 'No audio generated' };
  } catch (error: any) {
    console.error("TTS Error:", error);
    if (error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
      return { error: 'QUOTA_EXCEEDED' };
    }
    return { error: 'FAILED' };
  }
}

function addWavHeader(base64Pcm: string, sampleRate = 24000) {
  const binaryPcm = atob(base64Pcm);
  const dataLen = binaryPcm.length;
  const buffer = new ArrayBuffer(44 + dataLen);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + dataLen, true); // ChunkSize
  view.setUint32(8, 0x57415645, false); // "WAVE"

  // fmt sub-chunk
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); // Subchunk1Size
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, 1, true); // NumChannels (1 = Mono)
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * 2, true); // ByteRate
  view.setUint16(32, 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample

  // data sub-chunk
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, dataLen, true); // Subchunk2Size

  // Write PCM data
  const uint8View = new Uint8Array(buffer, 44);
  for (let i = 0; i < dataLen; i++) {
    uint8View[i] = binaryPcm.charCodeAt(i);
  }

  // Convert to base64 safely
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function analyzeCropDisease(imageBase64: string, mimeType: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `You are an expert Agricultural Scientist specialized in crop diseases in Tamil Nadu, India. 
  The user will provide an image of a crop. 
  Identify the disease, describe symbols/symptoms, suggest chemical or organic medicines, and provide a solution method.
  IMPORTANT: Provide the entire response in Tamil language.
  Format the output as a JSON object with these keys in Tamil: 
  {
    "நோய்": "...",
    "அறிகுறி": "...",
    "மருந்து": "...",
    "தீர்வு_முறை": "..."
  }`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          parts: [
            { text: "Analyze this crop image for diseases. Provide the response in Tamil as JSON." },
            { inlineData: { data: imageBase64, mimeType } }
          ]
        }
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error: any) {
    console.error("Gemini Disease Analysis Error:", error);
    const isQuota = error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED');
    return {
      "நோய்": isQuota ? "சேவை அளவு முடிந்தது" : "கண்டறிய முடியவில்லை",
      "அறிகுறி": isQuota ? "இன்றைய சேவைக்கான அளவு முடிந்துவிட்டது. சிறிது நேரம் கழித்து மீண்டும் புகைப்படத்தைப் பதிவேற்றவும்." : "தயவுசெய்து தெளிவான புகைப்படத்தை மீண்டும் பதிவேற்றவும்.",
      "மருந்து": isQuota ? "Quota Exhausted" : "-",
      "தீர்வு_முறை": isQuota ? "Please try again later" : "-"
    };
  }
}
