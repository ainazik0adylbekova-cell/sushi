// app/api/finik/create-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createFinikPayment, CreatePaymentData } from '@/lib/finik';
import { verifyAuth } from '@/lib/auth';

/**
 * POST /api/finik/create-payment
 * Создает платеж в Finik с фиксированной ценой 5 сомов
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Проверка аутентификации пользователя
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Получение данных из запроса
    const body = await request.json();
    const { orderId, orderDescription } = body;

    // 3. Валидация данных
    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing orderId' },
        { status: 400 }
      );
    }

    // 4. Фиксированная цена 5 сомов
    const FIXED_PRICE = 5;

    // 5. Создание данных для платежа
    const paymentData: CreatePaymentData = {
      amount: FIXED_PRICE,
      orderId,
      orderDescription: orderDescription || 'Оплата заказа',
      userId: user.userId,
    };

    console.log(`[FINIK_PAYMENT] Creating payment for user ${user.userId}, order ${orderId}, amount: ${FIXED_PRICE} сом`);

    // 6. Создание платежа в Finik
    const paymentUrl = await createFinikPayment(paymentData);

    // 7. Возврат URL платежной страницы
    return NextResponse.json({
      success: true,
      paymentUrl,
      amount: FIXED_PRICE,
      orderId,
    });

  } catch (error) {
    console.error('Error creating Finik payment:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
