export interface Configuration {
  id?: string;
  eventId: string;
  templateName: string;
  totalTickets: number;
  vendorCount: number;
  customerCount: number;
  ticketReleaseRate: number;
  customerRetrievalRate: number;
  maxTicketCapacity: number;
  running: boolean;
  paused: boolean;
}