export type SkuRow = {
  category: string
  subcategory?: string
  product: string
  var1?: string
  var2?: string
}

export type SkuResult = {
  sku?: string
  parts?: {
    brand?: string
    category?: string
    subcat?: string
    product?: string
    var1?: string
    var2?: string
    dims?: string
    serial?: string
  }
  details?: string
  error?: string
}

export type Category = {
  id: string
  name: string
  code: string
  type: 'dimension' | 'colour' | 'accessory'
}

export type SubCategory = {
  id: string
  name: string
  code: string
}

export type Product = {
  id: string
  category: string
  sub: string | null
  name: string
  code: string
}

export type Model = {
  id: string
  name: string
  code: string
}

export type Colour = {
  id: string
  name: string
  code: string
}

export type Size = {
  id: string
  name: string
  code: string
}

export type SkuHistory = {
  id: string
  sku: string
  category: string
  product: string
  details: string
  created_at: string
}
