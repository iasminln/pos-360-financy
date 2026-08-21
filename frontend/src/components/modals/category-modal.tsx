import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@apollo/client/react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  CREATE_CATEGORY_MUTATION,
  UPDATE_CATEGORY_MUTATION,
} from "@/graphql/operations";
import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
} from "@/lib/categories";
import { getCategoryIcon } from "@/lib/icons";
import { useRefetchActiveQueries } from "@/hooks/use-refetch-active-queries";
import { getErrorMessage } from "@/lib/errors";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  icon: z.string().min(1),
  color: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onClose: () => void;
  category?: Category | null;
};

export function CategoryModal({ open, onClose, category }: Props) {
  const isEditing = Boolean(category);
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
      title: "",
      description: "",
      icon: "briefcase",
      color: "green",
    },
  });

  const selectedIcon = watch("icon");
  const selectedColor = watch("color");

  useEffect(() => {
    if (!open) return;
    setSubmitError("");
    if (category) {
      reset({
        title: category.title,
        description: category.description ?? "",
        icon: category.icon,
        color: category.color,
      });
    } else {
      reset({
        title: "",
        description: "",
        icon: "briefcase",
        color: "green",
      });
    }
  }, [open, category, reset]);

  const [createCategory] = useMutation(CREATE_CATEGORY_MUTATION);
  const [updateCategory] = useMutation(UPDATE_CATEGORY_MUTATION);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError("");
    try {
      if (isEditing && category) {
        await updateCategory({
          variables: {
            id: category.id,
            title: values.title,
            description: values.description || null,
            icon: values.icon,
            color: values.color,
          },
        });
      } else {
        await createCategory({
          variables: {
            title: values.title,
            description: values.description || null,
            icon: values.icon,
            color: values.color,
          },
        });
      }
      await refetchActiveQueries();
      onClose();
    } catch (error) {
      setSubmitError(
        getErrorMessage(error, "Não foi possível salvar a categoria"),
      );
    }
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar categoria" : "Nova categoria"}
      description="Organize suas transações com categorias"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          label="Título"
          htmlFor="title"
          error={errors.title?.message}
        >
          <Input
            id="title"
            placeholder="Ex. Alimentação"
            {...register("title")}
          />
        </Field>

        <Field
          label="Descrição"
          htmlFor="description"
          helper="Opcional"
        >
          <Input
            id="description"
            placeholder="Descrição da categoria"
            {...register("description")}
          />
        </Field>

        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">
            Ícone
          </p>
          <div className="grid grid-cols-8 gap-2">
            {CATEGORY_ICONS.map((icon) => {
              const Icon = getCategoryIcon(icon);
              return (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setValue("icon", icon)}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg cursor-pointer border",
                    selectedIcon === icon
                      ? "border-brand-base text-brand-base"
                      : "border-border text-gray-600",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>
          <input type="hidden" {...register("icon")} />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">Cor</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_COLORS.map((color) => {
              const isSelected = selectedColor === color.id;
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setValue("color", color.id)}
                  className={cn(
                    "rounded-lg cursor-pointer border bg-white p-1 transition-colors",
                    !isSelected && "border-border",
                  )}
                  style={
                    isSelected ? { borderColor: color.text } : undefined
                  }
                  aria-label={color.id}
                  aria-pressed={isSelected}
                >
                  <span
                    className="block h-5 w-9 rounded-md"
                    style={{ backgroundColor: color.value }}
                  />
                </button>
              );
            })}
          </div>
          <input type="hidden" {...register("color")} />
        </div>

        {submitError && <p className="text-sm text-danger">{submitError}</p>}

        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
      </form>
    </Dialog>
  );
}
