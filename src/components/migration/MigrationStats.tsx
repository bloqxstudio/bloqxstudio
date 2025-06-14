
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, Loader2, BarChart3 } from 'lucide-react';

interface MigrationStatsProps {
  stats: {
    total: number;
    processed: number;
    successful: number;
    failed: number;
    progress: number;
  };
  isRunning: boolean;
}

const MigrationStats: React.FC<MigrationStatsProps> = ({ stats, isRunning }) => {
  const isCompleted = stats.processed === stats.total && stats.total > 0;
  const hasErrors = stats.failed > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isRunning && <Loader2 className="h-5 w-5 animate-spin" />}
          {isCompleted && !hasErrors && <CheckCircle className="h-5 w-5 text-green-600" />}
          {isCompleted && hasErrors && <AlertCircle className="h-5 w-5 text-orange-600" />}
          {!isRunning && !isCompleted && <BarChart3 className="h-5 w-5" />}
          Estatísticas da Migração
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress Bar */}
          {stats.total > 0 && (
            <div className="space-y-2">
              <Progress value={stats.progress} className="w-full" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progresso: {Math.round(stats.progress)}%</span>
                <span>{stats.processed} de {stats.total} processados</span>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.processed}</div>
              <div className="text-sm text-muted-foreground">Processados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.successful}</div>
              <div className="text-sm text-muted-foreground">Sucessos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-sm text-muted-foreground">Falhas</div>
            </div>
          </div>

          {/* Status Message */}
          {isCompleted && (
            <div className={`p-3 rounded border ${
              hasErrors 
                ? 'bg-orange-50 border-orange-200 text-orange-800' 
                : 'bg-green-50 border-green-200 text-green-800'
            }`}>
              <p className="font-medium">
                {hasErrors 
                  ? `Migração concluída com ${stats.failed} erro(s)` 
                  : 'Migração concluída com sucesso!'
                }
              </p>
              <p className="text-sm mt-1">
                {stats.successful} componentes foram migrados para o sistema local.
              </p>
            </div>
          )}

          {isRunning && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded">
              <p className="font-medium">Migração em andamento...</p>
              <p className="text-sm mt-1">
                Processando componentes do WordPress. Aguarde...
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MigrationStats;
