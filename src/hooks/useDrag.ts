/**
 * MiniDev ONE Template - Drag & Drop Hook
 * 
 * Drag and drop functionality with sortable support.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export interface DragItem {
  id: string;
  index: number;
  data: any;
}

export interface DropZone {
  id: string;
  element: HTMLElement;
}

export interface UseDragOptions {
  onDragStart?: (item: DragItem) => void;
  onDragEnd?: (item: DragItem) => void;
  onDragOver?: (item: DragItem, target: DragItem) => void;
  onDrop?: (item: DragItem, target: DragItem) => void;
}

export interface UseSortableOptions extends UseDragOptions {
  animationDuration?: number;
}

/**
 * useDrag - Basic drag functionality
 */
export function useDrag(
  ref: React.RefObject<HTMLElement>,
  options: UseDragOptions = {}
) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragItem, setDragItem] = useState<DragItem | null>(null);
  const startPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (e.button !== 0) return; // Left click only

    const element = ref.current;
    if (!element) return;

    startPos.current = { x: e.clientX, y: e.clientY };

    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startPos.current.x;
      const dy = moveEvent.clientY - startPos.current.y;

      if (!isDragging && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
        setIsDragging(true);
        setDragItem({
          id: element.id || Math.random().toString(36),
          index: 0,
          data: null,
        });
        options.onDragStart?.(dragItem!);
      }

      if (isDragging && dragItem) {
        element.style.transform = `translate(${dx}px, ${dy}px)`;
        element.style.opacity = '0.8';
        element.style.zIndex = '9999';
      }
    };

    const onMouseUp = () => {
      if (isDragging && dragItem) {
        options.onDragEnd?.(dragItem);
      }

      setIsDragging(false);
      setDragItem(null);
      if (element) {
        element.style.transform = '';
        element.style.opacity = '';
        element.style.zIndex = '';
      }

      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [ref, isDragging, dragItem, options]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener('mousedown', handleMouseDown);
    element.style.cursor = 'grab';

    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
    };
  }, [ref, handleMouseDown]);

  return { isDragging, dragItem };
}

/**
 * useSortable - Sortable list functionality
 */
export function useSortable<T>(
  items: T[],
  options: UseSortableOptions = {}
): {
  items: T[];
  activeId: string | null;
  handleProps: (id: string) => React.HTMLAttributes<HTMLDivElement>;
  getItemStyle: (index: number, id: string) => React.CSSProperties;
  containerProps: React.HTMLAttributes<HTMLDivElement>;
} {
  const [orderedItems, setOrderedItems] = useState(items);
  const [activeId, setActiveId] = useState<string | null>(null);
  const dragOffset = useRef(0);
  const dragIndex = useRef(-1);

  // Sync with external items
  useEffect(() => {
    setOrderedItems(items);
  }, [items]);

  const handleDragStart = useCallback((id: string, index: number) => {
    setActiveId(id);
    dragIndex.current = index;
  }, []);

  const handleDragOver = useCallback((targetIndex: number) => {
    if (activeId === null || dragIndex.current === -1) return;
    if (targetIndex === dragIndex.current) return;

    const newItems = [...orderedItems];
    const [draggedItem] = newItems.splice(dragIndex.current, 1);
    newItems.splice(targetIndex, 0, draggedItem);

    setOrderedItems(newItems);
    dragIndex.current = targetIndex;

    options.onDragOver?.({
      id: activeId,
      index: targetIndex,
      data: draggedItem,
    }, {
      id: String(targetIndex),
      index: targetIndex,
      data: newItems[targetIndex],
    });
  }, [activeId, orderedItems, options]);

  const handleDragEnd = useCallback(() => {
    if (activeId !== null) {
      options.onDragEnd?.({
        id: activeId,
        index: dragIndex.current,
        data: orderedItems[dragIndex.current],
      });
    }
    setActiveId(null);
    dragIndex.current = -1;
  }, [activeId, orderedItems, options]);

  const handleProps = useCallback((id: string) => ({
    draggable: true,
    onDragStart: () => {
      const index = orderedItems.findIndex((item: any) => item.id === id || item === id);
      handleDragStart(id, index);
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const index = y < rect.height / 2 
        ? orderedItems.findIndex((item: any) => item.id === id || item === id)
        : orderedItems.findIndex((item: any) => item.id === id || item === id) + 1;
      handleDragOver(Math.max(0, index));
    },
    onDragEnd: handleDragEnd,
  }), [orderedItems, handleDragStart, handleDragOver, handleDragEnd]);

  const getItemStyle = useCallback((index: number, id: string): React.CSSProperties => {
    const isActive = activeId === id;
    const isAbove = dragIndex.current !== -1 && index < dragIndex.current;

    return {
      transition: `transform ${options.animationDuration || 200}ms`,
      transform: isActive ? 'scale(1.02)' : undefined,
      opacity: isActive ? 0.5 : 1,
      zIndex: isActive ? 10 : 1,
    };
  }, [activeId, dragIndex.current, options.animationDuration]);

  const containerProps: React.HTMLAttributes<HTMLDivElement> = {
    onDragLeave: (e) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
        handleDragEnd();
      }
    },
  };

  return {
    items: orderedItems,
    activeId,
    handleProps,
    getItemStyle,
    containerProps,
  };
}

/**
 * useDropZone - Drop zone detection
 */
export function useDropZone(
  ref: React.RefObject<HTMLElement>,
  options: {
    onDrop?: (item: DragItem) => void;
    onEnter?: () => void;
    onLeave?: () => void;
  } = {}
) {
  const [isOver, setIsOver] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      setIsOver(true);
    };

    const handleDragEnter = () => {
      setIsOver(true);
      options.onEnter?.();
    };

    const handleDragLeave = (e: DragEvent) => {
      if (!element.contains(e.relatedTarget as Node)) {
        setIsOver(false);
        options.onLeave?.();
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsOver(false);
      
      const data = e.dataTransfer?.getData('text/plain');
      if (data) {
        try {
          const item = JSON.parse(data);
          options.onDrop?.(item);
        } catch {
          options.onDrop?.({ id: data, index: 0, data });
        }
      }
    };

    element.addEventListener('dragover', handleDragOver);
    element.addEventListener('dragenter', handleDragEnter);
    element.addEventListener('dragleave', handleDragLeave);
    element.addEventListener('drop', handleDrop);

    return () => {
      element.removeEventListener('dragover', handleDragOver);
      element.removeEventListener('dragenter', handleDragEnter);
      element.removeEventListener('dragleave', handleDragLeave);
      element.removeEventListener('drop', handleDrop);
    };
  }, [ref, options]);

  return { isOver };
}

/**
 * useDraggable - Make element draggable
 */
export function useDraggable(
  ref: React.RefObject<HTMLElement>,
  options: {
    id: string;
    data?: any;
    disabled?: boolean;
  }
) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element || options.disabled) return;

    let startPos = { x: 0, y: 0 };
    let startOffset = { x: 0, y: 0 };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();

      startPos = { x: e.clientX, y: e.clientY };
      startOffset = { x: position.x, y: position.y };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - startPos.x;
        const dy = moveEvent.clientY - startPos.y;
        setPosition({
          x: startOffset.x + dx,
          y: startOffset.y + dy,
        });
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    element.addEventListener('mousedown', handleMouseDown);
    element.style.cursor = 'grab';

    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
    };
  }, [ref, position, options.disabled]);

  return {
    position,
    setPosition,
    style: {
      transform: `translate(${position.x}px, ${position.y}px)`,
      position: 'relative' as const,
    },
    reset: () => setPosition({ x: 0, y: 0 }),
  };
}

export default {
  useDrag,
  useSortable,
  useDropZone,
  useDraggable,
};