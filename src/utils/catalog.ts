type ImageLike =
  | string
  | null
  | undefined
  | {
      image_url?: string | null;
      uri?: string | null;
      url?: string | null;
    };

type ProductLike = {
  primary_image?: ImageLike;
  images?: ImageLike[];
} | null | undefined;

export const getCatalogImageUrl = (image: ImageLike): string | undefined => {
  if (!image) {
    return undefined;
  }

  if (typeof image === 'string') {
    const normalized = image.trim();
    return normalized.length > 0 ? normalized : undefined;
  }

  const candidate = image.image_url || image.uri || image.url;
  if (typeof candidate !== 'string') {
    return undefined;
  }

  const normalized = candidate.trim();
  return normalized.length > 0 ? normalized : undefined;
};

export const getPrimaryCatalogProductImageUrl = (product: ProductLike): string | undefined => {
  if (!product) {
    return undefined;
  }

  return getCatalogImageUrl(product.primary_image) || getCatalogImageUrl(product.images?.[0]);
};

export const getCatalogProductImageUrls = (
  product: ProductLike,
  productImages?: ImageLike[] | null,
): string[] => {
  const urls = (productImages?.length ? productImages : product?.images || [])
    .map((image) => getCatalogImageUrl(image))
    .filter((imageUrl): imageUrl is string => Boolean(imageUrl));

  if (urls.length > 0) {
    return Array.from(new Set(urls));
  }

  const primaryImageUrl = getPrimaryCatalogProductImageUrl(product);
  return primaryImageUrl ? [primaryImageUrl] : [];
};
