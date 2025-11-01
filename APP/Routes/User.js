const router = require('express').Router();
const userFuncController = require('./../Controller/User_screens/userFunc');
const rolePermFuncController = require('./../Controller/User_screens/rolePermFunc');
const invitationFuncController = require('./../Controller/User_screens/invitationFunc');

// STATIC ROUTES ALWAYS FIRST

// ROLE & PERMISSION ROUTES
// Organization route
router.get("/organization/:orgId", rolePermFuncController.getOrganizationLogo);


// Roles CRUD routes
router.get("/roles", rolePermFuncController.index);// Fetch all roles
router.get("/roles/:roleId/permissions", rolePermFuncController.getPermissionsByRole); // Fetch permissions for role
router.post("/roles", rolePermFuncController.create);// Create new role
router.put("/roles/:roleId", rolePermFuncController.update);// Update role info
router.put("/roles/:roleId/permissions", rolePermFuncController.updateRolePermissions);// Update role permissions
router.delete("/roles/:roleId", rolePermFuncController.destroy);// Delete role


// INVITATION ROUTES
router.post("/invitations/send", invitationFuncController.sendInvitation);// Send invite
router.post("/invitations/verify", invitationFuncController.verifyInvitation);// Verify invite token
router.post("/invitations/register", invitationFuncController.registerFromInvitation); // Complete registration


// USER ROUTES
// Static routes first
router.get("/search", userFuncController.search);
router.get("/export", userFuncController.exportCSV);

//CRUD operations
router.get("/", userFuncController.index);// Fetch all users
router.get("/:id", userFuncController.show);// Fetch single user by ID
router.post("/", userFuncController.create);// Add new user
router.put("/:id", userFuncController.update);// Update user
router.delete("/:id", userFuncController.destroy);// Delete user

module.exports = router;
