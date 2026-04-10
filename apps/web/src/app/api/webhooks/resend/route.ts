/**
 * Resend webhook handler
 * This route handles email delivery status callbacks from Resend
 * Optional: Only needed if you want to track email delivery status
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log the webhook event (you can store this in a database if needed)
    console.log('Resend webhook received:', {
      type: body.type,
      email_id: body.email_id,
      created_at: body.created_at,
    });

    // Handle different webhook events
    switch (body.type) {
      case 'email.sent':
        console.log('Email sent successfully');
        break;
      case 'email.delivered':
        console.log('Email delivered to recipient');
        break;
      case 'email.delivery_delayed':
        console.warn('Email delivery delayed');
        break;
      case 'email.bounced':
        console.error('Email bounced:', body.email_id);
        break;
      case 'email.complained':
        console.warn('Recipient complained about spam');
        break;
      case 'email.opened':
        // Optional: Track email opens
        console.log('Email opened by recipient');
        break;
      default:
        console.log('Unknown webhook event:', body.type);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling resend webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
