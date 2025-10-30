const prisma = require("../Prisma");
const nano = require("nano")(process.env.COUCHDB_URL); // For image storage
const bcrypt = require("bcryptjs");

const usersDB = nano.db.use("users_images"); // CouchDB database name

//  GET all users
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

//  CREATE new user
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

module.exports = { index, create, update, destroy };
