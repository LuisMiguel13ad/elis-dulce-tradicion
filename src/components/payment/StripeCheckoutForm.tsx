import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface StripeCheckoutFormProps {
    amount: number;
    onSuccess: (paymentIntentId: string) => void;
    isProcessing?: boolean;
}

export const StripeCheckoutForm = ({ amount, onSuccess, isProcessing: externalProcessing }: StripeCheckoutFormProps) => {
    const stripe = useStripe();
    const elements = useElements();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [localProcessing, setLocalProcessing] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setLocalProcessing(true);
        setErrorMessage(null);

        // Confirm Payment
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/order-confirmation`, // We handle success manually usually, but this is required fallback
            },
            redirect: "if_required", // Important: prevents redirect if not needed (e.g. card params correct)
        });

        if (error) {
            setErrorMessage(error.message || 'Payment failed');
            toast.error(error.message || 'Payment failed');
            setLocalProcessing(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            onSuccess(paymentIntent.id);
            // Don't turn off processing, parent will handle redirect
        } else {
            setLocalProcessing(false);
        }
    };

    const isBusy = localProcessing || externalProcessing;

    return (
        <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <PaymentElement />
            </div>

            {errorMessage && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                    {errorMessage}
                </div>
            )}

            <Button
                type="submit"
                disabled={!stripe || isBusy}
                className="w-full h-12 text-base font-semibold bg-[#2a2a2a] hover:bg-black text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
                {isBusy ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        <Lock className="mr-2 h-4 w-4" />
                        Pay ${amount.toFixed(2)}
                    </>
                )}
            </Button>

            <div className="flex justify-center items-center gap-2 text-xs text-gray-400">
                <Lock className="w-3 h-3" />
                <span>Payments secured by Stripe</span>
            </div>
        </form>
    );
};
