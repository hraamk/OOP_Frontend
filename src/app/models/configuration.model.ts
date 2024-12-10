export interface Configuration {
  id?: string;
  eventId: string;
  vendorCount: number;
  customerCount: number;
  ticketReleaseRate: number;
  customerRetrievalRate: number;
  maxTicketCapacity: number;
  running: boolean;
  paused: boolean;
}