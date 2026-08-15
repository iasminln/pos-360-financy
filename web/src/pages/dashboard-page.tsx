import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@apollo/client/react";
import {
  CircleArrowUp,
  CircleArrowDown,
  Plus,
  Wallet,
  ChevronRight
} from "lucide-react";
import { DASHBOARD_QUERY, CATEGORIES_QUERY } from "@/graphql/operations";
import type { Category, DashboardSummary, Transaction } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { CategoryBadge } from "@/components/ui/badge";
import { CategoryIconBox } from "@/components/category-icon-box"; 
import { Button } from "@/components/ui/button";
import { TransactionModal } from "@/components/modals/transaction-modal";

export function DashboardPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data, loading } = useQuery<{ dashboard: DashboardSummary }>(
    DASHBOARD_QUERY,
  );
  const { data: categoriesData } = useQuery<{ categories: Category[] }>(
    CATEGORIES_QUERY,
  );

  const dashboard = data?.dashboard;
  const categories = categoriesData?.categories ?? [];

  if (loading && !dashboard) {
    return <p className="text-gray-500">Carregando dashboard...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          label="SALDO TOTAL"
          value={formatCurrency(dashboard?.totalBalance ?? 0)} 
          icon={<Wallet className="h-4 w-4 text-purple-base" />}
        />
        <SummaryCard
          label="RECEITAS DO MÊS"
          value={formatCurrency(dashboard?.monthlyIncome ?? 0)}
          icon={<CircleArrowUp className="h-4 w-4 text-success" />}
        />
        <SummaryCard
          label="DESPESAS DO MÊS"
          value={formatCurrency(dashboard?.monthlyExpenses ?? 0)}
          icon={<CircleArrowDown className="h-4 w-4 text-danger" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <section className="rounded-2xl border border-border bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-semibold tracking-wide text-gray-500">
              TRANSAÇÕES RECENTES
            </h2>
            <Link to="/transacoes" className="flex items-center gap-1 text-sm font-medium text-brand-base">
              Ver todas <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="divide-y divide-border">
            {(dashboard?.recentTransactions ?? []).length === 0 && (
              <p className="py-8 text-center text-sm text-gray-500">
                Nenhuma transação ainda
              </p>
            )}
            {dashboard?.recentTransactions.map((transaction) => (
              <RecentTransactionRow
                key={transaction.id}
                transaction={transaction}
              />
            ))}
          </div>

          <div className="mt-4 flex justify-center">
            <Button variant="ghost" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Nova transação
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-semibold tracking-wide text-gray-500">
              CATEGORIAS
            </h2>
            <Link to="/categorias" className="flex items-center gap-1 text-sm font-medium text-brand-base">
              Gerenciar <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {(dashboard?.categorySummaries ?? []).length === 0 && (
              <p className="py-8 text-center text-sm text-gray-500">
                Nenhuma categoria com transações
              </p>
            )}
            {dashboard?.categorySummaries.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <CategoryBadge label={category.title} color={category.color} />
                  <span className="text-sm text-gray-500">
                    {category.transactionsCount} itens
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  {formatCurrency(Math.abs(category.totalAmount))}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <TransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        categories={categories}
      />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <div className={`mb-3 inline-flex`}>{icon}</div>
      <p className="text-xs font-semibold tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

function RecentTransactionRow({ transaction }: { transaction: Transaction }) {
  const isIncome = transaction.type === "INCOME";
  return (
    <div className="flex items-center gap-3 py-3">
      <CategoryIconBox
        icon={transaction.category.icon}
        color={transaction.category.color}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-gray-800">
          {transaction.description}
        </p>
        <p className="text-xs text-gray-500">{formatDate(transaction.date)}</p>
      </div>
      <CategoryBadge
        label={transaction.category.title}
        color={transaction.category.color}
        className="hidden sm:inline-flex"
      />
      <div
        className={`flex items-center gap-1 text-sm font-semibold ${
          isIncome ? "text-success" : "text-gray-800"
        }`}
      >
        {isIncome ? "+" : "-"} {formatCurrency(transaction.amount)}
        {isIncome ? (
          <CircleArrowUp className="h-4 w-4 text-success" />
        ) : (
          <CircleArrowDown className="h-4 w-4 text-danger" />
        )}
      </div>
    </div>
  );
}
