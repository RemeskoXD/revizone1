import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: 'Vyplňte všechna pole' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ message: 'Nové heslo musí mít alespoň 6 znaků' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !user.password) {
      return NextResponse.json({ message: 'Uživatel nenalezen' }, { status: 404 });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json({ message: 'Současné heslo je nesprávné' }, { status: 401 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: 'Heslo bylo úspěšně změněno' });
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json({ message: 'Interní chyba serveru' }, { status: 500 });
  }
}
