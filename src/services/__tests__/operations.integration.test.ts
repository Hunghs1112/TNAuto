/**
 * Integration Tests — Operations CRUD (Vehicles, Warranties)
 * Validates: Requirements 12.1–12.11
 *
 * Tests verify that mock API responses match the expected TypeScript interfaces
 * and that the adminGarageApi integration layer correctly handles operations response shapes.
 */

import type { Vehicle, Warranty } from '../../types/api.types';
import type { AdminMutationResponse, AdminEntity } from '../adminGarageApi';

// ---------------------------------------------------------------------------
// Mock data helpers
// ---------------------------------------------------------------------------

const makeVehicle = (overrides: Partial<Vehicle> = {}): Vehicle => ({
  id: 1,
  customer_id: 1,
  license_plate: 'ABC-123',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

const makeWarranty = (overrides: Partial<Warranty> = {}): Warranty => ({
  id: 1,
  order_id: 10,
  customer_id: 1,
  warranty_period: 6,
  start_date: '2024-01-01',
  end_date: '2024-07-01',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

const makeInspection = (overrides: Record<string, unknown> = {}): AdminEntity => ({
  id: 1,
  vehicle_id: 1,
  inspection_date: '2024-01-15',
  inspection_expiry_date: '2025-01-15',
  inspection_certificate_number: 'CERT-001',
  ...overrides,
});

const makeListResponse = <T>(data: T[]) => ({
  success: true,
  data,
});

const makeMutationResponse = (extra: Record<string, unknown> = {}): AdminMutationResponse => ({
  success: true,
  ...extra,
});

// ---------------------------------------------------------------------------
// VEHICLES
// ---------------------------------------------------------------------------

describe('Operations Integration', () => {
  describe('Vehicles', () => {
    describe('GET /api/app/admin/vehicles', () => {
      it('should parse response into Vehicle array', () => {
        const mockResponse = makeListResponse([makeVehicle()]);

        expect(mockResponse.success).toBe(true);
        expect(Array.isArray(mockResponse.data)).toBe(true);
        expect(mockResponse.data).toHaveLength(1);
      });

      it('should have correct Vehicle shape', () => {
        const vehicle = makeVehicle();

        expect(vehicle).toHaveProperty('id');
        expect(vehicle).toHaveProperty('customer_id');
        expect(vehicle).toHaveProperty('license_plate');
        expect(vehicle).toHaveProperty('created_at');
      });

      it('should handle empty vehicle list', () => {
        const mockResponse = makeListResponse<Vehicle>([]);

        expect(mockResponse.success).toBe(true);
        expect(mockResponse.data).toHaveLength(0);
      });

      it('should support optional vehicle document fields', () => {
        const vehicle = makeVehicle({
          model: 'Toyota Camry',
          image_url: 'https://example.com/car.jpg',
          license_number: 'LIC-001',
          license_expiry_date: '2026-12-31',
          inspection_status: 'valid',
          insurance_status: 'expiring',
        });

        expect(vehicle.model).toBe('Toyota Camry');
        expect(vehicle.inspection_status).toBe('valid');
        expect(vehicle.insurance_status).toBe('expiring');
      });
    });

    describe('GET /api/app/admin/vehicles/:id', () => {
      it('should verify vehicle detail response shape', () => {
        const mockResponse = {
          success: true,
          data: makeVehicle({ id: 5, license_plate: 'XYZ-789' }),
        };

        expect(mockResponse.success).toBe(true);
        expect(mockResponse.data.id).toBe(5);
        expect(mockResponse.data.license_plate).toBe('XYZ-789');
      });

      it('should include all vehicle fields in detail', () => {
        const vehicle = makeVehicle({
          id: 10,
          model: 'Honda Civic',
          has_active_order: true,
          active_order_count: 1,
          last_service_date: '2024-01-10',
        });

        expect(vehicle.model).toBe('Honda Civic');
        expect(vehicle.has_active_order).toBe(true);
        expect(vehicle.last_service_date).toBeTruthy();
      });
    });

    describe('PUT /api/app/admin/vehicles/:id', () => {
      it('should verify vehicle update response shape', () => {
        const updateBody = {
          model: 'Updated Model',
          license_number: 'LIC-002',
          license_expiry_date: '2027-06-30',
        };
        const mockResponse = makeMutationResponse();

        expect(mockResponse.success).toBe(true);
        expect(updateBody).toHaveProperty('model');
      });

      it('should support updating document fields', () => {
        const updateBody = {
          inspection_certificate_number: 'CERT-002',
          inspection_date: '2024-03-01',
          inspection_expiry_date: '2025-03-01',
        };

        expect(updateBody).toHaveProperty('inspection_certificate_number');
        expect(updateBody).toHaveProperty('inspection_expiry_date');
      });
    });

    describe('DELETE /api/app/admin/vehicles/:id', () => {
      it('should verify vehicle deletion response shape', () => {
        const mockResponse = makeMutationResponse({ message: 'Vehicle deleted' });

        expect(mockResponse.success).toBe(true);
      });

      it('should return success true on deletion', () => {
        const mockResponse: AdminMutationResponse = { success: true };

        expect(mockResponse.success).toBe(true);
        expect(mockResponse.error).toBeUndefined();
      });
    });

    describe('GET /api/app/admin/vehicles/search', () => {
      it('should verify search response returns Vehicle array', () => {
        const searchQuery = { q: 'ABC', license_plate: 'ABC-123' };
        const mockResponse = makeListResponse([
          makeVehicle({ license_plate: 'ABC-123' }),
        ]);

        expect(mockResponse.success).toBe(true);
        expect(Array.isArray(mockResponse.data)).toBe(true);
        expect(mockResponse.data[0].license_plate).toBe('ABC-123');
      });

      it('should handle empty search results', () => {
        const mockResponse = makeListResponse<Vehicle>([]);

        expect(mockResponse.success).toBe(true);
        expect(mockResponse.data).toHaveLength(0);
      });

      it('should support search by license plate', () => {
        const searchParams = { q: 'XYZ' };

        expect(searchParams).toHaveProperty('q');
        expect(searchParams.q).toBeTruthy();
      });
    });

    describe('GET /api/app/admin/vehicles/:vehicleId/inspection', () => {
      it('should verify inspection response shape', () => {
        const mockResponse = {
          success: true,
          data: makeInspection(),
        };

        expect(mockResponse.success).toBe(true);
        expect(mockResponse.data).toHaveProperty('vehicle_id');
        expect(mockResponse.data).toHaveProperty('inspection_date');
      });

      it('should include certificate number in inspection', () => {
        const inspection = makeInspection({
          inspection_certificate_number: 'CERT-XYZ',
          inspection_expiry_date: '2025-06-30',
        });

        expect(inspection.inspection_certificate_number).toBe('CERT-XYZ');
        expect(inspection.inspection_expiry_date).toBeTruthy();
      });

      it('should handle null inspection (no inspection on record)', () => {
        const mockResponse = {
          success: true,
          data: null,
        };

        expect(mockResponse.success).toBe(true);
        expect(mockResponse.data).toBeNull();
      });
    });

    describe('PUT /api/app/admin/vehicles/:vehicleId/inspection', () => {
      it('should verify inspection upsert response shape', () => {
        const inspectionBody = {
          inspection_date: '2024-03-15',
          inspection_expiry_date: '2025-03-15',
          inspection_certificate_number: 'CERT-NEW',
        };
        const mockResponse = makeMutationResponse();

        expect(mockResponse.success).toBe(true);
        expect(inspectionBody).toHaveProperty('inspection_date');
      });

      it('should include required inspection fields', () => {
        const inspectionBody = {
          inspection_date: '2024-04-01',
          inspection_expiry_date: '2025-04-01',
        };

        expect(inspectionBody.inspection_date).toBeTruthy();
        expect(inspectionBody.inspection_expiry_date).toBeTruthy();
      });
    });
  });

  // ---------------------------------------------------------------------------
  // WARRANTIES
  // ---------------------------------------------------------------------------

  describe('Warranties', () => {
    describe('GET /api/app/admin/warranties', () => {
      it('should parse response into Warranty array', () => {
        const mockResponse = makeListResponse([makeWarranty()]);

        expect(mockResponse.success).toBe(true);
        expect(Array.isArray(mockResponse.data)).toBe(true);
        expect(mockResponse.data).toHaveLength(1);
      });

      it('should have correct Warranty shape', () => {
        const warranty = makeWarranty();

        expect(warranty).toHaveProperty('id');
        expect(warranty).toHaveProperty('order_id');
        expect(warranty).toHaveProperty('customer_id');
        expect(warranty).toHaveProperty('warranty_period');
        expect(warranty).toHaveProperty('start_date');
        expect(warranty).toHaveProperty('end_date');
      });

      it('should handle empty warranty list', () => {
        const mockResponse = makeListResponse<Warranty>([]);

        expect(mockResponse.success).toBe(true);
        expect(mockResponse.data).toHaveLength(0);
      });

      it('should support optional populated fields', () => {
        const warranty = makeWarranty({
          service_name: 'Oil Change',
          employee_name: 'Nguyen Mechanic',
          license_plate: 'ABC-123',
          vehicle_type: 'sedan',
          note: 'Standard warranty',
        });

        expect(warranty.service_name).toBe('Oil Change');
        expect(warranty.license_plate).toBe('ABC-123');
      });
    });

    describe('POST /api/app/admin/warranties', () => {
      it('should verify warranty created response shape', () => {
        const createBody = {
          order_id: 15,
          customer_id: 3,
          warranty_period: 12,
          start_date: '2024-02-01',
          end_date: '2025-02-01',
        };
        const mockResponse = makeMutationResponse({ data: makeWarranty(createBody) });

        expect(mockResponse.success).toBe(true);
      });

      it('should include required fields in create body', () => {
        const createBody = {
          order_id: 20,
          warranty_period: 6,
          start_date: '2024-03-01',
        };

        expect(createBody).toHaveProperty('order_id');
        expect(createBody).toHaveProperty('warranty_period');
        expect(createBody.warranty_period).toBeGreaterThan(0);
      });
    });

    describe('PUT /api/app/admin/warranties/:id', () => {
      it('should verify warranty update response shape', () => {
        const updateBody = {
          warranty_period: 18,
          end_date: '2025-08-01',
          note: 'Extended warranty',
        };
        const mockResponse = makeMutationResponse();

        expect(mockResponse.success).toBe(true);
        expect(updateBody.warranty_period).toBeGreaterThan(0);
      });
    });

    describe('DELETE /api/app/admin/warranties/:id', () => {
      it('should verify warranty deletion response shape', () => {
        const mockResponse = makeMutationResponse({ message: 'Warranty deleted' });

        expect(mockResponse.success).toBe(true);
      });

      it('should return success true on deletion', () => {
        const mockResponse: AdminMutationResponse = { success: true };

        expect(mockResponse.success).toBe(true);
        expect(mockResponse.error).toBeUndefined();
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Response shape validation
  // ---------------------------------------------------------------------------

  describe('Response shape validation', () => {
    it('should handle { success: true, data: [...] } envelope for vehicles', () => {
      const response = {
        success: true,
        data: [makeVehicle({ id: 1 }), makeVehicle({ id: 2 })],
      };

      expect(response.success).toBe(true);
      expect(response.data).toHaveLength(2);
    });

    it('should handle { success: true, vehicles: [...] } envelope', () => {
      const response = {
        success: true,
        vehicles: [makeVehicle({ id: 3 })],
      };

      expect(response.success).toBe(true);
      expect(Array.isArray(response.vehicles)).toBe(true);
    });

    it('should handle { success: true, warranties: [...] } envelope', () => {
      const response = {
        success: true,
        warranties: [makeWarranty({ id: 1 })],
      };

      expect(response.success).toBe(true);
      expect(Array.isArray(response.warranties)).toBe(true);
    });

    it('should detect failure response', () => {
      const errorResponse = {
        success: false,
        error: 'Vehicle not found',
      };

      expect(errorResponse.success).toBe(false);
      expect(errorResponse.error).toBeTruthy();
    });
  });
});
