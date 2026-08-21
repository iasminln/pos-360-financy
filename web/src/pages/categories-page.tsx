import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client/react";
import { ArrowUpDown, SquarePen, Plus, Tag, Trash } from "lucide-react";
import {
  CATEGORIES_QUERY,
  DASHBOARD_QUERY,
  DELETE_CATEGORY_MUTATION,
} from "@/graphql/operations";
import type { Category, DashboardSummary } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/ui/badge";
import { CategoryIconBox } from "@/components/category-icon-box";
import { CategoryModal } from "@/components/modals/category-modal";
import { getCategoryColor } from "@/lib/categories";
import { getCategoryIcon } from "@/lib/icons";
import { useRefetchActiveQueries } from "@/hooks/use-refetch-active-queries";
import { getErrorMessage } from "@/lib/errors";

type CategoriesLocationState = {
  openCreateCategory?: boolean;
};

export function CategoriesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const refetchActiveQueries = useRefetchActiveQueries();

  const { data, loading } = useQuery<{ categories: Category[] }>(
    CATEGORIES_QUERY,
  );
  const { data: dashboardData } = useQuery<{ dashboard: DashboardSummary }>(
    DASHBOARD_QUERY,
  );
  const [deleteCategory] = useMutation(DELETE_CATEGORY_MUTATION);

  const categories = data?.categories ?? [];
  const dashboard = dashboardData?.dashboard;
  const mostUsed = dashboard?.mostUsedCategory;
  const MostUsedIcon = mostUsed ? getCategoryIcon(mostUsed.icon) : Tag;
  const mostUsedColor = mostUsed
    ? getCategoryColor(mostUsed.color).text
    : undefined;

  useEffect(() => {
    const state = location.state as CategoriesLocationState | null;
    if (!state?.openCreateCategory) return;

    setEditing(null);
    setModalOpen(true);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.pathname, location.state, navigate]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setModalOpen(true);
  };

  const handleDelete = async (category: Category) => {
    if (category.transactionsCount > 0) {
      window.alert(
        "Não é possível excluir uma categoria com transações vinculadas.",
      );
      return;
    }
    if (!window.confirm(`Excluir a categoria "${category.title}"?`)) return;
    try {
      await deleteCategory({ variables: { id: category.id } });
      await refetchActiveQueries();
    } catch (error) {
      window.alert(
        getErrorMessage(error, "Não foi possível excluir a categoria"),
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categorias</h1>
          <p className="mt-1 text-gray-600 text-base">
            Organize suas transações por categorias
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nova categoria
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="mb-3 inline-flex rounded-lg text-gray-700">
            <Tag className="h-6 w-6" />
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {dashboard?.totalCategories ?? categories.length}
          </p>
          <p className="mt-1 text-xs font-semibold tracking-wide text-gray-500">
            TOTAL DE CATEGORIAS
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="mb-3 inline-flex rounded-lg text-purple-base">
            <ArrowUpDown className="h-6 w-6" />
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {dashboard?.totalTransactions ?? 0}
          </p>
          <p className="mt-1 text-xs font-semibold tracking-wide text-gray-500">
            TOTAL DE TRANSAÇÕES
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <div
            className="mb-3 inline-flex rounded-lg text-gray-500"
            style={mostUsedColor ? { color: mostUsedColor } : undefined}
          >
            <MostUsedIcon className="h-6 w-6" />
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {mostUsed?.title ?? "—"}
          </p>
          <p className="mt-1 text-xs font-semibold tracking-wide text-gray-500">
            CATEGORIA MAIS UTILIZADA
          </p>
        </div>
      </div>

      {loading && categories.length === 0 && (
        <p className="text-gray-500">Carregando categorias...</p>
      )}

      {!loading && categories.length === 0 && (
        <div className="rounded-2xl border border-border bg-white p-10 text-center text-gray-500">
          Nenhuma categoria cadastrada. Crie a primeira!
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <article
            key={category.id}
            className="rounded-2xl border border-border bg-white p-5"
          >
            <div className="mb-4 flex items-start justify-between">
              <CategoryIconBox icon={category.icon} color={category.color} />
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  size="icon"
                  onClick={() => handleDelete(category)}
                  aria-label="Excluir categoria"
                >
                  <Trash className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => openEdit(category)}
                  aria-label="Editar categoria"
                >
                  <SquarePen className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <h3 className="text-base font-semibold text-gray-800">
              {category.title}
            </h3>
            <p className="mt-1 min-h-10 text-sm text-gray-600">
              {category.description || "Sem descrição"}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <CategoryBadge label={category.title} color={category.color} />
              <span className="text-sm text-gray-500">
                {category.transactionsCount} itens
              </span>
            </div>
          </article>
        ))}
      </div>

      <CategoryModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        category={editing}
      />
    </div>
  );
}
