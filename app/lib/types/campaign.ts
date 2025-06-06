export interface Campaign {
  id?: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  campaign_type?: string;
  target_group?: string;
  bonus_period?: string;
  channels?: string[];
  contract_type_ids?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface CampaignStats {
  leads: number;
  conversions: number;
  conversionRate: number;
}

export interface CampaignTableProps {
  onEdit: (campaign: Campaign) => void;
  onDelete: (id: string) => void;
} 