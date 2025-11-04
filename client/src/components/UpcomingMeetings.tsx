import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";

interface Meeting {
  id: string;
  title: string;
  date: Date;
  location: string;
  projectId?: string;
  projectName?: string;
  attendees?: string[];
}

export function UpcomingMeetings() {
  // Mock data for now - will be replaced with real API
  const meetings: Meeting[] = [
    {
      id: "m1",
      title: "Site Walk — DHA Villa",
      date: new Date(2025, 3, 14, 10, 0),
      location: "On-site",
      projectName: "DHA Residence Tower",
    },
    {
      id: "m2",
      title: "Approval Call — MEP",
      date: new Date(2025, 3, 16, 14, 30),
      location: "ARKA Office",
      projectName: "Bakhtiar Renovation",
    },
    {
      id: "m3",
      title: "Client Presentation",
      date: new Date(2025, 3, 18, 11, 0),
      location: "Zoom",
      projectName: "Mall Retail Fitout",
    },
  ];

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-900">Upcoming Meetings</h4>
        <Calendar className="w-5 h-5 text-gray-400" />
      </div>
      <div className="space-y-3">
        {meetings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No upcoming meetings</p>
          </div>
        ) : (
          meetings.map((meeting) => (
            <div
              key={meeting.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-semibold">
                  {meeting.title.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm">
                  {meeting.title}
                </div>
                {meeting.projectName && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    {meeting.projectName}
                  </div>
                )}
                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(meeting.date, "MMM d, h:mm a")}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {meeting.location}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
