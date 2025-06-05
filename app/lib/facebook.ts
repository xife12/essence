import { createClient } from '@supabase/supabase-js';

// Supabase-Client initialisieren
const getSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(supabaseUrl, supabaseKey);
};

// Hole das aktuelle Facebook-Token aus der Datenbank
export async function getFacebookToken() {
  const supabase = getSupabase();
  
  try {
    const { data, error } = await supabase
      .from('api_credentials')
      .select('*')
      .eq('provider', 'facebook')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    
    if (data) {
      // Prüfen, ob der Token noch gültig ist
      const expiresAt = new Date(data.expires_at);
      if (expiresAt > new Date()) {
        return data.access_token;
      } else {
        // Token ist abgelaufen
        throw new Error('Facebook-Token ist abgelaufen. Bitte neu verbinden.');
      }
    }

    return null;
  } catch (error) {
    console.error('Fehler beim Abrufen des Facebook-Tokens:', error);
    return null;
  }
}

// Facebook API-Aufruf mit gültigem Token
export async function callFacebookApi(endpoint: string, method = 'GET', body?: any) {
  const token = await getFacebookToken();
  
  if (!token) {
    throw new Error('Kein gültiger Facebook-Token gefunden. Bitte verbinde dein Facebook-Konto.');
  }

  const url = `https://graph.facebook.com/v19.0/${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Facebook API-Fehler: ${errorData.error?.message || 'Unbekannter Fehler'}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Facebook API-Aufruf fehlgeschlagen:', error);
    throw error;
  }
}

// Abrufen aller Werbekonten
export async function getAdAccounts() {
  try {
    const result = await callFacebookApi('me/adaccounts?fields=name,account_status,amount_spent,business_name');
    return result.data;
  } catch (error) {
    console.error('Fehler beim Abrufen der Werbekonten:', error);
    throw error;
  }
}

// Abrufen aller Kampagnen für ein Werbekonto
export async function getCampaigns(adAccountId: string) {
  try {
    const result = await callFacebookApi(`${adAccountId}/campaigns?fields=name,status,objective,spend,lifetime_budget`);
    return result.data;
  } catch (error) {
    console.error('Fehler beim Abrufen der Kampagnen:', error);
    throw error;
  }
}

// Erstellen einer neuen Werbeanzeige
export async function createAd(adAccountId: string, campaignData: any, adData: any, creativeData: any) {
  try {
    // 1. Kampagne erstellen
    const campaign = await callFacebookApi(`${adAccountId}/campaigns`, 'POST', {
      name: campaignData.name,
      objective: campaignData.objective || 'REACH',
      status: campaignData.status || 'PAUSED',
      special_ad_categories: [],
    });

    // 2. Anzeigengruppe erstellen
    const adSet = await callFacebookApi(`${adAccountId}/adsets`, 'POST', {
      name: adData.name,
      campaign_id: campaign.id,
      billing_event: 'IMPRESSIONS',
      optimization_goal: 'REACH',
      bid_amount: adData.bid_amount || 2000, // In Cent
      status: adData.status || 'PAUSED',
      targeting: adData.targeting || {},
      daily_budget: adData.daily_budget || 500000, // In Cent
    });

    // 3. Kreativ erstellen
    const creative = await callFacebookApi(`${adAccountId}/adcreatives`, 'POST', {
      name: creativeData.title,
      object_story_spec: {
        page_id: creativeData.page_id,
        link_data: {
          message: creativeData.description,
          link: creativeData.url,
          image_hash: creativeData.image_hash,
          call_to_action: {
            type: creativeData.cta_type || 'LEARN_MORE',
          },
        },
      },
    });

    // 4. Anzeige erstellen
    const ad = await callFacebookApi(`${adAccountId}/ads`, 'POST', {
      name: adData.name,
      adset_id: adSet.id,
      creative: { creative_id: creative.id },
      status: adData.status || 'PAUSED',
    });

    return {
      campaign,
      adSet,
      creative,
      ad,
    };
  } catch (error) {
    console.error('Fehler beim Erstellen der Werbeanzeige:', error);
    throw error;
  }
} 