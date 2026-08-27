export type ClientSegment = "GLOBE" | "SME";

export interface Client {
  id: number;
  name: string;
  segment: ClientSegment;
  contract_start: string;
  contract_end: string;
  status: string;
}

export type ClientStatus = "ACTIVE" | "EXPIRING_SOON" | "EXPIRED";

export function clientStatus(contractEnd: string, today = new Date()): ClientStatus {
  const end = new Date(`${contractEnd}T00:00:00`);
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const daysUntilEnd = Math.floor((end.getTime() - current.getTime()) / 86400000);

  if (daysUntilEnd < 0) return "EXPIRED";
  if (daysUntilEnd <= 30) return "EXPIRING_SOON";
  return "ACTIVE";
}

export function currentClientStatus(client: Client): ClientStatus {
  return clientStatus(client.contract_end);
}
