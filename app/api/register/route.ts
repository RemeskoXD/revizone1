import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { readJsonBody, PayloadTooLargeError } from "@/lib/json-body";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const limited = rateLimit(`register:${ip}`, 12, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { message: "Příliš mnoho pokusů o registraci z této sítě. Zkuste to později." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } }
    );
  }

  try {
    const body = await readJsonBody<{
      name?: string;
      email?: string;
      password?: string;
      role?: string;
      companyId?: string;
      inviteCode?: string;
    }>(req, 32_768);

    const { name, email, password, role, companyId, inviteCode } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Chybí povinné údaje" }, { status: 400 });
    }

    const nameTrim = String(name).trim().slice(0, 120);
    const emailNorm = String(email).trim().toLowerCase().slice(0, 254);
    if (!EMAIL_RE.test(emailNorm)) {
      return NextResponse.json({ message: "Neplatný formát e-mailu" }, { status: 400 });
    }
    if (nameTrim.length < 2) {
      return NextResponse.json({ message: "Jméno je příliš krátké" }, { status: 400 });
    }
    if (password.length < 10 || password.length > 200) {
      return NextResponse.json(
        { message: "Heslo musí mít alespoň 10 znaků (max. 200)" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: emailNorm },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json({ message: "Uživatel s tímto e-mailem již existuje" }, { status: 400 });
    }

    if (role === "PENDING_SUPPORT" || role === "PENDING_CONTRACTOR") {
      if (!inviteCode) {
        return NextResponse.json({ message: "Chybí zvací kód" }, { status: 400 });
      }

      const adminWithCode = await prisma.user.findFirst({
        where: { inviteCode, role: "ADMIN" },
        select: { id: true },
      });

      if (!adminWithCode) {
        return NextResponse.json({ message: "Neplatný zvací kód" }, { status: 400 });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const inviteForCompany =
      role === "COMPANY_ADMIN" ? randomBytes(5).toString("hex").slice(0, 10).toUpperCase() : null;

    const user = await prisma.user.create({
      data: {
        name: nameTrim,
        email: emailNorm,
        password: hashedPassword,
        role: role || "CUSTOMER",
        inviteCode: inviteForCompany,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (role === "TECHNICIAN" && companyId) {
      await prisma.companyJoinRequest.create({
        data: {
          technicianId: user.id,
          companyId: companyId,
          status: "PENDING",
        },
      });
    }

    return NextResponse.json(
      { message: "Uživatel byl úspěšně zaregistrován", user: { id: user.id, email: user.email, role: user.role } },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof PayloadTooLargeError) {
      return NextResponse.json({ message: "Požadavek je příliš velký" }, { status: 413 });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: "Neplatný formát dat" }, { status: 400 });
    }
    console.error("Registration error:", error);
    return NextResponse.json({ message: "Chyba při registraci" }, { status: 500 });
  }
}
