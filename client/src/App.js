// client/src/App.js
import React, { useState } from 'react';
import { Volume2, BookOpen, Sparkles, Languages, X, Play, Pause } from 'lucide-react';
import { getWordHelp } from './services/api';

const App = () => {
  const [selectedWord, setSelectedWord] = useState(null);
  const [helpPanelData, setHelpPanelData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const story = {
    title: "The Curious Cat",
    text: "Once upon a time, there lived a curious cat named Whiskers. She loved to explore the garden and discover new things every day."
  };

  const words = story.text.split(' ');

  // Generate FREE AI image URL using Pollinations.ai
  const generateImageUrl = (imagePrompt) => {
    const enhancedPrompt = `${imagePrompt}, colorful cartoon illustration, child-friendly, simple, cute, educational`;
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&nologo=true&enhance=true`;
  };

  // Text-to-Speech function
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech is not supported in your browser.');
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleWordClick = async (word, index) => {
    const cleanWord = word.replace(/[.,!?]/g, '');
    setSelectedWord({ word: cleanWord, index });
    setIsLoading(true);
    setError(null);
    setHelpPanelData(null);
    setImageLoaded(false);

    try {
      console.log('Fetching word help for:', cleanWord);
      const data = await getWordHelp(cleanWord);
      console.log('Received data:', data);
      setHelpPanelData(data);
    } catch (err) {
      console.error('Error fetching word help:', err);
      setError('Could not connect to the server. Make sure the backend is running on port 3001.');
      setHelpPanelData({
        word: cleanWord,
        definition: "Oops! I couldn't load the definition right now. Make sure your backend server is running!",
        imagePrompt: `A friendly colorful illustration of a ${cleanWord}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closeHelpPanel = () => {
    stopSpeaking();
    setSelectedWord(null);
    setHelpPanelData(null);
    setError(null);
    setImageLoaded(false);
  };

  const handleReadStory = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakText(story.text);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-12 h-12 text-purple-600" />
            <h1 className="text-5xl font-bold text-purple-800">Kindred</h1>
          </div>
          <p className="text-xl text-purple-600">Click words to learn and see AI images!</p>
        </div>

        {/* Story Container */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800">{story.title}</h2>
            <button
              onClick={handleReadStory}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
                isSpeaking
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-purple-500 hover:bg-purple-600 text-white'
              }`}
            >
              {isSpeaking ? (
                <>
                  <Pause className="w-5 h-5" />
                  Stop Story
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Read Story Aloud
                </>
              )}
            </button>
          </div>

          <div className="text-2xl leading-relaxed text-gray-700">
            {words.map((word, index) => (
              <span
                key={index}
                onClick={() => handleWordClick(word, index)}
                className="cursor-pointer px-1 rounded transition-all inline-block hover:bg-purple-100 hover:scale-105"
              >
                {word}{' '}
              </span>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-purple-50 rounded-2xl p-6 border-2 border-purple-200">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-purple-600 mt-1" />
            <div>
              <h3 className="font-bold text-purple-800 mb-2">How to use Kindred:</h3>
              <ul className="space-y-1 text-purple-700">
                <li>• Click "Read Story Aloud" to hear the entire story</li>
                <li>• Click any word to learn its meaning</li>
                <li>• See FREE AI-generated images for each word!</li>
                <li>• Listen to word definitions with text-to-speech</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Help Panel */}
        {selectedWord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 relative animate-in max-h-[90vh] overflow-y-auto">
              <button
                onClick={closeHelpPanel}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-8 h-8 text-purple-600" />
                  <h3 className="text-3xl font-bold text-purple-800">
                    {selectedWord.word}
                  </h3>
                </div>
                {helpPanelData && helpPanelData.definition && (
                  <button
                    onClick={() => speakText(helpPanelData.definition)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full font-semibold transition-colors"
                  >
                    <Volume2 className="w-5 h-5" />
                    Listen
                  </button>
                )}
              </div>

              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                  <p className="mt-4 text-gray-600">Loading word magic...</p>
                </div>
              ) : helpPanelData ? (
                <div>
                  {/* AI Generated Image Section */}
                  <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl p-6 mb-6">
                    <h4 className="font-bold text-purple-800 mb-4 text-xl flex items-center gap-2">
                      <span>🎨</span> AI-Generated Image:
                    </h4>
                    <div className="bg-white rounded-xl p-4 border-2 border-purple-200">
                      <div className="relative">
                        {!imageLoaded && (
                          <div className="absolute inset-0 flex items-center justify-center bg-purple-50 rounded-lg">
                            <div className="text-center">
                              <div className="inline-block w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-2"></div>
                              <p className="text-sm text-purple-600">Generating AI image...</p>
                            </div>
                          </div>
                        )}
                        <img 
                          src={generateImageUrl(helpPanelData.imagePrompt)}
                          alt={selectedWord.word}
                          className="w-full h-64 object-cover rounded-lg"
                          onLoad={() => setImageLoaded(true)}
                          onError={(e) => {
                            e.target.src = `https://via.placeholder.com/512x512/9333EA/FFFFFF?text=${encodeURIComponent(selectedWord.word)}`;
                            setImageLoaded(true);
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 text-center mt-3">
                        ✨ Generated by AI using: {helpPanelData.imagePrompt}
                      </p>
                    </div>
                  </div>

                  {/* Definition Section */}
                  <div className="bg-purple-50 rounded-2xl p-6 mb-6">
                    <h4 className="font-bold text-purple-800 mb-3 text-xl">What does it mean?</h4>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      {helpPanelData.definition}
                    </p>
                    {error && (
                      <div className="mt-4 p-4 bg-orange-100 border border-orange-300 rounded-lg">
                        <p className="text-sm text-orange-800">
                          <strong>⚠️ Note:</strong> {error}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Translation Button */}
                  <button 
                    onClick={() => alert('Translation feature coming soon! 🌍\n\nThis will let kids translate words into different languages.')}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-semibold transition-colors"
                  >
                    <Languages className="w-5 h-5" />
                    Translate to Another Language
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;