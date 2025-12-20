import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { 
  Phone, 
  MessageCircle, 
  Mail, 
  MoreHorizontal,
  Copy,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { Order } from '@/types/order';

interface CustomerQuickActionsProps {
  order: Order;
  variant?: 'buttons' | 'dropdown';
  size?: 'sm' | 'default';
}

const CustomerQuickActions = ({ 
  order, 
  variant = 'dropdown',
  size = 'sm' 
}: CustomerQuickActionsProps) => {
  const { t } = useLanguage();
  
  const phone = order.customer_phone?.replace(/\D/g, '') || '';
  const email = order.customer_email || '';
  const customerName = order.customer_name || '';

  // Generate WhatsApp message template
  const getWhatsAppMessage = () => {
    const message = t(
      `Hola ${customerName}! 🎂\n\nSomos de Eli's Dulce Tradición. Su orden #${order.order_number} está siendo preparada.\n\n¿Tiene alguna pregunta?`,
      `Hi ${customerName}! 🎂\n\nThis is Eli's Bakery. Your order #${order.order_number} is being prepared.\n\nDo you have any questions?`
    );
    return encodeURIComponent(message);
  };

  // Generate ready notification message
  const getReadyMessage = () => {
    const isDelivery = order.delivery_option === 'delivery';
    const message = isDelivery
      ? t(
          `Hola ${customerName}! 🎂\n\nSu orden #${order.order_number} está lista y saldrá para entrega pronto.\n\n¡Gracias por elegir Eli's Dulce Tradición!`,
          `Hi ${customerName}! 🎂\n\nYour order #${order.order_number} is ready and will be out for delivery soon.\n\nThank you for choosing Eli's Bakery!`
        )
      : t(
          `Hola ${customerName}! 🎂\n\nSu orden #${order.order_number} está lista para recoger.\n\n¡Gracias por elegir Eli's Dulce Tradición!`,
          `Hi ${customerName}! 🎂\n\nYour order #${order.order_number} is ready for pickup.\n\nThank you for choosing Eli's Bakery!`
        );
    return encodeURIComponent(message);
  };

  const handleCall = () => {
    if (!phone) {
      toast.error(t('No hay teléfono disponible', 'No phone available'));
      return;
    }
    window.open(`tel:${phone}`, '_self');
  };

  const handleWhatsApp = (customMessage?: string) => {
    if (!phone) {
      toast.error(t('No hay teléfono disponible', 'No phone available'));
      return;
    }
    const message = customMessage || getWhatsAppMessage();
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleSMS = () => {
    if (!phone) {
      toast.error(t('No hay teléfono disponible', 'No phone available'));
      return;
    }
    const message = getWhatsAppMessage();
    window.open(`sms:${phone}?body=${decodeURIComponent(message)}`, '_self');
  };

  const handleEmail = () => {
    if (!email) {
      toast.error(t('No hay email disponible', 'No email available'));
      return;
    }
    const subject = encodeURIComponent(t(
      `Orden #${order.order_number} - Eli's Dulce Tradición`,
      `Order #${order.order_number} - Eli's Bakery`
    ));
    window.open(`mailto:${email}?subject=${subject}`, '_self');
  };

  const handleCopyPhone = () => {
    if (!phone) {
      toast.error(t('No hay teléfono disponible', 'No phone available'));
      return;
    }
    navigator.clipboard.writeText(order.customer_phone || '');
    toast.success(t('Teléfono copiado', 'Phone copied'));
  };

  if (variant === 'buttons') {
    return (
      <div className="flex gap-1">
        <Button
          size={size}
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={handleCall}
          disabled={!phone}
          title={t('Llamar', 'Call')}
        >
          <Phone className="h-4 w-4" />
        </Button>
        <Button
          size={size}
          variant="outline"
          className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
          onClick={() => handleWhatsApp()}
          disabled={!phone}
          title="WhatsApp"
        >
          <MessageCircle className="h-4 w-4" />
        </Button>
        {email && (
          <Button
            size={size}
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={handleEmail}
            title={t('Email', 'Email')}
          >
            <Mail className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size={size} variant="outline" className="h-8 gap-1">
          <Phone className="h-3 w-3" />
          {t('Contactar', 'Contact')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <span className="truncate">{customerName}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleCall} disabled={!phone}>
          <Phone className="mr-2 h-4 w-4" />
          {t('Llamar', 'Call')}
          {phone && <span className="ml-auto text-xs text-muted-foreground">{order.customer_phone}</span>}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleWhatsApp()} disabled={!phone}>
          <MessageCircle className="mr-2 h-4 w-4 text-green-600" />
          WhatsApp
          <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleWhatsApp(getReadyMessage())} disabled={!phone}>
          <MessageCircle className="mr-2 h-4 w-4 text-green-600" />
          {t('WA: Orden Lista', 'WA: Order Ready')}
          <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleSMS} disabled={!phone}>
          <MessageCircle className="mr-2 h-4 w-4" />
          SMS
        </DropdownMenuItem>
        
        {email && (
          <DropdownMenuItem onClick={handleEmail}>
            <Mail className="mr-2 h-4 w-4" />
            Email
            <span className="ml-auto text-xs text-muted-foreground truncate max-w-[100px]">{email}</span>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleCopyPhone} disabled={!phone}>
          <Copy className="mr-2 h-4 w-4" />
          {t('Copiar Teléfono', 'Copy Phone')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CustomerQuickActions;

