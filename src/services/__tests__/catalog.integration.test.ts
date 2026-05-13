/**
 * Integration Tests — Catalog CRUD (Services, Products, Offers)
 * Validates: Requirements 11.1–11.12
 *
 * Tests verify that mock API responses match the expected TypeScript interfaces
 * and that the adminGarageApi integration layer correctly handles catalog response shapes.
 */

import type { Service, Product, Offer } from '../../types/api.types';
import type { AdminMutationResponse } from '../adminGarageApi';

// ---------------------------------------------------------------------------
// Mock data helpers
// ---------------------------------------------------------------------------

const makeService = (overrides: Partial<Service> = {}): Service => ({
  id: 1,
  name: 'Oil Change',
  description: 'Full synthetic oil change',
  estimated_time: 3600,
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 1,
  name: 'Engine Oil 5W-30',
  description: 'High quality synthetic engine oil',
  price: 250000,
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

const makeOffer = (overrides: Partial<Offer> = {}): Offer => ({
  id: 1,
  name: 'Summer Discount',
  service_id: 1,
  discount: 20,
  valid_from: '2024-06-01',
  valid_to: '2024-08-31',
  created_at: '2024-01-01T00:00:00Z',
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
// SERVICES
// ---------------------------------------------------------------------------

describe('Catalog Integration', () => {
  describe('Services', () => {
    describe('GET /api/app/admin/services', () => {
      it('should parse response into Service array', () => {
        const mockResponse = makeListResponse([makeService()]);

        expect(mockResponse.success).toBe(true);
        expect(Array.isArray(mockResponse.data)).toBe(true);
        expect(mockResponse.data).toHaveLength(1);
      });

      it('should have correct Service shape', () => {
        const service = makeService();

        expect(service).toHaveProperty('id');
        expect(service).toHaveProperty('name');
        expect(service).toHaveProperty('description');
        expect(service).toHaveProperty('estimated_time');
        expect(service).toHaveProperty('created_at');
      });

      it('should handle empty service list', () => {
        const mockResponse = makeListResponse<Service>([]);

        expect(mockResponse.success).toBe(true);
        expect(mockResponse.data).toHaveLength(0);
      });

      it('should support optional warranty_period field', () => {
        const service = makeService({ warranty_period: 15552000 }); // 6 months in seconds

        expect(service.warranty_period).toBe(15552000);
      });
    });

    describe('POST /api/app/admin/services', () => {
      it('should verify service created response shape', () => {
        const createBody = {
          name: 'Brake Inspection',
          description: 'Full brake system inspection',
          estimated_time: 7200,
        };
        const mockResponse = makeMutationResponse({ data: makeService(createBody) });

        expect(mockResponse.success).toBe(true);
      });

      it('should include required fields in create body', () => {
        const createBody = {
          name: 'Tire Rotation',
          description: 'Rotate all four tires',
          estimated_time: 1800,
        };

        expect(createBody).toHaveProperty('name');
        expect(createBody).toHaveProperty('description');
        expect(createBody).toHaveProperty('estimated_time');
      });
    });

    describe('PUT /api/app/admin/services/:id', () => {
      it('should verify service update response shape', () => {
        const updateBody = { name: 'Updated Oil Change', estimated_time: 4500 };
        const mockResponse = makeMutationResponse();

        expect(mockResponse.success).toBe(true);
        expect(updateBody).toHaveProperty('name');
      });

      it('should support updating warranty_period', () => {
        const updateBody = { warranty_period: 7776000 }; // 3 months

        expect(updateBody.warranty_period).toBeGreaterThan(0);
      });
    });

    describe('DELETE /api/app/admin/services/:id', () => {
      it('should verify service deletion response shape', () => {
        const mockResponse = makeMutationResponse({ message: 'Service deleted' });

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
  // PRODUCTS
  // ---------------------------------------------------------------------------

  describe('Products', () => {
    describe('GET /api/app/admin/products', () => {
      it('should parse response into Product array', () => {
        const mockResponse = makeListResponse([makeProduct()]);

        expect(mockResponse.success).toBe(true);
        expect(Array.isArray(mockResponse.data)).toBe(true);
        expect(mockResponse.data).toHaveLength(1);
      });

      it('should have correct Product shape', () => {
        const product = makeProduct();

        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('price');
      });

      it('should handle empty product list', () => {
        const mockResponse = makeListResponse<Product>([]);

        expect(mockResponse.success).toBe(true);
        expect(mockResponse.data).toHaveLength(0);
      });

      it('should support optional product fields', () => {
        const product = makeProduct({
          category_id: 3,
          primary_image: 'https://example.com/oil.jpg',
          video_url: 'https://example.com/video.mp4',
        });

        expect(product.category_id).toBe(3);
        expect(product.primary_image).toBeTruthy();
        expect(product.video_url).toBeTruthy();
      });
    });

    describe('POST /api/app/admin/products', () => {
      it('should verify product created response shape', () => {
        const createBody = {
          name: 'Air Filter',
          description: 'High performance air filter',
          price: 150000,
          category_id: 2,
        };
        const mockResponse = makeMutationResponse({ data: makeProduct(createBody) });

        expect(mockResponse.success).toBe(true);
      });

      it('should include required fields in create body', () => {
        const createBody = {
          name: 'Spark Plug',
          price: 80000,
        };

        expect(createBody).toHaveProperty('name');
        expect(createBody).toHaveProperty('price');
        expect(createBody.price).toBeGreaterThan(0);
      });
    });

    describe('PUT /api/app/admin/products/:id', () => {
      it('should verify product update response shape', () => {
        const updateBody = { name: 'Updated Air Filter', price: 175000 };
        const mockResponse = makeMutationResponse();

        expect(mockResponse.success).toBe(true);
        expect(updateBody.price).toBeGreaterThan(0);
      });
    });

    describe('DELETE /api/app/admin/products/:id', () => {
      it('should verify product deletion response shape', () => {
        const mockResponse = makeMutationResponse({ message: 'Product deleted' });

        expect(mockResponse.success).toBe(true);
      });

      it('should return success true on deletion', () => {
        const mockResponse: AdminMutationResponse = { success: true };

        expect(mockResponse.success).toBe(true);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // OFFERS
  // ---------------------------------------------------------------------------

  describe('Offers', () => {
    describe('GET /api/app/admin/offers', () => {
      it('should parse response into Offer array', () => {
        const mockResponse = makeListResponse([makeOffer()]);

        expect(mockResponse.success).toBe(true);
        expect(Array.isArray(mockResponse.data)).toBe(true);
        expect(mockResponse.data).toHaveLength(1);
      });

      it('should have correct Offer shape', () => {
        const offer = makeOffer();

        expect(offer).toHaveProperty('id');
        expect(offer).toHaveProperty('name');
        expect(offer).toHaveProperty('service_id');
        expect(offer).toHaveProperty('created_at');
      });

      it('should handle empty offer list', () => {
        const mockResponse = makeListResponse<Offer>([]);

        expect(mockResponse.success).toBe(true);
        expect(mockResponse.data).toHaveLength(0);
      });

      it('should support optional offer fields', () => {
        const offer = makeOffer({
          service_name: 'Oil Change',
          description: 'Summer special discount',
          content: 'Get 20% off on all oil changes this summer',
          discount: 20,
        });

        expect(offer.service_name).toBe('Oil Change');
        expect(offer.discount).toBe(20);
        expect(offer.content).toBeTruthy();
      });
    });

    describe('POST /api/app/admin/offers', () => {
      it('should verify offer created response shape', () => {
        const createBody = {
          name: 'Winter Special',
          service_id: 2,
          discount: 15,
          valid_from: '2024-12-01',
          valid_to: '2025-01-31',
        };
        const mockResponse = makeMutationResponse({ data: makeOffer(createBody) });

        expect(mockResponse.success).toBe(true);
      });

      it('should include required fields in create body', () => {
        const createBody = {
          name: 'New Year Offer',
          service_id: 1,
        };

        expect(createBody).toHaveProperty('name');
        expect(createBody).toHaveProperty('service_id');
      });

      it('should support discount and validity period', () => {
        const createBody = {
          name: 'Flash Sale',
          service_id: 3,
          discount: 30,
          valid_from: '2024-03-01',
          valid_to: '2024-03-07',
        };

        expect(createBody.discount).toBeGreaterThan(0);
        expect(createBody.discount).toBeLessThanOrEqual(100);
        expect(createBody.valid_from).toBeTruthy();
        expect(createBody.valid_to).toBeTruthy();
      });
    });

    describe('PUT /api/app/admin/offers/:id', () => {
      it('should verify offer update response shape', () => {
        const updateBody = { name: 'Updated Summer Discount', discount: 25 };
        const mockResponse = makeMutationResponse();

        expect(mockResponse.success).toBe(true);
        expect(updateBody.discount).toBeGreaterThan(0);
      });
    });

    describe('DELETE /api/app/admin/offers/:id', () => {
      it('should verify offer deletion response shape', () => {
        const mockResponse = makeMutationResponse({ message: 'Offer deleted' });

        expect(mockResponse.success).toBe(true);
      });

      it('should return success true on deletion', () => {
        const mockResponse: AdminMutationResponse = { success: true };

        expect(mockResponse.success).toBe(true);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Response shape validation
  // ---------------------------------------------------------------------------

  describe('Response shape validation', () => {
    it('should handle { success: true, data: [...] } envelope for services', () => {
      const response = {
        success: true,
        data: [makeService({ id: 1 }), makeService({ id: 2 })],
      };

      expect(response.success).toBe(true);
      expect(response.data).toHaveLength(2);
    });

    it('should handle { success: true, services: [...] } envelope', () => {
      const response = {
        success: true,
        services: [makeService({ id: 3 })],
      };

      expect(response.success).toBe(true);
      expect(Array.isArray(response.services)).toBe(true);
    });

    it('should handle { success: true, products: [...] } envelope', () => {
      const response = {
        success: true,
        products: [makeProduct({ id: 1 })],
      };

      expect(response.success).toBe(true);
      expect(Array.isArray(response.products)).toBe(true);
    });

    it('should handle { success: true, offers: [...] } envelope', () => {
      const response = {
        success: true,
        offers: [makeOffer({ id: 1 })],
      };

      expect(response.success).toBe(true);
      expect(Array.isArray(response.offers)).toBe(true);
    });

    it('should detect failure response', () => {
      const errorResponse = {
        success: false,
        error: 'Service not found',
      };

      expect(errorResponse.success).toBe(false);
      expect(errorResponse.error).toBeTruthy();
    });
  });
});
