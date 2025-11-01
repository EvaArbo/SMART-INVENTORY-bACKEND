const prisma = require("../Prisma");

// ORGANIZATION LOGO
async function getOrganizationLogo(req, res, next) {
  try {
    const { orgId } = req.params;

    const org = await prisma.organization.findUnique({
      where: { org_id: orgId },
      select: { org_id: true, name: true, logo_url: true },
    });

    if (!org) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.status(200).json(org);
  } catch (error) {
    next(error);
  }
}


// GET ALL ROLES
async function index(req, res, next) {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { created_at: "desc" },
      select: {
        role_id: true,
        org_id: true,
        role_name: true,
        description: true,
        created_at: true,
      },
    });

    res.status(200).json(roles);
  } catch (error) {
    next(error);
  }
}

// GET PERMISSIONS FOR SPECIFIC ROLE
async function getPermissionsByRole(req, res, next) {
  try {
    const { roleId } = req.params;

    const roleWithPermissions = await prisma.role.findUnique({
      where: { role_id: roleId },
      include: {
        role_permissions: {
          include: {
            permissions: true, // now Prisma knows to follow the join table
          },
        },
      },
    });

    if (!roleWithPermissions) {
      return res.status(404).json({ message: "Role not found" });
    }

    // Extract permissions array from the join table
    const permissions = roleWithPermissions.role_permissions.map(
      (rp) => rp.permissions
    );

    res.status(200).json(permissions);
  } catch (error) {
    next(error);
  }
}


// CREATE NEW ROLE
async function create(req, res, next) {
  try {
    const { role_name, description, permissions = [] } = req.body;

    const newRole = await prisma.role.create({
      data: {
        role_name,
        description,
        permissions: {
          connect: permissions.map((id) => ({ permission_id: id })),
        },
      },
      include: { permissions: true },
    });

    res.status(201).json({
      message: "Role created successfully",
      role: newRole,
    });
  } catch (error) {
    next(error);
  }
}

//UPDATE BASIC ROLE INFO (name, description)
async function update(req, res, next) {
  try {
    const { roleId } = req.params;
    const { role_name, description } = req.body;

    const updatedRole = await prisma.role.update({
      where: { role_id: roleId },
      data: { role_name, description },
    });

    res.status(200).json({
      message: "Role updated successfully",
      role: updatedRole,
    });
  } catch (error) {
    next(error);
  }
}


// UPDATE ROLE PERMISSIONS (for EditPermissions screen using checkbox logic)
async function updateRolePermissions(req, res, next) {
  try {
    const { roleId } = req.params;
    const { permissions } = req.body; // array of permission IDs from frontend

    if (!Array.isArray(permissions)) {
      return res.status(400).json({ message: "Invalid permissions format. Must be an array of IDs." });
    }

    // Step 1: Remove all existing role-permission mappings
    await prisma.role_permissions.deleteMany({
      where: { role_id: roleId },
    });

    // Step 2: Create new role-permission mappings based on checked checkboxes
    const newMappings = permissions.map((permission_id) => ({
      role_id: roleId,
      permission_id,
    }));

    if (newMappings.length > 0) {
      await prisma.role_permissions.createMany({
        data: newMappings,
      });
    }

    // Step 3: Fetch updated role with permissions to return
    const updatedRole = await prisma.role.findUnique({
      where: { role_id: roleId },
      include: {
        role_permissions: {
          include: {
            permissions: true, // include permission details for frontend display
          },
        },
      },
    });

    res.status(200).json({
      message: "Role permissions updated successfully",
      role: updatedRole,
    });
  } catch (error) {
    console.error("Error updating role permissions:", error);
    next(error);
  }
}

//DELETE ROLE
async function destroy(req, res, next) {
  try {
    const { roleId } = req.params;

    await prisma.role.delete({
      where: { role_id: roleId },
    });

    res.status(200).json({ message: "Role deleted successfully" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getOrganizationLogo,
  index,
  getPermissionsByRole,
  create,
  update,
  updateRolePermissions, 
  destroy,
};
