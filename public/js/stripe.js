/* eslint-disable */
import { showAlert } from './alert';
import axios from 'axios';


export const bookTour = async (tourId) => {
  try {
    const stripe = Stripe(
      'pk_test_51NzkvbH2h6W9DNgf8coSXkjfWWa3L8TDt7ZulCLBu74mFYsKSlo0aQpJ9ZljXkaoWihcUKZvc62lLQktAvRfmxB800pTjhG6xl',
    );
    
    // 1) get checkout session from API
    const session = await axios(
      `http://127.0.0.1:8000/api/v1/bookings/checkout-sesion/${tourId}`,
    );
    console.log(session);

    // 2) create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
