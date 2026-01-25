const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('🚀 SubTrack Environment Setup');
console.log('=============================\n');

const questions = [
  { name: 'SENTRY_DSN', question: 'Enter Sentry DSN (optional): ' },
  { name: 'CURRENCY_API_KEY', question: 'Enter currency API key: ' },
  { name: 'OCR_API_KEY', question: 'Enter OCR API key (optional): ' },
  { name: 'AI_API_KEY', question: 'Enter AI API key (optional): ' },
];

const envVars = {};

const askQuestion = (index) => {
  if (index >= questions.length) {
    // Write to .env file
    let envContent = '# SubTrack Environment Variables\n';
    envContent += '# Generated automatically\n\n';
    
    Object.keys(envVars).forEach(key => {
      if (envVars[key]) {
        envContent += `${key}=${envVars[key]}\n`;
      }
    });
    
    fs.writeFileSync('.env', envContent);
    console.log('\n✅ Environment file created!');
    rl.close();
    return;
  }
  
  const q = questions[index];
  rl.question(q.question, (answer) => {
    envVars[q.name] = answer.trim();
    askQuestion(index + 1);
  });
};

askQuestion(0);