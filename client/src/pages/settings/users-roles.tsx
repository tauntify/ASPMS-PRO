import { useTranslation } from "react-i18next";
import { UserPlus, Shield, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function UsersRoles() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {t("settings.usersRoles")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage team members and their access levels
          </p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite User
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableCaption>A list of all users in your organization</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Admin User</TableCell>
              <TableCell>admin@ofivio.com</TableCell>
              <TableCell>
                <Badge variant="default">
                  <Shield className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Active
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm">Edit</Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="rounded-lg border p-6 bg-muted/50">
        <h3 className="font-semibold mb-3">Role Permissions</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Badge>Principle</Badge>
            <span className="text-muted-foreground">Full access to all features</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Employee</Badge>
            <span className="text-muted-foreground">Can view projects and tasks</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Client</Badge>
            <span className="text-muted-foreground">Limited to assigned projects</span>
          </div>
        </div>
      </div>
    </div>
  );
}
