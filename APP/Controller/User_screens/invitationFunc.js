const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const prisma = require("../Prisma");

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

//SEND INVITATION EMAIL
async function sendInvitation(req, res, next) {
  try {
    const { email, role_id, department, branch } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString("hex");

    // Store token and meta info in invitation table
    await prisma.invitation.create({
      data: {
        email,
        token,
        role_id,
        department,
        branch,
        status: "PENDING",
        expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
      },
    });

    // Build invitation link
    const inviteLink = `${APP_URL}/accept-invite?token=${token}`;

    // Email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });

    await transporter.sendMail({
      from: `"Admin Team" <${EMAIL_USER}>`,
      to: email,
      subject: "You’ve Been Invited to Join!",
      html: `
        <h2>Welcome!</h2>
        <p>You’ve been invited to join our system.</p>
        <p>Click below to accept your invitation:</p>
        <a href="${inviteLink}" style="background:#007bff;color:#fff;padding:10px 15px;border-radius:5px;text-decoration:none;">Accept Invitation</a>
        <p>This link will expire in 24 hours.</p>
      `,
    });

    res.status(200).json({ message: "Invitation sent successfully" });
  } catch (error) {
    next(error);
  }
}

//  VERIFY INVITATION TOKEN
async function verifyInvitation(req, res, next) {
  try {
    const { token } = req.body;

    const invitation = await prisma.invitation.findUnique({ where: { token } });
    if (!invitation) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    if (new Date() > invitation.expires_at) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      });
      return res.status(400).json({ message: "Invitation link expired" });
    }

    // Mark as verified (but not yet registered)
    res.status(200).json({
      valid: true,
      email: invitation.email,
      role_id: invitation.role_id,
      department: invitation.department,
      branch: invitation.branch,
    });
  } catch (error) {
    next(error);
  }
}

//  REGISTER USER FROM INVITE
async function registerFromInvitation(req, res, next) {
  try {
    const { token, full_name, password } = req.body;

    const invitation = await prisma.invitation.findUnique({ where: { token } });
    if (!invitation || invitation.status !== "PENDING") {
      return res.status(400).json({ message: "Invalid or already used token" });
    }

    if (new Date() > invitation.expires_at) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      });
      return res.status(400).json({ message: "Invitation expired" });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        full_name,
        email: invitation.email,
        password: hashedPassword,
        department: invitation.department,
        branch: invitation.branch,
        role_id: invitation.role_id,
        status: "Active",
      },
    });

    // Mark invitation as accepted
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED" },
    });

    res.status(201).json({
      message: "Account created successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  sendInvitation,
  verifyInvitation,
  registerFromInvitation,
};
