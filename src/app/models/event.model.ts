export interface Event {
    _id: string;
    name: string;
    description: string;
    totalTickets: number;
    price: number;
    eventDate: Date;
    _class?: string; 
  }