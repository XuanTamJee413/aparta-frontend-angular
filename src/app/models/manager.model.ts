import { BuildingDto } from '../services/admin/building.service';

// Interface cho building được gán từ API Manager
export interface AssignedBuilding {
  buildingId: string;
  buildingName: string;
  buildingCode: string;
  isActive: boolean;
}

export interface Manager {
  userId: string;
  name: string;
  email: string;
  staffCode: string;
  avatarUrl: string | null;
  phone: string;
  role: string | null;
  status: string;
  lastLoginAt: string | null;
  permissionGroup: string | null;
  assignedBuildings: AssignedBuilding[];
}

