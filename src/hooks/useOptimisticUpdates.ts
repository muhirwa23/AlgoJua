import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface OptimisticUpdateOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useOptimisticUpdate<T>() {
  const [isUpdating, setIsUpdating] = useState(false);

  const performUpdate = useCallback(
    async (
      updateFn: () => Promise<T>,
      options: OptimisticUpdateOptions<T> = {}
    ) => {
      setIsUpdating(true);
      
      try {
        const result = await updateFn();
        
        if (options.successMessage) {
          toast.success(options.successMessage);
        }
        
        if (options.onSuccess) {
          options.onSuccess(result);
        }
        
        return result;
      } catch (error) {
        const errorMessage = options.errorMessage || 'Operation failed';
        toast.error(errorMessage);
        
        if (options.onError) {
          options.onError(error as Error);
        }
        
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  return { performUpdate, isUpdating };
}

export function useOptimisticList<T extends { id: string }>(initialData: T[] = []) {
  const [items, setItems] = useState<T[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);

  const addItem = useCallback((item: T) => {
    setItems((prev) => [item, ...prev]);
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<T>) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const setData = useCallback((newItems: T[]) => {
    setItems(newItems);
  }, []);

  return {
    items,
    isLoading,
    setIsLoading,
    addItem,
    updateItem,
    removeItem,
    setData,
  };
}
