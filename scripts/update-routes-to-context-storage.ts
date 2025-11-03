import { readFileSync, writeFileSync } from 'fs';

const routesPath = 'C:\\Users\\PC\\Desktop\\ASPMS-1\\ASPMS\\server\\routes.ts';
let content = readFileSync(routesPath, 'utf-8');

console.log('🔄 Updating routes.ts to use context-aware storage...\n');

// Replace storage.getUsers() with context-aware version
content = content.replace(
  /const users = await storage\.getUsers\(\);/g,
  `const { getUsersForUser } = await import("./context-storage");
      const users = await getUsersForUser(req.user!);`
);

content = content.replace(
  /const usersSnapshot = await storage\.getUsers\(\);/g,
  `const { getUsersForUser } = await import("./context-storage");
      const usersSnapshot = await getUsersForUser(req.user!);`
);

content = content.replace(
  /const allUsers = await storage\.getUsers\(\);/g,
  `const { getUsersForUser } = await import("./context-storage");
      const allUsers = await getUsersForUser(req.user!);`
);

// Replace storage.getDivisions with context-aware version
content = content.replace(
  /let divisions = await storage\.getDivisions\(([^)]*)\);/g,
  `const { getDivisionsForUser } = await import("./context-storage");
      let divisions = await getDivisionsForUser(req.user!);
      if ($1) divisions = divisions.filter(d => d.projectId === $1);`
);

content = content.replace(
  /const allDivisions = await storage\.getDivisions\(\);/g,
  `const { getDivisionsForUser } = await import("./context-storage");
      const allDivisions = await getDivisionsForUser(req.user!);`
);

// Replace storage.getItems with context-aware version
content = content.replace(
  /let items = await storage\.getItems\(([^)]*)\);/g,
  `const { getItemsForUser } = await import("./context-storage");
      let items = await getItemsForUser(req.user!);
      if ($1) items = items.filter(i => i.projectId === $1 || divisions.some(d => d.id === i.divisionId && d.projectId === $1));`
);

content = content.replace(
  /const allItems = await storage\.getItems\(\);/g,
  `const { getItemsForUser } = await import("./context-storage");
      const allItems = await getItemsForUser(req.user!);`
);

// Replace storage.getProcurementItems with context-aware version
content = content.replace(
  /let items = await storage\.getProcurementItems\(([^)]*)\);/g,
  `const { getProcurementItemsForUser } = await import("./context-storage");
      let items = await getProcurementItemsForUser(req.user!);
      if ($1) items = items.filter(i => i.projectId === $1);`
);

// Replace storage.getProjectAssignments with context-aware version
content = content.replace(
  /const assignments = await storage\.getProjectAssignments\(([^)]*)\);/g,
  `const { getProjectAssignmentsForUser } = await import("./context-storage");
      let assignments = await getProjectAssignmentsForUser(req.user!);
      assignments = assignments.filter(a => a.userId === $1);`
);

// Replace storage.getSalaryAdvances with context-aware version
content = content.replace(
  /const advances = await storage\.getSalaryAdvances\(([^)]*)\);/g,
  `const { getSalaryAdvancesForUser } = await import("./context-storage");
      let advances = await getSalaryAdvancesForUser(req.user!);
      advances = advances.filter(a => a.employeeId === $1);`
);

// Replace CREATE operations
content = content.replace(
  /const division = await storage\.createDivision\(([^)]+)\);/g,
  `const { createDivisionForUser } = await import("./context-storage");
      const division = await createDivisionForUser(req.user!, $1);`
);

content = content.replace(
  /const item = await storage\.createItem\(([^)]+)\);/g,
  `const { createItemForUser } = await import("./context-storage");
      const item = await createItemForUser(req.user!, $1);`
);

content = content.replace(
  /const item = await storage\.createProcurementItem\(([^)]+)\);/g,
  `const { createProcurementItemForUser } = await import("./context-storage");
      const item = await createProcurementItemForUser(req.user!, $1);`
);

content = content.replace(
  /const assignment = await storage\.createProjectAssignment\(([^)]+)\);/g,
  `const { createProjectAssignmentForUser } = await import("./context-storage");
      const assignment = await createProjectAssignmentForUser(req.user!, $1);`
);

// Replace UPDATE operations
content = content.replace(
  /const division = await storage\.updateDivision\(([^)]+)\);/g,
  `const { updateDivisionForUser } = await import("./context-storage");
      const division = await updateDivisionForUser(req.user!, $1);`
);

content = content.replace(
  /const item = await storage\.updateItem\(([^)]+)\);/g,
  `const { updateItemForUser } = await import("./context-storage");
      const item = await updateItemForUser(req.user!, $1);`
);

content = content.replace(
  /const item = await storage\.updateProcurementItem\(req\.params\.id, ([^)]+)\);/g,
  `const { updateProcurementItemForUser } = await import("./context-storage");
      const item = await updateProcurementItemForUser(req.user!, req.params.id, $1);`
);

// Replace DELETE operations
content = content.replace(
  /const deleted = await storage\.deleteDivision\(([^)]+)\);/g,
  `const { deleteDivisionForUser } = await import("./context-storage");
      const deleted = await deleteDivisionForUser(req.user!, $1);`
);

content = content.replace(
  /const deleted = await storage\.deleteItem\(([^)]+)\);/g,
  `const { deleteItemForUser } = await import("./context-storage");
      const deleted = await deleteItemForUser(req.user!, $1);`
);

content = content.replace(
  /const deleted = await storage\.deleteProcurementItem\(([^)]+)\);/g,
  `const { deleteProcurementItemForUser } = await import("./context-storage");
      const deleted = await deleteProcurementItemForUser(req.user!, $1);`
);

writeFileSync(routesPath, content, 'utf-8');

console.log('✅ Routes updated successfully!');
console.log('📝 Updated storage method calls to use context-aware functions.');
