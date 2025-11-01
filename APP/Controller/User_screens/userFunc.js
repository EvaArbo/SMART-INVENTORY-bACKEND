const prisma = require("../Prisma");
const nano = require("nano")(process.env.COUCHDBURL); // For image storage
const bcrypt = require("bcryptjs");

const usersDB = nano.db.use("users_images"); // CouchDB database name

// GET all users
async function index(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { created_at: "desc" },
    });
    res.status(200).json(users);
  } catch (e) {
    next(e);
  }
}

// GET single user by ID
async function show(req, res, next) {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { user_id: id },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (e) {
    next(e);
  }
}

// SEARCH users
async function search(req, res, next) {
  try {
    const { q } = req.query;

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { full_name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { department: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { created_at: "desc" },
    });

    res.status(200).json(users);
  } catch (e) {
    next(e);
  }
}

// CREATE new user
async function create(req, res, next) {
  try {
    const { full_name, email, password, department, branch, role_id } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        full_name,
        email,
        password: hashedPassword,
        department,
        branch,
        role_id,
        status: "Active",
      },
    });

    res.status(201).json(user);
  } catch (e) {
    next(e);
  }
}

// UPDATE user (edit name, email, or image)
async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { full_name, email, user_pic } = req.body;

    let updatedData = { full_name, email };

    // If image sent, upload to CouchDB
    if (user_pic) {
      const imgBuffer = Buffer.from(
        user_pic.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );
      const imgName = `user_${id}_${Date.now()}.jpg`;

      await usersDB.attachment.insert(imgName, imgName, imgBuffer, "image/jpeg");
      updatedData.user_pic = imgName;
    }

    const updatedUser = await prisma.user.update({
      where: { user_id: id },
      data: updatedData,
    });

    res.status(200).json(updatedUser);
  } catch (e) {
    next(e);
  }
}

// DELETE user
async function destroy(req, res, next) {
  try {
    const { id } = req.params;

    await prisma.user.delete({ where: { user_id: id } });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (e) {
    next(e);
  }
}

// EXPORT users as CSV
async function exportCSV(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { created_at: "desc" },
    });

    const csvRows = [];
    const headers = ["ID", "Full Name", "Email", "Department", "Branch", "Role", "Status"];
    csvRows.push(headers.join(","));

    users.forEach((u) => {
      csvRows.push([
        u.user_id,
        u.full_name,
        u.email,
        u.department,
        u.branch,
        u.role_id,
        u.status,
      ].join(","));
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=users.csv");
    res.status(200).send(csvRows.join("\n"));
  } catch (e) {
    next(e);
  }
}

module.exports = {
  index,
  show,
  search,
  create,
  update,
  destroy,
  exportCSV,
};
