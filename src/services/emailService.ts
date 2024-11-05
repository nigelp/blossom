import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = 'service_1zmu3oi';
const EMAILJS_TEMPLATE_ID = 'template_akj6bpp';
const EMAILJS_PUBLIC_KEY = 'V4WiG_7MnkVedPCqn';

interface EmailParams {
  ownerName: string;
  ownerEmail: string;
  riderName: string;
  riderEmail: string;
  date: string;
  time: string;
  pickup: string;
  seats: number;
}

export const sendRideConfirmationEmails = async (params: EmailParams) => {
  try {
    await Promise.all([
      // Send to owner
      emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_email: params.ownerEmail,
          to_name: params.ownerName,
          rider_name: params.riderName,
          rider_email: params.riderEmail,
          date: params.date,
          time: params.time,
          pickup: params.pickup,
          seats: params.seats,
          user_type: 'owner'
        },
        EMAILJS_PUBLIC_KEY
      ),
      // Send to rider
      emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_email: params.riderEmail,
          to_name: params.riderName,
          owner_name: params.ownerName,
          owner_email: params.ownerEmail,
          date: params.date,
          time: params.time,
          pickup: params.pickup,
          seats: params.seats,
          user_type: 'rider'
        },
        EMAILJS_PUBLIC_KEY
      )
    ]);
  } catch (error) {
    console.error('Error sending confirmation emails:', error);
    throw error;
  }
};