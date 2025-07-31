const fs = require('fs');
const path = require('path');

// Mapeamento de classes que devem ser substituídas
const colorReplacements = {
  'bg-blue-600': 'bg-primary',
  'bg-blue-50': 'bg-primary-50',
  'bg-blue-100': 'bg-primary-100',
  'text-blue-600': 'text-primary',
  'text-blue-700': 'text-primary-700',
  'text-blue-800': 'text-primary-800',
  'hover:bg-blue-700': 'hover:bg-primary',
  'hover:bg-blue-50': 'hover:bg-primary-50',
  'hover:bg-blue-100': 'hover:bg-primary-100',
  'hover:text-blue-700': 'hover:text-primary-700',
  'hover:text-blue-800': 'hover:text-primary-800',
  'border-blue-200': 'border-primary-200',
  'border-blue-500': 'border-primary',
  'focus:ring-blue-500': 'focus:ring-primary',
  'ring-blue-500': 'ring-primary'
};

function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    for (const [oldClass, newClass] of Object.entries(colorReplacements)) {
      if (content.includes(oldClass)) {
        content = content.replace(new RegExp(oldClass, 'g'), newClass);
        changed = true;
      }
    }
    
    if (changed) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

function scanDirectory(dir, extensions = ['.tsx', '.ts']) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      scanDirectory(filePath, extensions);
    } else if (extensions.some(ext => file.endsWith(ext))) {
      updateFile(filePath);
    }
  }
}

// Executar para os diretórios de componentes e páginas
console.log('🔄 Atualizando cores para usar --primary...');
scanDirectory('./src/components');
scanDirectory('./src/pages');
console.log('✅ Atualização concluída!');