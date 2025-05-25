
import { useEffect, useState } from "react";
import { useAdmin, AuditLog } from "@/hooks/useAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, User, Settings, MessageSquare } from "lucide-react";
import { format } from "date-fns";

const AdminAuditLogs = () => {
  const { fetchAuditLogs } = useAdmin();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    loadLogs();
  }, [page]);

  const loadLogs = async () => {
    setLoading(true);
    const fetchedLogs = await fetchAuditLogs(page, pageSize);
    setLogs(fetchedLogs);
    setLoading(false);
  };

  const getTargetIcon = (targetType: string) => {
    switch (targetType) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'post':
        return <MessageSquare className="h-4 w-4" />;
      case 'setting':
        return <Settings className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTargetBadgeColor = (targetType: string) => {
    switch (targetType) {
      case 'user':
        return 'bg-blue-100 text-blue-800';
      case 'post':
        return 'bg-green-100 text-green-800';
      case 'setting':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-thryvance-green" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-gray-600" />
          Audit Logs
        </CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No audit logs found</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Badge className={`flex items-center gap-1 ${getTargetBadgeColor(log.target_type)}`}>
                        {getTargetIcon(log.target_type)}
                        {log.target_type}
                      </Badge>
                      
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{log.action}</p>
                        {log.target_id && (
                          <p className="text-sm text-gray-600">
                            Target ID: <code className="bg-gray-100 px-1 rounded">{log.target_id}</code>
                          </p>
                        )}
                        {log.details && (
                          <details className="mt-2">
                            <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                              View details
                            </summary>
                            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {format(new Date(log.created_at), 'MMM d, yyyy')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(log.created_at), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={logs.length < pageSize || loading}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminAuditLogs;
