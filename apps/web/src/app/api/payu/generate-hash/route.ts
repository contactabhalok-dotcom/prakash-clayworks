import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const PAYU_MERCHANT_KEY = process.env.NEXT_PUBLIC_PAYU_MERCHANT_KEY;
const PAYU_SALT = process.env.PAYU_SALT;

export async function POST(request: NextRequest) {
  try {
    if (!PAYU_MERCHANT_KEY || !PAYU_SALT) {
      return NextResponse.json(
        { success: false, error: 'PayU is not configured. Please add PayU credentials to environment variables.' },
        { status: 500 }
      );
    }

    const { txnid, amount, productinfo, firstname, email, phone, udf1, udf2, udf3, udf4, udf5 } = await request.json();

    // Generate hash as per PayU documentation
    // Format: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT
    const hashString = `${PAYU_MERCHANT_KEY}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1 || ''}|${udf2 || ''}|${udf3 || ''}|${udf4 || ''}|${udf5 || ''}||||||${PAYU_SALT}`;

    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

    return NextResponse.json({
      success: true,
      hash,
    });
  } catch (error) {
    console.error('PayU hash generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate payment hash' },
      { status: 500 }
    );
  }
}
