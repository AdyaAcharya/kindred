// server.js - Backend for Kindred (AUTO-DETECT MODEL)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Check if API key exists
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ ERROR: GEMINI_API_KEY not found in .env file!');
  process.exit(1);
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// List of models to try (in order of preference)
const MODELS_TO_TRY = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-pro',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash-002',
  'models/gemini-1.5-flash',
  'models/gemini-pro',
  'models/gemini-2.5-flash-image', 
  'models/gemini-3-pro-image-preview',
  'models/gemini-2.5-flash',
];

let WORKING_MODEL = null;

// Function to find a working model
async function findWorkingModel() {
  console.log('🔍 Auto-detecting working model...');
  
  for (const modelName of MODELS_TO_TRY) {
    try {
      console.log(`   Testing: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Say hi in one word');
      await result.response.text(); // Make sure we can get the text
      
      WORKING_MODEL = modelName;
      console.log(`   ✅ SUCCESS! Using model: ${modelName}`);
      return modelName;
    } catch (error) {
      console.log(`   ❌ Failed: ${modelName}`);
    }
  }
  
  throw new Error('No working model found. Please check your API key.');
}

// Initialize the working model on startup
(async () => {
  try {
    await findWorkingModel();
    console.log(`\n🎉 Server ready with model: ${WORKING_MODEL}\n`);
  } catch (error) {
    console.error('\n❌ ERROR: Could not find a working Gemini model.');
    console.error('Please check your API key at: https://aistudio.google.com/app/apikey');
    process.exit(1);
  }
})();

// Combined endpoint for complete word help
app.post('/api/word-help', async (req, res) => {
  try {
    const { word } = req.body;
    
    if (!word) {
      return res.status(400).json({ error: 'Word is required' });
    }

    if (!WORKING_MODEL) {
      return res.status(500).json({ 
        error: 'Server not ready',
        message: 'Model initialization in progress. Please try again in a few seconds.'
      });
    }

    console.log(`📝 Processing word: "${word}" with model: ${WORKING_MODEL}`);

    const model = genAI.getGenerativeModel({ model: WORKING_MODEL });

    // Get definition
    const defPrompt = `You are a friendly teacher. Explain the word "${word}" to a 5-year-old child in ONE simple, fun sentence. Keep it under 25 words.`;
    
    console.log('🔍 Requesting definition...');
    const defResult = await model.generateContent(defPrompt);
    const definition = defResult.response.text().trim();
    console.log('✅ Definition received');

    // Get image prompt
    const imgPrompt = `Describe a colorful, friendly cartoon image of "${word}" for children. One sentence, under 25 words.`;
    
    console.log('🎨 Requesting image description...');
    const imgResult = await model.generateContent(imgPrompt);
    const imagePrompt = imgResult.response.text().trim();
    console.log('✅ Image prompt received');

    res.json({ 
      word,
      definition,
      imagePrompt
    });

  } catch (error) {
    console.error('❌ Error in word-help:', error.message);
    
    res.status(500).json({ 
      error: 'Failed to process word',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    model: WORKING_MODEL || 'initializing',
    apiKeyPresent: !!process.env.GEMINI_API_KEY
  });
});

// Test endpoint
app.get('/test', async (req, res) => {
  try {
    if (!WORKING_MODEL) {
      // Try to find model again
      await findWorkingModel();
    }

    const model = genAI.getGenerativeModel({ model: WORKING_MODEL });
    const result = await model.generateContent('Say hello in one word');
    const text = result.response.text();
    
    res.json({ 
      success: true, 
      message: 'API key is working!',
      model: WORKING_MODEL,
      response: text
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Kindred backend running on port ${PORT}`);
  console.log(`📚 Ready to help kids learn!`);
  console.log(`🔑 API Key loaded: ${process.env.GEMINI_API_KEY ? 'YES ✅' : 'NO ❌'}`);
  console.log(`\n🧪 Test at: http://localhost:${PORT}/test`);
});