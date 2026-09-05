const brain = require('brain.js');

// Create a feed-forward neural network
const net = new brain.NeuralNetwork({ hiddenLayers: [4, 4] });
let isTrained = false;

// Generate 5000 synthetic rows of training data based on real-world heuristics
const generateTrainingData = () => {
  const data = [];
  for (let i = 0; i < 5000; i++) {
    // Random features (0 to 1 scale)
    const isMobile = Math.random() > 0.4 ? 1 : 0; // 60% mobile traffic
    const isNight = Math.random() > 0.7 ? 1 : 0; // 30% night traffic
    const highAmount = Math.random() > 0.8 ? 1 : 0; // 20% high value txns
    const slowNetwork = Math.random() > 0.85 ? 1 : 0; // 15% slow network
    
    // The "Ground Truth" logic (simulating what an ML model would learn from real data)
    // Failures are highly correlated with: Mobile + Slow Network + High Amount
    let failProb = 0.1; // base failure rate
    if (isMobile) failProb += 0.2;
    if (slowNetwork) failProb += 0.4;
    if (highAmount) failProb += 0.2;
    if (isNight) failProb += 0.1;
    
    // Add some noise so it's not a perfectly deterministic function
    failProb += (Math.random() * 0.2 - 0.1);
    
    // Clamp between 0 and 1
    const output = Math.min(Math.max(failProb, 0), 1);
    
    // Threshold to make it a classification task (0 = success, 1 = drop-off)
    const droppedOff = output > 0.6 ? 1 : 0;

    data.push({
      input: { mobile: isMobile, night: isNight, highAmount: highAmount, slowNetwork: slowNetwork },
      output: { dropoff: droppedOff }
    });
  }
  return data;
};

const trainModel = () => {
  console.log("🧠 Training RevenueGuard Neural Network on 5,000 synthetic transactions...");
  const trainingData = generateTrainingData();
  
  // Train the model
  net.train(trainingData, {
    iterations: 2000, 
    errorThresh: 0.011, 
    log: true, 
    logPeriod: 500 
  });
  
  isTrained = true;
  console.log("✅ Neural Network Training Complete. Ready for real-time predictions.");
};

// Predict probability of failure for a new transaction
const predictDropoff = (transactionParams) => {
  if (!isTrained) throw new Error("Model not trained yet!");
  
  // Format: { mobile: 1, night: 0, highAmount: 1, slowNetwork: 0 }
  const result = net.run(transactionParams);
  
  return {
    riskScore: result.dropoff, // e.g. 0.85
    willDropoff: result.dropoff > 0.6,
    parameters: transactionParams
  };
};

module.exports = { trainModel, predictDropoff, isModelReady: () => isTrained };
