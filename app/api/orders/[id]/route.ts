// app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

/**
 * GET /api/orders/[id]
 * Получить информацию о заказе
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const orderId = params.id;

    // Получаем заказ с включением статуса и платежа
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        status: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Проверяем права доступа (пользователь может видеть только свои заказы)
    if (order.userId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Возвращаем данные заказа
    return NextResponse.json({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status.slug,
      statusName: order.status.name,
      total: order.total,
      createdAt: order.createdAt,
      isPaid: order.payments.length > 0 && order.payments[0].status === 'PAID',
      payment: order.payments.length > 0 ? {
        status: order.payments[0].status,
        amount: order.payments[0].amount,
        transactionId: order.payments[0].transactionId,
        paidAt: order.payments[0].paidAt,
      } : null,
      items: order.items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          imageUrl: item.product.imageUrl,
        },
      })),
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
