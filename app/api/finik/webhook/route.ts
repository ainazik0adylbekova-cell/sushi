// app/api/finik/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { 
  verifyFinikWebhook, 
  isTimestampValid, 
  FinikWebhookData 
} from '@/lib/finik';
import { prisma } from '@/lib/db';

/**
 * POST /api/finik/webhook
 * Обрабатывает webhook от Finik после завершения платежа
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Получение заголовков
    const signature = request.headers.get('signature');
    const timestamp = request.headers.get('x-api-timestamp');
    const host = request.headers.get('host');

    if (!signature || !timestamp) {
      console.error('[FINIK_WEBHOOK] Missing signature or timestamp');
      return NextResponse.json(
        { error: 'Missing signature or timestamp' },
        { status: 400 }
      );
    }

    // 2. Проверка актуальности timestamp (защита от replay-атак)
    if (!isTimestampValid(timestamp)) {
      console.error('[FINIK_WEBHOOK] Timestamp is too old or invalid');
      return NextResponse.json(
        { error: 'Invalid timestamp' },
        { status: 400 }
      );
    }

    // 3. Получение тела запроса
    const body: FinikWebhookData = await request.json();

    console.log('[FINIK_WEBHOOK] Received webhook:', {
      status: body.status,
      amount: body.amount,
      transactionId: body.transactionId,
    });

    // 4. Подготовка заголовков для верификации
    const headers: Record<string, string> = {
      'host': host || '',
    };

    // 5. Верификация подписи
    const webhookPath = '/api/finik/webhook';
    const isValid = await verifyFinikWebhook(
      signature, 
      timestamp, 
      body as any, 
      headers, 
      webhookPath
    );
    
    if (!isValid) {
      console.error('[FINIK_WEBHOOK] Invalid signature');
      
      // В продакшене всегда отклоняем невалидные подписи
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
      
      console.warn('[FINIK_WEBHOOK] Proceeding despite invalid signature (development mode)');
    }

    // 6. Извлечение метаданных
    let metadata: { 
      userId?: string; 
      orderId?: string; 
      paymentId?: string 
    } = {};
    
    try {
      if (body.data && body.data.metadata) {
        if (typeof body.data.metadata === 'string') {
          metadata = JSON.parse(body.data.metadata);
        } else {
          metadata = body.data.metadata as typeof metadata;
        }
      }
    } catch (error) {
      console.error('[FINIK_WEBHOOK] Error parsing metadata:', error);
    }

    const { userId, orderId } = metadata;

    if (!userId || !orderId) {
      console.error('[FINIK_WEBHOOK] Missing userId or orderId in metadata');
      return NextResponse.json(
        { error: 'Missing metadata' },
        { status: 400 }
      );
    }

    // 7. Обработка успешного платежа
    if (body.status === 'SUCCEEDED' || body.status === 'succeeded') {
      console.log(`[FINIK_WEBHOOK] Payment succeeded for order ${orderId}, amount: ${body.amount} сом`);

      try {
        // Находим способ оплаты "Finik Pay" или создаём его
        let paymentMethod = await prisma.paymentMethod.findFirst({
          where: { slug: 'finik' }
        });

        if (!paymentMethod) {
          paymentMethod = await prisma.paymentMethod.create({
            data: {
              name: 'Finik Pay',
              slug: 'finik',
              description: 'Оплата через Finik QR-код',
              isActive: true,
              sortOrder: 10,
            }
          });
          console.log('[FINIK_WEBHOOK] Created Finik payment method');
        }

        // Проверяем, существует ли уже платёж с этим transactionId
        const existingPayment = await prisma.payment.findFirst({
          where: { transactionId: body.transactionId }
        });

        if (existingPayment) {
          console.log(`[FINIK_WEBHOOK] Payment already exists: ${body.transactionId}`);
          return NextResponse.json({ success: true, message: 'Payment already processed' });
        }

        // Создаём или обновляем запись о платеже
        await prisma.payment.create({
          data: {
            orderId: orderId,
            paymentMethodId: paymentMethod.id,
            amount: body.amount,
            status: 'PAID',
            transactionId: body.transactionId,
            paidAt: new Date(body.transactionDate),
          }
        });

        // Обновляем статус заказа на "Подтверждён" или "Оплачен"
        const confirmedStatus = await prisma.orderStatus.findFirst({
          where: { 
            OR: [
              { slug: 'confirmed' },
              { slug: 'paid' },
            ]
          }
        });

        if (confirmedStatus) {
          await prisma.order.update({
            where: { id: orderId },
            data: { statusId: confirmedStatus.id }
          });

          // Добавляем запись в историю статусов
          await prisma.orderStatusHistory.create({
            data: {
              orderId: orderId,
              statusId: confirmedStatus.id,
              comment: `Оплачено через Finik Pay. Transaction ID: ${body.transactionId}`,
            }
          });

          console.log(`[FINIK_WEBHOOK] Order ${orderId} status updated to ${confirmedStatus.slug}`);
        }

        // Создаём уведомление для пользователя
        await prisma.notification.create({
          data: {
            userId: userId,
            type: 'ORDER_STATUS',
            channel: 'IN_APP',
            title: 'Оплата успешно выполнена',
            body: `Ваш заказ успешно оплачен. Сумма: ${body.amount} сом`,
            metadata: {
              orderId: orderId,
              transactionId: body.transactionId,
              amount: body.amount,
            }
          }
        });

        console.log(`[FINIK_WEBHOOK] ✓ Payment processed successfully for order ${orderId}`);

      } catch (dbError) {
        console.error('[FINIK_WEBHOOK] Database error:', dbError);
        return NextResponse.json(
          { error: 'Database error', details: dbError instanceof Error ? dbError.message : 'Unknown error' },
          { status: 500 }
        );
      }
    } 
    // 8. Обработка неудачного платежа
    else if (body.status === 'FAILED' || body.status === 'failed') {
      console.error(`[FINIK_WEBHOOK] Payment failed for order ${orderId}`);

      try {
        // Находим способ оплаты "Finik Pay"
        const paymentMethod = await prisma.paymentMethod.findFirst({
          where: { slug: 'finik' }
        });

        if (paymentMethod) {
          // Создаём запись о неудачном платеже
          await prisma.payment.create({
            data: {
              orderId: orderId,
              paymentMethodId: paymentMethod.id,
              amount: body.amount,
              status: 'FAILED',
              transactionId: body.transactionId,
              failReason: 'Payment failed via Finik',
            }
          });
        }

        // Создаём уведомление для пользователя
        await prisma.notification.create({
          data: {
            userId: userId,
            type: 'ORDER_STATUS',
            channel: 'IN_APP',
            title: 'Ошибка оплаты',
            body: 'К сожалению, оплата не прошла. Попробуйте ещё раз или выберите другой способ оплаты.',
            metadata: {
              orderId: orderId,
              transactionId: body.transactionId,
            }
          }
        });

        console.log(`[FINIK_WEBHOOK] Failed payment recorded for order ${orderId}`);

      } catch (dbError) {
        console.error('[FINIK_WEBHOOK] Database error on failed payment:', dbError);
      }
    }

    // 9. Возврат успешного ответа
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[FINIK_WEBHOOK] Error processing webhook:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
