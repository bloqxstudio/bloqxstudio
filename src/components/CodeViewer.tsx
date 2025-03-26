
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, Download, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Link } from 'react-router-dom';

interface CodeViewerProps {
  code: string;
  language?: string;
  title?: string;
  fileName?: string;
  restricted?: boolean;
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
  fileName = 'elementor-component.json',
  restricted = false
}) => {
  const [copied, setCopied] = useState(false);
  const [formattedCode, setFormattedCode] = useState('');
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (language === 'json') {
      const formatted = formatJSON(code);
      setFormattedCode(syntaxHighlight(formatted));
    } else {
      setFormattedCode(code);
    }
  }, [code, language]);

  const handleCopy = () => {
    if (restricted && !user) {
      setShowAuthDialog(true);
      return;
    }
    
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Código copiado para a área de transferência!');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    if (restricted && !user) {
      setShowAuthDialog(true);
      return;
    }
    
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success(`Arquivo ${fileName} baixado com sucesso!`);
  };

  const getPreviewCode = () => {
    // Show first 5 lines with "..." for unauthenticated users
    if (restricted && !user) {
      const lines = code.split('\n');
      return lines.slice(0, 5).join('\n') + '\n...';
    }
    return code;
  };

  return (
    <>
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
              {restricted && !user ? (
                <Lock className="h-3.5 w-3.5 mr-1" />
              ) : (
                <Download className="h-3.5 w-3.5 mr-1" />
              )}
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
                  {restricted && !user ? (
                    <Lock className="h-3.5 w-3.5 mr-1" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 mr-1" />
                  )}
                  Copiar
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="overflow-auto max-h-[500px] bg-card relative">
          <pre className="text-sm p-4 code-json">
            <div dangerouslySetInnerHTML={{ __html: formattedCode }} />
          </pre>
          
          {restricted && !user && (
            <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px] flex flex-col items-center justify-center">
              <div className="bg-background/95 border shadow-md rounded-lg p-6 max-w-md mx-auto text-center">
                <Lock className="h-10 w-10 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-bold mb-2">Acesso exclusivo para membros</h3>
                <p className="text-muted-foreground mb-6">
                  Crie sua conta gratuita para acessar este componente e muitos outros.
                </p>
                <div className="flex flex-row gap-4 justify-center">
                  <Button asChild variant="outline">
                    <Link to="/login">Entrar</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/register">Criar conta</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Acesso restrito</DialogTitle>
            <DialogDescription>
              Você precisa estar logado para acessar o código completo deste componente.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-center text-muted-foreground">
              Crie sua conta gratuita para acessar este e muitos outros componentes Elementor.
            </p>
          </div>
          <DialogFooter className="sm:justify-center gap-2">
            <Button asChild variant="outline">
              <Link to="/login" onClick={() => setShowAuthDialog(false)}>
                Entrar
              </Link>
            </Button>
            <Button asChild>
              <Link to="/register" onClick={() => setShowAuthDialog(false)}>
                Criar conta
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CodeViewer;
