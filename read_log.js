const fs = require('fs');
try {
  const content = fs.readFileSync('expo_output.log', 'utf16le');
  console.log(content);
} catch (e) {
  try {
    const content = fs.readFileSync('expo_output.log', 'utf8');
    console.log(content);
  } catch (err) {
    console.error(err);
  }
}
