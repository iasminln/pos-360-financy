import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@apollo/client/react";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  CREATE_TRANSACTION_MUTATION,
  UPDATE_TRANSACTION_MUTATION,
} from "@/graphql/operations";
import { useRefetchActiveQueries } from "@/hooks/use-refetch-active-queries";
import { getErrorMessage } from "@/lib/errors";
import type { Category, Transaction } from "@/lib/types";
import { dateInputToIso, toDateInputValue } from "@/lib/format";
import { cn } from "@/lib/utils";

const schema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  amount: z.coerce.number().positive("Valor deve ser maior que zero"),
  type: z.enum(["INCOME", "EXPENSE"]),
  date: z.string().min(1, "Data é obrigatória"),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  transaction?: Transaction | null;
};

export function TransactionModal({
  open,
  onClose,
  categories,
  transaction,
}: Props) {
  const isEditing = Boolean(transaction);
  const refetchActiveQueries = useRefetchActiveQueries();
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: "",
      amount: 0,
      type: "EXPENSE",
      date: toDateInputValue(),
      categoryId: "",
    },
  });

  const type = watch("type");

  useEffect(() => {
    if (!open) return;
    setSubmitError("");
    if (transaction) {
      reset({
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        date: toDateInputValue(transaction.date),
        categoryId: transaction.category.id,
      });
    } else {
      reset({
        description: "",
        amount: 0,
        type: "EXPENSE",
        date: toDateInputValue(),
        categoryId: categories[0]?.id ?? "",
      });
    }
  }, [open, transaction, categories, reset]);

  const [createTransaction] = useMutation(CREATE_TRANSACTION_MUTATION);
  const [updateTransaction] = useMutation(UPDATE_TRANSACTION_MUTATION);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError("");
    const variables = {
      description: values.description,
      amount: values.amount,
      type: values.type,
      date: dateInputToIso(values.date),
      categoryId: values.categoryId,
    };

    try {
      if (isEditing && transaction) {
        await updateTransaction({
          variables: { id: transaction.id, ...variables },
        });
      } else {
        await createTransaction({ variables });
      }
      await refetchActiveQueries();
      onClose();
    } catch (error) {
      setSubmitError(
        getErrorMessage(error, "Não foi possível salvar a transação"),
      );
    }
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar transação" : "Nova transação"}
      description="Registre sua despesa ou receita"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setValue("type", "EXPENSE")}
            className={cn(
              "flex h-12 items-center justify-center gap-2 rounded-lg border text-sm font-medium",
              type === "EXPENSE"
                ? "border-danger text-danger"
                : "border-border text-gray-700",
            )}
          >
            <ArrowDownCircle className="h-4 w-4" />
            Despesa
          </button>
          <button
            type="button"
            onClick={() => setValue("type", "INCOME")}
            className={cn(
              "flex h-12 items-center justify-center gap-2 rounded-lg border text-sm font-medium",
              type === "INCOME"
                ? "border-success text-success"
                : "border-border text-gray-700",
            )}
          >
            <ArrowUpCircle className="h-4 w-4" />
            Receita
          </button>
        </div>

        <div>
          <Label htmlFor="description">Descrição</Label>
          <Input
            id="description"
            placeholder="Ex. Almoço no restaurante"
            {...register("description")}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-danger">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="date">Data</Label>
            <Input id="date" type="date" {...register("date")} />
            {errors.date && (
              <p className="mt-1 text-xs text-danger">{errors.date.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="amount">Valor</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              {...register("amount")}
            />
            {errors.amount && (
              <p className="mt-1 text-xs text-danger">{errors.amount.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="categoryId">Categoria</Label>
          <Select id="categoryId" {...register("categoryId")}>
            <option value="">Selecione</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </Select>
          {errors.categoryId && (
            <p className="mt-1 text-xs text-danger">
              {errors.categoryId.message}
            </p>
          )}
        </div>

        {submitError && <p className="text-sm text-danger">{submitError}</p>}

        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
      </form>
    </Dialog>
  );
}
