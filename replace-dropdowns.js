const fs = require('fs');
const path = require('path');

// Lista de arquivos que contêm dropdowns
const filesToUpdate = [
  'src/pages/AdminContentListPage.tsx',
  'src/pages/AdminModulesPage.tsx', 
  'src/components/admin/ContentEditor.tsx'
];

function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Padrão para encontrar selects simples
    const selectPattern = /<select\s+([^>]*?)>([\s\S]*?)<\/select>/g;
    
    content = content.replace(selectPattern, (match, attributes, options) => {
      // Extrair value e onChange dos atributos
      const valueMatch = attributes.match(/value=\{([^}]+)\}/);
      const onChangeMatch = attributes.match(/onChange=\{([^}]+)\}/);
      const classNameMatch = attributes.match(/className="([^"]+)"/);
      
      if (!valueMatch || !onChangeMatch) {
        return match; // Manter original se não conseguir extrair
      }

      const value = valueMatch[1];
      const onChange = onChangeMatch[1];
      
      // Extrair options
      const optionPattern = /<option\s+value="([^"]*)"[^>]*>([^<]+)<\/option>/g;
      const options = [];
      let optionMatch;
      
      while ((optionMatch = optionPattern.exec(options)) !== null) {
        options.push({
          value: optionMatch[1],
          label: optionMatch[2]
        });
      }

      // Se não conseguiu extrair options, manter original
      if (options.length === 0) {
        return match;
      }

      changed = true;
      
      // Gerar o novo Dropdown
      const optionsStr = options.map(opt => 
        `{ value: '${opt.value}', label: '${opt.label}' }`
      ).join(',\n                ');

      const onChangeStr = onChange.includes('e.target.value') 
        ? onChange.replace(/\(e\) => [^(]+\(e\.target\.value\)/, '(value) => setValue(value)')
        : onChange;

      return `<Dropdown
            options={[
                ${optionsStr}
            ]}
            value={${value}}
            onChange=${onChangeStr}
            className="min-w-[120px]"
        />`;
    });

    // Adicionar import se necessário e houve mudanças
    if (changed && !content.includes("import Dropdown from")) {
      const importMatch = content.match(/(import.*from.*;\n)/);
      if (importMatch) {
        const insertPos = content.lastIndexOf(importMatch[1]) + importMatch[1].length;
        content = content.slice(0, insertPos) + 
                 "import Dropdown from '../components/ui/Dropdown';\n" + 
                 content.slice(insertPos);
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated: ${filePath}`);
    } else {
      console.log(`⚪ No changes: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

console.log('🔄 Atualizando dropdowns...');
filesToUpdate.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    updateFile(fullPath);
  } else {
    console.log(`⚠️  File not found: ${fullPath}`);
  }
});
console.log('✅ Concluído!'); 