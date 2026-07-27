export const getAssignableBrands = (brands, currentBrandId = '') => (
  brands.filter((brand) => (
    !brand.archived_at
    && (brand.is_active || String(brand.id) === String(currentBrandId))
  ))
)
