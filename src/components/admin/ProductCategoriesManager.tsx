import { useCollections, useProductCollections, useAddProductCollection, useRemoveProductCollection } from "@/hooks/useCollections";
import { X, FolderOpen, Plus } from "lucide-react";

export const ProductCategoriesManager = ({
  productId,
  primaryCollectionId,
  onChangePrimary,
}: {
  productId: string;
  primaryCollectionId: string;
  onChangePrimary: (id: string) => void;
}) => {
  const { data: collections } = useCollections();
  const { data: assigned, isLoading } = useProductCollections(productId);
  const add = useAddProductCollection();
  const remove = useRemoveProductCollection();

  const assignedIds = new Set(assigned?.map((pc) => pc.collection_id) ?? []);
  const available = collections?.filter((c) => !assignedIds.has(c.id)) ?? [];

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">
          Kategoritë e caktuara
        </label>
        {isLoading ? (
          <p className="text-xs text-muted-foreground">Duke ngarkuar...</p>
        ) : assigned?.length === 0 ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded p-3">
            <FolderOpen className="h-4 w-4" />
            Asnjë kategori e caktuar ende.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {assigned?.map((pc) => {
              const col = collections?.find((c) => c.id === pc.collection_id);
              if (!col) return null;
              const isPrimary = pc.collection_id === primaryCollectionId;
              return (
                <div
                  key={pc.id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-colors ${
                    isPrimary
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted border-border text-foreground"
                  }`}
                >
                  {isPrimary && (
                    <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">
                      Kryesore
                    </span>
                  )}
                  <span>{col.title_al || col.slug}</span>
                  {!isPrimary && (
                    <button
                      onClick={() => onChangePrimary(pc.collection_id)}
                      className="opacity-50 hover:opacity-100 transition-opacity text-[9px] border border-current rounded px-1"
                      title="Bëje kategorinë kryesore"
                    >
                      ★
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (assigned.length === 1) return;
                      remove.mutate({ product_id: productId, collection_id: pc.collection_id });
                      if (isPrimary) {
                        const next = assigned.find((a) => a.collection_id !== pc.collection_id);
                        if (next) onChangePrimary(next.collection_id);
                      }
                    }}
                    disabled={assigned.length === 1}
                    className="opacity-50 hover:opacity-100 disabled:opacity-20 disabled:cursor-not-allowed transition-opacity"
                    title={assigned.length === 1 ? "Duhet të ketë të paktën 1 kategori" : "Hiq"}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {available.length > 0 && (
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            Shto në kategori
          </label>
          <div className="flex flex-wrap gap-2">
            {available.map((col) => (
              <button
                key={col.id}
                onClick={() => add.mutate({ product_id: productId, collection_id: col.id })}
                disabled={add.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-border rounded-full text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Plus className="h-3 w-3" />
                {col.title_al || col.slug}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground">
        Kategoria <strong>Kryesore</strong> përdoret për URL-in e produktit. Kategoritë e tjera e shfaqin produktin edhe atje.
      </p>
    </div>
  );
};
