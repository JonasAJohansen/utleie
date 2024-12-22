'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Plus, Trash2, ChevronRight, ChevronDown } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import React from 'react';
import { Card } from "@/components/ui/card"

interface Category {
  id: number;
  name: string;
  subcategories: { id: number; name: string }[];
}

const initialCategories: Category[] = [
  { 
    id: 1, 
    name: 'Sports & Outdoors', 
    subcategories: [
      { id: 1, name: 'Camping Gear' },
      { id: 2, name: 'Bicycles' },
    ]
  },
  { 
    id: 2, 
    name: 'Electronics', 
    subcategories: [
      { id: 3, name: 'Cameras' },
      { id: 4, name: 'Laptops' },
    ]
  },
  { 
    id: 3, 
    name: 'Home & Garden', 
    subcategories: [
      { id: 5, name: 'Power Tools' },
      { id: 6, name: 'Furniture' },
    ]
  },
]

export function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newSubcategoryName, setNewSubcategoryName] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<number[]>([])

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: Category = {
        id: Math.max(0, ...categories.map(c => c.id)) + 1,
        name: newCategoryName.trim(),
        subcategories: [],
      }
      setCategories([...categories, newCategory])
      setNewCategoryName('')
    }
  }

  const handleAddSubcategory = () => {
    if (selectedCategory && newSubcategoryName.trim()) {
      const updatedCategories = categories.map(category => {
        if (category.id === selectedCategory.id) {
          return {
            ...category,
            subcategories: [
              ...category.subcategories,
              {
                id: Math.max(0, ...category.subcategories.map(sc => sc.id)) + 1,
                name: newSubcategoryName.trim(),
              }
            ]
          }
        }
        return category
      })
      setCategories(updatedCategories)
      setNewSubcategoryName('')
    }
  }

  const handleDeleteCategory = (id: number) => {
    setCategories(categories.filter(category => category.id !== id))
  }

  const handleDeleteSubcategory = (categoryId: number, subcategoryId: number) => {
    setCategories(categories.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          subcategories: category.subcategories.filter(sc => sc.id !== subcategoryId)
        }
      }
      return category
    }))
  }

  const handleEditCategory = (id: number, newName: string) => {
    setCategories(categories.map(category =>
      category.id === id ? { ...category, name: newName } : category
    ))
  }

  const handleEditSubcategory = (categoryId: number, subcategoryId: number, newName: string) => {
    setCategories(categories.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          subcategories: category.subcategories.map(sc =>
            sc.id === subcategoryId ? { ...sc, name: newName } : sc
          )
        }
      }
      return category
    }))
  }

  const toggleCategoryExpansion = (categoryId: number) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Input
          placeholder="New category name"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
        <Button onClick={handleAddCategory}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>
      <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Subcategories</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <React.Fragment key={category.id}>
              <TableRow>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0"
                    onClick={() => toggleCategoryExpansion(category.id)}
                  >
                    {expandedCategories.includes(category.id) ? (
                      <ChevronDown className="h-4 w-4 mr-2" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mr-2" />
                    )}
                    {category.name}
                  </Button>
                </TableCell>
                <TableCell>{category.subcategories.length}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Subcategory</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="subcategoryName" className="text-right">
                              Name
                            </Label>
                            <Input
                              id="subcategoryName"
                              value={newSubcategoryName}
                              onChange={(e) => setNewSubcategoryName(e.target.value)}
                              className="col-span-3"
                            />
                          </div>
                        </div>
                        <Button onClick={() => {
                          setSelectedCategory(category)
                          handleAddSubcategory()
                        }}>
                          Add Subcategory
                        </Button>
                      </DialogContent>
                    </Dialog>
                    <Button variant="ghost" size="icon" onClick={() => {
                      const newName = prompt('Enter new category name', category.name)
                      if (newName) handleEditCategory(category.id, newName)
                    }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(category.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              {expandedCategories.includes(category.id) && category.subcategories.map(subcategory => (
                <TableRow key={`${category.id}-${subcategory.id}`}>
                  <TableCell className="pl-10">{subcategory.name}</TableCell>
                  <TableCell></TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => {
                        const newName = prompt('Enter new subcategory name', subcategory.name)
                        if (newName) handleEditSubcategory(category.id, subcategory.id, newName)
                      }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteSubcategory(category.id, subcategory.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
      </Card>
    </div>
  )
}

