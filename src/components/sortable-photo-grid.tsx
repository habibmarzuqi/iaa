'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Eye, Trash2, Check, GripVertical } from 'lucide-react'

interface Photo {
  id: string
  title: string | null
  url: string
}

interface SortablePhotoGridProps {
  photos: Photo[]
  selectMode: boolean
  selectedPhotos: Set<string>
  onToggleSelect: (id: string) => void
  onDelete: (id: string) => void
  onReorder: (newOrder: string[]) => void
}

export function SortablePhotoGrid({
  photos, selectMode, selectedPhotos, onToggleSelect, onDelete, onReorder,
}: SortablePhotoGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = photos.findIndex((p) => p.id === active.id)
    const newIndex = photos.findIndex((p) => p.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const newOrder = arrayMove(photos, oldIndex, newIndex)
    onReorder(newOrder.map((p) => p.id))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-3 gap-2">
          {photos.map((p, i) => (
            <SortablePhoto
              key={p.id}
              photo={p}
              index={i}
              selectMode={selectMode}
              isSelected={selectedPhotos.has(p.id)}
              onToggleSelect={onToggleSelect}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

function SortablePhoto({
  photo, index, selectMode, isSelected, onToggleSelect, onDelete,
}: {
  photo: Photo
  index: number
  selectMode: boolean
  isSelected: boolean
  onToggleSelect: (id: string) => void
  onDelete: (id: string) => void
}) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: photo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto' as any,
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      className={`group relative aspect-square rounded-lg overflow-hidden border bg-muted cursor-pointer ${
        selectMode && isSelected ? 'border-gold ring-2 ring-gold/40' : 'border-border'
      } ${isDragging ? 'shadow-2xl' : ''}`}
      onClick={() => selectMode && onToggleSelect(photo.id)}
    >
      { }
      <img src={photo.url} alt={photo.title || 'Foto'} className="h-full w-full object-cover" />

      {/* Drag handle (only when not in select mode) */}
      {!selectMode && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-1 right-1 h-6 w-6 rounded-md bg-black/40 backdrop-blur grid place-items-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </div>
      )}

      {/* Select mode checkbox */}
      {selectMode && (
        <div className={`absolute top-1 left-1 h-5 w-5 rounded-full grid place-items-center transition-colors ${
          isSelected ? 'bg-gold text-navy' : 'bg-black/40 text-white'
        }`}>
          {isSelected && <Check className="h-3 w-3" />}
        </div>
      )}

      {/* Hover actions (non-select mode) */}
      {!selectMode && (
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center">
          <div className="flex gap-1">
            <a href={photo.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
              <Button size="sm" variant="secondary" className="h-7 w-7 p-0">
                <Eye className="h-3.5 w-3.5" />
              </Button>
            </a>
            <Button
              size="sm"
              variant="secondary"
              className="h-7 w-7 p-0 text-red-600 hover:bg-red-50"
              onClick={(e) => { e.stopPropagation(); onDelete(photo.id) }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
      {photo.title && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
          <p className="text-[9px] text-white truncate">{photo.title}</p>
        </div>
      )}
    </motion.div>
  )
}
