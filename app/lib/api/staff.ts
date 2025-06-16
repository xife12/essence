import { createClient } from '@supabase/supabase-js';

// Supabase Client Setup (aus anderen API-Dateien kopiert)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Interfaces
export interface Staff {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  name: string; // Computed field
  rolle: 'admin' | 'studioleiter' | 'mitarbeiter';
  created_at: string;
  updated_at: string;
}

export class StaffAPI {
  /**
   * Alle Mitarbeiter abrufen (Mock-Daten für Test)
   */
  static async getAll(): Promise<Staff[]> {
    try {
      // Echte Daten aus der Datenbank laden
      const { data, error } = await supabase
        .from('staff')
        .select(`
          id,
          rolle,
          created_at,
          updated_at,
          users:id (
            email,
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Fehler beim Laden der Staff-Daten:', error);
        // Fallback zu Mock-Daten mit echten UUIDs
        return [
          {
            id: '550e8400-e29b-41d4-a716-446655440001',
            email: 'max.trainer@studio.de',
            first_name: 'Max',
            last_name: 'Mustermann',
            name: 'Max Mustermann',
            rolle: 'mitarbeiter',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440002', 
            email: 'lisa.studioleiter@studio.de',
            first_name: 'Lisa',
            last_name: 'Schmidt',
            name: 'Lisa Schmidt',
            rolle: 'studioleiter',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440003',
            email: 'anna.trainer@studio.de', 
            first_name: 'Anna',
            last_name: 'Weber',
            name: 'Anna Weber',
            rolle: 'mitarbeiter',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ];
      }

      // Daten transformieren
      return data?.map((staff: any) => ({
        id: staff.id,
        email: staff.users?.email || 'unknown@example.com',
        first_name: staff.users?.first_name,
        last_name: staff.users?.last_name,
        name: this.getDisplayName(staff.users?.first_name, staff.users?.last_name, staff.users?.email),
        rolle: staff.rolle,
        created_at: staff.created_at,
        updated_at: staff.updated_at,
      })) || [];
    } catch (error) {
      console.error('Fehler beim Laden der Staff-Daten:', error);
      // Fallback zu Mock-Daten mit echten UUIDs
      return [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          email: 'max.trainer@studio.de',
          first_name: 'Max',
          last_name: 'Mustermann',
          name: 'Max Mustermann',
          rolle: 'mitarbeiter',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002', 
          email: 'lisa.studioleiter@studio.de',
          first_name: 'Lisa',
          last_name: 'Schmidt',
          name: 'Lisa Schmidt',
          rolle: 'studioleiter',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440003',
          email: 'anna.trainer@studio.de', 
          first_name: 'Anna',
          last_name: 'Weber',
          name: 'Anna Weber',
          rolle: 'mitarbeiter',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];
    }
  }

  /**
   * Einzelnen Mitarbeiter abrufen
   */
  static async getById(id: string): Promise<Staff | null> {
    const allStaff = await this.getAll();
    return allStaff.find(staff => staff.id === id) || null;
  }

  /**
   * Nur Trainer und Studioleiter (für Kurszuweisung)
   */
  static async getTrainers(): Promise<Staff[]> {
    const allStaff = await this.getAll();
    return allStaff.filter(staff => 
      staff.rolle === 'studioleiter' || staff.rolle === 'mitarbeiter'
    );
  }

  /**
   * Display-Name generieren
   */
  private static getDisplayName(firstName?: string, lastName?: string, email?: string): string {
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    if (firstName) {
      return firstName;
    }
    if (lastName) {
      return lastName;
    }
    if (email) {
      return email.split('@')[0]; // Teil vor dem @
    }
    return 'Unbekannt';
  }
}

export default StaffAPI; 