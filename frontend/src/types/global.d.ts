export {};

declare global {
  interface Window {
    Razorpay: any; // you can replace `any` with proper type later
  }

  interface RazorpayPaymentResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }
}
