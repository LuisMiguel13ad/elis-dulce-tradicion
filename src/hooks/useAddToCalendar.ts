import { useCallback } from 'react';

interface CalendarEvent {
  title: string;
  description?: string;
  start: Date;
  end?: Date;
  location?: string;
}

/**
 * Hook for adding events to calendar
 */
export function useAddToCalendar() {
  const addToCalendar = useCallback((event: CalendarEvent) => {
    const formatDate = (date: Date): string => {
      return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
    };

    const start = formatDate(event.start);
    const end = formatDate(event.end || new Date(event.start.getTime() + 60 * 60 * 1000));

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${start}/${end}`,
      details: event.description || '',
      location: event.location || '',
    });

    // Google Calendar URL
    const googleUrl = `https://calendar.google.com/calendar/render?${params.toString()}`;

    // Open in new window
    window.open(googleUrl, '_blank');
  }, []);

  const addOrderToCalendar = useCallback((
    orderNumber: string,
    date: Date,
    time: string,
    location?: string
  ) => {
    const [hours, minutes] = time.split(':').map(Number);
    const eventDate = new Date(date);
    eventDate.setHours(hours, minutes, 0, 0);

    addToCalendar({
      title: `Order Pickup: ${orderNumber}`,
      description: `Pickup your order ${orderNumber} from Eli's Bakery`,
      start: eventDate,
      end: new Date(eventDate.getTime() + 30 * 60 * 1000), // 30 minutes
      location: location || "324 W Marshall St, Norristown, PA 19401",
    });
  }, [addToCalendar]);

  return {
    addToCalendar,
    addOrderToCalendar,
  };
}
