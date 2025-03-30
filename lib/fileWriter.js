const fs = require('fs');
const path = require('path');

/**
 * 将 Markdown 内容写入文件
 */
function writeMarkdownFile(content, outputPath) {
  const dir = path.dirname(outputPath);
  
  // 确保目录存在
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, content, 'utf8');
  return outputPath;
}

module.exports = { writeMarkdownFile };
