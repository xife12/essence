import supabase from './supabaseClient';

// Generischer API-Wrapper für Fehlerbehandlung
const handleApiCall = async <T>(
  apiCall: () => Promise<T>
): Promise<{ data: T | null; error: Error | null }> => {
  try {
    const result = await apiCall();
    return { data: result, error: null };
  } catch (error) {
    console.error('API Error:', error);
    return { data: null, error: error as Error };
  }
};

// API-Module
export const api = {
  // Kampagnen
  campaigns: {
    getAll: async () => {
      return handleApiCall(async () => {
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        return data;
      });
    },
    
    getById: async (id: string) => {
      return handleApiCall(async () => {
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        return data;
      });
    },
    
    create: async (campaign: any) => {
      return handleApiCall(async () => {
        const { data, error } = await supabase
          .from('campaigns')
          .insert(campaign)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      });
    },
    
    update: async (id: string, updates: any) => {
      return handleApiCall(async () => {
        const { data, error } = await supabase
          .from('campaigns')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      });
    },
    
    delete: async (id: string) => {
      return handleApiCall(async () => {
        const { error } = await supabase
          .from('campaigns')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        return true;
      });
    }
  },
  
  // Leads
  leads: {
    getAll: async () => {
      return handleApiCall(async () => {
        const { data, error } = await supabase
          .from('leads')
          .select('*, campaigns(*)')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        return data;
      });
    },
    
    getById: async (id: string) => {
      return handleApiCall(async () => {
        const { data, error } = await supabase
          .from('leads')
          .select('*, campaigns(*)')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        return data;
      });
    },
    
    create: async (lead: any) => {
      return handleApiCall(async () => {
        const { data, error } = await supabase
          .from('leads')
          .insert(lead)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      });
    },
    
    update: async (id: string, updates: any) => {
      return handleApiCall(async () => {
        const { data, error } = await supabase
          .from('leads')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      });
    },
    
    convertToMember: async (id: string) => {
      return handleApiCall(async () => {
        const { data: lead, error: leadError } = await supabase
          .from('leads')
          .select('*')
          .eq('id', id)
          .single();
          
        if (leadError) throw leadError;
        
        // Erstelle Mitglied aus Lead-Daten
        const memberData = {
          name: lead.name,
          contact: lead.contact,
          first_name: lead.first_name,
          last_name: lead.last_name,
          phone: lead.phone,
          email: lead.email,
          birthdate: lead.birthdate
        };
        
        const { data: member, error: memberError } = await supabase
          .from('members')
          .insert(memberData)
          .select()
          .single();
          
        if (memberError) throw memberError;
        
        // Aktualisiere Lead-Status
        const { error: updateError } = await supabase
          .from('leads')
          .update({ status: 'converted' })
          .eq('id', id);
          
        if (updateError) throw updateError;
        
        return member;
      });
    }
  },
  
  // Beratungen
  consultations: {
    getAll: async () => {
      return handleApiCall(async () => {
        const { data, error } = await supabase
          .from('consultations')
          .select('*, leads(*), contract_types(*)')
          .order('date', { ascending: false });
          
        if (error) throw error;
        return data;
      });
    },
    
    getByLeadId: async (leadId: string) => {
      return handleApiCall(async () => {
        const { data, error } = await supabase
          .from('consultations')
          .select('*, leads(*), contract_types(*)')
          .eq('lead_id', leadId)
          .order('date', { ascending: false });
          
        if (error) throw error;
        return data;
      });
    },
    
    create: async (consultation: any) => {
      return handleApiCall(async () => {
        const { data, error } = await supabase
          .from('consultations')
          .insert(consultation)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      });
    },
    
    update: async (id: string, updates: any) => {
      return handleApiCall(async () => {
        const { data, error } = await supabase
          .from('consultations')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      });
    }
  },
  
  // Mitglieder
  members: {
    getAll: async () => {
      return handleApiCall(async () => {
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        return data;
      });
    },
    
    getById: async (id: string) => {
      return handleApiCall(async () => {
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        return data;
      });
    },
    
    create: async (member: any) => {
      return handleApiCall(async () => {
        const { data, error } = await supabase
          .from('members')
          .insert(member)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      });
    },
    
    update: async (id: string, updates: any) => {
      return handleApiCall(async () => {
        const { data, error } = await supabase
          .from('members')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      });
    }
  },
  
  // Mitgliedschaften
  memberships: {
    getAll: async () => {
      return handleApiCall(async () => {
        const { data, error } = await supabase
          .from('memberships')
          .select('*, members(*), contract_types(*)')
          .order('start_date', { ascending: false });
          
        if (error) throw error;
        return data;
      });
    },
    
    getByMemberId: async (memberId: string) => {
      return handleApiCall(async () => {
        const { data, error } = await supabase
          .from('memberships')
          .select('*, contract_types(*)')
          .eq('member_id', memberId)
          .order('start_date', { ascending: false });
          
        if (error) throw error;
        return data;
      });
    },
    
    create: async (membership: any) => {
      return handleApiCall(async () => {
        const { data, error } = await supabase
          .from('memberships')
          .insert(membership)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      });
    },
    
    update: async (id: string, updates: any) => {
      return handleApiCall(async () => {
        const { data, error } = await supabase
          .from('memberships')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      });
    },
    
    cancel: async (id: string, endDate: string) => {
      return handleApiCall(async () => {
        const { data, error } = await supabase
          .from('memberships')
          .update({ 
            status: 'cancelled',
            end_date: endDate
          })
          .eq('id', id)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      });
    },
    
    extend: async (id: string, newMembership: any) => {
      return handleApiCall(async () => {
        // Erst alte Mitgliedschaft auf "cancelled" setzen
        const { data: oldMembership, error: oldError } = await supabase
          .from('memberships')
          .update({ status: 'cancelled' })
          .eq('id', id)
          .select()
          .single();
          
        if (oldError) throw oldError;
        
        // Neue Mitgliedschaft erstellen mit Vorgänger-Referenz
        const newData = {
          ...newMembership,
          predecessor_id: id
        };
        
        const { data: newData2, error: newError } = await supabase
          .from('memberships')
          .insert(newData)
          .select()
          .single();
          
        if (newError) throw newError;
        
        return newData2;
      });
    }
  },
  
  // Vertragsarten
  contractTypes: {
    getAll: async () => {
      return handleApiCall(async () => {
        const { data, error } = await supabase
          .from('contract_types')
          .select('*')
          .order('name', { ascending: true });
          
        if (error) throw error;
        return data;
      });
    },
    
    getActive: async () => {
      return handleApiCall(async () => {
        const { data, error } = await supabase
          .from('contract_types')
          .select('*')
          .eq('status', 'active')
          .order('name', { ascending: true });
          
        if (error) throw error;
        return data;
      });
    },
    
    getById: async (id: string) => {
      return handleApiCall(async () => {
        const { data, error } = await supabase
          .from('contract_types')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        return data;
      });
    },
    
    create: async (contractType: any) => {
      return handleApiCall(async () => {
        const { data, error } = await supabase
          .from('contract_types')
          .insert(contractType)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      });
    },
    
    update: async (id: string, updates: any) => {
      return handleApiCall(async () => {
        const { data, error } = await supabase
          .from('contract_types')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      });
    }
  },
  
  // Stunden
  staffHours: {
    getByStaffId: async (staffId: string) => {
      return handleApiCall(async () => {
        const { data, error } = await supabase
          .from('staff_hours')
          .select('*')
          .eq('staff_id', staffId)
          .order('date', { ascending: false });
          
        if (error) throw error;
        return data;
      });
    },
    
    getByDateRange: async (staffId: string, startDate: string, endDate: string) => {
      return handleApiCall(async () => {
        const { data, error } = await supabase
          .from('staff_hours')
          .select('*')
          .eq('staff_id', staffId)
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: true });
          
        if (error) throw error;
        return data;
      });
    },
    
    create: async (hours: any) => {
      return handleApiCall(async () => {
        const { data, error } = await supabase
          .from('staff_hours')
          .insert(hours)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      });
    },
    
    update: async (id: string, updates: any) => {
      return handleApiCall(async () => {
        const { data, error } = await supabase
          .from('staff_hours')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      });
    },
    
    delete: async (id: string) => {
      return handleApiCall(async () => {
        const { error } = await supabase
          .from('staff_hours')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        return true;
      });
    }
  },
  
  // Passwörter
  secrets: {
    getAll: async () => {
      return handleApiCall(async () => {
        const { data, error } = await supabase
          .from('secrets')
          .select('*')
          .order('name', { ascending: true });
          
        if (error) throw error;
        return data;
      });
    },
    
    getById: async (id: string) => {
      return handleApiCall(async () => {
        const { data, error } = await supabase
          .from('secrets')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        return data;
      });
    },
    
    create: async (secret: any) => {
      return handleApiCall(async () => {
        const { data, error } = await supabase
          .from('secrets')
          .insert(secret)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      });
    },
    
    update: async (id: string, updates: any) => {
      return handleApiCall(async () => {
        const { data, error } = await supabase
          .from('secrets')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      });
    },
    
    delete: async (id: string) => {
      return handleApiCall(async () => {
        const { error } = await supabase
          .from('secrets')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        return true;
      });
    }
  },
  
  // Mitarbeiter
  staff: {
    getAll: async () => {
      return handleApiCall(async () => {
        const { data, error } = await supabase
          .from('staff')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        return data;
      });
    },
    
    getById: async (id: string) => {
      return handleApiCall(async () => {
        const { data, error } = await supabase
          .from('staff')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        return data;
      });
    },
    
    create: async (staff: any) => {
      return handleApiCall(async () => {
        const { data, error } = await supabase
          .from('staff')
          .insert(staff)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      });
    },
    
    update: async (id: string, updates: any) => {
      return handleApiCall(async () => {
        const { data, error } = await supabase
          .from('staff')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      });
    }
  }
};

export default api; 