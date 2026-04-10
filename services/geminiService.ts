
import { GoogleGenAI } from "@google/genai";
import { Supplier, Material, ProcurementRecord, EnergyRecord } from "../types";

export const getSustainabilityAdvice = async (
  suppliers: Supplier[],
  materials: Material[],
  procurement: ProcurementRecord[],
  energy: EnergyRecord[],
  userQuery?: string
) => {
  const model = "gemini-3-flash-preview";
  console.log(`[Gemini] Calling model: ${model}`);
  
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    console.error("Gemini API Key is missing. Please check your environment variables.");
    return "Error: Gemini API Key is missing. Please configure it in the settings.";
  }

  const ai = new GoogleGenAI({ apiKey });
  const systemInstruction = `
    You are an expert Sustainability Consultant for a Green ERP system. 
    Your goal is to analyze procurement and energy data to provide actionable, high-impact strategies for reducing carbon footprint and improving ESG scores.
    
    If the user provides a specific question, answer it directly using the data context provided.
    If no specific question is provided, generate a structured report with:
    1. Executive Summary
    2. Top 3 Strategic Actions
    3. Estimated Impact Analysis
    4. Circular Economy Opportunities
    
    Keep the tone professional, data-driven, and encouraging.
  `;

  const dataContext = {
    totalSuppliers: suppliers.length,
    avgSupplierScore: suppliers.reduce((acc, s) => acc + s.sustainabilityScore, 0) / (suppliers.length || 1),
    totalProcurementValue: procurement.reduce((acc, p) => acc + p.totalCost, 0),
    totalEnergyCarbon: energy.reduce((acc, e) => acc + e.carbonEquivalent, 0),
    topMaterials: materials.slice(0, 5).map(m => ({ name: m.name, carbonFactor: m.carbonFactor })),
    recentProcurement: procurement.slice(0, 5).map(p => ({ 
      material: materials.find(m => m.id === p.materialId)?.name,
      supplier: suppliers.find(s => s.id === p.supplierId)?.name,
      cost: p.totalCost
    }))
  };

  const prompt = `
    ${userQuery ? `USER QUESTION: ${userQuery}` : 'Generate a strategic sustainability optimization report based on the data context.'}

    DATA CONTEXT:
    ${JSON.stringify(dataContext, null, 2)}
    
    Identify specific areas where the company can improve. Look for high-carbon materials being bought from low-ESG suppliers.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "I'm sorry, I couldn't generate advice at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return `Error generating AI suggestions: ${errorMessage}. Please check your API configuration.`;
  }
};

export const getSustainabilityTip = async () => {
  const model = "gemini-3-flash-preview";
  console.log(`[Gemini] Calling model: ${model}`);
  
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) return "Optimizing logistics routes can significantly reduce fuel consumption and carbon emissions.";

  const ai = new GoogleGenAI({ apiKey });
  const prompt = "Provide a single, concise, and high-impact sustainability tip for a large enterprise. Focus on energy, supply chain, or circular economy. Max 20 words.";

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature: 0.9,
      },
    });

    return response.text?.trim() || "Switching to LED lighting can reduce energy consumption by up to 75%.";
  } catch (error) {
    console.error("Gemini Tip Error:", error);
    return "Optimizing logistics routes can significantly reduce fuel consumption and carbon emissions.";
  }
};

export const getGeospatialInsights = async (suppliers: Supplier[]) => {
  const model = "gemini-3-flash-preview";
  console.log(`[Gemini] Calling model: ${model}`);
  
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) return "Error: Gemini API Key is missing.";

  const ai = new GoogleGenAI({ apiKey });
  const systemInstruction = `
    You are a Logistics and Sustainability Expert. 
    Analyze the geographical distribution of suppliers and provide insights on:
    1. Transport-related carbon risks.
    2. Regional sustainability trends.
    3. Opportunities for local sourcing to reduce Scope 3 emissions.
    
    Use Google Maps grounding to verify regional environmental regulations or logistics hubs if relevant.
  `;

  const prompt = `
    Analyze the following supplier locations for sustainability and logistics optimization:
    ${suppliers.map(s => `${s.name}: ${s.location} (ESG: ${s.sustainabilityScore})`).join('\n')}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }], // Using googleSearch for grounding as per guidelines for general web info
      },
    });

    return response.text || "No geospatial insights available.";
  } catch (error) {
    console.error("Geospatial AI Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return `Error generating geospatial insights: ${errorMessage}`;
  }
};

export const getCarbonForecast = async (
  procurement: ProcurementRecord[],
  energy: EnergyRecord[],
  materials: Material[]
) => {
  const model = "gemini-3-flash-preview";
  console.log(`[Gemini] Calling model: ${model}`);
  
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) return { forecastData: [], insights: "Error: Gemini API Key is missing.", confidence: 0 };

  const ai = new GoogleGenAI({ apiKey });
  const systemInstruction = `
    You are a Data Scientist and Sustainability Analyst.
    Based on historical procurement and energy data, predict carbon emissions for the next 6 months.
    
    Return a JSON object with:
    1. "forecastData": An array of 6 objects, each with "month" (string, e.g., "Jan") and "predictedCarbon" (number).
    2. "insights": A string (markdown) explaining the trends, potential risks, and mitigation strategies.
    3. "confidence": A number (0-100) representing the confidence in the prediction.
    
    Be realistic. If procurement is increasing, carbon should likely increase unless sustainability measures are noted.
  `;

  const dataContext = {
    procurement,
    energy,
    materials
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Predict the next 6 months of carbon emissions based on this data: ${JSON.stringify(dataContext)}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Forecasting AI Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      forecastData: [],
      insights: `Error generating forecast: ${errorMessage}`,
      confidence: 0
    };
  }
};

export const runSustainabilitySimulation = async (
  currentData: {
    procurement: ProcurementRecord[];
    energy: EnergyRecord[];
    materials: Material[];
    suppliers: Supplier[];
  },
  params: {
    energyReductionPercent: number;
    materialSwitchId?: string;
    newMaterialId?: string;
    supplierSwitchId?: string;
    newSupplierId?: string;
  }
) => {
  const model = "gemini-3-flash-preview";
  console.log(`[Gemini] Calling model: ${model}`);
  
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) return { currentCarbon: 0, simulatedCarbon: 0, carbonReduction: 0, costImpact: 0, esgImpact: 0, strategicAnalysis: "Error: Gemini API Key is missing." };

  const ai = new GoogleGenAI({ apiKey });
  const systemInstruction = `
    You are a Sustainability Strategy Consultant.
    Given the current enterprise data and a proposed "What-If" scenario, calculate the potential impact.
    
    Return a JSON object with:
    1. "currentCarbon": number (total kg CO2e)
    2. "simulatedCarbon": number (total kg CO2e)
    3. "carbonReduction": number (percentage)
    4. "costImpact": number (estimated percentage change in cost, positive or negative)
    5. "esgImpact": number (estimated change in average supplier ESG score)
    6. "strategicAnalysis": string (markdown explaining the trade-offs, feasibility, and long-term benefits)
    
    Be precise. Use the provided materials' carbon factors and suppliers' ESG scores to make realistic estimates.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Run a sustainability simulation with these parameters: ${JSON.stringify(params)} 
                 based on this current data: ${JSON.stringify(currentData)}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Simulation AI Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      currentCarbon: 0,
      simulatedCarbon: 0,
      carbonReduction: 0,
      costImpact: 0,
      esgImpact: 0,
      strategicAnalysis: `Error running simulation: ${errorMessage}`
    };
  }
};
