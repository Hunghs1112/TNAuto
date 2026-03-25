export interface DealerProductImage {
  id: number;
  image_url: string;
  is_primary: boolean | number;
  created_at?: string;
}

export interface DealerProduct {
  id: number;
  name: string;
  description?: string | null;
  price: number | string;
  category_id: number;
  video_url?: string | null;
  created_at: string;
  updated_at?: string;
  category_name?: string | null;
  category_description?: string | null;
  images?: DealerProductImage[];
  primary_image?: DealerProductImage | null;
}

export interface DealerCategory {
  id: number;
  name: string;
  description?: string | null;
  image_url?: string | null;
  created_at: string;
  updated_at?: string;
  product_count?: number;
}

export interface DealerCategoryDetail extends DealerCategory {
  products: DealerProduct[];
}

export interface CreateDealerCategoryRequest {
  name: string;
  description?: string | null;
  image_url?: string | null;
}

export interface UpdateDealerCategoryRequest {
  name?: string;
  description?: string | null;
  image_url?: string | null;
}

export interface CreateDealerProductRequest {
  name: string;
  description?: string | null;
  price: number | string;
  category_id: number;
  video_url?: string | null;
}

export interface UpdateDealerProductRequest {
  name?: string;
  description?: string | null;
  price?: number | string;
  category_id?: number;
  video_url?: string | null;
}

export interface CreateDealerProductImageRequest {
  product_id: number;
  image_url: string;
  is_primary?: boolean;
}

export interface UpdateDealerProductImageRequest {
  image_url?: string;
  is_primary?: boolean;
}
