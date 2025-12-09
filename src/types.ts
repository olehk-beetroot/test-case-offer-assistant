export type IntakeCustomer = {
  name: string;
  company?: string;
  phone: string;
  email: string;
  address: string;
};

export type Intake = {
  customer: IntakeCustomer;
  description: string;
  site: {
    difficultAccess: boolean;
  };
};

export type CatalogueItem = {
  position: string;
  shortName: string;
  keywords: string[];
  tags?: string[];
  category?: string;
  description?: string;
  unit?: string;
  hero?: boolean;
};

export type MatchResult = CatalogueItem & {
  score: number;
  why: string;
};

export type TradePosition = {
  position_number: string | number;
  short_name_de?: string;
  short_name_en?: string;
  unit?: string;
  description_de?: string;
  description_en?: string;
  hero?: boolean;
};

export type Trade = {
  code: string;
  name_de?: string;
  name_en?: string;
  positions: TradePosition[];
};

export type RawCatalogue = {
  trades: Trade[];
};
