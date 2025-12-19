export type Order = {
  id: number;
  order_number: string;
  status: string;
  customer_name?: string;
  customer_phone?: string;
  customer_language?: string;
  date_needed?: string;
  time_needed?: string;
  cake_size?: string;
  filling?: string;
  theme?: string;
  dedication?: string;
  delivery_option?: "pickup" | "delivery";
  delivery_address?: string;
  delivery_apartment?: string;
  reference_image_path?: string;
  total_amount?: number | string;
  payment_status?: string;
  created_at?: string;
};

