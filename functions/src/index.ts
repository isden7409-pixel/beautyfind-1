/**
 * Firebase Cloud Functions для системы резервации
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

admin.initializeApp();

// ============================================================================
// EMAIL CONFIGURATION
// ============================================================================

// Настройка email транспорта (используйте свои учетные данные)
const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: functions.config().email?.user || 'your-email@gmail.com',
    pass: functions.config().email?.password || 'your-app-password',
  },
});

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

interface BookingData {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  providerType: 'salon' | 'master';
  providerId: string;
  providerName: string;
  providerEmail: string;
  providerPhone: string;
  providerAddress: string;
  masterName?: string;
  serviceName_cs: string;
  serviceName_en?: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  status: string;
}

/**
 * Шаблон email подтверждения для клиента
 */
function getBookingConfirmationEmailForClient(
  booking: BookingData,
  language: 'cs' | 'en'
): { subject: string; html: string } {
  const serviceName = language === 'cs' 
    ? booking.serviceName_cs 
    : (booking.serviceName_en || booking.serviceName_cs);

  const dateFormatted = new Date(booking.date).toLocaleDateString(
    language === 'cs' ? 'cs-CZ' : 'en-US',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  );

  if (language === 'cs') {
    return {
      subject: 'Potvrzení rezervace - BeautyFind',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .detail-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #ec4899; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .label { color: #6b7280; }
            .value { font-weight: bold; color: #111827; }
            .contact-box { background: #dbeafe; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .button { display: inline-block; background: #ec4899; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; padding: 20px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Rezervace potvrzena!</h1>
              <p>Vaše rezervace byla úspěšně vytvořena</p>
            </div>
            <div class="content">
              <p>Dobrý den <strong>${booking.clientName}</strong>,</p>
              <p>Děkujeme za vaši rezervaci! Níže najdete všechny důležité informace.</p>
              
              <div class="detail-box">
                <h3>📋 Detaily rezervace</h3>
                <div class="detail-row">
                  <span class="label">Služba:</span>
                  <span class="value">${serviceName}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Datum:</span>
                  <span class="value">${dateFormatted}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Čas:</span>
                  <span class="value">${booking.time}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Délka:</span>
                  <span class="value">${booking.duration} minut</span>
                </div>
                <div class="detail-row">
                  <span class="label">Cena:</span>
                  <span class="value">${booking.price} Kč</span>
                </div>
              </div>

              <div class="contact-box">
                <h3>📍 Kontaktní informace</h3>
                <p><strong>${booking.providerName}</strong></p>
                ${booking.masterName ? `<p>Mistr: ${booking.masterName}</p>` : ''}
                <p>📍 ${booking.providerAddress}</p>
                <p>📞 ${booking.providerPhone}</p>
              </div>

              <p><strong>❌ Zrušení rezervace:</strong><br>
              Rezervaci můžete zrušit ve svém účtu na webu BeautyFind.</p>

              <p>Těšíme se na vás!<br>
              Tým BeautyFind</p>
            </div>
            <div class="footer">
              <p>© 2025 BeautyFind CZ | Váš průvodce krásou</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  } else {
    return {
      subject: 'Booking Confirmation - BeautyFind',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .detail-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #ec4899; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .label { color: #6b7280; }
            .value { font-weight: bold; color: #111827; }
            .contact-box { background: #dbeafe; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .footer { text-align: center; color: #6b7280; padding: 20px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Booking Confirmed!</h1>
              <p>Your booking has been successfully created</p>
            </div>
            <div class="content">
              <p>Hello <strong>${booking.clientName}</strong>,</p>
              <p>Thank you for your booking! Below you will find all important information.</p>
              
              <div class="detail-box">
                <h3>📋 Booking Details</h3>
                <div class="detail-row">
                  <span class="label">Service:</span>
                  <span class="value">${serviceName}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Date:</span>
                  <span class="value">${dateFormatted}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Time:</span>
                  <span class="value">${booking.time}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Duration:</span>
                  <span class="value">${booking.duration} minutes</span>
                </div>
                <div class="detail-row">
                  <span class="label">Price:</span>
                  <span class="value">${booking.price} CZK</span>
                </div>
              </div>

              <div class="contact-box">
                <h3>📍 Contact Information</h3>
                <p><strong>${booking.providerName}</strong></p>
                ${booking.masterName ? `<p>Master: ${booking.masterName}</p>` : ''}
                <p>📍 ${booking.providerAddress}</p>
                <p>📞 ${booking.providerPhone}</p>
              </div>

              <p><strong>❌ Cancellation:</strong><br>
              You can cancel your booking in your account on BeautyFind website.</p>

              <p>Looking forward to seeing you!<br>
              BeautyFind Team</p>
            </div>
            <div class="footer">
              <p>© 2025 BeautyFind CZ | Your Beauty Guide</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  }
}

/**
 * Шаблон email для провайдера о новой резервации
 */
function getNewBookingEmailForProvider(
  booking: BookingData,
  language: 'cs' | 'en'
): { subject: string; html: string } {
  const serviceName = language === 'cs' 
    ? booking.serviceName_cs 
    : (booking.serviceName_en || booking.serviceName_cs);

  const dateFormatted = new Date(booking.date).toLocaleDateString(
    language === 'cs' ? 'cs-CZ' : 'en-US',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  );

  if (language === 'cs') {
    return {
      subject: '🎉 Nová rezervace - BeautyFind',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .detail-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #10b981; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .label { color: #6b7280; }
            .value { font-weight: bold; color: #111827; }
            .client-box { background: #fef3c7; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .footer { text-align: center; color: #6b7280; padding: 20px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Máte novou rezervaci!</h1>
            </div>
            <div class="content">
              <p>Dobrý den,</p>
              <p>Přijali jste novou rezervaci přes BeautyFind.</p>
              
              <div class="client-box">
                <h3>👤 Informace o klientovi</h3>
                <p><strong>${booking.clientName}</strong></p>
                <p>📞 ${booking.clientPhone}</p>
                <p>📧 ${booking.clientEmail}</p>
              </div>

              <div class="detail-box">
                <h3>📋 Detaily rezervace</h3>
                <div class="detail-row">
                  <span class="label">Služba:</span>
                  <span class="value">${serviceName}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Datum:</span>
                  <span class="value">${dateFormatted}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Čas:</span>
                  <span class="value">${booking.time}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Délka:</span>
                  <span class="value">${booking.duration} minut</span>
                </div>
                <div class="detail-row">
                  <span class="label">Cena:</span>
                  <span class="value">${booking.price} Kč</span>
                </div>
              </div>

              <p>Rezervaci můžete spravovat ve svém dashboardu na BeautyFind.</p>

              <p>S pozdravem,<br>
              Tým BeautyFind</p>
            </div>
            <div class="footer">
              <p>© 2025 BeautyFind CZ</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  } else {
    return {
      subject: '🎉 New Booking - BeautyFind',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .detail-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #10b981; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .label { color: #6b7280; }
            .value { font-weight: bold; color: #111827; }
            .client-box { background: #fef3c7; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .footer { text-align: center; color: #6b7280; padding: 20px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 You have a new booking!</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>You have received a new booking via BeautyFind.</p>
              
              <div class="client-box">
                <h3>👤 Client Information</h3>
                <p><strong>${booking.clientName}</strong></p>
                <p>📞 ${booking.clientPhone}</p>
                <p>📧 ${booking.clientEmail}</p>
              </div>

              <div class="detail-box">
                <h3>📋 Booking Details</h3>
                <div class="detail-row">
                  <span class="label">Service:</span>
                  <span class="value">${serviceName}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Date:</span>
                  <span class="value">${dateFormatted}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Time:</span>
                  <span class="value">${booking.time}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Duration:</span>
                  <span class="value">${booking.duration} minutes</span>
                </div>
                <div class="detail-row">
                  <span class="label">Price:</span>
                  <span class="value">${booking.price} CZK</span>
                </div>
              </div>

              <p>You can manage the booking in your dashboard on BeautyFind.</p>

              <p>Best regards,<br>
              BeautyFind Team</p>
            </div>
            <div class="footer">
              <p>© 2025 BeautyFind CZ</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  }
}

/**
 * Шаблон напоминания за 24 часа
 */
function getBookingReminderEmail(
  booking: BookingData,
  language: 'cs' | 'en'
): { subject: string; html: string } {
  const serviceName = language === 'cs' 
    ? booking.serviceName_cs 
    : (booking.serviceName_en || booking.serviceName_cs);

  const dateFormatted = new Date(booking.date).toLocaleDateString(
    language === 'cs' ? 'cs-CZ' : 'en-US',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  );

  if (language === 'cs') {
    return {
      subject: '⏰ Připomínka rezervace zítra - BeautyFind',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .detail-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #f59e0b; }
            .confirm-box { background: #d1fae5; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
            .footer { text-align: center; color: #6b7280; padding: 20px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Připomínka rezervace</h1>
              <p>Vaše rezervace je zítra!</p>
            </div>
            <div class="content">
              <p>Dobrý den <strong>${booking.clientName}</strong>,</p>
              <p>Připomínáme vám vaší zítřejší rezervaci:</p>
              
              <div class="detail-box">
                <h3>📋 Detaily rezervace</h3>
                <p><strong>Služba:</strong> ${serviceName}</p>
                <p><strong>Datum:</strong> ${dateFormatted}</p>
                <p><strong>Čas:</strong> ${booking.time}</p>
                <p><strong>Místo:</strong> ${booking.providerName}</p>
                <p><strong>Adresa:</strong> ${booking.providerAddress}</p>
                <p><strong>Telefon:</strong> ${booking.providerPhone}</p>
              </div>

              <div class="confirm-box">
                <h3>✅ POTVRĎTE PROSÍM REZERVACI</h3>
                <p>Odpovězte na tento e-mail slovem <strong>"ANO"</strong> pro potvrzení.</p>
                <p>Pokud se nemůžete dostavit, odpovězte <strong>"NE"</strong> nebo zrušte rezervaci ve svém účtu.</p>
              </div>

              <p>Těšíme se na vás!<br>
              Tým BeautyFind</p>
            </div>
            <div class="footer">
              <p>© 2025 BeautyFind CZ</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  } else {
    return {
      subject: '⏰ Booking Reminder Tomorrow - BeautyFind',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .detail-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #f59e0b; }
            .confirm-box { background: #d1fae5; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
            .footer { text-align: center; color: #6b7280; padding: 20px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Booking Reminder</h1>
              <p>Your booking is tomorrow!</p>
            </div>
            <div class="content">
              <p>Hello <strong>${booking.clientName}</strong>,</p>
              <p>This is a reminder of your booking tomorrow:</p>
              
              <div class="detail-box">
                <h3>📋 Booking Details</h3>
                <p><strong>Service:</strong> ${serviceName}</p>
                <p><strong>Date:</strong> ${dateFormatted}</p>
                <p><strong>Time:</strong> ${booking.time}</p>
                <p><strong>Location:</strong> ${booking.providerName}</p>
                <p><strong>Address:</strong> ${booking.providerAddress}</p>
                <p><strong>Phone:</strong> ${booking.providerPhone}</p>
              </div>

              <div class="confirm-box">
                <h3>✅ PLEASE CONFIRM YOUR BOOKING</h3>
                <p>Reply to this email with <strong>"YES"</strong> to confirm.</p>
                <p>If you cannot attend, reply <strong>"NO"</strong> or cancel the booking in your account.</p>
              </div>

              <p>Looking forward to seeing you!<br>
              BeautyFind Team</p>
            </div>
            <div class="footer">
              <p>© 2025 BeautyFind CZ</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  }
}

// ============================================================================
// FIREBASE FUNCTIONS
// ============================================================================

/**
 * Trigger при создании новой резервации
 */
export const onBookingCreated = functions.firestore
  .document('bookings/{bookingId}')
  .onCreate(async (snap, context) => {
    const booking = snap.data() as BookingData;

    try {
      // Отправить email клиенту
      const clientEmail = getBookingConfirmationEmailForClient(booking, 'cs');
      await mailTransport.sendMail({
        from: '"BeautyFind CZ" <noreply@beautyfind.cz>',
        to: booking.clientEmail,
        subject: clientEmail.subject,
        html: clientEmail.html,
      });

      // Отправить email провайдеру
      const providerEmail = getNewBookingEmailForProvider(booking, 'cs');
      await mailTransport.sendMail({
        from: '"BeautyFind CZ" <noreply@beautyfind.cz>',
        to: booking.providerEmail,
        subject: providerEmail.subject,
        html: providerEmail.html,
      });

      console.log('Emails sent for booking:', context.params.bookingId);
    } catch (error) {
      console.error('Error sending emails:', error);
    }
  });

/**
 * Cron job для отправки напоминаний за 24 часа
 */
export const sendBookingReminders = functions.pubsub
  .schedule('0 10 * * *') // Каждый день в 10:00
  .timeZone('Europe/Prague')
  .onRun(async (context) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split('T')[0];

    try {
      const bookingsSnapshot = await admin
        .firestore()
        .collection('bookings')
        .where('date', '==', tomorrowDate)
        .where('status', '==', 'confirmed')
        .where('reminderSent', '==', false)
        .get();

      const promises = bookingsSnapshot.docs.map(async (doc) => {
        const booking = doc.data() as BookingData;

        const reminderEmail = getBookingReminderEmail(booking, 'cs');
        await mailTransport.sendMail({
          from: '"BeautyFind CZ" <noreply@beautyfind.cz>',
          to: booking.clientEmail,
          subject: reminderEmail.subject,
          html: reminderEmail.html,
        });

        // Пометить что напоминание отправлено
        await doc.ref.update({
          reminderSent: true,
          reminderSentAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log('Reminder sent for booking:', doc.id);
      });

      await Promise.all(promises);
      console.log(`Sent ${promises.length} reminders`);
    } catch (error) {
      console.error('Error sending reminders:', error);
    }
  });

/**
 * Cron job для автоматической смены статуса на completed
 */
export const autoCompleteBookings = functions.pubsub
  .schedule('0 * * * *') // Каждый час
  .timeZone('Europe/Prague')
  .onRun(async (context) => {
    const now = new Date();

    try {
      const bookingsSnapshot = await admin
        .firestore()
        .collection('bookings')
        .where('status', '==', 'confirmed')
        .get();

      const promises = bookingsSnapshot.docs.map(async (doc) => {
        const booking = doc.data() as BookingData;

        // Рассчитать время окончания услуги
        const bookingDateTime = new Date(booking.date);
        const [hours, minutes] = booking.time.split(':');
        bookingDateTime.setHours(parseInt(hours), parseInt(minutes) + booking.duration);

        // Если услуга уже закончилась
        if (bookingDateTime < now) {
          await doc.ref.update({
            status: 'completed',
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          console.log('Auto-completed booking:', doc.id);
        }
      });

      await Promise.all(promises);
    } catch (error) {
      console.error('Error auto-completing bookings:', error);
    }
  });

/**
 * Trigger для обновления аналитики при создании резервации
 */
export const updateAnalyticsOnBooking = functions.firestore
  .document('bookings/{bookingId}')
  .onCreate(async (snap, context) => {
    const booking = snap.data() as BookingData;

    try {
      const providerRef = admin.firestore().collection(
        booking.providerType === 'salon' ? 'salons' : 'masters'
      ).doc(booking.providerId);

      await providerRef.update({
        'analytics.totalBookings': admin.firestore.FieldValue.increment(1),
        'analytics.lastUpdated': admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log('Analytics updated for booking:', context.params.bookingId);
    } catch (error) {
      console.error('Error updating analytics:', error);
    }
  });

/**
 * Trigger для обновления аналитики при изменении статуса резервации
 */
export const updateAnalyticsOnStatusChange = functions.firestore
  .document('bookings/{bookingId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data() as BookingData;
    const after = change.after.data() as BookingData;

    // Если статус не изменился, выходим
    if (before.status === after.status) {
      return;
    }

    try {
      const providerRef = admin.firestore().collection(
        after.providerType === 'salon' ? 'salons' : 'masters'
      ).doc(after.providerId);

      const updates: any = {
        'analytics.lastUpdated': admin.firestore.FieldValue.serverTimestamp(),
      };

      if (after.status === 'completed') {
        updates['analytics.completedBookings'] = admin.firestore.FieldValue.increment(1);
        updates['analytics.totalRevenue'] = admin.firestore.FieldValue.increment(after.price);
      } else if (after.status === 'cancelled') {
        updates['analytics.cancelledBookings'] = admin.firestore.FieldValue.increment(1);
      }

      await providerRef.update(updates);

      console.log('Analytics updated on status change:', context.params.bookingId);
    } catch (error) {
      console.error('Error updating analytics on status change:', error);
    }
  });

