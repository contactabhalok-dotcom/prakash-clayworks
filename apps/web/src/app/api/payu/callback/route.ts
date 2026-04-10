import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const PAYU_SALT = process.env.PAYU_SALT;

export async function POST(request: NextRequest) {
  try {
    if (!PAYU_SALT) {
      return NextResponse.json(
        { success: false, error: 'PayU is not configured' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const status = formData.get('status') as string;
    const txnid = formData.get('txnid') as string;
    const amount = formData.get('amount') as string;
    const productinfo = formData.get('productinfo') as string;
    const firstname = formData.get('firstname') as string;
    const email = formData.get('email') as string;
    const hash = formData.get('hash') as string;
    const mihpayid = formData.get('mihpayid') as string;
    const udf1 = formData.get('udf1') as string;
    const udf2 = formData.get('udf2') as string;
    const udf3 = formData.get('udf3') as string;
    const udf4 = formData.get('udf4') as string;
    const udf5 = formData.get('udf5') as string;

    // Verify hash for security
    // Response hash format: SALT|status|||||||||||email|firstname|productinfo|amount|txnid|key
    const key = process.env.NEXT_PUBLIC_PAYU_MERCHANT_KEY;
    const hashString = `${PAYU_SALT}|${status}|||||||||||${udf5 || ''}|${udf4 || ''}|${udf3 || ''}|${udf2 || ''}|${udf1 || ''}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    const generatedHash = crypto.createHash('sha512').update(hashString).digest('hex');

    if (generatedHash !== hash) {
      console.error('Hash mismatch - possible tampering');
      return NextResponse.json(
        { success: false, error: 'Invalid payment response' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      status,
      txnid,
      amount,
      mihpayid,
      productinfo,
    });
  } catch (error) {
    console.error('PayU callback error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process payment response' },
      { status: 500 }
    );
  }
}
