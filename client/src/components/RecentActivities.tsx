import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Activity, MessageCircle, CheckCircle2, FileText, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  type: "comment" | "approval" | "update" | "task";
  user: string;
  action: string;
  target: string;
  timestamp: Date;
}

export function RecentActivities() {
  // Mock data for now - will be replaced with real API
  const activities: ActivityItem[] = [
    {
      id: "a1",
      type: "comment",
      user: "Ayesha",
      action: "commented on",
      target: "DHA Residence Tower",
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
    },
    {
      id: "a2",
      type: "approval",
      user: "Client",
      action: "approved BOQ item",
      target: "#B-33",
      timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 mins ago
    },
    {
      id: "a3",
      type: "update",
      user: "Procurement",
      action: "marked orders received for",
      target: "Mall Retail Fitout",
      timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
    },
    {
      id: "a4",
      type: "task",
      user: "Ahmed",
      action: "completed task on",
      target: "Bakhtiar Renovation",
      timestamp: new Date(Date.now() - 1000 * 60 * 180), // 3 hours ago
    },
  ];

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "comment":
        return MessageCircle;
      case "approval":
        return CheckCircle2;
      case "update":
        return FileText;
      case "task":
        return CheckCircle2;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type: ActivityItem["type"]) => {
    switch (type) {
      case "comment":
        return "bg-blue-100 text-blue-700";
      case "approval":
        return "bg-green-100 text-green-700";
      case "update":
        return "bg-purple-100 text-purple-700";
      case "task":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-900">Recent Activity</h4>
        <Activity className="w-5 h-5 text-gray-400" />
      </div>
      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Avatar className={`h-9 w-9 ${getActivityColor(activity.type)}`}>
                  <AvatarFallback className={getActivityColor(activity.type)}>
                    <Icon className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-900">
                    <span className="font-medium">{activity.user}</span>{" "}
                    <span className="text-gray-600">{activity.action}</span>{" "}
                    <span className="font-medium text-blue-600">
                      {activity.target}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
