
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, Download } from 'lucide-react';
import { toast } from 'sonner';

interface CodeViewerProps {
  code: string;
  language?: string;
  title?: string;
  fileName?: string;
}

const formatJSON = (jsonString: string): string => {
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed, null, 2);
  } catch (e) {
    console.error("Invalid JSON string:", e);
    return jsonString;
  }
};

const syntaxHighlight = (json: string): string => {
  // Simple syntax highlighting
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    function (match) {
      let cls = 'text-blue-600 dark:text-blue-400'; // number
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'text-pink-600 dark:text-pink-400'; // key
        } else {
          cls = 'text-green-600 dark:text-green-400'; // string
        }
      } else if (/true|false/.test(match)) {
        cls = 'text-purple-600 dark:text-purple-400'; // boolean
      } else if (/null/.test(match)) {
        cls = 'text-red-600 dark:text-red-400'; // null
      }
      return '<span class="' + cls + '">' + match + '</span>';
    }
  );
};

const CodeViewer: React.FC<CodeViewerProps> = ({ 
  code, 
  language = 'json', 
  title = 'Código JSON',
  fileName = 'elementor-component.json'
}) => {
  const [copied, setCopied] = useState(false);
  const [formattedCode, setFormattedCode] = useState('');

  useEffect(() => {
    if (language === 'json') {
      const formatted = formatJSON(code);
      setFormattedCode(syntaxHighlight(formatted));
    } else {
      setFormattedCode(code);
    }
  }, [code, language]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Código copiado para a área de transferência!');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success(`Arquivo ${fileName} baixado com sucesso!`);
  };

  return (
    <div className="w-full rounded-lg overflow-hidden border border-border bg-card">
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50">
        <h3 className="text-sm font-medium">{title}</h3>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-xs"
            onClick={downloadCode}
          >
            <Download className="h-3.5 w-3.5 mr-1" />
            Baixar
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-xs"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 mr-1" />
                Copiar
              </>
            )}
          </Button>
        </div>
      </div>
      <div className="overflow-auto max-h-[500px] bg-card">
        <pre className="text-sm p-4 code-json">
          <div dangerouslySetInnerHTML={{ __html: formattedCode }} />
        </pre>
      </div>
    </div>
  );
};

export default CodeViewer;
