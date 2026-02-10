
export interface EtsyListingData {
  title: string;
  description: string;
  firstMainColor: string;
  secondMainColor: string;
  homeStyle: string;
  celebration: string;
  occasion: string;
  subject: string;
  room: string;
  tags: string;
  sources?: Array<{ title: string; uri: string }>;
}

export type AppStatus = 'idle' | 'analyzing' | 'completed' | 'error';
