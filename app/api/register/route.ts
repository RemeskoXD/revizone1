import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password, role, companyId, inviteCode } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Chybí povinné údaje" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Uživatel s tímto e-mailem již existuje" },
        { status: 400 }
      );
    }

    // Validate invite code if role is PENDING_SUPPORT or PENDING_CONTRACTOR
    if (role === 'PENDING_SUPPORT' || role === 'PENDING_CONTRACTOR') {
      if (!inviteCode) {
        return NextResponse.json(
          { message: "Chybí zvací kód" },
          { status: 400 }
        );
      }

      const adminWithCode = await prisma.user.findFirst({
        where: { inviteCode, role: 'ADMIN' },
        select: { id: true },
      });

      if (!adminWithCode) {
        return NextResponse.json(
          { message: "Neplatný zvací kód" },
          { status: 400 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "CUSTOMER",
        // Generate a random invite code for companies
        inviteCode: role === "COMPANY_ADMIN" ? Math.random().toString(36).substring(2, 8).toUpperCase() : null,
      },
      select: {
        id: true,
        email: true,
        role: true,
      }
    });

    if (role === "TECHNICIAN" && companyId) {
      // Create a join request
      await prisma.companyJoinRequest.create({
        data: {
          technicianId: user.id,
          companyId: companyId,
          status: "PENDING"
        }
      });
    }

    return NextResponse.json(
      { message: "Uživatel byl úspěšně zaregistrován", user: { id: user.id, email: user.email, role: user.role } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Chyba při registraci" },
      { status: 500 }
    );
  }
}
