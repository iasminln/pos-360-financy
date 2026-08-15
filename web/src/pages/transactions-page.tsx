import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  ChevronRight,
  ChevronLeft,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import {
  TRANSACTIONS_QUERY,
  CATEGORIES_QUERY,
  DELETE_TRANSACTION_MUTATION,
} from "@/graphql/operations";
import type { Category, Transaction } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CategoryBadge } from "@/components/ui/badge";
import { CategoryIconBox } from "@/components/category-icon-box";
import { TransactionModal } from "@/components/modals/transaction-modal";
import { useRefetchActiveQueries } from "@/hooks/use-refetch-active-queries";
import { getErrorMessage } from "@/lib/errors";

const PAGE_SIZE = 10;

export function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [period, setPeriod] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const filter = useMemo(() => {
    const [month, year] = period ? period.split("/").map(Number) : [null, null];
    return {
      search: search || null,
      type: type || null,
      categoryId: categoryId || null,
      month: month || null,
      year: year || null,
    };
  }, [search, type, categoryId, period]);

  const { data, loading } = useQuery<{ transactions: Transaction[] }>(
    TRANSACTIONS_QUERY,
    { variables: { filter } },
  );
  const { data: categoriesData } = useQuery<{ categories: Category[] }>(
    CATEGORIES_QUERY,
  );
  const refetchActiveQueries = useRefetchActiveQueries();
  const [deleteTransaction] = useMutation(DELETE_TRANSACTION_MUTATION);

  const categories = categoriesData?.categories ?? [];
  const transactions = data?.transactions ?? [];
  const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = transactions.slice(start, start + PAGE_SIZE);

  const periodOptions = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 12 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const label = date.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      });
      return {
        value: `${month}/${year}`,
        label: label.charAt(0).toUpperCase() + label.slice(1),
      };
    });
  }, []);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (transaction: Transaction) => {
    setEditing(transaction);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Deseja excluir esta transação?")) return;
    try {
      await deleteTransaction({ variables: { id } });
      await refetchActiveQueries();
    } catch (error) {
      window.alert(
        getErrorMessage(error, "Não foi possível excluir a transação"),
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Transações</h1>
          <p className="mt-1 text-base text-gray-600">
            Gerencie todas as suas transações financeiras
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nova transação
        </Button>
      </div>

      <div className="grid gap-4 rounded-2xl border border-border bg-white p-4 md:grid-cols-4">
        <div>
          <Label>Buscar</Label>
          <Input
            placeholder="Buscar por descrição"
            leftIcon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>
        <div>
          <Label>Tipo</Label>
          <Select
            value={type}
            onChange={(event) => {
              setType(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Todos</option>
            <option value="INCOME">Entrada</option>
            <option value="EXPENSE">Saída</option>
          </Select>
        </div>
        <div>
          <Label>Categoria</Label>
          <Select
            value={categoryId}
            onChange={(event) => {
              setCategoryId(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Todas</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Período</Label>
          <Select
            value={period}
            onChange={(event) => {
              setPeriod(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Todos</option>
            {periodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-gray-100 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Descrição</th>
                <th className="px-4 py-3 font-semibold">Data</th>
                <th className="px-4 py-3 font-semibold">Categoria</th>
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 font-semibold">Valor</th>
                <th className="px-4 py-3 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading && pageItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Carregando...
                  </td>
                </tr>
              )}
              {!loading && pageItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Nenhuma transação encontrada
                  </td>
                </tr>
              )}
              {pageItems.map((transaction) => {
                const isIncome = transaction.type === "INCOME";
                return (
                  <tr
                    key={transaction.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <CategoryIconBox
                          icon={transaction.category.icon}
                          color={transaction.category.color}
                        />
                        <span className="font-medium text-gray-800">
                          {transaction.description}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-4 py-3">
                      <CategoryBadge
                        label={transaction.category.title}
                        color={transaction.category.color}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                          isIncome ? "text-success" : "text-danger"
                        }`}
                      >
                        {isIncome ? (
                          <ArrowUpCircle className="h-4 w-4" />
                        ) : (
                          <ArrowDownCircle className="h-4 w-4" />
                        )}
                        {isIncome ? "Entrada" : "Saída"}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-3 font-semibold ${
                        isIncome ? "text-success" : "text-gray-800"
                      }`}
                    >
                      {isIncome ? "+" : "-"}{" "}
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(transaction.id)}
                          className="text-danger hover:bg-red-light"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEdit(transaction)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            {transactions.length === 0
              ? "0 resultados"
              : `${start + 1} a ${Math.min(start + PAGE_SIZE, transactions.length)} | ${transactions.length} resultados`}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, index) => index + 1)
              .slice(0, 5)
              .map((pageNumber) => (
                <Button
                  key={pageNumber}
                  size="icon"
                  variant={pageNumber === currentPage ? "primary" : "outline"}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              ))}
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <TransactionModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        categories={categories}
        transaction={editing}
      />
    </div>
  );
}
