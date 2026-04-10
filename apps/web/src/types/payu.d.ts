interface PayUConfig {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  surl: string; // Success URL
  furl: string; // Failure URL
  hash: string;
}

interface PayUResponse {
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  status: string; // 'success', 'failure', 'pending'
  hash: string;
  mihpayid?: string;
  mode?: string;
  error_Message?: string;
}

interface Window {
  bolt?: {
    launch: (config: any, handlers: any) => void;
  };
}
