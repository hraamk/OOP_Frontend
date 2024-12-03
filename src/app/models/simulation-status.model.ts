export interface SimulationStatus {
  _id: string;
  name: string;
  description: string;
  totalTickets: number;
  price: number;
  eventDate: Date;
  isRunning?: boolean;  // Changed from running to isRunning
  isPaused?: boolean;   // Changed from paused to isPaused
  vendorCount?: number;
  customerCount?: number;
  _class?: string;
}