import { useEffect, useState } from 'react';
import { healthApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Database, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function DatabaseStatus() {
  const [status, setStatus] = useState({
    status: 'checking',
    database: 'checking'
  });

  useEffect(() => {
    const updateStatus = async () => {
      const health = await healthApi.check();
      setStatus(health);
    };

    updateStatus();
    const interval = setInterval(updateStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const isHealthy = status.status === 'healthy';

  return (
    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Database:</span>
            <Badge variant={isHealthy ? "default" : "destructive"}>
              {status.database}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Activity className={`w-4 h-4 ${isHealthy ? 'text-green-500' : 'text-red-500'}`} />
            <span className="text-sm">
              {isHealthy ? 'Healthy' : 'Unhealthy'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
