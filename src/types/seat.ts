export type RowConfig = {
  seats: number;
  aisles: number[];
};

export type RowConfigs = Record<string, RowConfig>;

export interface EnrollSeats {
  rows: number;
  rowsConfigs: RowConfigs;
  totalSeats: number;
}
