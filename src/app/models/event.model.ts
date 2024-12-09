export interface Event {
  id?: string;
  name: string;
  description: string;
  totalTickets: number;
  price: number;
  eventDate: Date;
}