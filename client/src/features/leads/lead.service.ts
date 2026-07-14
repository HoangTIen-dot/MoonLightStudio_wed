import { apiRequest } from '../../shared/lib/api';

export type LeadStatus = 'new' | 'contacted' | 'closed';

export type Lead = {
  _id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
};

export type LeadPayload = {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  message: string;
};

export async function createLead(payload: LeadPayload) {
  return apiRequest<{ lead: Lead }>('/public/leads', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getAdminLeads() {
  return apiRequest<{ leads: Lead[] }>('/admin/leads');
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  return apiRequest<{ lead: Lead }>(`/admin/leads/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
