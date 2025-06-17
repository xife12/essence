# Task: Kampagnen-Zeitraum automatische Übernahme

## 📋 PRD Reference
**Business Context:** Wenn eine Kampagne ausgewählt wird, soll der Zeitraum automatisch übernommen werden  
**User Story:** Als Studiobetreiber möchte ich, dass bei Kampagnenauswahl die Gültigkeitsdaten automatisch gesetzt werden  
**Business Value:** Schnellere Vertragserstellung, weniger Eingabefehler

## 🎯 Akzeptanzkriterien
- [ ] Kampagnen-Dropdown in Vertragserstellung zeigt aktive Kampagnen
- [ ] Bei Kampagnenauswahl wird Zeitraum automatisch übernommen
- [ ] Manueller Zeitraum-Override möglich
- [ ] Kampagnen-Verträge werden korrekt als solche markiert
- [ ] Rückschaltung nach Kampagnenende funktioniert

## 🔧 Technische Anforderungen

### API-Erweiterung:
```typescript
// lib/api/campaigns.ts
async getActiveCampaigns(): Promise<ApiResponse<Campaign[]>> {
  // Nur aktive Kampagnen für Dropdown
}

// lib/api/contracts-v2.ts  
async createCampaignContract(baseContractId: string, campaignId: string, modifications: any): Promise<ApiResponse<Contract>> {
  // Kampagnenvertrag basierend auf Basis-Vertrag erstellen
}
```

### UI-Komponenten:
```typescript
// app/(protected)/vertragsarten-v2/contracts/neu/page.tsx
const CampaignSelector = ({ onSelect, campaigns }: CampaignSelectorProps) => {
  // Kampagnen-Auswahl mit automatischer Zeitraumübernahme
};

const CampaignDateRange = ({ campaign, onOverride }: CampaignDateRangeProps) => {
  // Anzeige und Override für Kampagnenzeitraum
};
```

## 📊 Subtasks
1. **Kampagnen-API**: Aktive Kampagnen laden
2. **UI-Integration**: CampaignSelector in Vertragserstellung  
3. **Automatische Übernahme**: Zeitraum-Logic implementieren
4. **Override-Funktionalität**: Manuelle Anpassung ermöglichen
5. **Kampagnen-Flag**: is_campaign_version korrekt setzen

## 🔬 Testing
- [ ] Kampagnen-Dropdown zeigt nur aktive Kampagnen
- [ ] Zeitraum wird bei Auswahl automatisch gesetzt
- [ ] Manuelle Anpassung funktioniert
- [ ] Kampagnen-Verträge werden korrekt markiert

## 📅 Aufwand: 3-4 Stunden
**Komplexität:** 4/10  
**Priorität:** MITTEL - Verbesserung der User Experience

## 🔗 Dependencies
- Kampagnen-API existiert ✅
- Vertragserstellung funktional ✅
- Campaign-Contract-Relationship definiert ✅
- Braucht: Active Campaigns Endpoint 