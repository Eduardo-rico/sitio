/**
 * Draggable List Component
 * For reordering items using @dnd-kit
 */

"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { GripVertical, Trash2, Edit, ExternalLink } from "lucide-react";

interface DraggableItem {
  id: string;
  title: string;
  subtitle?: string;
  order: number;
  isPublished?: boolean;
  href?: string;
}

interface DraggableListProps {
  items: DraggableItem[];
  onReorder: (items: DraggableItem[]) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  emptyMessage?: string;
  renderExtra?: (item: DraggableItem) => React.ReactNode;
}

// Individual sortable item
function SortableItem({
  item,
  onDelete,
  onEdit,
  renderExtra,
}: {
  item: DraggableItem;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  renderExtra?: (item: DraggableItem) => React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg transition-shadow ${
        isDragging ? "shadow-lg ring-2 ring-blue-500" : "hover:shadow-md"
      }`}
    >
      {/* Drag Handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      {/* Order Number */}
      <div className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium text-gray-600 dark:text-gray-400">
        {item.order}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {item.title}
          </h4>
          {item.isPublished !== undefined && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                item.isPublished
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
              }`}
            >
              {item.isPublished ? "Publicado" : "Borrador"}
            </span>
          )}
        </div>
        {item.subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {item.subtitle}
          </p>
        )}
        {renderExtra && renderExtra(item)}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {item.href && (
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Ver"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(item.id)}
            className="p-2 text-gray-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export function DraggableList({
  items,
  onReorder,
  onDelete,
  onEdit,
  emptyMessage = "No hay elementos",
  renderExtra,
}: DraggableListProps) {
  const [localItems, setLocalItems] = useState(items);

  // Update local items when props change
  useState(() => {
    setLocalItems(items);
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLocalItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Update order numbers
        const reorderedItems = newItems.map((item, index) => ({
          ...item,
          order: index + 1,
        }));
        
        onReorder(reorderedItems);
        return reorderedItems;
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={localItems.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {localItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <SortableItem
                item={item}
                onDelete={onDelete}
                onEdit={onEdit}
                renderExtra={renderExtra}
              />
            </motion.div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

// Simple sortable wrapper for custom items
interface SortableWrapperProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function SortableWrapper({ id, children, className }: SortableWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={className}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}
