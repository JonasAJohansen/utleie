import { categories } from './categoryData'

export interface Subcategory {
  id: number
  name: string
}

export interface Category {
  id: number
  name: string
  icon: string
  subcategories: Subcategory[]
}

export function getSubcategories(categoryId: number): Subcategory[] {
  const category = categories.find(c => c.id === categoryId)
  return category ? category.subcategories : []
}

export function getSubcategoryById(categoryId: number, subcategoryId: number): Subcategory | undefined {
  const subcategories = getSubcategories(categoryId)
  return subcategories.find(sc => sc.id === subcategoryId)
}

export function addSubcategory(categoryId: number, newSubcategory: Omit<Subcategory, 'id'>): Subcategory | null {
  const categoryIndex = categories.findIndex(c => c.id === categoryId)
  if (categoryIndex === -1) return null

  const newId = Math.max(0, ...categories[categoryIndex].subcategories.map(sc => sc.id)) + 1
  const subcategory: Subcategory = { id: newId, ...newSubcategory }
  
  categories[categoryIndex].subcategories.push(subcategory)
  return subcategory
}

export function updateSubcategory(categoryId: number, subcategoryId: number, updatedData: Partial<Subcategory>): Subcategory | null {
  const categoryIndex = categories.findIndex(c => c.id === categoryId)
  if (categoryIndex === -1) return null

  const subcategoryIndex = categories[categoryIndex].subcategories.findIndex(sc => sc.id === subcategoryId)
  if (subcategoryIndex === -1) return null

  categories[categoryIndex].subcategories[subcategoryIndex] = {
    ...categories[categoryIndex].subcategories[subcategoryIndex],
    ...updatedData
  }

  return categories[categoryIndex].subcategories[subcategoryIndex]
}

export function deleteSubcategory(categoryId: number, subcategoryId: number): boolean {
  const categoryIndex = categories.findIndex(c => c.id === categoryId)
  if (categoryIndex === -1) return false

  const initialLength = categories[categoryIndex].subcategories.length
  categories[categoryIndex].subcategories = categories[categoryIndex].subcategories.filter(sc => sc.id !== subcategoryId)

  return categories[categoryIndex].subcategories.length !== initialLength
}

